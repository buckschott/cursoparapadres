import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin emails that can access this endpoint
const ADMIN_EMAILS = ['jonescraig@me.com'];

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // Get admin user from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, body } = await request.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Generate HTML email
    const htmlBody = generateSupportEmailHTML(body);

    // Send via Resend
    const { data, error } = await resend.emails.send({
      from: 'Clase para Padres <hola@claseparapadres.com>',
      replyTo: 'info@claseparapadres.com',
      to: to,
      subject: subject,
      html: htmlBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      message: `Email sent to ${to}` 
    });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

function generateSupportEmailHTML(body: string): string {
  // Convert line breaks to HTML
  const formattedBody = body
    .split('\n')
    .map(line => line.trim() === '' ? '<br>' : `<p style="margin: 0 0 10px 0;">${line}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #1C1C1C;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px;">
          
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <img src="https://www.claseparapadres.com/images/email/logo-email.png" 
                   alt="Clase para Padres" 
                   width="200" 
                   style="display: block; max-width: 200px; height: auto;">
            </td>
          </tr>
          
          <!-- Content Card -->
          <tr>
            <td style="background-color: #2C2C2C; border-radius: 16px; padding: 40px; border: 1px solid rgba(255,255,255,0.1);">
              
              <!-- Body -->
              <div style="color: #FFFFFF; font-size: 16px; line-height: 1.6;">
                ${formattedBody}
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top: 30px;">
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} Clase para Padres
              </p>
              <p style="color: rgba(255,255,255,0.3); font-size: 11px; margin: 10px 0 0 0;">
                claseparapadres.com
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
