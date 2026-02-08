'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

interface UserStatus {
  orphan?: boolean;
  message?: string;
  authUserId?: string;
  authEmail?: string;
  profile: {
    id: string;
    email: string;
    full_name: string;
    legal_name: string | null;
    profile_completed: boolean;
  } | null;
  purchases: Array<{
    id: string;
    course_type: string;
    status: string;
    created_at: string;
  }>;
  progress: Array<{
    course_type: string;
    lessons_completed: number[];
    completed_at: string | null;
  }>;
  examAttempts: Array<{
    id: string;
    passed: boolean;
    score: number;
    completed_at: string;
  }>;
  certificates: Array<{
    id: string;
    course_type: string;
    certificate_number: string;
    verification_code: string;
  }>;
}

// Default test user - change this to your preferred test email
const DEFAULT_TEST_EMAIL = 'stephencraigjones@gmail.com';

export default function AdminTestingPage() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Form states
  const [targetEmail, setTargetEmail] = useState(DEFAULT_TEST_EMAIL);
  const [selectedCourse, setSelectedCourse] = useState<'coparenting' | 'parenting' | 'bundle'>('coparenting');
  const [selectedState, setSelectedState] = useState<'new' | 'mid_course' | 'exam_ready' | 'exam_passed' | 'completed'>('new');
  const [emailType, setEmailType] = useState('welcome_with_password');
  const [emailRecipient, setEmailRecipient] = useState('');

  // User status
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [userNotFound, setUserNotFound] = useState(false);
  
  // Password reset
  const [testPassword, setTestPassword] = useState<string | null>(null);

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('adminTestingEmail');
    if (savedEmail) {
      setTargetEmail(savedEmail);
    } else if (DEFAULT_TEST_EMAIL) {
      setTargetEmail(DEFAULT_TEST_EMAIL);
    }
  }, []);

  // Save email to localStorage when it changes
  const handleEmailChange = (email: string) => {
    setTargetEmail(email);
    if (email) {
      localStorage.setItem('adminTestingEmail', email);
    }
  };

  // Check authorization on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsAuthorized(false);
        return;
      }

      // Check if admin
      const adminEmails = ['jonescraig@me.com'];
      setIsAuthorized(adminEmails.includes(user.email || ''));
    };

    checkAuth();
  }, []);

  const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const apiCall = async (action: string, data: Record<string, unknown> = {}) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/admin/testing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ action, ...data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Request failed');
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleGrantAccess = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    try {
      await apiCall('grant_access', {
        testUserEmail: targetEmail,
        courseType: selectedCourse,
      });

      showMessage('success', `Granted ${selectedCourse} access to ${targetEmail}`);
      handleGetStatus(); // Refresh status
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to grant access');
    }
  };

  const handleSetProgress = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    try {
      await apiCall('set_progress', {
        testUserEmail: targetEmail,
        courseType: selectedCourse,
        state: selectedState,
      });

      showMessage('success', `Set ${targetEmail} to ${selectedState} state`);
      handleGetStatus(); // Refresh status
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to set progress');
    }
  };

  const handleResetUser = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    if (!confirm(`Reset all data for ${targetEmail}? This cannot be undone.`)) {
      return;
    }

    try {
      await apiCall('reset_user', { testUserEmail: targetEmail });
      showMessage('success', `Reset ${targetEmail} - auth preserved, data wiped`);
      setUserStatus(null);
      setUserNotFound(false);
      setTestPassword(null);
      handleGetStatus(); // Refresh status
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to reset user');
    }
  };

  const handleResetPassword = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    try {
      const result = await apiCall('reset_password', { testUserEmail: targetEmail });
      setTestPassword(result.password || 'test123');
      showMessage('success', `Password reset to: ${result.password || 'test123'}`);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to reset password');
    }
  };

  const handleSendEmail = async () => {
    if (!emailRecipient) {
      showMessage('error', 'Recipient email required');
      return;
    }

    try {
      await apiCall('send_email', {
        emailType,
        recipientEmail: emailRecipient,
        courseType: selectedCourse,
      });

      showMessage('success', `Sent ${emailType} to ${emailRecipient}`);
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to send email');
    }
  };

  const handleGetStatus = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    setUserNotFound(false);

    try {
      const result = await apiCall('get_status', { testUserEmail: targetEmail });
      setUserStatus(result);
      
      if (result.orphan) {
        showMessage('warning', 'ORPHAN USER - Auth exists but no profile. Grant Access will fix this.');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get status';
      if (errorMsg.includes('not found') || errorMsg.includes('User not found')) {
        setUserNotFound(true);
        setUserStatus(null);
        showMessage('warning', errorMsg);
      } else {
        showMessage('error', errorMsg);
      }
    }
  };

  const handleCreateAndGetStatus = async () => {
    if (!targetEmail) return;

    try {
      await apiCall('create_user', { email: targetEmail, password: 'test123' });
      showMessage('success', `Created ${targetEmail} with password: test123`);
      setTestPassword('test123');
      setUserNotFound(false);
      handleGetStatus();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to create user');
    }
  };

  // Quick actions
  const handleExamReady = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    try {
      // First ensure access is granted (ignore "already has course" error)
      try {
        await apiCall('grant_access', {
          testUserEmail: targetEmail,
          courseType: selectedCourse,
        });
      } catch (e) {
        // Ignore "already has course" error, continue with set_progress
        const errorMsg = e instanceof Error ? e.message : '';
        if (!errorMsg.includes('already has')) {
          throw e;
        }
      }
      
      // Then set to exam ready
      await apiCall('set_progress', {
        testUserEmail: targetEmail,
        courseType: selectedCourse,
        state: 'exam_ready',
      });

      showMessage('success', `🎯 ${targetEmail} now has 15/15 lessons - exam unlocked!`);
      handleGetStatus();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to set exam ready');
    }
  };

  const handleFullGraduate = async () => {
    if (!targetEmail) {
      showMessage('error', 'Target email required');
      return;
    }

    try {
      // First ensure access is granted (ignore "already has course" error)
      try {
        await apiCall('grant_access', {
          testUserEmail: targetEmail,
          courseType: selectedCourse,
        });
      } catch (e) {
        // Ignore "already has course" error, continue with set_progress
        const errorMsg = e instanceof Error ? e.message : '';
        if (!errorMsg.includes('already has')) {
          throw e;
        }
      }
      
      // Then set to completed
      await apiCall('set_progress', {
        testUserEmail: targetEmail,
        courseType: selectedCourse,
        state: 'completed',
      });

      showMessage('success', `📜 ${targetEmail} is now a graduate with certificate!`);
      handleGetStatus();
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to create graduate');
    }
  };

  // Loading/unauthorized states
  if (isAuthorized === null) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">⛔ Unauthorized</h1>
          <p className="text-white/70 mb-2">You need to log in as an admin to access this page.</p>
          <a href="/iniciar-sesion" className="inline-block mt-4 px-6 py-3 bg-[#77DD77] text-[#1C1C1C] rounded-lg font-bold hover:bg-[#88EE88] transition-colors">
            Log In →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1C1C1C] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">🧪 Admin Testing Panel</h1>
            <p className="text-white/60">Test user flows without Stripe payments</p>
          </div>
          <a
            href="/admin/support"
            className="flex items-center gap-2 px-5 py-3 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-colors border border-white/10 shrink-0"
          >
            ← Support Panel
          </a>
        </div>

        {/* Message Toast */}
        {message && (
          <div
            className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 ${
              message.type === 'success' ? 'bg-green-600' : 
              message.type === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
            } text-white max-w-md`}
          >
            {message.text}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-[#2A2A2A] rounded-lg px-8 py-6 text-white">
              Processing...
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Section: Test User */}
          <section className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">🎯 Test User</h2>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <input
                type="email"
                placeholder="Test user email"
                value={targetEmail}
                onChange={(e) => handleEmailChange(e.target.value)}
                className="bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#77DD77] md:col-span-2"
              />
              <button
                onClick={handleGetStatus}
                disabled={loading || !targetEmail}
                className="bg-[#7EC8E3] text-[#1C1C1C] font-bold rounded-lg px-6 py-3 hover:bg-[#9DD8F3] transition-colors disabled:opacity-50"
              >
                Get Status
              </button>
            </div>

            {/* Course selector */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-white/60 py-2">Course:</span>
              {(['coparenting', 'parenting', 'bundle'] as const).map((course) => (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCourse === course
                      ? 'bg-[#77DD77] text-[#1C1C1C]'
                      : 'bg-[#1C1C1C] text-white/70 hover:text-white border border-white/20'
                  }`}
                >
                  {course === 'coparenting' ? 'Co-Parenting' : course === 'parenting' ? 'Parenting' : 'Bundle'}
                </button>
              ))}
            </div>

            {/* User Not Found - Create Option */}
            {userNotFound && (
              <div className="mt-4 p-4 bg-[#FFE566]/10 border border-[#FFE566]/30 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="text-white font-medium">User not found: <span className="text-[#FFE566]">{targetEmail}</span></p>
                  <p className="text-white/50 text-sm mt-1">No auth account or profile exists. Create a test user to get started.</p>
                </div>
                <button
                  onClick={handleCreateAndGetStatus}
                  disabled={loading}
                  className="bg-[#77DD77] text-[#1C1C1C] font-bold rounded-lg px-6 py-3 hover:bg-[#88EE88] transition-colors disabled:opacity-50 shrink-0"
                >
                  Create User
                </button>
              </div>
            )}
          </section>

          {/* Section: User Status Display */}
          {userStatus && (
            <section className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-bold text-white mb-4">
                📊 User Status: {userStatus.profile?.email || userStatus.authEmail}
                {userStatus.orphan && (
                  <span className="ml-3 px-3 py-1 bg-yellow-600 text-sm rounded-full">⚠️ ORPHAN</span>
                )}
              </h2>
              
              {userStatus.orphan ? (
                <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-4">
                  <p className="text-yellow-400 font-bold mb-2">⚠️ Orphan User Detected</p>
                  <p className="text-white/70 text-sm">
                    Auth exists but no profile. Click &quot;Grant Access&quot; below to fix this automatically.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="bg-[#1C1C1C] rounded-lg p-4">
                    <h3 className="text-[#77DD77] font-bold mb-2">Profile</h3>
                    <p className="text-white/70 text-sm">Name: {userStatus.profile?.full_name || 'Not set'}</p>
                    <p className="text-white/70 text-sm">Legal Name: {userStatus.profile?.legal_name || 'Not set'}</p>
                    <p className="text-white/70 text-sm">
                      Completed: {userStatus.profile?.profile_completed ? '✅ Yes' : '❌ No'}
                    </p>
                  </div>
                  <div className="bg-[#1C1C1C] rounded-lg p-4">
                    <h3 className="text-[#77DD77] font-bold mb-2">Purchases ({userStatus.purchases.length})</h3>
                    {userStatus.purchases.length === 0 ? (
                      <p className="text-white/50 text-sm">No purchases</p>
                    ) : (
                      userStatus.purchases.map((p) => (
                        <p key={p.id} className="text-white/70 text-sm">
                          • {p.course_type} ({p.status})
                        </p>
                      ))
                    )}
                  </div>
                  <div className="bg-[#1C1C1C] rounded-lg p-4">
                    <h3 className="text-[#77DD77] font-bold mb-2">Progress ({userStatus.progress.length})</h3>
                    {userStatus.progress.length === 0 ? (
                      <p className="text-white/50 text-sm">No progress</p>
                    ) : (
                      userStatus.progress.map((p, i) => (
                        <p key={i} className="text-white/70 text-sm">
                          • {p.course_type}: {p.lessons_completed?.length || 0}/15 lessons
                          {p.completed_at && ' ✅'}
                        </p>
                      ))
                    )}
                  </div>
                  <div className="bg-[#1C1C1C] rounded-lg p-4">
                    <h3 className="text-[#77DD77] font-bold mb-2">Exam Attempts ({userStatus.examAttempts.length})</h3>
                    {userStatus.examAttempts.length === 0 ? (
                      <p className="text-white/50 text-sm">No exam attempts</p>
                    ) : (
                      userStatus.examAttempts.map((e) => (
                        <p key={e.id} className="text-white/70 text-sm">
                          • Score: {e.score} — {e.passed ? '✅ Passed' : '❌ Failed'}
                        </p>
                      ))
                    )}
                  </div>
                  <div className="bg-[#1C1C1C] rounded-lg p-4 md:col-span-2">
                    <h3 className="text-[#77DD77] font-bold mb-2">Certificates ({userStatus.certificates.length})</h3>
                    {userStatus.certificates.length === 0 ? (
                      <p className="text-white/50 text-sm">No certificates</p>
                    ) : (
                      userStatus.certificates.map((c) => (
                        <p key={c.id} className="text-white/70 text-sm">
                          • {c.course_type}: {c.certificate_number} — 
                          <a 
                            href={`/certificado/${c.id}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#7EC8E3] hover:underline ml-1"
                          >
                            View
                          </a>
                          {' | '}
                          <a 
                            href={`/verificar/${c.verification_code}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#7EC8E3] hover:underline"
                          >
                            Verify ({c.verification_code})
                          </a>
                        </p>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Section: Quick Actions */}
          <section className="bg-gradient-to-r from-[#77DD77]/10 to-[#7EC8E3]/10 rounded-xl p-6 border border-[#77DD77]/30">
            <h2 className="text-xl font-bold text-white mb-2">⚡ Quick Actions</h2>
            <p className="text-white/60 mb-4 text-sm">Set up common test scenarios in one click</p>
            <div className="grid gap-3 md:grid-cols-4">
              <button
                onClick={handleGrantAccess}
                disabled={loading || !targetEmail}
                className="bg-[#1C1C1C] border-2 border-white/20 text-white rounded-lg px-4 py-4 hover:border-[#77DD77] transition-colors disabled:opacity-50 text-left"
              >
                <span className="text-2xl block mb-1">🎟️</span>
                <span className="block font-bold">Grant Access</span>
                <span className="text-white/50 text-xs">Add course purchase</span>
              </button>
              <button
                onClick={handleExamReady}
                disabled={loading || !targetEmail}
                className="bg-[#1C1C1C] border-2 border-[#7EC8E3]/50 text-white rounded-lg px-4 py-4 hover:border-[#7EC8E3] transition-colors disabled:opacity-50 text-left"
              >
                <span className="text-2xl block mb-1">🎯</span>
                <span className="block font-bold text-[#7EC8E3]">Exam Ready</span>
                <span className="text-white/50 text-xs">15/15 lessons complete</span>
              </button>
              <button
                onClick={handleFullGraduate}
                disabled={loading || !targetEmail}
                className="bg-[#1C1C1C] border-2 border-[#FFE566]/50 text-white rounded-lg px-4 py-4 hover:border-[#FFE566] transition-colors disabled:opacity-50 text-left"
              >
                <span className="text-2xl block mb-1">📜</span>
                <span className="block font-bold text-[#FFE566]">Full Graduate</span>
                <span className="text-white/50 text-xs">Complete with certificate</span>
              </button>
              <button
                onClick={handleResetUser}
                disabled={loading || !targetEmail}
                className="bg-[#1C1C1C] border-2 border-[#FF9999]/30 text-white rounded-lg px-4 py-4 hover:border-[#FF9999] transition-colors disabled:opacity-50 text-left"
              >
                <span className="text-2xl block mb-1">🔄</span>
                <span className="block font-bold text-[#FF9999]">Reset User</span>
                <span className="text-white/50 text-xs">Wipe data, keep auth</span>
              </button>
            </div>
          </section>

          {/* Section: Test as User - THE IMPORTANT REMINDER */}
          <section className="bg-gradient-to-r from-[#B19CD9]/20 to-[#7EC8E3]/20 rounded-xl p-6 border-2 border-[#B19CD9]/50">
            <h2 className="text-xl font-bold text-white mb-2">🔐 Test as This User</h2>
            <p className="text-white/70 mb-4">
              To experience the site as the test user, log in as them in a separate browser session.
            </p>
            
            <div className="bg-[#1C1C1C] rounded-xl p-5 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="text-3xl">💡</div>
                <div className="flex-1">
                  <h3 className="font-bold text-white mb-3">How to Test:</h3>
                  <ol className="text-white/70 text-sm space-y-2 list-decimal list-inside mb-4">
                    <li>Open an <strong className="text-white">incognito/private window</strong> (Cmd+Shift+N on Mac)</li>
                    <li>Go to the login page (copy link below)</li>
                    <li>Log in with the credentials below</li>
                    <li>Test the full flow (dashboard → course → exam → certificate)</li>
                    <li>Close incognito window when done</li>
                  </ol>
                  
                  {/* Quick copy credentials */}
                  <div className="grid gap-3 md:grid-cols-3 mb-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('https://www.claseparapadres.com/iniciar-sesion');
                        showMessage('success', 'Login URL copied!');
                      }}
                      className="bg-[#2A2A2A] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#7EC8E3] transition-colors text-left"
                    >
                      <span className="text-xs text-white/50 block">Login URL</span>
                      <span className="text-sm text-[#7EC8E3]">📋 Click to copy</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(targetEmail);
                        showMessage('success', 'Email copied!');
                      }}
                      className="bg-[#2A2A2A] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#7EC8E3] transition-colors text-left"
                    >
                      <span className="text-xs text-white/50 block">Email</span>
                      <span className="text-sm truncate block">{targetEmail}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (testPassword) {
                          navigator.clipboard.writeText(testPassword);
                          showMessage('success', 'Password copied!');
                        } else {
                          showMessage('error', 'Set password first!');
                        }
                      }}
                      className={`bg-[#2A2A2A] border rounded-lg px-4 py-3 transition-colors text-left ${
                        testPassword 
                          ? 'border-[#77DD77]/50 text-white hover:border-[#77DD77]' 
                          : 'border-white/10 text-white/40'
                      }`}
                    >
                      <span className="text-xs text-white/50 block">Password</span>
                      <span className={`text-sm ${testPassword ? 'text-[#77DD77]' : ''}`}>
                        {testPassword || '(not set)'}
                      </span>
                    </button>
                  </div>
                  
                  <button
                    onClick={handleResetPassword}
                    disabled={loading || !targetEmail}
                    className="bg-[#B19CD9] text-[#1C1C1C] font-bold rounded-lg px-5 py-3 hover:bg-[#C9B8E8] transition-colors disabled:opacity-50"
                  >
                    {testPassword ? '🔄 Reset Password Again' : '🔑 Set Password to "test123"'}
                  </button>
                </div>
              </div>
            </div>
            
            <p className="text-white/50 text-xs mt-4">
              ℹ️ Using incognito keeps your admin session in this window untouched.
            </p>
          </section>

          {/* Section: Page Previews */}
          <section className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">👁️ Page Previews</h2>
            <p className="text-white/50 text-sm mb-4">
              Quick links to test pages. Opens in new tab.
            </p>
            
            {/* Purchase & Onboarding */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[#77DD77] mb-3 uppercase tracking-wide">Purchase & Onboarding</h3>
              <div className="grid gap-2 md:grid-cols-4">
                <a href="/" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#77DD77] transition-colors block">
                  <span className="text-lg mr-2">🏠</span>
                  <span className="font-bold text-sm">Homepage</span>
                  <span className="text-white/50 text-xs block mt-1">Main landing page</span>
                </a>
                <a href="/exito?session_id=test" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#77DD77] transition-colors block">
                  <span className="text-lg mr-2">✅</span>
                  <span className="font-bold text-sm">Success Page</span>
                  <span className="text-white/50 text-xs block mt-1">Post-purchase flow</span>
                </a>
                <a href="/iniciar-sesion" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#77DD77] transition-colors block">
                  <span className="text-lg mr-2">🔐</span>
                  <span className="font-bold text-sm">Login Page</span>
                  <span className="text-white/50 text-xs block mt-1">/iniciar-sesion</span>
                </a>
                <a href="/recuperar-contrasena" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#77DD77] transition-colors block">
                  <span className="text-lg mr-2">🔑</span>
                  <span className="font-bold text-sm">Password Reset</span>
                  <span className="text-white/50 text-xs block mt-1">Recovery request</span>
                </a>
              </div>
            </div>

            {/* Student Experience */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[#7EC8E3] mb-3 uppercase tracking-wide">Student Experience</h3>
              <div className="grid gap-2 md:grid-cols-4">
                <a href="/panel" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#7EC8E3] transition-colors block">
                  <span className="text-lg mr-2">📊</span>
                  <span className="font-bold text-sm">Dashboard</span>
                  <span className="text-white/50 text-xs block mt-1">/panel - Student home</span>
                </a>
                <a href="/clase/coparenting" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#7EC8E3] transition-colors block">
                  <span className="text-lg mr-2">📚</span>
                  <span className="font-bold text-sm">Co-Parenting Course</span>
                  <span className="text-white/50 text-xs block mt-1">Course overview</span>
                </a>
                <a href="/clase/parenting" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#7EC8E3] transition-colors block">
                  <span className="text-lg mr-2">📚</span>
                  <span className="font-bold text-sm">Parenting Course</span>
                  <span className="text-white/50 text-xs block mt-1">Course overview</span>
                </a>
                <a href="/clase/coparenting/leccion-1" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#7EC8E3] transition-colors block">
                  <span className="text-lg mr-2">📖</span>
                  <span className="font-bold text-sm">Lesson 1</span>
                  <span className="text-white/50 text-xs block mt-1">Sample lesson view</span>
                </a>
              </div>
            </div>

            {/* Exam & Certificate */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[#FFE566] mb-3 uppercase tracking-wide">Exam & Certificate</h3>
              <div className="grid gap-2 md:grid-cols-4">
                <a href="/clase/coparenting/examen" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#FFE566] transition-colors block">
                  <span className="text-lg mr-2">📝</span>
                  <span className="font-bold text-sm">Exam Page</span>
                  <span className="text-white/50 text-xs block mt-1">Final exam (needs 15 lessons)</span>
                </a>
                <a href="/completar-perfil" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#FFE566] transition-colors block">
                  <span className="text-lg mr-2">👤</span>
                  <span className="font-bold text-sm">Profile Form</span>
                  <span className="text-white/50 text-xs block mt-1">Certificate info (post-exam)</span>
                </a>
                {userStatus?.certificates?.[0] ? (
                  <a href={`/certificado/${userStatus.certificates[0].id}`} target="_blank" rel="noopener noreferrer"
                    className="bg-[#1C1C1C] border border-[#77DD77]/50 text-white rounded-lg px-4 py-3 hover:border-[#77DD77] transition-colors block">
                    <span className="text-lg mr-2">📜</span>
                    <span className="font-bold text-sm text-[#77DD77]">Certificate View</span>
                    <span className="text-white/50 text-xs block mt-1">User has certificate ✓</span>
                  </a>
                ) : (
                  <div className="bg-[#1C1C1C] border border-white/10 text-white/40 rounded-lg px-4 py-3">
                    <span className="text-lg mr-2">📜</span>
                    <span className="font-bold text-sm">Certificate View</span>
                    <span className="text-white/30 text-xs block mt-1">No certificate yet</span>
                  </div>
                )}
                {userStatus?.certificates?.[0] ? (
                  <a href={`/verificar/${userStatus.certificates[0].verification_code}`} target="_blank" rel="noopener noreferrer"
                    className="bg-[#1C1C1C] border border-[#77DD77]/50 text-white rounded-lg px-4 py-3 hover:border-[#77DD77] transition-colors block">
                    <span className="text-lg mr-2">🔍</span>
                    <span className="font-bold text-sm text-[#77DD77]">Verification Page</span>
                    <span className="text-white/50 text-xs block mt-1">{userStatus.certificates[0].verification_code}</span>
                  </a>
                ) : (
                  <a href="/verificar/TESTCODE" target="_blank" rel="noopener noreferrer"
                    className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#FFE566] transition-colors block">
                    <span className="text-lg mr-2">🔍</span>
                    <span className="font-bold text-sm">Verification Page</span>
                    <span className="text-white/50 text-xs block mt-1">Public cert verify</span>
                  </a>
                )}
              </div>
            </div>

            {/* Marketing & Info */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-[#B19CD9] mb-3 uppercase tracking-wide">Marketing & Info</h3>
              <div className="grid gap-2 md:grid-cols-4">
                <a href="/preguntas-frecuentes" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#B19CD9] transition-colors block">
                  <span className="text-lg mr-2">❓</span>
                  <span className="font-bold text-sm">FAQ</span>
                  <span className="text-white/50 text-xs block mt-1">Common questions</span>
                </a>
                <a href="/aceptacion-de-la-corte" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#B19CD9] transition-colors block">
                  <span className="text-lg mr-2">⚖️</span>
                  <span className="font-bold text-sm">Court Acceptance</span>
                  <span className="text-white/50 text-xs block mt-1">Acceptance info</span>
                </a>
                <a href="/this-page-does-not-exist-404" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#B19CD9] transition-colors block">
                  <span className="text-lg mr-2">🚫</span>
                  <span className="font-bold text-sm">404 Page</span>
                  <span className="text-white/50 text-xs block mt-1">Not found preview</span>
                </a>
                <a href="/estados/texas" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#B19CD9] transition-colors block">
                  <span className="text-lg mr-2">🗺️</span>
                  <span className="font-bold text-sm">State Page (TX)</span>
                  <span className="text-white/50 text-xs block mt-1">Sample state landing</span>
                </a>
              </div>
            </div>

            {/* Admin Tools */}
            <div>
              <h3 className="text-sm font-bold text-[#FFB347] mb-3 uppercase tracking-wide">Admin Tools</h3>
              <div className="grid gap-2 md:grid-cols-4">
                <a href="/admin/attorneys" target="_blank" rel="noopener noreferrer"
                  className="bg-[#1C1C1C] border border-white/20 text-white rounded-lg px-4 py-3 hover:border-[#FFB347] transition-colors block">
                  <span className="text-lg mr-2">👨‍⚖️</span>
                  <span className="font-bold text-sm">Attorney Database</span>
                  <span className="text-white/50 text-xs block mt-1">Manage attorney directory</span>
                </a>
              </div>
            </div>

            {/* Reminder about incognito */}
            <div className="mt-4 p-3 bg-[#B19CD9]/10 border border-[#B19CD9]/30 rounded-lg">
              <p className="text-white/70 text-sm">
                ⚠️ <strong>Remember:</strong> These pages open as <em>your admin account</em>. To test as the test user, use the incognito instructions above.
              </p>
            </div>
          </section>

          {/* Section: Set Progress State */}
          <section className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">📈 Set Progress State</h2>
              <p className="text-white/50 text-sm mb-4">Fine-grained control over user state</p>
              <div className="flex gap-2 flex-wrap mb-4">
                {([
                  { value: 'new', label: 'New (0 lessons)', icon: '🆕' },
                  { value: 'mid_course', label: 'Mid-Course (7/15)', icon: '📚' },
                  { value: 'exam_ready', label: 'Exam Ready (15/15)', icon: '🎯' },
                  { value: 'exam_passed', label: 'Exam Passed', icon: '✅' },
                  { value: 'completed', label: 'Full Graduate', icon: '📜' },
                ] as const).map((state) => (
                  <button
                    key={state.value}
                    onClick={() => setSelectedState(state.value)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                      selectedState === state.value
                        ? 'bg-[#77DD77] text-[#1C1C1C]'
                        : 'bg-[#1C1C1C] text-white/70 hover:text-white border border-white/20'
                    }`}
                  >
                    {state.icon} {state.label}
                  </button>
                ))}
              </div>
              <button
                onClick={handleSetProgress}
                disabled={loading || !targetEmail}
                className="bg-[#7EC8E3] text-[#1C1C1C] font-bold rounded-lg px-6 py-3 hover:bg-[#9DD8F3] transition-colors disabled:opacity-50"
              >
                Set Progress State
              </button>
          </section>

          {/* Section: Send Test Emails */}
          <section className="bg-[#2A2A2A] rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-4">📧 Send Test Emails</h2>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <select
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value)}
                  className="bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#77DD77]"
                >
                  <option value="welcome_with_password">Welcome (with password)</option>
                  <option value="welcome_no_password">Welcome (no password)</option>
                  <option value="existing_user">Existing User (new course)</option>
                  <option value="already_owned">Already Owned (refund)</option>
                  <option value="password_reset">Password Reset</option>
                  <option value="student_certificate">Student Certificate 🎉</option>
                  <option value="attorney_certificate">Attorney Certificate</option>
                </select>
                <input
                  type="email"
                  placeholder="Recipient email"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  className="bg-[#1C1C1C] border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-[#77DD77]"
                />
                <button
                  onClick={handleSendEmail}
                  disabled={loading || !emailRecipient}
                  className="bg-[#7EC8E3] text-[#1C1C1C] font-bold rounded-lg px-6 py-3 hover:bg-[#9DD8F3] transition-colors disabled:opacity-50"
                >
                  Send Email
                </button>
              </div>
              <p className="text-white/50 text-sm">
                💡 Send to your real email to preview formatting.
              </p>
          </section>
        </div>
      </div>
    </div>
  );
}