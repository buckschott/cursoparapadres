import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;
const resend = new Resend(process.env.RESEND_API_KEY);

const ICON_BASE_URL = 'https://claseparapadres.com/images/email';

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

    // If no attorney email, return clear response (not an error)
    if (!profile?.attorney_email) {
      return NextResponse.json({ 
        success: true, 
        skipped: true, 
        reason: 'no_attorney_email',
        message: 'No attorney email provided' 
      });
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
    const verifyUrl = `https://claseparapadres.com/verificar/${cert.verification_code}`;
    const downloadUrl = `https://claseparapadres.com/api/certificate/${cert.id}`;
    const currentYear = new Date().getFullYear();

    // Send email to attorney
    const { data, error } = await resend.emails.send({
      from: 'Putting Kids First <certificates@claseparapadres.com>',
      replyTo: 'info@puttingkidsfirst.org',
      to: [profile.attorney_email],
      subject: `Certificate of Completion - ${profile.legal_name}`,
      html: generateAttorneyEmailHTML({
        attorneyName: profile.attorney_name,
        participantName: profile.legal_name,
        courseName,
        completionDate: formatDate(completionDate),
        certificateNumber: cert.certificate_number,
        verificationCode: cert.verification_code,
        courtState: profile.court_state,
        courtCounty: profile.court_county,
        caseNumber: profile.case_number,
        downloadUrl,
        verifyUrl,
        currentYear,
      }),
    });

    if (error) {
      console.error('Failed to send attorney email:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send email',
        details: error.message 
      }, { status: 500 });
    }

    // ✅ Record successful send in database
    const { error: updateError } = await supabase
      .from('certificates')
      .update({
        attorney_email_sent_at: new Date().toISOString(),
        attorney_email_sent_to: profile.attorney_email,
      })
      .eq('id', certificateId);

    if (updateError) {
      // Email sent but DB update failed - log but don't fail the request
      console.error('Failed to record attorney email send:', updateError);
    }

    return NextResponse.json({ 
      success: true, 
      emailId: data?.id,
      sentTo: profile.attorney_email,
      sentAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Attorney email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

interface AttorneyEmailData {
  attorneyName: string | null;
  participantName: string;
  courseName: string;
  completionDate: string;
  certificateNumber: string;
  verificationCode: string;
  courtState: string | null;
  courtCounty: string | null;
  caseNumber: string | null;
  downloadUrl: string;
  verifyUrl: string;
  currentYear: number;
}

function generateAttorneyEmailHTML(data: AttorneyEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate of Completion - ${data.participantName}</title>
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
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          
          <!-- Certificate Icon -->
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img 
                src="${ICON_BASE_URL}/icon-certificate.png" 
                width="80" 
                height="80" 
                alt="Certificate" 
                style="display: block;"
              />
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
                Dear ${data.attorneyName || 'Counselor'},
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="padding-bottom: 24px;">
              <p style="color: rgba(255,255,255,0.85); font-size: 16px; line-height: 26px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Your client, <strong style="color: #77DD77;">${data.participantName}</strong>, has successfully completed the 
                <strong style="color: #7EC8E3;">${data.courseName}</strong> through Putting Kids First®.
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
                        <td style="padding: 8px 0; color: #FFFFFF;">${data.participantName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Course:</td>
                        <td style="padding: 8px 0; color: #7EC8E3;">${data.courseName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Completion Date:</td>
                        <td style="padding: 8px 0; color: #77DD77;">${data.completionDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Certificate #:</td>
                        <td style="padding: 8px 0; color: #FFE566; font-family: monospace;">${data.certificateNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">State:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${data.courtState || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">County:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${data.courtCounty || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; color: rgba(255,255,255,0.6);">Case Number:</td>
                        <td style="padding: 8px 0; color: #FFFFFF;">${data.caseNumber || 'N/A'}</td>
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
                      href="${data.downloadUrl}" 
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
                      <a href="${data.verifyUrl}" style="color: #7EC8E3; font-size: 14px; font-family: 'Courier Prime', Courier, monospace;">${data.verifyUrl}</a>
                    </p>
                    <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                      Verification Code: <strong style="color: #FFE566;">${data.verificationCode}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Professional Signature -->
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
              <p style="color: rgba(255,255,255,0.85); font-size: 15px; line-height: 24px; margin: 0 0 16px 0; font-family: 'Courier Prime', Courier, monospace;">
                If you'd like materials to share with future clients who need to complete this requirement, just reply to this email and we'll send them at no cost.
              </p>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; line-height: 22px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                — Geri Jones<br/>
                <span style="color: rgba(255,255,255,0.4);">Executive Director, Putting Kids First®</span>
              </p>
            </td>
          </tr>
          
          <!-- About / Heritage -->
          <tr>
            <td style="padding: 24px 0;">
              <p style="color: rgba(255,255,255,0.4); font-size: 13px; line-height: 20px; margin: 0; font-family: 'Courier Prime', Courier, monospace;">
                Putting Kids First® has been providing court-accepted parenting education since 1993.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top: 1px solid rgba(255,255,255,0.1);"></td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td align="center" style="padding-top: 24px;">
              <p style="color: rgba(255,255,255,0.3); font-size: 12px; margin: 0; line-height: 18px; font-family: 'Courier Prime', Courier, monospace;">
                © ${data.currentYear} Putting Kids First® | 888-777-2298 | info@puttingkidsfirst.org
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