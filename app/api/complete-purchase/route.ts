import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY);

// ============================================
// EMAIL CONFIGURATION
// ============================================

const EMAIL_CONFIG = {
  from: 'Clase para Padres <hola@claseparapadres.com>',
  replyTo: 'info@claseparapadres.com',
};

const ICON_BASE_URL = 'https://claseparapadres.com/images/email';

// ============================================
// TYPES
// ============================================

interface CompleteRequest {
  sessionId: string;
  password: string;
}

interface CompleteResponse {
  success: boolean;
  error?: string;
  redirect?: string;
  email?: string;  // Returned for client-side sign-in
}

// ============================================
// MAIN HANDLER
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse<CompleteResponse>> {
  try {
    const body: CompleteRequest = await request.json();
    const { sessionId, password } = body;

    // Validate inputs
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Sesión no válida' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Retrieve Stripe session
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeError) {
      console.error('Stripe session retrieval failed:', stripeError);
      return NextResponse.json(
        { success: false, error: 'No pudimos verificar su compra. Por favor, contacte soporte.' },
        { status: 400 }
      );
    }

    // Validate session is paid
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'El pago no ha sido completado' },
        { status: 400 }
      );
    }

    // Extract customer info
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = extractCleanName(session);
    const courseType = session.metadata?.course_type || 'coparenting';
    const amountPaid = session.amount_total || 0;

    if (!customerEmail) {
      return NextResponse.json(
        { success: false, error: 'No pudimos obtener su correo electrónico' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === customerEmail);

    let userId: string;
    let isNewUser = false;

    if (existingUser) {
      // User exists — update their password to what they just entered
      // This handles the case where webhook created account first
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password }
      );

      if (updateError) {
        console.error('Error updating user password:', updateError);
        // Non-fatal — they can use password reset if needed
      }

      userId = existingUser.id;
    } else {
      // Create new user with their chosen password
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
        },
      });

      if (authError) {
        console.error('Error creating user:', authError);
        return NextResponse.json(
          { success: false, error: 'No pudimos crear su cuenta. Por favor, intente de nuevo.' },
          { status: 500 }
        );
      }

      userId = authData.user!.id;
      isNewUser = true;
    }

    // ============================================
    // ENSURE PROFILE EXISTS
    // ============================================
    
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, profile_completed')
      .eq('id', userId)
      .single();

    if (!existingProfile) {
      // Profile doesn't exist — create it
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: customerEmail,
          full_name: customerName || null,
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        // Non-fatal — profile can be created later, but log it
      }
    }

    // ============================================
    // ENSURE PURCHASE EXISTS
    // ============================================

    const { data: existingPurchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('course_type', courseType)
      .single();

    if (!existingPurchase) {
      // Create purchase record
      const { error: purchaseError } = await supabase.from('purchases').insert({
        user_id: userId,
        course_type: courseType,
        stripe_payment_id: session.id,
        stripe_customer_id: session.customer as string,
        amount_paid: amountPaid,
      });

      if (purchaseError && purchaseError.code !== '23505') {
        // 23505 = unique constraint violation (already exists)
        console.error('Error creating purchase:', purchaseError);
        // Non-fatal — continue, they paid
      }
    }

    // ============================================
    // ENSURE COURSE PROGRESS EXISTS
    // ============================================
    
    // Determine which courses to initialize progress for
    const coursesToInit = courseType === 'bundle' 
      ? ['coparenting', 'parenting'] 
      : [courseType];

    for (const course of coursesToInit) {
      const { data: existingProgress } = await supabase
        .from('course_progress')
        .select('id')
        .eq('user_id', userId)
        .eq('course_type', course)
        .single();

      if (!existingProgress) {
        const { error: progressError } = await supabase
          .from('course_progress')
          .insert({
            user_id: userId,
            course_type: course,
            current_lesson: 1,
            lessons_completed: [],
            started_at: new Date().toISOString(),
          });

        if (progressError && progressError.code !== '23505') {
          console.error(`Error creating course progress for ${course}:`, progressError);
          // Non-fatal — will be created when they access course
        }
      }
    }

    // ============================================
    // SEND WELCOME EMAIL
    // ============================================
    
    // Only send welcome email if this is a NEW user created by success page.
    // If user already existed (created by webhook), webhook already sent
    // the welcome email with temp password. Sending another would cause
    // confusion about which password to use.
    if (isNewUser) {
      await sendWelcomeEmail(customerEmail, customerName, courseType, amountPaid);
    }

    // Always redirect to panel
    const redirect = '/panel';

    // Return email so client can sign in
    return NextResponse.json({
      success: true,
      email: customerEmail,
      redirect,
    });

  } catch (error) {
    console.error('Complete purchase error:', error);
    return NextResponse.json(
      { success: false, error: 'Algo salió mal. Por favor, intente de nuevo.' },
      { status: 500 }
    );
  }
}

// ============================================
// EMAIL FUNCTIONS
// ============================================

/**
 * Send welcome email after successful account creation via success page.
 * This version does NOT include a password since user just set their own.
 */
async function sendWelcomeEmail(
  email: string,
  name: string,
  courseType: string,
  amountPaid: number
) {
  const courseName = getCourseDisplayName(courseType);
  const firstName = name ? name.split(' ')[0] : '';
  const formattedAmount = formatCurrency(amountPaid);
  
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.from,
      replyTo: EMAIL_CONFIG.replyTo,
      to: email,
      subject: '¡Todo listo! — su clase lo espera',
      html: generateWelcomeEmailHTML(firstName, email, courseName, formattedAmount, courseType),
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Non-fatal — don't fail the purchase flow if email fails
  }
}

function getCourseDisplayName(type: string): string {
  switch (type) {
    case 'coparenting':
      return 'Clase de Coparentalidad';
    case 'parenting':
      return 'Clase de Crianza';
    case 'bundle':
      return 'Paquete Completo (Coparentalidad + Crianza)';
    default:
      return 'Clase';
  }
}

function formatCurrency(amountInCents: number): string {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amountInCents / 100);
}

// ============================================
// EMAIL TEMPLATE
// ============================================

function generateWelcomeEmailHTML(
  firstName: string,
  email: string,
  courseName: string,
  amount: string,
  courseType: string
): string {
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';
  const currentYear = new Date().getFullYear();
  const purchaseDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Only show second class note for single-class purchases (not bundle)
  const showSecondClassNote = courseType !== 'bundle';
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clase para Padres</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1C1C1C;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 520px;">
          
          <!-- Success Icon -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img 
                src="${ICON_BASE_URL}/icon-checkmark.png" 
                width="80" 
                height="80" 
                alt="✓" 
                style="display: block;"
              />
            </td>
          </tr>
          
          <!-- Main Heading -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #FFFFFF; font-size: 32px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                ¡Todo listo!
              </h1>
            </td>
          </tr>
          
          <!-- Greeting & Intro -->
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                ${greeting}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Gracias por su compra. Su 
                <strong style="color: #77DD77;">${courseName}</strong> 
                está lista. Puede comenzar ahora mismo — su progreso se guarda automáticamente para que avance a su propio ritmo.
              </p>
            </td>
          </tr>
          
          <!-- Purchase Receipt Box -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
                <tr>
                  <td style="background-color: #2A2A2A; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
                    <p style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                      Resumen de su compra:
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 4px 0; font-family: 'Courier Prime', Courier, monospace;">
                            Clase
                          </p>
                          <p style="color: #FFFFFF; font-size: 15px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                            ${courseName}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 4px 0; font-family: 'Courier Prime', Courier, monospace;">
                            Total pagado
                          </p>
                          <p style="color: #77DD77; font-size: 15px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                            ${amount}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                          <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 4px 0; font-family: 'Courier Prime', Courier, monospace;">
                            Fecha
                          </p>
                          <p style="color: #FFFFFF; font-size: 15px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                            ${purchaseDate}
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0;">
                          <p style="color: rgba(255,255,255,0.6); font-size: 13px; margin: 0 0 4px 0; font-family: 'Courier Prime', Courier, monospace;">
                            Correo de acceso
                          </p>
                          <p style="color: #7EC8E3; font-size: 15px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                            ${email}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #77DD77; border-radius: 12px;">
                    <a 
                      href="https://claseparapadres.com/panel" 
                      style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
                    >
                      Ir a Mi Clase →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- What to Expect -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2A2A2A; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Courier Prime', Courier, monospace;">
                      ¿Qué puede esperar?
                    </p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                      <span style="color: #77DD77; margin-right: 8px;">●</span> 15 lecciones interactivas a su propio ritmo
                    </p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                      <span style="color: #7EC8E3; margin-right: 8px;">●</span> Examen final con intentos ilimitados
                    </p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0 0 8px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                      <span style="color: #FFB347; margin-right: 8px;">●</span> Certificado oficial al completar
                    </p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                      <span style="color: #77DD77; margin-right: 8px;">●</span> Aceptado por cortes a nivel nacional
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          ${showSecondClassNote ? `
          <!-- Second Class Note (single-class purchases only) -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                <strong style="color: rgba(255,255,255,0.8);">¿Necesita ambas clases?</strong> La segunda clase está disponible por $60 en cualquier momento.
              </p>
            </td>
          </tr>
          ` : ''}
          
          <!-- Personal Signature -->
          <tr>
            <td style="padding: 32px 0 24px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid rgba(255,255,255,0.1);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td>
              <p style="color: rgba(255,255,255,0.85); font-size: 15px; line-height: 24px; margin: 0 0 8px 0; font-family: 'Courier Prime', Courier, monospace;">
                <strong>Estamos aquí para ayudarle.</strong>
              </p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 22px; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                Si tiene alguna pregunta, solo responda a este correo.
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                — El equipo de Clase para Padres
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding-top: 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid rgba(255,255,255,0.1);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0 0 8px 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                © ${currentYear} Putting Kids First® — Todos los derechos reservados.
              </p>
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                Este correo fue enviado a ${email}
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ============================================
// HELPERS
// ============================================

/**
 * Extract customer name from Stripe session, filtering out junk names
 * from payment methods like Google Pay, Apple Pay, etc.
 */
function extractCleanName(session: Stripe.Checkout.Session): string {
  const rawName = session.customer_details?.name || '';

  const junkNames = [
    'card', 
    'visa', 
    'mastercard', 
    'amex', 
    'american express',
    'discover', 
    'paypal', 
    'apple pay', 
    'google pay',
    'gpay',
    'credit',
    'debit'
  ];
  
  const nameLower = rawName.toLowerCase().trim();
  const isJunkName = junkNames.some(junk => nameLower === junk || nameLower.includes(junk));
  const isTooShort = rawName.trim().length < 2;

  return (isJunkName || isTooShort) ? '' : rawName;
}
