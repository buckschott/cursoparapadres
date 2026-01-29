import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { isAdmin } from '@/lib/admin';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper to generate random strings
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper to generate certificate number
function generateCertificateNumber(): string {
  return `PKF-${generateRandomString(6).toUpperCase()}`;
}

// Helper to generate verification code
function generateVerificationCode(): string {
  return generateRandomString(8).toUpperCase();
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient();

  try {
    // Get admin user from Authorization header (passed from client)
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let adminEmail: string | null = null;

    if (token) {
      const { data: { user } } = await supabase.auth.getUser(token);
      adminEmail = user?.email || null;
    }

    if (!adminEmail || !isAdmin(adminEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      // ========================================================================
      // FIX ORPHAN USER
      // ========================================================================
      case 'fix_orphan_user': {
        const { userId, email } = body;
        if (!userId || !email) {
          return NextResponse.json({ error: 'userId and email required' }, { status: 400 });
        }

        // Create missing profile
        const { error: profileError } = await supabase.from('profiles').insert({
          id: userId,
          email: email,
          full_name: 'User',
          profile_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Orphan user fixed — profile created',
        });
      }

      // ========================================================================
      // RESET PASSWORD
      // ========================================================================
      case 'reset_password': {
        const { userId, email } = body;
        if (!email) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Generate password reset link
        const { data, error } = await supabase.auth.admin.generateLink({
          type: 'recovery',
          email: email,
          options: {
            redirectTo: 'https://www.claseparapadres.com/actualizar-contrasena',
          },
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Send custom password reset email via our existing endpoint
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.claseparapadres.com';
        await fetch(`${baseUrl}/api/send-password-reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            resetLink: data.properties?.action_link,
          }),
        });

        return NextResponse.json({
          success: true,
          message: 'Password reset email sent',
        });
      }

      // ========================================================================
      // VERIFY EMAIL
      // ========================================================================
      case 'verify_email': {
        const { userId } = body;
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { error } = await supabase.auth.admin.updateUserById(userId, {
          email_confirm: true,
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Email verified successfully',
        });
      }

      // ========================================================================
      // MARK PROFILE COMPLETE
      // ========================================================================
      case 'mark_profile_complete': {
        const { userId } = body;
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('profiles')
          .update({ profile_completed: true, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Profile marked as complete',
        });
      }

      // ========================================================================
      // UPDATE PROFILE FIELDS
      // ========================================================================
      case 'update_profile': {
        const { userId, legal_name, court_state, court_county, case_number, attorney_name, attorney_email } = body;
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // Build update object with only provided fields
        const updateData: Record<string, string> = {
          updated_at: new Date().toISOString(),
        };

        if (legal_name !== undefined) updateData.legal_name = legal_name;
        if (court_state !== undefined) updateData.court_state = court_state;
        if (court_county !== undefined) updateData.court_county = court_county;
        if (case_number !== undefined) updateData.case_number = case_number;
        if (attorney_name !== undefined) updateData.attorney_name = attorney_name;
        if (attorney_email !== undefined) updateData.attorney_email = attorney_email;

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also update certificate participant_name if legal_name changed and cert exists
        if (legal_name) {
          await supabase
            .from('certificates')
            .update({ participant_name: legal_name })
            .eq('user_id', userId);
        }

        return NextResponse.json({
          success: true,
          message: 'Profile updated successfully',
        });
      }

      // ========================================================================
      // RESEND WELCOME EMAIL
      // ========================================================================
      case 'resend_welcome_email': {
        const { userId, email } = body;
        if (!email) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Get user's purchases to determine course
        const { data: purchases } = await supabase
          .from('purchases')
          .select('course_type')
          .eq('user_id', userId)
          .eq('status', 'active')
          .limit(1);

        const courseName =
          purchases?.[0]?.course_type === 'parenting'
            ? 'Clase de Crianza'
            : purchases?.[0]?.course_type === 'bundle'
            ? 'El Paquete Completo'
            : 'Clase de Coparentalidad';

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.claseparapadres.com';

        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="${baseUrl}/images/email/icon-checkmark.png" width="80" height="80" alt="">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #77DD77; font-size: 32px; margin: 0;">¡Todo listo!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px;">
              <p>Su acceso a <span style="color: #77DD77; font-weight: bold;">${courseName}</span> está listo.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${baseUrl}/iniciar-sesion" style="display: inline-block; background-color: #77DD77; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold;">
                Comenzar la Clase →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p>— El equipo de Clase para Padres</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        await resend.emails.send({
          from: 'Clase para Padres <hola@claseparapadres.com>',
          to: email,
          subject: '¡Todo listo! — su clase lo espera',
          html: emailHtml,
        });

        return NextResponse.json({
          success: true,
          message: 'Welcome email sent',
        });
      }

      // ========================================================================
      // GRANT COURSE ACCESS
      // ========================================================================
      case 'grant_course_access': {
        const { userId, courseType } = body;
        if (!userId || !courseType) {
          return NextResponse.json({ error: 'userId and courseType required' }, { status: 400 });
        }

        // Check for existing purchase
        const { data: existingPurchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('course_type', courseType)
          .single();

        if (existingPurchase) {
          return NextResponse.json({
            success: true,
            message: `User already has ${courseType} access`,
            alreadyHad: true,
          });
        }

        // Create purchase
        const { error: purchaseError } = await supabase.from('purchases').insert({
          user_id: userId,
          course_type: courseType,
          stripe_payment_id: `admin_granted_${generateRandomString(10)}`,
          amount_paid: courseType === 'bundle' ? 8000 : 6000,
          status: 'active',
        });

        if (purchaseError) {
          return NextResponse.json({ error: purchaseError.message }, { status: 500 });
        }

        // Create course progress
        const coursesToCreate = courseType === 'bundle' ? ['coparenting', 'parenting'] : [courseType];

        for (const ct of coursesToCreate) {
          const { data: existingProgress } = await supabase
            .from('course_progress')
            .select('id')
            .eq('user_id', userId)
            .eq('course_type', ct)
            .single();

          if (!existingProgress) {
            await supabase.from('course_progress').insert({
              user_id: userId,
              course_type: ct,
              current_lesson: 1,
              lessons_completed: [],
              started_at: new Date().toISOString(),
            });
          }
        }

        return NextResponse.json({
          success: true,
          message: `Granted ${courseType} access`,
        });
      }

      // ========================================================================
      // ISSUE REFUND
      // ========================================================================
      case 'issue_refund': {
        const { purchaseId, stripePaymentId } = body;
        if (!purchaseId) {
          return NextResponse.json({ error: 'purchaseId required' }, { status: 400 });
        }

        // Update purchase status
        const { error: updateError } = await supabase
          .from('purchases')
          .update({ status: 'refunded' })
          .eq('id', purchaseId);

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Issue Stripe refund if we have a payment ID
        if (stripePaymentId && stripePaymentId.startsWith('pi_')) {
          try {
            await stripe.refunds.create({
              payment_intent: stripePaymentId,
            });
          } catch (stripeErr) {
            console.error('Stripe refund error:', stripeErr);
            // Continue even if refund fails - we've marked it in our DB
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Refund processed',
        });
      }

      // ========================================================================
      // CREATE PROGRESS RECORD
      // ========================================================================
      case 'create_progress_record': {
        const { userId, courseType } = body;
        if (!userId || !courseType) {
          return NextResponse.json({ error: 'userId and courseType required' }, { status: 400 });
        }

        const { error } = await supabase.from('course_progress').insert({
          user_id: userId,
          course_type: courseType,
          lessons_completed: [],
          started_at: new Date().toISOString(),
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Progress record created',
        });
      }

      // ========================================================================
      // COMPLETE ALL LESSONS
      // ========================================================================
      case 'complete_all_lessons': {
        const { progressId, userId, courseType } = body;
        if (!progressId) {
          return NextResponse.json({ error: 'progressId required' }, { status: 400 });
        }

        const allLessons = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

        const { error } = await supabase
          .from('course_progress')
          .update({
            lessons_completed: allLessons,
            current_lesson: 15,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', progressId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'All 15 lessons marked complete',
        });
      }

      // ========================================================================
      // RESET PROGRESS
      // ========================================================================
      case 'reset_progress': {
        const { progressId } = body;
        if (!progressId) {
          return NextResponse.json({ error: 'progressId required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('course_progress')
          .update({
            lessons_completed: [],
            current_lesson: null,
            quiz_score: null,
            completed_at: null,
            last_accessed: new Date().toISOString(),
          })
          .eq('id', progressId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Progress reset to beginning',
        });
      }

      // ========================================================================
      // MARK EXAM PASSED
      // ========================================================================
      case 'mark_exam_passed': {
        const { attemptId } = body;
        if (!attemptId) {
          return NextResponse.json({ error: 'attemptId required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('exam_attempts')
          .update({
            passed: true,
            score: 18, // 90%
            completed_at: new Date().toISOString(),
          })
          .eq('id', attemptId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Exam marked as passed',
        });
      }

      // ========================================================================
      // CREATE PASSING ATTEMPT
      // ========================================================================
      case 'create_passing_attempt': {
        const { userId, courseType } = body;
        if (!userId || !courseType) {
          return NextResponse.json({ error: 'userId and courseType required' }, { status: 400 });
        }

        // Get the user's purchase
        const { data: purchase } = await supabase
          .from('purchases')
          .select('id, exam_version')
          .eq('user_id', userId)
          .or(`course_type.eq.${courseType},course_type.eq.bundle`)
          .eq('status', 'active')
          .single();

        const { error } = await supabase.from('exam_attempts').insert({
          user_id: userId,
          purchase_id: purchase?.id || null,
          version: purchase?.exam_version || 'A',
          questions_shown: [],
          answers_given: {},
          score: 18,
          passed: true,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also update course progress
        await supabase
          .from('course_progress')
          .update({
            quiz_score: 90,
            completed_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .eq('course_type', courseType);

        return NextResponse.json({
          success: true,
          message: 'Passing exam attempt created',
        });
      }

      // ========================================================================
      // GENERATE CERTIFICATE
      // ========================================================================
      case 'generate_certificate': {
        const { userId, courseType, participantName } = body;
        if (!userId || !courseType) {
          return NextResponse.json({ error: 'userId and courseType required' }, { status: 400 });
        }

        const certificateNumber = generateCertificateNumber();
        const verificationCode = generateVerificationCode();

        const { error } = await supabase.from('certificates').insert({
          user_id: userId,
          course_type: courseType,
          certificate_number: certificateNumber,
          verification_code: verificationCode,
          participant_name: participantName || 'Participant',
          issued_at: new Date().toISOString(),
        });

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Certificate generated: ${certificateNumber}`,
        });
      }

      // ========================================================================
      // RESEND CERTIFICATE EMAIL
      // ========================================================================
      case 'resend_certificate_email': {
        const { certificateId, email } = body;
        if (!certificateId || !email) {
          return NextResponse.json({ error: 'certificateId and email required' }, { status: 400 });
        }

        // Get certificate details
        const { data: cert } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', certificateId)
          .single();

        if (!cert) {
          return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.claseparapadres.com';

        // Send certificate email via existing endpoint
        await fetch(`${baseUrl}/api/send-certificate-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            certificateId: cert.id,
            participantName: cert.participant_name,
            courseName: cert.course_type === 'parenting' ? 'Clase de Crianza' : 'Clase de Coparentalidad',
            certificateNumber: cert.certificate_number,
            verificationCode: cert.verification_code,
          }),
        });

        return NextResponse.json({
          success: true,
          message: 'Certificate email sent to student',
        });
      }

      // ========================================================================
      // RESEND ATTORNEY EMAIL
      // ========================================================================
      case 'resend_attorney_email': {
        const { certificateId, attorneyEmail } = body;
        if (!certificateId || !attorneyEmail) {
          return NextResponse.json({ error: 'certificateId and attorneyEmail required' }, { status: 400 });
        }

        // Get certificate details
        const { data: cert } = await supabase
          .from('certificates')
          .select('*')
          .eq('id', certificateId)
          .single();

        if (!cert) {
          return NextResponse.json({ error: 'Certificate not found' }, { status: 404 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.claseparapadres.com';

        // Send attorney email via existing endpoint
        await fetch(`${baseUrl}/api/send-attorney-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attorneyEmail,
            certificateId: cert.id,
            participantName: cert.participant_name,
            courseName: cert.course_type === 'parenting' ? 'Parenting Skills Class' : 'Co-Parenting Class',
            certificateNumber: cert.certificate_number,
            verificationCode: cert.verification_code,
          }),
        });

        return NextResponse.json({
          success: true,
          message: 'Certificate email sent to attorney',
        });
      }

      // ========================================================================
      // UPDATE CERTIFICATE NAME
      // ========================================================================
      case 'update_certificate_name': {
        const { certificateId, newName } = body;
        if (!certificateId || !newName) {
          return NextResponse.json({ error: 'certificateId and newName required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('certificates')
          .update({ participant_name: newName })
          .eq('id', certificateId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Certificate name updated to: ${newName}`,
        });
      }

      // ========================================================================
      // DELETE CERTIFICATE
      // ========================================================================
      case 'delete_certificate': {
        const { certificateId } = body;
        if (!certificateId) {
          return NextResponse.json({ error: 'certificateId required' }, { status: 400 });
        }

        const { error } = await supabase.from('certificates').delete().eq('id', certificateId);

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: 'Certificate deleted',
        });
      }

      // ========================================================================
      // RESET USER (Keep Auth)
      // ========================================================================
      case 'reset_user': {
        const { userId, email } = body;
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // Delete in order (respecting foreign keys)
        await supabase.from('certificates').delete().eq('user_id', userId);
        await supabase.from('exam_attempts').delete().eq('user_id', userId);
        await supabase.from('course_progress').delete().eq('user_id', userId);
        await supabase.from('purchases').delete().eq('user_id', userId);

        // Reset profile
        await supabase
          .from('profiles')
          .update({
            full_name: 'User',
            legal_name: null,
            phone: null,
            mailing_address: null,
            case_number: null,
            court_county: null,
            court_state: null,
            attorney_name: null,
            attorney_email: null,
            attorney_id: null,
            profile_completed: false,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);

        return NextResponse.json({
          success: true,
          message: 'User data reset (auth account preserved)',
        });
      }

      // ========================================================================
      // DELETE USER COMPLETELY
      // ========================================================================
      case 'delete_user': {
        const { userId, email } = body;
        if (!userId) {
          return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // Delete all data
        await supabase.from('certificates').delete().eq('user_id', userId);
        await supabase.from('exam_attempts').delete().eq('user_id', userId);
        await supabase.from('course_progress').delete().eq('user_id', userId);
        await supabase.from('purchases').delete().eq('user_id', userId);
        await supabase.from('profiles').delete().eq('id', userId);

        // Delete auth user
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) {
          return NextResponse.json({ error: authError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `User ${email || userId} permanently deleted`,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('Quick action error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Action failed' },
      { status: 500 }
    );
  }
}
