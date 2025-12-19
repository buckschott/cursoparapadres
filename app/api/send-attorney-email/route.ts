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

    // Send email to attorney
    const { data, error } = await resend.emails.send({
      from: 'Putting Kids First <certificates@cursoparapadres.org>',
      to: [profile.attorney_email],
      subject: `Certificate of Completion - ${profile.legal_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #1e40af; padding: 24px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Putting Kids First®</h1>
          </div>
          
          <div style="padding: 32px; background-color: #f8fafc;">
            <p style="font-size: 16px; color: #334155;">Dear ${profile.attorney_name || 'Counselor'},</p>
            
            <p style="font-size: 16px; color: #334155;">
              Your client, <strong>${profile.legal_name}</strong>, has successfully completed the 
              <strong>${courseName}</strong> through Putting Kids First®.
            </p>
            
            <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin: 24px 0;">
              <h2 style="margin-top: 0; color: #1e40af; font-size: 18px;">Certificate Details</h2>
              <table style="width: 100%; font-size: 14px; color: #334155;">
                <tr>
                  <td style="padding: 8px 0;"><strong>Participant:</strong></td>
                  <td style="padding: 8px 0;">${profile.legal_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Course:</strong></td>
                  <td style="padding: 8px 0;">${courseName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Completion Date:</strong></td>
                  <td style="padding: 8px 0;">${formatDate(completionDate)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Certificate #:</strong></td>
                  <td style="padding: 8px 0;">${cert.certificate_number}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>State:</strong></td>
                  <td style="padding: 8px 0;">${profile.court_state || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>County:</strong></td>
                  <td style="padding: 8px 0;">${profile.court_county || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Case Number:</strong></td>
                  <td style="padding: 8px 0;">${profile.case_number || 'N/A'}</td>
                </tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${downloadUrl}" 
                 style="display: inline-block; background-color: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                Download Certificate PDF
              </a>
            </div>
            
            <div style="background-color: #eff6ff; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>Verify Online:</strong><br>
                <a href="${verifyUrl}" style="color: #1e40af;">${verifyUrl}</a>
              </p>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #64748b;">
                Verification Code: <strong>${cert.verification_code}</strong>
              </p>
            </div>
            
            <p style="font-size: 14px; color: #64748b; margin-top: 32px;">
              Putting Kids First® has been providing court-accepted parenting education since 1993. 
              If you have any questions, please contact us at info@cursoparapadres.org.
            </p>
          </div>
          
          <div style="background-color: #334155; padding: 16px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">
              © 2025 Putting Kids First® | 888-777-2298 | info@cursoparapadres.org
            </p>
          </div>
        </div>
      `,
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
