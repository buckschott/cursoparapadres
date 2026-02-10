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
  // Spanish site - customer-facing emails
  spanish: {
    from: 'Clase para Padres <info@claseparapadres.com>',
    replyTo: 'info@claseparapadres.com',
  },
  // Attorney emails stay in English with PKF branding
  attorney: {
    from: 'Putting Kids First <certificates@claseparapadres.com>',
    replyTo: 'info@claseparapadres.com',
  },
};

const ICON_BASE_URL = 'https://claseparapadres.com/images/email';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const customerEmail = session.customer_email || session.customer_details?.email;
    const customerName = extractCleanName(session);
    const courseType = session.metadata?.course_type || 'coparenting';
    const amountPaid = session.amount_total || 0;

    if (!customerEmail) {
      console.error('No customer email found in session');
      return NextResponse.json({ error: 'No email' }, { status: 400 });
    }

    const supabase = createServerClient();

    // ============================================
    // IDEMPOTENT USER HANDLING
    // ============================================
    
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers?.users.find(u => u.email === customerEmail);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      
      // ============================================
      // SMART DUPLICATE DETECTION
      // ============================================
      
      const duplicateCheck = await checkForDuplicatePurchase(supabase, userId, courseType);
      
      if (duplicateCheck.isDuplicate) {
        // Issue refund and send appropriate email
        console.log(`Duplicate purchase detected for ${customerEmail}: ${duplicateCheck.reason}`);
        
        await issueRefund(session, duplicateCheck.reason);
        await sendAlreadyOwnedEmail(
          customerEmail, 
          customerName, 
          courseType, 
          duplicateCheck.ownedCourses
        );
        
        return NextResponse.json({ received: true });
      }

      // Check if they own ANY course (existing user buying second/additional course)
      const { data: anyPurchase } = await supabase
        .from('purchases')
        .select('id')
        .eq('user_id', userId)
        .limit(1)
        .single();

      if (anyPurchase) {
        // Existing user adding new course (not a duplicate)
        await addPurchase(supabase, userId, courseType, session.id, session.customer as string, amountPaid);
        await sendExistingUserEmail(customerEmail, customerName, courseType);
        return NextResponse.json({ received: true });
      }

      // User exists but no purchases (created by success page, webhook running after)
      // Just ensure profile and purchase exist — success page already sent email
      await ensureProfileExists(supabase, userId, customerEmail, customerName);
      await addPurchase(supabase, userId, courseType, session.id, session.customer as string, amountPaid);
      console.log(`Purchase added for existing user ${customerEmail} (created by success page)`);
      
    } else {
      // ============================================
      // NEW USER - FALLBACK CREATION
      // This only runs if user didn't complete the success page flow
      // (e.g., closed browser immediately after payment)
      // ============================================
      
      // Generate internal password (required by Supabase, never shown to user)
      const internalPassword = generateInternalPassword();

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: customerEmail,
        password: internalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: customerName,
        },
      });

      if (authError) {
        console.error('Error creating user in webhook:', authError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }

      userId = authData.user!.id;

      // Create profile
      await ensureProfileExists(supabase, userId, customerEmail, customerName);

      // Add purchase
      await addPurchase(supabase, userId, courseType, session.id, session.customer as string, amountPaid);
      
      // Send welcome email directing user to set their password
      await sendFallbackWelcomeEmail(customerEmail, customerName, courseType);
    }
  }

  return NextResponse.json({ received: true });
}

// ============================================
// DUPLICATE DETECTION LOGIC
// ============================================

interface DuplicateCheckResult {
  isDuplicate: boolean;
  reason: string;
  ownedCourses: string[];
}

/**
 * Smart duplicate detection based on what user already owns.
 * 
 * Refund scenarios:
 * - Buying exact same course they already have
 * - Buying individual course when they have bundle
 * - Buying bundle when they have both individual courses
 * 
 * Allow scenarios:
 * - Buying different individual course
 * - Buying bundle when they only have one individual course (gray zone - they get value)
 */
async function checkForDuplicatePurchase(
  supabase: any,
  userId: string,
  attemptedCourseType: string
): Promise<DuplicateCheckResult> {
  
  // Get all existing purchases for this user
  const { data: purchases } = await supabase
    .from('purchases')
    .select('course_type')
    .eq('user_id', userId);

  if (!purchases || purchases.length === 0) {
    return { isDuplicate: false, reason: '', ownedCourses: [] };
  }

  const ownedCourses = purchases.map((p: { course_type: string }) => p.course_type);
  const hasCoparenting = ownedCourses.includes('coparenting');
  const hasParenting = ownedCourses.includes('parenting');
  const hasBundle = ownedCourses.includes('bundle');

  // ============================================
  // TRYING TO BUY COPARENTING
  // ============================================
  if (attemptedCourseType === 'coparenting') {
    if (hasCoparenting) {
      return { 
        isDuplicate: true, 
        reason: 'Already owns Coparenting class',
        ownedCourses 
      };
    }
    if (hasBundle) {
      return { 
        isDuplicate: true, 
        reason: 'Bundle includes Coparenting class',
        ownedCourses 
      };
    }
    // Has only Parenting → ALLOW (buying different course)
    return { isDuplicate: false, reason: '', ownedCourses };
  }

  // ============================================
  // TRYING TO BUY PARENTING
  // ============================================
  if (attemptedCourseType === 'parenting') {
    if (hasParenting) {
      return { 
        isDuplicate: true, 
        reason: 'Already owns Parenting class',
        ownedCourses 
      };
    }
    if (hasBundle) {
      return { 
        isDuplicate: true, 
        reason: 'Bundle includes Parenting class',
        ownedCourses 
      };
    }
    // Has only Coparenting → ALLOW (buying different course)
    return { isDuplicate: false, reason: '', ownedCourses };
  }

  // ============================================
  // TRYING TO BUY BUNDLE
  // ============================================
  if (attemptedCourseType === 'bundle') {
    if (hasBundle) {
      return { 
        isDuplicate: true, 
        reason: 'Already owns Bundle',
        ownedCourses 
      };
    }
    if (hasCoparenting && hasParenting) {
      return { 
        isDuplicate: true, 
        reason: 'Already owns both individual classes',
        ownedCourses 
      };
    }
    // Has only ONE course → ALLOW (gray zone - they get the other course)
    return { isDuplicate: false, reason: '', ownedCourses };
  }

  // Unknown course type — allow and log
  console.warn(`Unknown course type attempted: ${attemptedCourseType}`);
  return { isDuplicate: false, reason: '', ownedCourses };
}

// ============================================
// STRIPE REFUND
// ============================================

/**
 * Issue a full refund for a duplicate purchase.
 */
async function issueRefund(session: Stripe.Checkout.Session, reason: string): Promise<void> {
  try {
    const paymentIntentId = session.payment_intent as string;
    
    if (!paymentIntentId) {
      console.error('No payment_intent found in session, cannot refund');
      return;
    }

    await stripe.refunds.create({
      payment_intent: paymentIntentId,
      reason: 'duplicate',
    });

    console.log(`Refund issued for payment_intent ${paymentIntentId}. Reason: ${reason}`);
  } catch (error) {
    console.error('Failed to issue refund:', error);
    // Don't throw — we still want to send the email even if refund fails
    // Support can handle manually if needed
  }
}

/**
 * Extract customer name from Stripe session, filtering out junk names
 * from payment methods like Google Pay, Apple Pay, etc.
 */
function extractCleanName(session: Stripe.Checkout.Session): string {
  const rawName = session.customer_details?.name || '';

  // Filter out junk names from payment methods
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
  
  // Also filter names that are too short (likely initials or garbage)
  const isTooShort = rawName.trim().length < 2;

  return (isJunkName || isTooShort) ? '' : rawName;
}

/**
 * Ensure profile exists for user - creates if missing
 */
async function ensureProfileExists(
  supabase: any,
  userId: string,
  email: string,
  name: string
) {
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (!existingProfile) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: name || null,
        profile_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (profileError && profileError.code !== '23505') {
      console.error('Error creating profile:', profileError);
    }
  }
}

async function addPurchase(
  supabase: any,
  userId: string,
  courseType: string,
  stripePaymentId: string,
  stripeCustomerId: string,
  amountPaid: number
) {
  const { error } = await supabase.from('purchases').insert({
    user_id: userId,
    course_type: courseType,
    stripe_payment_id: stripePaymentId,
    stripe_customer_id: stripeCustomerId,
    amount_paid: amountPaid,
  });

  if (error) {
    // Could be unique constraint violation if they somehow got through
    if (error.code === '23505') {
      console.log('Duplicate purchase prevented by database constraint');
    } else {
      console.error('Error adding purchase:', error);
    }
  }
}

/**
 * Generate internal password for Supabase (never shown to user).
 * User will set their own password via success page or password reset.
 */
function generateInternalPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  let password = '';
  for (let i = 0; i < 24; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// ============================================
// EMAIL FUNCTIONS
// ============================================

/**
 * Fallback welcome email for users who closed browser before completing success page.
 * Directs them to set their password via the password reset flow.
 */
async function sendFallbackWelcomeEmail(
  email: string,
  name: string,
  courseType: string
) {
  const courseName = getCourseDisplayName(courseType);
  const firstName = name ? name.split(' ')[0] : '';
  
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.spanish.from,
      replyTo: EMAIL_CONFIG.spanish.replyTo,
      to: email,
      subject: '¡Todo listo! — configure su acceso',
      html: generateFallbackWelcomeEmailHTML(firstName, email, courseName, courseType),
    });
  } catch (error) {
    console.error('Error sending fallback welcome email:', error);
  }
}

async function sendExistingUserEmail(
  email: string,
  name: string,
  courseType: string
) {
  const courseName = getCourseDisplayName(courseType);
  const firstName = name ? name.split(' ')[0] : '';
  
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.spanish.from,
      replyTo: EMAIL_CONFIG.spanish.replyTo,
      to: email,
      subject: '¡Todo listo! — su nueva clase lo espera',
      html: generateExistingUserEmailHTML(firstName, email, courseName),
    });
  } catch (error) {
    console.error('Error sending course added email:', error);
  }
}

async function sendAlreadyOwnedEmail(
  email: string,
  name: string,
  attemptedCourseType: string,
  ownedCourses: string[]
) {
  const attemptedCourseName = getCourseDisplayName(attemptedCourseType);
  const firstName = name ? name.split(' ')[0] : '';
  
  // Determine what they currently have access to for the email
  const hasBundle = ownedCourses.includes('bundle');
  const accessDescription = hasBundle 
    ? 'el Paquete Completo (ambas clases)'
    : ownedCourses.map(c => getCourseDisplayName(c)).join(' y ');
  
  try {
    await resend.emails.send({
      from: EMAIL_CONFIG.spanish.from,
      replyTo: EMAIL_CONFIG.spanish.replyTo,
      to: email,
      subject: 'Reembolso procesado — ya tiene acceso a esta clase',
      html: generateAlreadyOwnedEmailHTML(firstName, email, attemptedCourseName, accessDescription),
    });
  } catch (error) {
    console.error('Error sending already owned email:', error);
  }
}

function getCourseDisplayName(type: string) {
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

// ============================================
// EMAIL TEMPLATES
// ============================================

function getEmailWrapper(content: string, email: string): string {
  const currentYear = new Date().getFullYear();
  
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
          
          ${content}
          
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

/**
 * Fallback welcome email - no password shown.
 * Directs user to set their password via password reset flow.
 */
function generateFallbackWelcomeEmailHTML(
  firstName: string,
  email: string,
  courseName: string,
  courseType: string
): string {
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';
  
  // Only show second class note for single-class purchases (not bundle)
  const showSecondClassNote = courseType !== 'bundle';
  
  const content = `
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
          está lista. Solo necesita crear una contraseña para acceder.
        </p>
      </td>
    </tr>
    
    <!-- Account Info Box -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #2A2A2A; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                Su cuenta:
              </p>
              
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 12px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <span style="color: rgba(255,255,255,0.6);">Correo electrónico:</span> 
                <a href="mailto:${email}" style="color: #7EC8E3; text-decoration: none;">${email}</a>
              </p>
              
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                Haga clic en el botón de abajo para crear su contraseña y comenzar.
              </p>
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
                href="https://claseparapadres.com/recuperar-contrasena" 
                style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
              >
                Crear Mi Contraseña →
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
  `;

  return getEmailWrapper(content, email);
}

function generateExistingUserEmailHTML(
  firstName: string,
  email: string,
  courseName: string
): string {
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';
  
  const content = `
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
          ¡Nueva clase añadida!
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
          ha sido añadida a su cuenta existente. Puede acceder desde su panel de control.
        </p>
      </td>
    </tr>
    
    <!-- Login Info Box -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #2A2A2A; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                Acceso a su cuenta:
              </p>
              
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 12px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <span style="color: rgba(255,255,255,0.6);">Correo electrónico:</span> 
                <a href="mailto:${email}" style="color: #7EC8E3; text-decoration: none;">${email}</a>
              </p>
              
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                Use la contraseña que creó anteriormente. 
                <a href="https://claseparapadres.com/recuperar-contrasena" style="color: #7EC8E3; text-decoration: underline;">¿Olvidó su contraseña?</a>
              </p>
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
                Continuar a Mi Clase →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content, email);
}

/**
 * Email sent when user already has access to what they're trying to buy.
 * Confirms the refund has been processed.
 */
function generateAlreadyOwnedEmailHTML(
  firstName: string,
  email: string,
  attemptedCourseName: string,
  accessDescription: string
): string {
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';
  
  const content = `
    <!-- Refund Icon -->
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
        <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
          Reembolso procesado
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
          Notamos que intentó comprar la 
          <strong style="color: #7EC8E3;">${attemptedCourseName}</strong>, 
          pero ya tiene acceso a este contenido a través de ${accessDescription}.
        </p>
      </td>
    </tr>
    
    <!-- Refund Confirmation Box -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: rgba(119, 221, 119, 0.1); border-radius: 12px; padding: 20px 24px; border: 1px solid rgba(119, 221, 119, 0.3);">
              <p style="color: #77DD77; font-size: 15px; font-weight: 700; margin: 0 0 8px 0; font-family: 'Courier Prime', Courier, monospace;">
                ✓ Reembolso procesado automáticamente
              </p>
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                El reembolso completo aparecerá en su cuenta dentro de 5-10 días hábiles, dependiendo de su banco.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <tr>
      <td style="padding-bottom: 16px;">
        <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
          Mientras tanto, puede continuar con su clase en cualquier momento:
        </p>
      </td>
    </tr>
    
    <!-- Login Info Box -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #2A2A2A; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                Acceda a su clase:
              </p>
              
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 12px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <span style="color: rgba(255,255,255,0.6);">Correo electrónico:</span> 
                <a href="mailto:${email}" style="color: #7EC8E3; text-decoration: none;">${email}</a>
              </p>
              
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <a href="https://claseparapadres.com/recuperar-contrasena" style="color: #7EC8E3; text-decoration: underline;">¿Olvidó su contraseña? Haga clic aquí para restablecerla.</a>
              </p>
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
  `;

  return getEmailWrapper(content, email);
}
