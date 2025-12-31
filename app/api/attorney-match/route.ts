import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Get profile with attorney info
    const { data: profile } = await supabase
      .from('profiles')
      .select('legal_name, court_state, court_county, case_number, attorney_name, attorney_email')
      .eq('id', cert.user_id)
      .single();

    // If no attorney email, skip silently
    if (!profile?.attorney_email) {
      return NextResponse.json({ success: true, skipped: true, reason: 'No attorney email provided' });
    }

    // Get course progress for dates
    const { data: progress } = await supabase
      .from('course_progress')
      .select('completed_at')
      .eq('user_id', cert.user_id)
      .eq('course_type', cert.course_type)
      .single();

    const completionDate = progress?.completed_at || cert.issued_at;
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
    };

    const courseNames: Record<string, string> = {
      coparenting: 'Co-Parenting Class',
      parenting: 'Parenting Class',
      bundle: 'Co-Parenting & Parenting Classes'
    };

    const courseName = courseNames[cert.course_type] || cert.course_type;
    const verifyUrl = `https://www.cursoparapadres.org/verificar/${cert.verification_code}`;
    const downloadUrl = `https://www.cursoparapadres.org/api/certificate/${cert.id}`;
    const currentYear = new Date().getFullYear();

    // Send email to attorney
    const { data, error } = await resend.emails.send({
      from: 'Putting Kids First <certificates@cursoparapadres.org>',
      to: [profile.attorney_email],
      subject: `Certificate of Completion - ${profile.legal_name}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion - ${profile.legal_name}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #1C1C1C;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom: 32px;">
              <img 
                src="https://www.cursoparapadres.org/logo.svg" 
                width="40" 
                height="40" 
                alt="PKF" 
                style="display: block; margin-bottom: 8px;"
              />
              <p style="color: #FFFFFF; font-size: 20px; font-weight: 600; margin: 0; font-family: 'Short Stack', cursive, sans-serif;">
                Putting Kids First<sup style="font-size: 10px; position: relative; top: -8px;">®</sup>
              </p>
            </td>
          </tr>
          
          <!-- Certificate Icon -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="width: 70px; height: 70px; background-color: #7EC8E3; border-radius: 50%; text-align: center; vertical-align: middle;">
                    <span style="color: #1C1C1C; font-size: 32px; line-height: 70px;">📜</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Heading -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #FFFFFF; font-size: 28px; font-weight: 700; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Certificate of Completion
              </h1>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding-bottom: 16px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Dear ${profile.attorney_name || 'Counselor'},
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Your client, <strong style="color: #77DD77;">${profile.legal_name}</strong>, has successfully completed the 
                <strong style="color: #7EC8E3;">${courseName}</strong> through Putting Kids First®.
              </p>
            </td>
          </tr>
          
          <!-- Certificate Details Box -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #2A2A2A; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
                <tr>
                  <td style="padding: 24px;">
                    <p style="color: #FFFFFF; font-size: 14px; font-weight: 700; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 0.5px; font-family: 'Courier Prime', Courier, monospace;">
                      Certificate Details
                    </p>
                    
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; font-family: 'Courier Prime', Courier, monospace;">
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6); width: 40%;">Participant:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${profile.legal_name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Course:</td>
                        <td style="padding: 8px 0; color: #7EC8E3;">${courseName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Completion Date:</td>
                        <td style="padding: 8px 0; color: #77DD77;">${formatDate(completionDate)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Certificate #:</td>
                        <td style="padding: 8px 0; color: #FFE566; font-family: monospace;">${cert.certificate_number}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">State:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${profile.court_state || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">County:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${profile.court_county || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Case Number:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${profile.case_number || 'N/A'}</td>
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
                  <td style="background-color: #7EC8E3; border-radius: 12px;">
                    <a 
                      href="${downloadUrl}" 
                      style="display: inline-block; padding: 16px 32px; color: #1C1C1C; font-size: 16px; font-weight: 700; text-decoration: none; font-family: 'Courier Prime', Courier, monospace;"
                    >
                      Download Certificate PDF
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Verification Box -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: rgba(126,200,227,0.1); border-radius: 12px; border: 1px solid rgba(126,200,227,0.3);">
                <tr>
                  <td style="padding: 16px 24px;">
                    <p style="color: #7EC8E3; font-size: 14px; font-weight: 700; margin: 0 0 8px 0; font-family: 'Courier Prime', Courier, monospace;">
                      Verify Online:
                    </p>
                    <p style="margin: 0 0 8px 0;">
                      <a href="${verifyUrl}" style="color: #7EC8E3; font-size: 14px; font-family: 'Courier Prime', Courier, monospace;">${verifyUrl}</a>
                    </p>
                    <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                      Verification Code: <strong style="color: #FFE566;">${cert.verification_code}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- About -->
          <tr>
            <td style="padding: 24px 0;">
              <p style="color: rgba(255,255,255,0.5); font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Putting Kids First® has been providing court-accepted parenting education since 1993. 
                If you have any questions, please contact us at info@cursoparapadres.org.
              </p>
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding-bottom: 24px;">
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
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                © ${currentYear} Putting Kids First® | 888-777-2298 | info@cursoparapadres.org
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
      console.error('Failed to send attorney email:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, emailId: data?.id });

  } catch (error) {
    console.error('Attorney email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}