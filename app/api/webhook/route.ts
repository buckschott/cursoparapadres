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
    const customerName = session.customer_details?.name || '';
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
      // User might already exist - try to get their ID
      if (authError.message.includes('already been registered')) {
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        const user = existingUser.users.find(u => u.email === customerEmail);
        
        if (user) {
          // Add purchase for existing user
          await addPurchase(supabase, user.id, courseType, session.id, session.customer as string, amountPaid);
          
          // Send email about new course access
          await sendExistingUserEmail(customerEmail, customerName, courseType);
        }
      } else {
        console.error('Error creating user:', authError);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
      }
    } else if (authData.user) {
      // New user created - add their purchase
      await addPurchase(supabase, authData.user.id, courseType, session.id, session.customer as string, amountPaid);
      
      // Send welcome email with login credentials
      await sendWelcomeEmail(customerEmail, customerName, tempPassword, courseType);
    }
  }

  return NextResponse.json({ received: true });
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
    console.error('Error adding purchase:', error);
  }
}

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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hola${firstName ? ` ${firstName}` : ''},</p>
          
          <p>Gracias por elegir Putting Kids First.</p>
          
          <p>Su <strong>${courseName}</strong> está lista. Puede comenzar ahora mismo — su progreso se guarda automáticamente para que avance a su propio ritmo.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Sus credenciales de acceso:</h3>
            <p><strong>Correo electrónico:</strong> ${email}</p>
            <p><strong>Contraseña temporal:</strong> ${password}</p>
          </div>
          
          <p><strong>Importante:</strong> Le recomendamos cambiar su contraseña después de iniciar sesión por primera vez.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.cursoparapadres.org/iniciar-sesion" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Comenzar el Curso
            </a>
          </div>
          
          <p>¿Preguntas? Contáctenos en info@cursoparapadres.org</p>
          
          <p>— El equipo de Putting Kids First</p>
        </div>
      `,
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
      subject: '¡Todo listo! — su curso lo espera',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <p>Hola${firstName ? ` ${firstName}` : ''},</p>
          
          <p>Gracias por elegir Putting Kids First.</p>
          
          <p>Su <strong>${courseName}</strong> está lista. Puede comenzar ahora mismo — su progreso se guarda automáticamente para que avance a su propio ritmo.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.cursoparapadres.org/panel" 
               style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Comenzar el Curso
            </a>
          </div>
          
          <p>¿Preguntas? Contáctenos en info@cursoparapadres.org</p>
          
          <p>— El equipo de Putting Kids First</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending course added email:', error);
  }
}

function getCourseDisplayName(type: string) {
  switch (type) {
    case 'coparenting':
      return 'Clase de Coparentalidad';
    case 'parenting':
      return 'Clase de Crianza';
    case 'bundle':
      return 'El Paquete Completo';
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