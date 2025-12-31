import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Generate a temporary password
    const tempPassword = generatePassword();

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: customerEmail,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: customerName,
      },
    });

    if (authError) {
      // User might already exist
      if (authError.message.includes('already been registered')) {
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === customerEmail);
        
        if (user) {
          // Check if user already owns this course
          const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('id')
            .eq('user_id', user.id)
            .eq('course_type', courseType)
            .single();

          if (existingPurchase) {
            // Already owns this course — send "you already own this" email
            console.log(`User ${customerEmail} already owns ${courseType} — sending reminder email`);
            await sendAlreadyOwnedEmail(customerEmail, customerName, courseType);
          } else {
            // Add new course for existing user
            await addPurchase(supabase, user.id, courseType, session.id, session.customer as string, amountPaid);
            await sendExistingUserEmail(customerEmail, customerName, courseType);
          }
        }
      } else {
        console.error('Error creating user:', authError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    } else if (authData.user) {
      // New user created — add their purchase
      await addPurchase(supabase, authData.user.id, courseType, session.id, session.customer as string, amountPaid);
      
      // Send welcome email with login credentials
      await sendWelcomeEmail(customerEmail, customerName, tempPassword, courseType);
    }
  }

  return NextResponse.json({ received: true });
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

// ============================================
// EMAIL FUNCTIONS
// ============================================

async function sendWelcomeEmail(
  email: string,
  name: string,
  password: string,
  courseType: string
) {
  const courseName = getCourseDisplayName(courseType);
  const firstName = name ? name.split(' ')[0] : '';
  
  try {
    await resend.emails.send({
      from: 'Putting Kids First <noreply@cursoparapadres.org>',
      to: email,
      subject: '¡Todo listo! — su curso lo espera',
      html: generateWelcomeEmailHTML(firstName, email, password, courseName),
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
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
      from: 'Putting Kids First <noreply@cursoparapadres.org>',
      to: email,
      subject: '¡Todo listo! — su nuevo curso lo espera',
      html: generateExistingUserEmailHTML(firstName, email, courseName),
    });
  } catch (error) {
    console.error('Error sending course added email:', error);
  }
}

async function sendAlreadyOwnedEmail(
  email: string,
  name: string,
  courseType: string
) {
  const courseName = getCourseDisplayName(courseType);
  const firstName = name ? name.split(' ')[0] : '';
  
  try {
    await resend.emails.send({
      from: 'Putting Kids First <noreply@cursoparapadres.org>',
      to: email,
      subject: 'Ya tiene acceso a este curso',
      html: generateAlreadyOwnedEmailHTML(firstName, email, courseName),
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
      return 'Curso';
  }
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
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
  <title>Putting Kids First</title>
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
          
          <!-- Divider -->
          <tr>
            <td style="padding: 32px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid rgba(255,255,255,0.1);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin: 0 0 16px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                ¿Tiene preguntas? Responda a este correo o escríbanos a 
                <a href="mailto:info@cursoparapadres.org" style="color: #7EC8E3; text-decoration: underline;">info@cursoparapadres.org</a>
              </p>
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0 0 8px 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                © ${currentYear} Putting Kids First® — Todos los derechos reservados.
              </p>
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                Este correo fue enviado a ${email} porque realizó una compra en Putting Kids First®
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

function generateWelcomeEmailHTML(
  firstName: string,
  email: string,
  password: string,
  courseName: string
): string {
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';
  
  const content = `
    <!-- Success Icon -->
    <tr>
      <td align="center" style="padding-bottom: 24px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width: 80px; height: 80px; background-color: #77DD77; border-radius: 50%; text-align: center; vertical-align: middle;">
              <span style="color: #1C1C1C; font-size: 40px; font-weight: bold; line-height: 80px;">✓</span>
            </td>
          </tr>
        </table>
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
    
    <!-- Credentials Box -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
          <tr>
            <td style="background-color: #2A2A2A; border-radius: 12px; padding: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <p style="color: #FFFFFF; font-size: 16px; font-weight: 700; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                Sus credenciales de acceso:
              </p>
              
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 12px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <span style="color: rgba(255,255,255,0.6);">Correo electrónico:</span> 
                <a href="mailto:${email}" style="color: #7EC8E3; text-decoration: none;">${email}</a>
              </p>
              
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 16px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <span style="color: rgba(255,255,255,0.6);">Contraseña temporal:</span> 
                <span style="color: #FFE566; font-family: monospace; font-weight: 600; background-color: rgba(255,229,102,0.1); padding: 2px 8px; border-radius: 4px;">${password}</span>
              </p>
              
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0; font-style: italic; font-family: 'Courier Prime', Courier, monospace;">
                Puede cambiar su contraseña en cualquier momento desde su perfil.
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
                href="https://www.cursoparapadres.org/panel" 
                style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
              >
                Comenzar el Curso →
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
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width: 80px; height: 80px; background-color: #77DD77; border-radius: 50%; text-align: center; vertical-align: middle;">
              <span style="color: #1C1C1C; font-size: 40px; font-weight: bold; line-height: 80px;">✓</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Main Heading -->
    <tr>
      <td align="center" style="padding-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 32px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
          ¡Nuevo curso añadido!
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
                <a href="https://www.cursoparapadres.org/recuperar-contrasena" style="color: #7EC8E3; text-decoration: underline;">¿Olvidó su contraseña?</a>
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
                href="https://www.cursoparapadres.org/panel" 
                style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
              >
                Ir a Mi Panel →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content, email);
}

function generateAlreadyOwnedEmailHTML(
  firstName: string,
  email: string,
  courseName: string
): string {
  const greeting = firstName ? `Hola ${firstName},` : 'Hola,';
  
  const content = `
    <!-- Info Icon -->
    <tr>
      <td align="center" style="padding-bottom: 24px;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="width: 80px; height: 80px; background-color: #7EC8E3; border-radius: 50%; text-align: center; vertical-align: middle;">
              <span style="color: #1C1C1C; font-size: 40px; font-weight: bold; line-height: 80px;">i</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    
    <!-- Main Heading -->
    <tr>
      <td align="center" style="padding-bottom: 24px;">
        <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
          Ya tiene acceso a este curso
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
          <strong style="color: #77DD77;">${courseName}</strong>, 
          pero ya tiene acceso a este curso en su cuenta.
        </p>
      </td>
    </tr>
    
    <tr>
      <td style="padding-bottom: 16px;">
        <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
          No se preocupe — procesaremos un reembolso automático por este cargo duplicado. El reembolso aparecerá en su cuenta dentro de 5-10 días hábiles.
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
                Acceda a su curso existente:
              </p>
              
              <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0 0 12px 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <span style="color: rgba(255,255,255,0.6);">Correo electrónico:</span> 
                <a href="mailto:${email}" style="color: #7EC8E3; text-decoration: none;">${email}</a>
              </p>
              
              <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; line-height: 22px; font-family: 'Courier Prime', Courier, monospace;">
                <a href="https://www.cursoparapadres.org/recuperar-contrasena" style="color: #7EC8E3; text-decoration: underline;">¿Olvidó su contraseña? Haga clic aquí para restablecerla.</a>
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
                href="https://www.cursoparapadres.org/iniciar-sesion" 
                style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
              >
                Iniciar Sesión →
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;

  return getEmailWrapper(content, email);
}