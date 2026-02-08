import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Admin emails that can access this endpoint
const ADMIN_EMAILS = ['jonescraig@me.com'];

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

// Helper to find an auth user by email (handles pagination)
async function findAuthUserByEmail(supabase: ReturnType<typeof createServerClient>, email: string) {
  let page = 1;
  const perPage = 500;
  while (true) {
    const { data: { users }, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error || !users || users.length === 0) break;
    const found = users.find(u => u.email === email);
    if (found) return found;
    if (users.length < perPage) break; // Last page
    page++;
  }
  return null;
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

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, email, courseType, password, testUserEmail } = body;

    switch (action) {
      // =========================================
      // RESET PASSWORD (for testing login)
      // =========================================
      case 'reset_password': {
        if (!testUserEmail) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Find user in auth
        const authUser = await findAuthUserByEmail(supabase, testUserEmail);

        if (!authUser) {
          return NextResponse.json({ error: 'User not found in auth' }, { status: 404 });
        }

        // Reset password to a known value
        const newPassword = 'test123';
        const { error: updateError } = await supabase.auth.admin.updateUserById(authUser.id, {
          password: newPassword,
        });

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Password reset to: ${newPassword}`,
          password: newPassword,
        });
      }

      // =========================================
      // CREATE TEST USER
      // =========================================
      case 'create_user': {
        if (!email) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        const userPassword = password || generateRandomString(12);

        // Check if user exists in auth
        const existingUser = await findAuthUserByEmail(supabase, email);

        if (existingUser) {
          // User exists in auth â€” check if profile also exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', existingUser.id)
            .single();

          if (existingProfile) {
            // Both auth and profile exist â€” true duplicate
            return NextResponse.json({
              error: 'User already exists',
              userId: existingUser.id
            }, { status: 400 });
          }

          // ORPHAN DETECTED: Auth exists but no profile
          // Recreate the missing profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: existingUser.id,
              email: email,
              full_name: 'Test User',
              profile_completed: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });

          if (profileError) {
            return NextResponse.json({ 
              error: `Orphan user found but failed to recreate profile: ${profileError.message}` 
            }, { status: 500 });
          }

          // Update password if provided (or generate new one)
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: userPassword,
          });

          return NextResponse.json({
            success: true,
            message: 'Orphan user recovered â€” profile recreated',
            userId: existingUser.id,
            email: email,
            password: userPassword,
            note: 'Auth user existed without profile. Profile has been recreated.',
          });
        }

        // No existing user â€” create fresh
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email,
          password: userPassword,
          email_confirm: true,
        });

        if (createError || !newUser.user) {
          return NextResponse.json({ error: createError?.message || 'Failed to create user' }, { status: 500 });
        }

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: newUser.user.id,
            email: email,
            full_name: 'Test User',
            profile_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        return NextResponse.json({
          success: true,
          message: 'Test user created',
          userId: newUser.user.id,
          email: email,
          password: userPassword,
        });
      }

      // =========================================
      // GRANT COURSE ACCESS
      // =========================================
      case 'grant_access': {
        if (!testUserEmail || !courseType) {
          return NextResponse.json({ error: 'Email and courseType required' }, { status: 400 });
        }

        // Find user - first check profiles, then auth for orphans
        let userId: string | null = null;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testUserEmail)
          .single();

        if (profile) {
          userId = profile.id;
        } else {
          // Check if user exists in auth but not profiles (orphan)
          const authUser = await findAuthUserByEmail(supabase, testUserEmail);
          
          if (authUser) {
            // Create missing profile for orphan
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                email: testUserEmail,
                full_name: 'Test User',
                profile_completed: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (profileError) {
              return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 });
            }
            
            userId = authUser.id;
          } else {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
          }
        }

        // Check for existing purchase
        const { data: existingPurchase } = await supabase
          .from('purchases')
          .select('id')
          .eq('user_id', userId)
          .eq('course_type', courseType)
          .single();

        if (existingPurchase) {
          // User already has course - that's fine, just return success
          return NextResponse.json({
            success: true,
            message: `User already has ${courseType} access`,
            userId: userId,
            alreadyHad: true,
          });
        }

        // Create purchase
        const { error: purchaseError } = await supabase
          .from('purchases')
          .insert({
            user_id: userId,
            course_type: courseType,
            stripe_payment_id: `test_${generateRandomString(10)}`,
            amount_paid: courseType === 'bundle' ? 8000 : 6000,
            status: 'active',
          });

        if (purchaseError) {
          return NextResponse.json({ error: purchaseError.message }, { status: 500 });
        }

        // Create course progress
        const coursesToCreate = courseType === 'bundle'
          ? ['coparenting', 'parenting']
          : [courseType];

        for (const ct of coursesToCreate) {
          // Check if progress already exists
          const { data: existingProgress } = await supabase
            .from('course_progress')
            .select('id')
            .eq('user_id', userId)
            .eq('course_type', ct)
            .single();

          if (!existingProgress) {
            await supabase
              .from('course_progress')
              .insert({
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
          userId: userId,
        });
      }

      // =========================================
      // SET PROGRESS STATE
      // =========================================
      case 'set_progress': {
        const { state } = body;
        if (!testUserEmail || !courseType || !state) {
          return NextResponse.json({ error: 'Email, courseType, and state required' }, { status: 400 });
        }

        // Find user
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('email', testUserEmail)
          .single();

        if (!profile) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const progressStates: Record<string, { lessons: number[]; examPassed?: boolean; hasCert?: boolean }> = {
          'new': { lessons: [] },
          'mid_course': { lessons: [1, 2, 3, 4, 5, 6, 7] },
          'exam_ready': { lessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
          'exam_passed': { lessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], examPassed: true },
          'completed': { lessons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], examPassed: true, hasCert: true },
        };

        const targetState = progressStates[state];
        if (!targetState) {
          return NextResponse.json({ error: 'Invalid state' }, { status: 400 });
        }

        // ===========================================
        // ENSURE PURCHASE EXISTS (for any state except 'new')
        // ===========================================
        let purchaseId: string | null = null;
        
        if (state !== 'new') {
          // Check for existing purchase (exact match or bundle)
          const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('id, course_type')
            .eq('user_id', profile.id)
            .or(`course_type.eq.${courseType},course_type.eq.bundle`)
            .maybeSingle();

          if (!existingPurchase) {
            // Create purchase automatically
            const { data: newPurchase, error: purchaseError } = await supabase
              .from('purchases')
              .insert({
                user_id: profile.id,
                course_type: courseType,
                stripe_payment_id: `test_auto_${generateRandomString(10)}`,
                amount_paid: courseType === 'bundle' ? 8000 : 6000,
                status: 'active',
              })
              .select('id')
              .single();

            if (purchaseError) {
              console.error('Auto-purchase creation error:', purchaseError);
            } else {
              purchaseId = newPurchase?.id || null;
            }
          } else {
            purchaseId = existingPurchase.id;
          }
        }

        // ===========================================
        // UPDATE OR CREATE COURSE PROGRESS
        // ===========================================
        const { data: existingProgress } = await supabase
          .from('course_progress')
          .select('id')
          .eq('user_id', profile.id)
          .eq('course_type', courseType)
          .maybeSingle();

        if (existingProgress) {
          await supabase
            .from('course_progress')
            .update({
              lessons_completed: targetState.lessons,
              current_lesson: targetState.lessons.length > 0 ? Math.max(...targetState.lessons) : 1,
              completed_at: targetState.hasCert ? new Date().toISOString() : null,
            })
            .eq('id', existingProgress.id);
        } else {
          await supabase
            .from('course_progress')
            .insert({
              user_id: profile.id,
              course_type: courseType,
              lessons_completed: targetState.lessons,
              current_lesson: targetState.lessons.length > 0 ? Math.max(...targetState.lessons) : 1,
              started_at: new Date().toISOString(),
              completed_at: targetState.hasCert ? new Date().toISOString() : null,
            });
        }

        // ===========================================
        // HANDLE EXAM PASSED STATE
        // ===========================================
        if (targetState.examPassed) {
          // Check if passed exam attempt exists for this course
          const { data: existingAttempt } = await supabase
            .from('exam_attempts')
            .select('id')
            .eq('user_id', profile.id)
            .eq('passed', true)
            .maybeSingle();

          if (!existingAttempt) {
            // Get purchase ID if we don't have it yet
            if (!purchaseId) {
              const { data: purchase } = await supabase
                .from('purchases')
                .select('id')
                .eq('user_id', profile.id)
                .or(`course_type.eq.${courseType},course_type.eq.bundle`)
                .maybeSingle();
              purchaseId = purchase?.id || null;
            }

            await supabase
              .from('exam_attempts')
              .insert({
                user_id: profile.id,
                purchase_id: purchaseId,
                version: 'A',
                questions_shown: [],
                answers_given: {},
                score: 18,
                passed: true,
                started_at: new Date().toISOString(),
                completed_at: new Date().toISOString(),
              });
          }
        }

        // ===========================================
        // HANDLE CERTIFICATE STATE (Full Graduate)
        // ===========================================
        if (targetState.hasCert) {
          // Generate a proper test name based on email
          const emailName = profile.email.split('@')[0];
          const legalName = `Test Graduate (${emailName})`;

          // Update profile as completed with legal name
          const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({
              profile_completed: true,
              legal_name: legalName,
              full_name: legalName,
              court_county: 'Test County',
              court_state: 'Texas',
              updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

          if (profileUpdateError) {
            console.error('Profile update error:', profileUpdateError);
          }

          // Check if certificate exists for this course
          const { data: existingCert } = await supabase
            .from('certificates')
            .select('id')
            .eq('user_id', profile.id)
            .eq('course_type', courseType)
            .maybeSingle();

          if (!existingCert) {
            const { error: certError } = await supabase
              .from('certificates')
              .insert({
                user_id: profile.id,
                course_type: courseType,
                certificate_number: generateCertificateNumber(),
                verification_code: generateVerificationCode(),
                participant_name: legalName,
                issued_at: new Date().toISOString(),
              });

            if (certError) {
              console.error('Certificate creation error:', certError);
            }
          }
        }

        return NextResponse.json({
          success: true,
          message: `Set progress to ${state}`,
          state: targetState,
        });
      }

      // =========================================
      // RESET USER (Keep Auth, Wipe Data)
      // =========================================
      case 'reset_user': {
        if (!testUserEmail) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Find user
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testUserEmail)
          .single();

        if (!profile) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Delete in order (respecting foreign keys)
        await supabase.from('certificates').delete().eq('user_id', profile.id);
        await supabase.from('exam_attempts').delete().eq('user_id', profile.id);
        await supabase.from('course_progress').delete().eq('user_id', profile.id);
        await supabase.from('purchases').delete().eq('user_id', profile.id);

        // Reset profile
        await supabase
          .from('profiles')
          .update({
            full_name: 'Test User',
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
          .eq('id', profile.id);

        return NextResponse.json({
          success: true,
          message: 'User data reset (auth account preserved)',
          userId: profile.id,
        });
      }

      // =========================================
      // DELETE USER COMPLETELY
      // =========================================
      case 'delete_user': {
        if (!testUserEmail) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Find user in profiles first
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', testUserEmail)
          .single();

        // Also check auth directly in case of orphan
        const authUser = await findAuthUserByEmail(supabase, testUserEmail);

        if (!profile && !authUser) {
          return NextResponse.json({ error: 'User not found in profiles or auth' }, { status: 404 });
        }

        const userId = profile?.id || authUser?.id;

        if (userId) {
          // Delete all data (these will silently succeed even if no rows exist)
          await supabase.from('certificates').delete().eq('user_id', userId);
          await supabase.from('exam_attempts').delete().eq('user_id', userId);
          await supabase.from('course_progress').delete().eq('user_id', userId);
          await supabase.from('purchases').delete().eq('user_id', userId);
          await supabase.from('profiles').delete().eq('id', userId);

          // Delete auth user
          await supabase.auth.admin.deleteUser(userId);
        }

        return NextResponse.json({
          success: true,
          message: 'User completely deleted',
          note: profile ? 'Deleted from profiles and auth' : 'Deleted orphan auth user (no profile existed)',
        });
      }

      // =========================================
      // SEND TEST EMAIL
      // =========================================
      case 'send_email': {
        const { emailType, recipientEmail, courseType: emailCourseType } = body;
        if (!emailType || !recipientEmail) {
          return NextResponse.json({ error: 'emailType and recipientEmail required' }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.claseparapadres.com';

        // Email templates (simplified for testing)
        const emails: Record<string, { subject: string; html: string }> = {
          welcome_with_password: {
            subject: 'Â¡Todo listo! â€” su clase lo espera',
            html: generateWelcomeEmailWithPasswordHTML({
              userName: 'Test User',
              userEmail: recipientEmail,
              tempPassword: 'TestPass123!',
              courseName: 'Clase de Coparentalidad',
              loginUrl: `${baseUrl}/iniciar-sesion`,
            }),
          },
          welcome_no_password: {
            subject: 'Â¡Todo listo! â€” su clase lo espera',
            html: generateWelcomeEmailHTML({
              userName: 'Test User',
              courseName: 'Clase de Coparentalidad',
              loginUrl: `${baseUrl}/iniciar-sesion`,
            }),
          },
          existing_user: {
            subject: 'Â¡Todo listo! â€” su nueva clase lo espera',
            html: generateExistingUserEmailHTML({
              userName: 'Test User',
              courseName: 'Clase de Crianza',
              loginUrl: `${baseUrl}/iniciar-sesion`,
              forgotPasswordUrl: `${baseUrl}/recuperar-contrasena`,
            }),
          },
          already_owned: {
            subject: 'Ya tiene acceso a esta clase',
            html: generateAlreadyOwnedEmailHTML({
              userName: 'Test User',
              courseName: 'Clase de Coparentalidad',
              loginUrl: `${baseUrl}/iniciar-sesion`,
            }),
          },
          password_reset: {
            subject: 'Restablecer su contraseÃ±a',
            html: generatePasswordResetEmailHTML({
              userName: 'Test User',
              resetUrl: `${baseUrl}/actualizar-contrasena?test=true`,
            }),
          },
          student_certificate: {
            subject: 'ðŸŽ‰ Â¡Felicidades! Ha completado su clase',
            html: generateStudentCertificateEmailHTML({
              userName: 'Test User',
              courseName: 'Clase de Coparentalidad',
              certificateNumber: 'PKF-TEST01',
              verificationCode: 'TESTCODE',
              certificateUrl: `${baseUrl}/certificado/test-id`,
            }),
          },
          attorney_certificate: {
            subject: 'Certificate of Completion - Test User',
            html: generateAttorneyEmailHTML({
              attorneyName: 'Attorney Test',
              participantName: 'Test User Legal Name',
              courseName: courseType === 'parenting' ? 'Parenting Class' : 'Co-Parenting Class',
              certificateNumber: 'PKF-TEST01',
              verificationCode: 'TESTCODE',
              completionDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
              verificationUrl: `${baseUrl}/verificar/TESTCODE`,
              downloadUrl: `${baseUrl}/api/certificate/test-id`,
            }),
          },
        };

        const emailData = emails[emailType];
        if (!emailData) {
          return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        // Determine sender based on email type
        const isAttorneyEmail = emailType === 'attorney_certificate';
        const from = isAttorneyEmail
          ? 'Putting Kids First <certificates@claseparapadres.com>'
          : 'Clase para Padres <hola@claseparapadres.com>';

        const { error: sendError } = await resend.emails.send({
          from,
          to: recipientEmail,
          subject: `[TEST] ${emailData.subject}`,
          html: emailData.html,
        });

        if (sendError) {
          return NextResponse.json({ error: sendError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Sent ${emailType} email to ${recipientEmail}`,
        });
      }

      // =========================================
      // GET USER STATUS
      // =========================================
      case 'get_status': {
        if (!testUserEmail) {
          return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Check auth first
        const authUser = await findAuthUserByEmail(supabase, testUserEmail);

        // Find user in profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', testUserEmail)
          .single();

        // Handle orphan case
        if (authUser && !profile) {
          return NextResponse.json({
            success: true,
            orphan: true,
            message: 'ORPHAN USER: Exists in auth but not in profiles table',
            authUserId: authUser.id,
            authEmail: authUser.email,
            profile: null,
            purchases: [],
            progress: [],
            examAttempts: [],
            certificates: [],
          });
        }

        if (!profile) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Get purchases
        const { data: purchases } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', profile.id);

        // Get progress
        const { data: progress } = await supabase
          .from('course_progress')
          .select('*')
          .eq('user_id', profile.id);

        // Get exam attempts
        const { data: examAttempts } = await supabase
          .from('exam_attempts')
          .select('*')
          .eq('user_id', profile.id);

        // Get certificates
        const { data: certificates } = await supabase
          .from('certificates')
          .select('*')
          .eq('user_id', profile.id);

        return NextResponse.json({
          success: true,
          profile,
          purchases: purchases || [],
          progress: progress || [],
          examAttempts: examAttempts || [],
          certificates: certificates || [],
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin testing error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================
// EMAIL TEMPLATE GENERATORS
// =============================================

function generateWelcomeEmailWithPasswordHTML(data: {
  userName: string;
  userEmail: string;
  tempPassword: string;
  courseName: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-checkmark.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #77DD77; font-size: 32px; margin: 0; font-weight: bold;">Â¡Todo listo!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Hola${data.userName ? ` ${data.userName}` : ''},</p>
              <p style="margin: 0 0 20px;">
                Â¡Gracias por inscribirse! Su acceso a <span style="color: #77DD77; font-weight: bold;">${data.courseName}</span> estÃ¡ listo.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                <tr>
                  <td style="padding: 20px; color: #FFFFFF; font-size: 14px;">
                    <p style="margin: 0 0 10px; color: rgba(255,255,255,0.7);">Sus credenciales:</p>
                    <p style="margin: 0 0 8px;"><strong>Email:</strong> ${data.userEmail}</p>
                    <p style="margin: 0;"><strong>ContraseÃ±a temporal:</strong> <span style="color: #FFE566;">${data.tempPassword}</span></p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${data.loginUrl}" style="display: inline-block; background-color: #77DD77; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px;">
                Comenzar la Clase â†’
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p style="margin: 0;">â€” El equipo de Clase para Padres</p>
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

function generateWelcomeEmailHTML(data: {
  userName: string;
  courseName: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-checkmark.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #77DD77; font-size: 32px; margin: 0; font-weight: bold;">Â¡Todo listo!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Hola${data.userName ? ` ${data.userName}` : ''},</p>
              <p style="margin: 0 0 20px;">
                Â¡Gracias por inscribirse! Su acceso a <span style="color: #77DD77; font-weight: bold;">${data.courseName}</span> estÃ¡ listo.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${data.loginUrl}" style="display: inline-block; background-color: #77DD77; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px;">
                Comenzar la Clase â†’
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p style="margin: 0;">â€” El equipo de Clase para Padres</p>
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

function generateExistingUserEmailHTML(data: {
  userName: string;
  courseName: string;
  loginUrl: string;
  forgotPasswordUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-checkmark.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #77DD77; font-size: 32px; margin: 0; font-weight: bold;">Â¡Nueva clase aÃ±adida!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Hola${data.userName ? ` ${data.userName}` : ''},</p>
              <p style="margin: 0 0 20px;">
                Hemos aÃ±adido <span style="color: #77DD77; font-weight: bold;">${data.courseName}</span> a su cuenta.
              </p>
              <p style="margin: 0 0 20px; color: rgba(255,255,255,0.7); font-size: 14px;">
                Use su contraseÃ±a existente para iniciar sesiÃ³n. Â¿OlvidÃ³ su contraseÃ±a? <a href="${data.forgotPasswordUrl}" style="color: #7EC8E3;">RestablÃ©zcala aquÃ­</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${data.loginUrl}" style="display: inline-block; background-color: #77DD77; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px;">
                Continuar a Mi Clase â†’
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p style="margin: 0;">â€” El equipo de Clase para Padres</p>
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

function generateAlreadyOwnedEmailHTML(data: {
  userName: string;
  courseName: string;
  loginUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-info.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #7EC8E3; font-size: 28px; margin: 0; font-weight: bold;">Ya tiene acceso a esta clase</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Hola${data.userName ? ` ${data.userName}` : ''},</p>
              <p style="margin: 0 0 20px;">
                Notamos que ya tiene acceso a <span style="color: #77DD77; font-weight: bold;">${data.courseName}</span>.
              </p>
              <p style="margin: 0 0 20px;">
                Hemos procesado un reembolso automÃ¡tico. DeberÃ­a ver el crÃ©dito en su cuenta dentro de 5-10 dÃ­as hÃ¡biles.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${data.loginUrl}" style="display: inline-block; background-color: #7EC8E3; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px;">
                Iniciar SesiÃ³n â†’
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p style="margin: 0;">â€” El equipo de Clase para Padres</p>
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

function generatePasswordResetEmailHTML(data: {
  userName: string;
  resetUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-key.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #FFE566; font-size: 28px; margin: 0; font-weight: bold;">Restablecer ContraseÃ±a</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Hola${data.userName ? ` ${data.userName}` : ''},</p>
              <p style="margin: 0 0 20px;">
                Recibimos una solicitud para restablecer su contraseÃ±a. Haga clic en el botÃ³n a continuaciÃ³n para crear una nueva.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <a href="${data.resetUrl}" style="display: inline-block; background-color: #FFE566; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px;">
                Restablecer Mi ContraseÃ±a â†’
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                <tr>
                  <td style="padding: 15px; color: rgba(255,255,255,0.7); font-size: 13px;">
                    â° Este enlace expira en 1 hora. Si no solicitÃ³ este cambio, puede ignorar este mensaje.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p style="margin: 0;">â€” El equipo de Clase para Padres</p>
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

function generateStudentCertificateEmailHTML(data: {
  userName: string;
  courseName: string;
  certificateNumber: string;
  verificationCode: string;
  certificateUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-certificate.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #77DD77; font-size: 32px; margin: 0; font-weight: bold;">Â¡Felicidades!</h1>
              <p style="color: #FFFFFF; font-size: 18px; margin: 10px 0 0;">Ha completado su clase exitosamente</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Hola${data.userName ? ` ${data.userName}` : ''},</p>
              <p style="margin: 0 0 20px;">
                Â¡Lo logrÃ³! Ha completado exitosamente <span style="color: #77DD77; font-weight: bold;">${data.courseName}</span>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color: #77DD77; font-size: 14px; padding: 8px 0;">âœ“ InscripciÃ³n completada</td>
                </tr>
                <tr>
                  <td style="color: #77DD77; font-size: 14px; padding: 8px 0;">âœ“ 15 lecciones completadas</td>
                </tr>
                <tr>
                  <td style="color: #77DD77; font-size: 14px; padding: 8px 0;">âœ“ Examen aprobado</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                <tr>
                  <td style="padding: 20px; color: #FFFFFF; font-size: 14px;">
                    <p style="margin: 0 0 8px;"><strong>Certificado:</strong> ${data.certificateNumber}</p>
                    <p style="margin: 0;"><strong>CÃ³digo de verificaciÃ³n:</strong> ${data.verificationCode}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 40px;">
              <a href="${data.certificateUrl}" style="display: inline-block; background-color: #77DD77; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px;">
                Descargar Mi Certificado â†’
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 40px; color: rgba(255,255,255,0.7); font-size: 14px;">
              <p style="margin: 0;">â€” El equipo de Clase para Padres</p>
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

function generateAttorneyEmailHTML(data: {
  attorneyName: string;
  participantName: string;
  courseName: string;
  certificateNumber: string;
  verificationCode: string;
  completionDate: string;
  verificationUrl: string;
  downloadUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #1C1C1C; font-family: 'Courier Prime', Courier, monospace;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #2A2A2A; border-radius: 12px; overflow: hidden;">
          <tr>
            <td align="center" style="padding: 40px 40px 20px;">
              <img src="https://www.claseparapadres.com/images/email/icon-certificate.png" width="80" height="80" alt="" style="display: block;">
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 10px;">
              <h1 style="color: #77DD77; font-size: 28px; margin: 0; font-weight: bold;">Certificate of Completion</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px; color: #FFFFFF; font-size: 16px; line-height: 1.6;">
              <p style="margin: 0 0 20px;">Dear ${data.attorneyName || 'Counselor'},</p>
              <p style="margin: 0 0 20px;">
                Your client, <strong>${data.participantName}</strong>, has successfully completed the <strong>${data.courseName}</strong>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                <tr>
                  <td style="padding: 20px; color: #FFFFFF; font-size: 14px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 5px 0; color: rgba(255,255,255,0.7);">Participant:</td>
                        <td style="padding: 5px 0; text-align: right;">${data.participantName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: rgba(255,255,255,0.7);">Course:</td>
                        <td style="padding: 5px 0; text-align: right;">${data.courseName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: rgba(255,255,255,0.7);">Completion Date:</td>
                        <td style="padding: 5px 0; text-align: right;">${data.completionDate}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: rgba(255,255,255,0.7);">Certificate #:</td>
                        <td style="padding: 5px 0; text-align: right;">${data.certificateNumber}</td>
                      </tr>
                      <tr>
                        <td style="padding: 5px 0; color: rgba(255,255,255,0.7);">Verification Code:</td>
                        <td style="padding: 5px 0; text-align: right; color: #FFE566;">${data.verificationCode}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 40px 20px;">
              <a href="${data.downloadUrl}" style="display: inline-block; background-color: #77DD77; color: #1C1C1C; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px;">
                Download Certificate PDF
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #1C1C1C; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15);">
                <tr>
                  <td style="padding: 15px; color: rgba(255,255,255,0.7); font-size: 13px;">
                    <strong>Verify online:</strong> <a href="${data.verificationUrl}" style="color: #7EC8E3;">${data.verificationUrl}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px; color: #FFFFFF; font-size: 14px; line-height: 1.6;">
              <p style="margin: 0 0 15px; color: rgba(255,255,255,0.8);">
                If you'd like materials to share with future clients who need to complete this requirement, just reply to this email and we'll send them at no cost.
              </p>
              <p style="margin: 0;">
                â€” Geri Jones<br>
                <span style="color: rgba(255,255,255,0.6);">Executive Director, Putting Kids FirstÂ®</span>
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
