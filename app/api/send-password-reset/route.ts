import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const resend = new Resend(process.env.RESEND_API_KEY);

const ICON_BASE_URL = 'https://claseparapadres.com/images/email';

const EMAIL_CONFIG = {
  from: 'Clase para Padres <info@claseparapadres.com>',
  replyTo: 'info@claseparapadres.com',
};

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Generate password reset link using Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: 'https://claseparapadres.com/actualizar-contrasena',
      },
    });

    if (error) {
      console.error('Error generating reset link:', error);
      // Don't reveal if email exists or not for security
      return NextResponse.json({ success: true });
    }

    if (!data?.properties?.action_link) {
      console.error('No action link generated');
      return NextResponse.json({ success: true });
    }

    // Get user's name from profiles table (efficient single-row query)
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('email', email.toLowerCase())
      .single();

    const firstName = profile?.full_name?.split(' ')[0] || '';

    // Send branded password reset email
    const { error: emailError } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      replyTo: EMAIL_CONFIG.replyTo,
      to: email,
      subject: 'Restablecer su contraseña',
      html: generatePasswordResetEmailHTML({
        firstName,
        email,
        resetLink: data.properties.action_link,
      }),
    });

    if (emailError) {
      console.error('Error sending password reset email:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface PasswordResetEmailData {
  firstName: string;
  email: string;
  resetLink: string;
}

function generatePasswordResetEmailHTML(data: PasswordResetEmailData): string {
  const currentYear = new Date().getFullYear();
  const greeting = data.firstName ? `Hola ${data.firstName},` : 'Hola,';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restablecer su contraseña</title>
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
          
          <!-- Key Icon -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img 
                src="${ICON_BASE_URL}/icon-key.png" 
                width="80" 
                height="80" 
                alt="🔑" 
                style="display: block;"
              />
            </td>
          </tr>
          
          <!-- Main Heading -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Restablecer Contraseña
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
                Recibimos una solicitud para restablecer la contraseña de su cuenta. Haga clic en el botón de abajo para crear una nueva contraseña.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding: 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #77DD77; border-radius: 12px;">
                    <a 
                      href="${data.resetLink}" 
                      style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
                    >
                      Restablecer Mi Contraseña →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Security Note Box -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(255,229,102,0.1); border-radius: 12px; border: 1px solid rgba(255,229,102,0.3);">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="color: #FFE566; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; font-family: 'Courier Prime', Courier, monospace;">
                      🔒 Nota de seguridad
                    </p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                      Este enlace expira en 1 hora. Si no solicitó restablecer su contraseña, puede ignorar este correo — su cuenta está segura.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Button not working fallback -->
          <tr>
            <td style="padding-top: 24px;">
              <p style="color: rgba(255,255,255,0.5); font-size: 13px; line-height: 20px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Si el botón no funciona, visite 
                <a href="https://claseparapadres.com/recuperar-contrasena" style="color: #7EC8E3; text-decoration: underline;">claseparapadres.com/recuperar-contrasena</a> 
                y solicite un nuevo enlace.
              </p>
            </td>
          </tr>
          
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
                Este correo fue enviado a ${data.email}
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