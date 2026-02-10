import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre, email, telefono, clase, mensaje } = body;

    const currentYear = new Date().getFullYear();
    const timestamp = new Date().toLocaleString('en-US', { 
      timeZone: 'America/New_York',
      dateStyle: 'full',
      timeStyle: 'short'
    });

    const { data, error } = await resend.emails.send({
      from: 'Atención al Cliente <atencionalcliente@claseparapadres.com>',
      to: ['hola@claseparapadres.com'],
      subject: `📬 New Inquiry - ${nombre} - claseparapadres.com`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Inquiry from claseparapadres.com</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1C1C1C;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="color: #FFFFFF; font-size: 20px; font-weight: 600; margin: 0; font-family: 'Short Stack', cursive, sans-serif;">
                Putting Kids First<sup style="font-size: 10px; position: relative; top: -8px;">®</sup>
              </p>
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 8px 0 0 0; font-family: 'Courier Prime', Courier, monospace;">
                Internal Notification
              </p>
            </td>
          </tr>
          
          <!-- Alert Badge -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #FFB347; border-radius: 20px; padding: 8px 20px;">
                    <span style="color: #1C1C1C; font-size: 14px; font-weight: 700; font-family: 'Courier Prime', Courier, monospace;">
                      📬 NEW INQUIRY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom: 8px;">
              <h1 style="color: #FFFFFF; font-size: 24px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Contact Form Submission
              </h1>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                from claseparapadres.com (Spanish Site)
              </p>
            </td>
          </tr>
          
          <!-- Details Box -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2A2A2A; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; font-family: 'Courier Prime', Courier, monospace;">
                      <tr>
                        <td style="padding: 10px 0; color: rgba(255,255,255,0.6); width: 30%; vertical-align: top;">Name:</td>
                        <td style="padding: 10px 0; color: #77DD77; font-weight: 700;">${nombre}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: rgba(255,255,255,0.6); vertical-align: top;">Email:</td>
                        <td style="padding: 10px 0;">
                          <a href="mailto:${email}" style="color: #7EC8E3; text-decoration: none;">${email}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: rgba(255,255,255,0.6); vertical-align: top;">Phone:</td>
                        <td style="padding: 10px 0; color: #FFFFFF;">${telefono || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: rgba(255,255,255,0.6); vertical-align: top;">Class:</td>
                        <td style="padding: 10px 0; color: #FFB347; font-weight: 600;">${clase}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Message Box (if provided) -->
          ${mensaje ? `
          <tr>
            <td style="padding-top: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2A2A2A; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 700; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Courier Prime', Courier, monospace;">
                      Message:
                    </p>
                    <p style="color: #FFFFFF; font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace; white-space: pre-wrap;">
                      ${mensaje}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}
          
          <!-- Reply Button -->
          <tr>
            <td align="center" style="padding: 32px 0;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color: #77DD77; border-radius: 12px;">
                    <a 
                      href="mailto:${email}?subject=Re: Su consulta - Putting Kids First" 
                      style="display: inline-block; padding: 14px 28px; color: #1C1C1C; font-size: 14px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
                    >
                      Reply to ${nombre.split(' ')[0]} →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding-bottom: 16px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid rgba(255,255,255,0.1);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Timestamp -->
          <tr>
            <td align="center">
              <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                Received: ${timestamp} ET
              </p>
              <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin: 8px 0 0 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                This is an internal notification from claseparapadres.com
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}