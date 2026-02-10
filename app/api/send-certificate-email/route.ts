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
    const { certificateId } = await request.json();

    if (!certificateId) {
      return NextResponse.json({ error: 'Certificate ID required' }, { status: 400 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get certificate
    const { data: cert } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single();

    if (!cert) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, legal_name')
      .eq('id', cert.user_id)
      .single();

    if (!profile?.email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 });
    }

    // Get course progress for dates
    const { data: progress } = await supabase
      .from('course_progress')
      .select('started_at, completed_at')
      .eq('user_id', cert.user_id)
      .eq('course_type', cert.course_type)
      .single();

    const completionDate = progress?.completed_at || cert.issued_at;
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      return `${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
    };

    const courseNames: Record<string, string> = {
      coparenting: 'Clase de Coparentalidad',
      parenting: 'Clase de Crianza',
      bundle: 'Paquete Completo'
    };

    const courseName = courseNames[cert.course_type] || 'Clase';
    const downloadUrl = `https://claseparapadres.com/api/certificate/${cert.id}`;
    const firstName = profile.full_name?.split(' ')[0] || profile.legal_name?.split(' ')[0] || '';

    // Send celebration email to student
    const { error } = await resend.emails.send({
      from: EMAIL_CONFIG.from,
      replyTo: EMAIL_CONFIG.replyTo,
      to: profile.email,
      subject: '🎉 ¡Felicidades! Ha completado su clase',
      html: generateStudentCertificateEmailHTML({
        firstName,
        email: profile.email,
        courseName,
        completionDate: formatDate(completionDate),
        certificateNumber: cert.certificate_number,
        verificationCode: cert.verification_code,
        downloadUrl,
      }),
    });

    if (error) {
      console.error('Failed to send student certificate email:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Student certificate email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface StudentCertificateEmailData {
  firstName: string;
  email: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  verificationCode: string;
  downloadUrl: string;
}

function generateStudentCertificateEmailHTML(data: StudentCertificateEmailData): string {
  const currentYear = new Date().getFullYear();
  const greeting = data.firstName ? `Hola ${data.firstName},` : 'Hola,';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>¡Felicidades! Ha completado su clase</title>
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
          
          <!-- Certificate Icon -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img 
                src="${ICON_BASE_URL}/icon-certificate.png" 
                width="80" 
                height="80" 
                alt="🎓" 
                style="display: block;"
              />
            </td>
          </tr>
          
          <!-- Main Heading -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                ¡Felicidades!
              </h1>
              <p style="color: #77DD77; font-size: 16px; margin: 8px 0 0 0; font-family: 'Courier Prime', Courier, monospace;">
                Ha completado su clase exitosamente
              </p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                ${greeting}
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Ha completado con éxito la <strong style="color: #77DD77;">${data.courseName}</strong>. 
                Su certificado oficial está listo para descargar y presentar ante la corte.
              </p>
            </td>
          </tr>
          
          <!-- Journey Complete Visual -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2A2A2A; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Courier Prime', Courier, monospace;">
                      Su Progreso Completado
                    </p>
                    
                    <!-- Step 1 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #77DD77; border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: #1C1C1C; font-size: 14px; font-weight: bold;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; line-height: 24px; font-family: 'Courier Prime', Courier, monospace;">
                            Inscripción completada
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 2 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 12px;">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #77DD77; border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: #1C1C1C; font-size: 14px; font-weight: bold;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; line-height: 24px; font-family: 'Courier Prime', Courier, monospace;">
                            15 lecciones completadas
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Step 3 -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="32" valign="top">
                          <div style="width: 24px; height: 24px; background-color: #77DD77; border-radius: 50%; text-align: center; line-height: 24px;">
                            <span style="color: #1C1C1C; font-size: 14px; font-weight: bold;">✓</span>
                          </div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="color: rgba(255,255,255,0.85); font-size: 14px; margin: 0; line-height: 24px; font-family: 'Courier Prime', Courier, monospace;">
                            Examen aprobado
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Certificate Details Box -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2A2A2A; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Courier Prime', Courier, monospace;">
                      Detalles del Certificado
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; font-family: 'Courier Prime', Courier, monospace;">
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.6);">Clase:</td>
                        <td style="padding: 6px 0; color: #7EC8E3; text-align: right;">${data.courseName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.6);">Fecha:</td>
                        <td style="padding: 6px 0; color: #77DD77; text-align: right;">${data.completionDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.6);">Certificado #:</td>
                        <td style="padding: 6px 0; color: #FFE566; text-align: right; font-family: monospace;">${data.certificateNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; color: rgba(255,255,255,0.6);">Código:</td>
                        <td style="padding: 6px 0; color: #FFE566; text-align: right; font-family: monospace;">${data.verificationCode}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Download Button -->
          <tr>
            <td align="center" style="padding: 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #77DD77; border-radius: 12px;">
                    <a 
                      href="${data.downloadUrl}" 
                      style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 18px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
                    >
                      Descargar Mi Certificado →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Next Steps -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(126,200,227,0.1); border-radius: 12px; border: 1px solid rgba(126,200,227,0.3);">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="color: #7EC8E3; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; font-family: 'Courier Prime', Courier, monospace;">
                      📋 Siguiente Paso
                    </p>
                    <p style="color: rgba(255,255,255,0.7); font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                      Su certificado ya está disponible para presentar ante la corte. Puede descargarlo e imprimirlo, o compartir el código de verificación.
                    </p>
                  </td>
                </tr>
              </table>
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