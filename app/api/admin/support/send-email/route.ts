import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';
import { isAdmin } from '@/lib/admin';

// Constants
const MAX_SUBJECT_LENGTH = 200;
const MAX_BODY_LENGTH = 10000;

// Types
interface SendEmailPayload {
  to: string;
  subject: string;
  body: string;
}

/**
 * POST /api/admin/support/send-email
 * 
 * Sends a support email to a customer.
 * Admin-only endpoint.
 */
export async function POST(request: NextRequest) {
  // Initialize Resend inside handler to avoid module-level crashes
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return NextResponse.json({ error: 'Email service not configured' }, { status: 503 });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const supabase = createServerClient();

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // 1. Authorization
    // ─────────────────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!isAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Parse and validate request body
    // ─────────────────────────────────────────────────────────────────────────
    let payload: SendEmailPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { to, subject, body } = payload;

    // Required fields
    if (!to || typeof to !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "to" field' }, { status: 400 });
    }
    if (!subject || typeof subject !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "subject" field' }, { status: 400 });
    }
    if (!body || typeof body !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid "body" field' }, { status: 400 });
    }

    // Length limits
    if (subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json({ 
        error: `Subject exceeds ${MAX_SUBJECT_LENGTH} characters` 
      }, { status: 400 });
    }
    if (body.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ 
        error: `Body exceeds ${MAX_BODY_LENGTH} characters` 
      }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Generate and send email
    // ─────────────────────────────────────────────────────────────────────────
    const htmlBody = generateSupportEmailHTML(body);

    const { data, error } = await resend.emails.send({
      from: 'Clase para Padres <hola@claseparapadres.com>',
      replyTo: 'hola@claseparapadres.com',
      to: to.trim(),
      subject: subject.trim(),
      html: htmlBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Audit log and success response
    // ─────────────────────────────────────────────────────────────────────────
    console.log(`[SUPPORT EMAIL] Admin: ${adminEmail} → Recipient: ${to.trim()} | Subject: "${subject.trim().substring(0, 50)}..."`);

    return NextResponse.json({ 
      success: true, 
      messageId: data?.id,
      message: `Email sent to ${to.trim()}` 
    });

  } catch (error) {
    console.error('Send email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Escape HTML special characters to prevent rendering issues.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate branded HTML email template for support responses.
 */
function generateSupportEmailHTML(body: string): string {
  const formattedBody = escapeHtml(body)
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
              <img src="https://claseparapadres.com/images/email/logo-email.png" 
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
