'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  legal_name: string | null;
  phone: string | null;
  mailing_address: string | null;
  case_number: string | null;
  court_county: string | null;
  court_state: string | null;
  attorney_name: string | null;
  attorney_email: string | null;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

interface Purchase {
  id: string;
  user_id: string;
  course_type: 'coparenting' | 'parenting' | 'bundle';
  stripe_payment_id: string | null;
  stripe_customer_id: string | null;
  amount_paid: number;
  purchased_at: string;
  status: 'active' | 'refunded';
  exam_version: string | null;
}

interface CourseProgress {
  id: string;
  user_id: string;
  course_type: 'coparenting' | 'parenting';
  current_lesson: number | null;
  lessons_completed: number[];
  quiz_score: number | null;
  started_at: string | null;
  last_accessed: string | null;
  completed_at: string | null;
}

interface ExamAttempt {
  id: string;
  user_id: string;
  purchase_id: string | null;
  version: string;
  score: number | null;
  passed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

interface Certificate {
  id: string;
  user_id: string;
  course_type: 'coparenting' | 'parenting';
  certificate_number: string;
  verification_code: string;
  participant_name: string | null;
  issued_at: string;
  pdf_url: string | null;
}

interface CustomerData {
  profile: Profile | null;
  authUser: {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    last_sign_in_at: string | null;
  } | null;
  purchases: Purchase[];
  courseProgress: CourseProgress[];
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  orphan?: boolean;
  message?: string;
}

interface ActionLog {
  id: string;
  action: string;
  target_user: string;
  details: string;
  timestamp: string;
}

interface SystemHealth {
  supabase: 'healthy' | 'degraded' | 'down';
  stripe: 'healthy' | 'degraded' | 'down';
  resend: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

interface DashboardStats {
  totalCustomers: number;
  totalGraduates: number;
  completionRate: number;
  attorneyPercentage: number;
  avgDaysToComplete: number;
  examPassRate: number;
  courseBreakdown: {
    coparenting: number;
    parenting: number;
    bundle: number;
  };
  stateBreakdown: Array<{ state: string; count: number }>;
  last7Days: {
    purchases: number;
    graduates: number;
  };
  stuckStudents: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatCurrency = (cents: number) => {
  return `$${(cents / 100).toFixed(2)}`;
};

const getCourseDisplayName = (type: string) => {
  switch (type) {
    case 'coparenting':
      return 'Co-Parenting Class';
    case 'parenting':
      return 'Parenting Class';
    case 'bundle':
      return 'Bundle (Both Classes)';
    default:
      return type;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AdminSupportPage() {
  // Auth state
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [showAllStates, setShowAllStates] = useState(false);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'name' | 'phone' | 'stripe'>('email');
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    action: string;
    title: string;
    message: string;
    params: Record<string, unknown>;
  } | null>(null);

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

  // Load stats and system health on mount
  useEffect(() => {
    if (isAuthorized) {
      fetchStats();
      checkSystemHealth();
    }
  }, [isAuthorized]);

  // ============================================================================
  // MESSAGE HELPER
  // ============================================================================

  const showMessage = (type: 'success' | 'error' | 'warning', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // ============================================================================
  // API CALL HELPER
  // ============================================================================

  const apiCall = async (endpoint: string, data: Record<string, unknown> = {}, method: 'POST' | 'GET' = 'POST') => {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || ''}`,
      },
    };

    if (method === 'POST') {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Request failed');
    }

    return result;
  };

  // ============================================================================
  // FETCH STATS
  // ============================================================================

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const data = await apiCall('/api/admin/support/stats', {}, 'GET');
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // ============================================================================
  // SYSTEM HEALTH CHECK
  // ============================================================================

  const checkSystemHealth = async () => {
    try {
      const data = await apiCall('/api/admin/support/system-health', {}, 'GET');
      setSystemHealth(data);
    } catch (err) {
      setSystemHealth({
        supabase: 'down',
        stripe: 'down',
        resend: 'down',
        lastCheck: new Date().toISOString(),
      });
    }
  };

  // ============================================================================
  // CUSTOMER SEARCH
  // ============================================================================

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setCustomer(null);

    try {
      const data = await apiCall('/api/admin/support/customer-lookup', {
        query: searchQuery,
        type: searchType,
      });

      setCustomer(data);

      if (data.orphan) {
        showMessage('warning', 'ORPHAN USER - Auth exists but no profile. Use Quick Actions to fix.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================================================
  // QUICK ACTIONS
  // ============================================================================

  const executeAction = async (
    action: string,
    params: Record<string, unknown>,
    confirmTitle?: string,
    confirmMessage?: string
  ) => {
    if (confirmTitle && confirmMessage) {
      setShowConfirmModal({
        action,
        title: confirmTitle,
        message: confirmMessage,
        params,
      });
      return;
    }
    await performAction(action, params);
  };

  const performAction = async (action: string, params: Record<string, unknown>) => {
    setShowConfirmModal(null);
    setActionInProgress(action);

    try {
      const result = await apiCall('/api/admin/support/quick-actions', { action, ...params });

      // Log the action
      setActionLog((prev) => [
        {
          id: Date.now().toString(),
          action,
          target_user: customer?.profile?.email || customer?.authUser?.email || 'Unknown',
          details: result.message || 'Success',
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Refresh customer data
      if (searchQuery) {
        await handleSearch();
      }

      // Refresh stats for actions that affect counts
      if (['grant_course_access', 'generate_certificate', 'delete_user', 'reset_user'].includes(action)) {
        fetchStats();
      }

      showMessage('success', result.message || 'Action completed successfully');
    } catch (err) {
      showMessage('error', err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionInProgress(null);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const StatusBadge = ({ status, children }: { status: 'success' | 'warning' | 'error' | 'info'; children: React.ReactNode }) => {
    const colors = {
      success: 'bg-[#77DD77]/20 text-[#77DD77] border-[#77DD77]/30',
      warning: 'bg-[#FFE566]/20 text-[#FFE566] border-[#FFE566]/30',
      error: 'bg-[#FF9999]/20 text-[#FF9999] border-[#FF9999]/30',
      info: 'bg-[#7EC8E3]/20 text-[#7EC8E3] border-[#7EC8E3]/30',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {children}
      </span>
    );
  };

  const ActionButton = ({
    onClick,
    disabled,
    variant = 'default',
    children,
  }: {
    onClick: () => void;
    disabled?: boolean;
    variant?: 'default' | 'danger' | 'success';
    children: React.ReactNode;
  }) => {
    const variants = {
      default: 'bg-white/10 hover:bg-white/20 text-white border-white/20',
      danger: 'bg-[#FF9999]/20 hover:bg-[#FF9999]/30 text-[#FF9999] border-[#FF9999]/30',
      success: 'bg-[#77DD77]/20 hover:bg-[#77DD77]/30 text-[#77DD77] border-[#77DD77]/30',
    };
    return (
      <button
        onClick={onClick}
        disabled={disabled || actionInProgress !== null}
        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200 
          disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
      >
        {actionInProgress ? '...' : children}
      </button>
    );
  };

  const StatCard = ({
    value,
    label,
    subtext,
    color = 'white',
  }: {
    value: string | number;
    label: string;
    subtext?: string;
    color?: 'white' | 'green' | 'blue' | 'yellow' | 'red';
  }) => {
    const colors = {
      white: 'text-white',
      green: 'text-[#77DD77]',
      blue: 'text-[#7EC8E3]',
      yellow: 'text-[#FFE566]',
      red: 'text-[#FF9999]',
    };
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
        <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
        <div className="text-sm text-white/60 mt-1">{label}</div>
        {subtext && <div className="text-xs text-white/40 mt-1">{subtext}</div>}
      </div>
    );
  };

  // ============================================================================
  // LOADING / UNAUTHORIZED STATES
  // ============================================================================

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
          <a
            href="/iniciar-sesion"
            className="inline-block mt-4 px-6 py-3 bg-[#77DD77] text-[#1C1C1C] rounded-lg font-bold hover:bg-[#88EE88] transition-colors"
          >
            Log In →
          </a>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white p-6">
      {/* Message Toast */}
      {message && (
        <div
          className={`fixed top-4 right-4 px-6 py-4 rounded-lg shadow-lg z-50 max-w-md ${
            message.type === 'success'
              ? 'bg-green-600'
              : message.type === 'warning'
              ? 'bg-yellow-600'
              : 'bg-red-600'
          } text-white`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Support Admin Panel</h1>
        <p className="text-white/60">Diagnose and resolve customer issues without touching the database directly.</p>
      </header>

      {/* Dashboard Stats */}
      <section className="mb-8">
        {statsLoading ? (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center text-white/50">
            Loading dashboard stats...
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Top Row - Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <StatCard value={stats.totalCustomers} label="Customers" subtext="with purchases" />
              <StatCard value={stats.totalGraduates} label="Graduates" subtext="with certificates" color="green" />
              <StatCard value={`${stats.completionRate}%`} label="Completion Rate" color="blue" />
              <StatCard value={`${stats.attorneyPercentage}%`} label="Attorney Rate" color="yellow" />
              <StatCard value={`${stats.avgDaysToComplete}`} label="Avg Days" subtext="to complete" />
            </div>

            {/* Second Row - Details */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Course Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-semibold mb-3 text-white/80">Course Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Co-Parenting</span>
                    <span className="text-[#7EC8E3]">
                      {stats.courseBreakdown.coparenting}{' '}
                      <span className="text-white/40">
                        ({stats.totalCustomers > 0 ? Math.round((stats.courseBreakdown.coparenting / stats.totalCustomers) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Parenting</span>
                    <span className="text-[#7EC8E3]">
                      {stats.courseBreakdown.parenting}{' '}
                      <span className="text-white/40">
                        ({stats.totalCustomers > 0 ? Math.round((stats.courseBreakdown.parenting / stats.totalCustomers) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bundle</span>
                    <span className="text-[#7EC8E3]">
                      {stats.courseBreakdown.bundle}{' '}
                      <span className="text-white/40">
                        ({stats.totalCustomers > 0 ? Math.round((stats.courseBreakdown.bundle / stats.totalCustomers) * 100) : 0}%)
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* State Breakdown */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <h3 className="font-semibold mb-3 text-white/80">Top States (Graduates)</h3>
                <div className="space-y-2">
                  {(showAllStates ? stats.stateBreakdown : stats.stateBreakdown.slice(0, 5)).map((item) => (
                    <div key={item.state} className="flex justify-between text-sm">
                      <span>{item.state}</span>
                      <span className="text-[#77DD77]">{item.count}</span>
                    </div>
                  ))}
                  {stats.stateBreakdown.length === 0 && (
                    <p className="text-white/40 text-sm">No state data yet</p>
                  )}
                  {stats.stateBreakdown.length > 5 && (
                    <button
                      onClick={() => setShowAllStates(!showAllStates)}
                      className="text-[#7EC8E3] text-sm hover:underline mt-2"
                    >
                      {showAllStates ? 'Show less' : `Show all ${stats.stateBreakdown.length} states`}
                    </button>
                  )}
                </div>
              </div>

              {/* Activity & Alerts */}
              <div className="space-y-4">
                {/* Last 7 Days */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-white/80">Last 7 Days</h3>
                  <div className="flex gap-6">
                    <div>
                      <span className="text-2xl font-bold text-[#77DD77]">+{stats.last7Days.purchases}</span>
                      <span className="text-white/50 text-sm ml-2">purchases</span>
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-[#7EC8E3]">+{stats.last7Days.graduates}</span>
                      <span className="text-white/50 text-sm ml-2">graduates</span>
                    </div>
                  </div>
                </div>

                {/* Alerts */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 text-white/80">Alerts</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Exam Pass Rate (1st try)</span>
                      <span className={stats.examPassRate >= 80 ? 'text-[#77DD77]' : 'text-[#FFE566]'}>
                        {stats.examPassRate}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Stuck Students (30+ days)</span>
                      <span className={stats.stuckStudents === 0 ? 'text-[#77DD77]' : 'text-[#FF9999]'}>
                        {stats.stuckStudents}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <div className="flex justify-end">
              <button
                onClick={fetchStats}
                className="text-sm text-[#7EC8E3] hover:underline"
              >
                ↻ Refresh Stats
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center text-white/50">
            Failed to load stats
          </div>
        )}
      </section>

      {/* System Health Bar */}
      {systemHealth && (
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-6 flex-wrap">
            <span className="text-sm text-white/60">System Status:</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth.supabase === 'healthy'
                    ? 'bg-[#77DD77]'
                    : systemHealth.supabase === 'degraded'
                    ? 'bg-[#FFE566]'
                    : 'bg-[#FF9999]'
                }`}
              />
              <span className="text-sm">Supabase</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth.stripe === 'healthy'
                    ? 'bg-[#77DD77]'
                    : systemHealth.stripe === 'degraded'
                    ? 'bg-[#FFE566]'
                    : 'bg-[#FF9999]'
                }`}
              />
              <span className="text-sm">Stripe</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  systemHealth.resend === 'healthy'
                    ? 'bg-[#77DD77]'
                    : systemHealth.resend === 'degraded'
                    ? 'bg-[#FFE566]'
                    : 'bg-[#FF9999]'
                }`}
              />
              <span className="text-sm">Resend</span>
            </div>
            <button onClick={checkSystemHealth} className="ml-auto text-sm text-[#7EC8E3] hover:underline">
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Search Section */}
      <section className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
        <h2 className="text-xl font-semibold mb-4">🔍 Customer Lookup</h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as typeof searchType)}
            className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
          >
            <option value="email">Email</option>
            <option value="name">Name</option>
            <option value="phone">Phone</option>
            <option value="stripe">Stripe ID</option>
          </select>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={`Search by ${searchType}...`}
            className="flex-1 min-w-[200px] px-4 py-3 rounded-lg bg-white/10 border border-white/20 
              text-white placeholder:text-white/40 focus:outline-none focus:border-[#7EC8E3]"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-6 py-3 rounded-lg bg-[#7EC8E3] text-[#1C1C1C] font-semibold
              hover:bg-[#9DD8F3] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-[#FF9999]/20 border border-[#FF9999]/30 text-[#FF9999]">
            ❌ {error}
          </div>
        )}
      </section>

      {/* Customer Details */}
      {customer && (
        <div className="space-y-6">
          {/* Orphan Warning */}
          {customer.orphan && (
            <section className="p-6 rounded-xl bg-[#FFE566]/10 border-2 border-[#FFE566]/50">
              <h2 className="text-xl font-bold text-[#FFE566] mb-2">⚠️ Orphan User Detected</h2>
              <p className="text-white/70 mb-4">
                This user exists in Supabase Auth but has no profile record. This usually happens when the webhook
                failed or the user closed the browser before account setup completed.
              </p>
              <div className="bg-[#1C1C1C] rounded-lg p-4 mb-4">
                <p className="text-sm">
                  <strong>Auth ID:</strong> <span className="font-mono">{customer.authUser?.id}</span>
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {customer.authUser?.email}
                </p>
              </div>
              <ActionButton
                variant="success"
                onClick={() =>
                  executeAction('fix_orphan_user', {
                    userId: customer.authUser?.id,
                    email: customer.authUser?.email,
                  })
                }
              >
                🔧 Fix Orphan User (Create Profile)
              </ActionButton>
            </section>
          )}

          {/* Customer Overview */}
          {!customer.orphan && customer.profile && (
            <>
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      👤 {customer.profile?.full_name || customer.authUser?.email || 'Unknown User'}
                    </h2>
                    <p className="text-white/60 mt-1">{customer.profile?.email || customer.authUser?.email}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {customer.authUser?.email_confirmed_at ? (
                      <StatusBadge status="success">✅ Email Verified</StatusBadge>
                    ) : (
                      <StatusBadge status="warning">⏳ Email Unverified</StatusBadge>
                    )}
                    {customer.profile?.profile_completed ? (
                      <StatusBadge status="success">✅ Profile Complete</StatusBadge>
                    ) : (
                      <StatusBadge status="warning">⏳ Profile Incomplete</StatusBadge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-white/50">User ID</span>
                    <p className="font-mono text-xs mt-1 truncate">{customer.profile?.id || customer.authUser?.id}</p>
                  </div>
                  <div>
                    <span className="text-white/50">Phone</span>
                    <p className="mt-1">{customer.profile?.phone || '—'}</p>
                  </div>
                  <div>
                    <span className="text-white/50">Created</span>
                    <p className="mt-1">
                      {formatDate(customer.authUser?.created_at || customer.profile?.created_at || null)}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/50">Last Sign In</span>
                    <p className="mt-1">{formatDate(customer.authUser?.last_sign_in_at || null)}</p>
                  </div>
                </div>

                {/* Profile Details */}
                {customer.profile && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h3 className="text-lg font-semibold mb-4">📋 Profile Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-white/50">Legal Name</span>
                        <p className="mt-1">{customer.profile.legal_name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/50">Case Number</span>
                        <p className="mt-1">{customer.profile.case_number || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/50">Court</span>
                        <p className="mt-1">
                          {customer.profile.court_county && customer.profile.court_state
                            ? `${customer.profile.court_county}, ${customer.profile.court_state}`
                            : '—'}
                        </p>
                      </div>
                      <div>
                        <span className="text-white/50">Attorney</span>
                        <p className="mt-1">{customer.profile.attorney_name || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/50">Attorney Email</span>
                        <p className="mt-1">{customer.profile.attorney_email || '—'}</p>
                      </div>
                      <div>
                        <span className="text-white/50">Mailing Address</span>
                        <p className="mt-1">{customer.profile.mailing_address || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Account Quick Actions */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-lg font-semibold mb-4">⚡ Account Actions</h3>
                  <div className="flex flex-wrap gap-3">
                    <ActionButton
                      onClick={() =>
                        executeAction('reset_password', {
                          userId: customer.profile?.id || customer.authUser?.id,
                          email: customer.profile?.email || customer.authUser?.email,
                        })
                      }
                    >
                      🔑 Send Password Reset
                    </ActionButton>
                    {!customer.authUser?.email_confirmed_at && (
                      <ActionButton
                        variant="success"
                        onClick={() =>
                          executeAction(
                            'verify_email',
                            { userId: customer.profile?.id || customer.authUser?.id },
                            'Force Verify Email?',
                            'This will mark the email as verified without the user clicking the link.'
                          )
                        }
                      >
                        ✅ Force Verify Email
                      </ActionButton>
                    )}
                    {!customer.profile?.profile_completed && (
                      <ActionButton
                        variant="success"
                        onClick={() =>
                          executeAction(
                            'mark_profile_complete',
                            { userId: customer.profile?.id },
                            'Mark Profile Complete?',
                            'This will allow the user to access their course.'
                          )
                        }
                      >
                        ✅ Mark Profile Complete
                      </ActionButton>
                    )}
                    <ActionButton
                      onClick={() =>
                        executeAction('resend_welcome_email', {
                          userId: customer.profile?.id,
                          email: customer.profile?.email,
                        })
                      }
                    >
                      📧 Resend Welcome Email
                    </ActionButton>
                  </div>
                </div>
              </section>

              {/* Purchases Section */}
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <h2 className="text-xl font-semibold">💳 Purchases</h2>
                  <ActionButton
                    variant="success"
                    onClick={() => {
                      const courseType = prompt('Enter course type (coparenting, parenting, or bundle):');
                      if (courseType && ['coparenting', 'parenting', 'bundle'].includes(courseType)) {
                        executeAction(
                          'grant_course_access',
                          { userId: customer.profile?.id, courseType },
                          'Grant Course Access?',
                          `This will grant ${courseType} access without payment.`
                        );
                      }
                    }}
                  >
                    ➕ Grant Course Access
                  </ActionButton>
                </div>

                {customer.purchases.length === 0 ? (
                  <div className="p-8 text-center text-white/50 border border-dashed border-white/20 rounded-lg">
                    <p className="text-lg mb-2">No purchases found</p>
                    <p className="text-sm">User may have paid but webhook failed. Check Stripe.</p>
                    <div className="mt-4">
                      <ActionButton
                        onClick={() =>
                          window.open(
                            `https://dashboard.stripe.com/search?query=${customer.profile?.email}`,
                            '_blank'
                          )
                        }
                      >
                        🔗 Search in Stripe
                      </ActionButton>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-white/50 border-b border-white/10">
                          <th className="pb-3">Course</th>
                          <th className="pb-3">Amount</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3">Date</th>
                          <th className="pb-3">Stripe ID</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.purchases.map((purchase) => (
                          <tr key={purchase.id} className="border-b border-white/5">
                            <td className="py-3">{getCourseDisplayName(purchase.course_type)}</td>
                            <td className="py-3">{formatCurrency(purchase.amount_paid)}</td>
                            <td className="py-3">
                              {purchase.status === 'active' ? (
                                <StatusBadge status="success">Active</StatusBadge>
                              ) : (
                                <StatusBadge status="error">Refunded</StatusBadge>
                              )}
                            </td>
                            <td className="py-3">{formatDate(purchase.purchased_at)}</td>
                            <td className="py-3 font-mono text-xs">{purchase.stripe_payment_id?.substring(0, 20)}...</td>
                            <td className="py-3">
                              <div className="flex gap-2">
                                {purchase.status === 'active' && (
                                  <ActionButton
                                    variant="danger"
                                    onClick={() =>
                                      executeAction(
                                        'issue_refund',
                                        { purchaseId: purchase.id, stripePaymentId: purchase.stripe_payment_id },
                                        'Issue Refund?',
                                        `This will refund ${formatCurrency(purchase.amount_paid)} and revoke access.`
                                      )
                                    }
                                  >
                                    💸 Refund
                                  </ActionButton>
                                )}
                                <ActionButton
                                  onClick={() =>
                                    window.open(
                                      `https://dashboard.stripe.com/payments/${purchase.stripe_payment_id}`,
                                      '_blank'
                                    )
                                  }
                                >
                                  🔗 Stripe
                                </ActionButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Course Progress Section */}
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">📚 Course Progress</h2>

                {customer.courseProgress.length === 0 ? (
                  <div className="p-8 text-center text-white/50 border border-dashed border-white/20 rounded-lg">
                    <p className="text-lg mb-2">No progress records found</p>
                    {customer.purchases.length > 0 && (
                      <div className="mt-4">
                        <ActionButton
                          variant="success"
                          onClick={() =>
                            executeAction('create_progress_record', {
                              userId: customer.profile?.id,
                              courseType: customer.purchases[0].course_type === 'bundle' 
                                ? 'coparenting' 
                                : customer.purchases[0].course_type,
                            })
                          }
                        >
                          ➕ Create Progress Record
                        </ActionButton>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customer.courseProgress.map((progress) => (
                      <div key={progress.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <h3 className="font-semibold">{getCourseDisplayName(progress.course_type)}</h3>
                          <div className="flex gap-2">
                            {progress.completed_at ? (
                              <StatusBadge status="success">✅ Completed</StatusBadge>
                            ) : progress.lessons_completed?.length === 15 ? (
                              <StatusBadge status="info">📝 Ready for Exam</StatusBadge>
                            ) : (
                              <StatusBadge status="warning">🔄 In Progress</StatusBadge>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Lessons Completed</span>
                            <span>{progress.lessons_completed?.length || 0} / 15</span>
                          </div>
                          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#77DD77] transition-all duration-300"
                              style={{
                                width: `${((progress.lessons_completed?.length || 0) / 15) * 100}%`,
                              }}
                            />
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {Array.from({ length: 15 }, (_, i) => i + 1).map((lesson) => (
                              <span
                                key={lesson}
                                className={`w-6 h-6 flex items-center justify-center rounded text-xs
                                  ${
                                    progress.lessons_completed?.includes(lesson)
                                      ? 'bg-[#77DD77]/30 text-[#77DD77]'
                                      : 'bg-white/10 text-white/40'
                                  }`}
                              >
                                {lesson}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-white/50">Started</span>
                            <p className="mt-1">{formatDate(progress.started_at)}</p>
                          </div>
                          <div>
                            <span className="text-white/50">Last Activity</span>
                            <p className="mt-1">{formatDate(progress.last_accessed)}</p>
                          </div>
                          <div>
                            <span className="text-white/50">Exam Score</span>
                            <p className="mt-1">{progress.quiz_score ? `${progress.quiz_score}%` : '—'}</p>
                          </div>
                        </div>

                        {/* Progress Quick Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                          {(progress.lessons_completed?.length || 0) < 15 && (
                            <ActionButton
                              variant="success"
                              onClick={() =>
                                executeAction(
                                  'complete_all_lessons',
                                  { progressId: progress.id, userId: customer.profile?.id, courseType: progress.course_type },
                                  'Mark All Lessons Complete?',
                                  'This will mark all 15 lessons complete, allowing exam access.'
                                )
                              }
                            >
                              ✅ Complete All Lessons
                            </ActionButton>
                          )}
                          <ActionButton
                            variant="danger"
                            onClick={() =>
                              executeAction(
                                'reset_progress',
                                { progressId: progress.id, userId: customer.profile?.id },
                                'Reset Progress?',
                                'This will reset progress to 0 lessons.'
                              )
                            }
                          >
                            🔄 Reset Progress
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Exam Attempts Section */}
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">📝 Exam Attempts</h2>

                {customer.examAttempts.length === 0 ? (
                  <div className="p-8 text-center text-white/50 border border-dashed border-white/20 rounded-lg">
                    <p>No exam attempts yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-white/50 border-b border-white/10">
                          <th className="pb-3">Version</th>
                          <th className="pb-3">Score</th>
                          <th className="pb-3">Result</th>
                          <th className="pb-3">Started</th>
                          <th className="pb-3">Completed</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customer.examAttempts.map((attempt) => (
                          <tr key={attempt.id} className="border-b border-white/5">
                            <td className="py-3">{attempt.version}</td>
                            <td className="py-3">{attempt.score !== null ? `${attempt.score}` : '—'}</td>
                            <td className="py-3">
                              {attempt.passed ? (
                                <StatusBadge status="success">✅ Passed</StatusBadge>
                              ) : attempt.completed_at ? (
                                <StatusBadge status="error">❌ Failed</StatusBadge>
                              ) : (
                                <StatusBadge status="warning">⏳ In Progress</StatusBadge>
                              )}
                            </td>
                            <td className="py-3">{formatDate(attempt.started_at)}</td>
                            <td className="py-3">{formatDate(attempt.completed_at)}</td>
                            <td className="py-3">
                              {!attempt.passed && attempt.completed_at && (
                                <ActionButton
                                  variant="success"
                                  onClick={() =>
                                    executeAction(
                                      'mark_exam_passed',
                                      { attemptId: attempt.id, userId: customer.profile?.id },
                                      'Mark Exam as Passed?',
                                      'This will override the result and mark as passed.'
                                    )
                                  }
                                >
                                  ✅ Mark Passed
                                </ActionButton>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Create Passing Attempt */}
                {customer.courseProgress.some((p) => p.lessons_completed?.length === 15) &&
                  !customer.examAttempts.some((a) => a.passed) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <ActionButton
                        variant="success"
                        onClick={() => {
                          const progress = customer.courseProgress.find((p) => p.lessons_completed?.length === 15);
                          executeAction(
                            'create_passing_attempt',
                            { userId: customer.profile?.id, courseType: progress?.course_type },
                            'Create Passing Exam Attempt?',
                            'This will create a new passed exam attempt.'
                          );
                        }}
                      >
                        ➕ Create Passing Attempt
                      </ActionButton>
                    </div>
                  )}
              </section>

              {/* Certificates Section */}
              <section className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h2 className="text-xl font-semibold mb-4">🏆 Certificates</h2>

                {customer.certificates.length === 0 ? (
                  <div className="p-8 text-center text-white/50 border border-dashed border-white/20 rounded-lg">
                    <p className="text-lg mb-2">No certificates generated</p>
                    {customer.examAttempts.some((a) => a.passed) && (
                      <>
                        <p className="text-sm mb-4">User passed exam but no certificate created.</p>
                        <ActionButton
                          variant="success"
                          onClick={() =>
                            executeAction('generate_certificate', {
                              userId: customer.profile?.id,
                              courseType: 'coparenting',
                              participantName: customer.profile?.legal_name || customer.profile?.full_name,
                            })
                          }
                        >
                          🏆 Generate Certificate
                        </ActionButton>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {customer.certificates.map((cert) => (
                      <div key={cert.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                          <div>
                            <h3 className="font-semibold text-lg">{getCourseDisplayName(cert.course_type)}</h3>
                            <p className="text-white/60">Certificate #{cert.certificate_number}</p>
                          </div>
                          <StatusBadge status="success">✅ Issued</StatusBadge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-white/50">Participant Name</span>
                            <p className="mt-1">{cert.participant_name || '—'}</p>
                          </div>
                          <div>
                            <span className="text-white/50">Verification Code</span>
                            <p className="mt-1 font-mono">{cert.verification_code}</p>
                          </div>
                          <div>
                            <span className="text-white/50">Issued</span>
                            <p className="mt-1">{formatDate(cert.issued_at)}</p>
                          </div>
                          <div>
                            <span className="text-white/50">Verification URL</span>
                            <p className="mt-1 text-[#7EC8E3]">
                              <a
                                href={`https://claseparapadres.com/verificar/${cert.verification_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                /verificar/{cert.verification_code}
                              </a>
                            </p>
                          </div>
                        </div>

                        {/* Certificate Quick Actions */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                          <ActionButton
                            onClick={() =>
                              window.open(`https://claseparapadres.com/api/certificate/${cert.id}`, '_blank')
                            }
                          >
                            📄 Download PDF
                          </ActionButton>
                          <ActionButton
                            onClick={() =>
                              executeAction('resend_certificate_email', {
                                certificateId: cert.id,
                                email: customer.profile?.email,
                              })
                            }
                          >
                            📧 Resend to Student
                          </ActionButton>
                          {customer.profile?.attorney_email && (
                            <ActionButton
                              onClick={() =>
                                executeAction('resend_attorney_email', {
                                  certificateId: cert.id,
                                  attorneyEmail: customer.profile?.attorney_email,
                                })
                              }
                            >
                              📧 Resend to Attorney
                            </ActionButton>
                          )}
                          <ActionButton
                            onClick={() => {
                              const newName = prompt('Enter corrected name:', cert.participant_name || '');
                              if (newName) {
                                executeAction('update_certificate_name', { certificateId: cert.id, newName });
                              }
                            }}
                          >
                            ✏️ Update Name
                          </ActionButton>
                          <ActionButton
                            variant="danger"
                            onClick={() =>
                              executeAction(
                                'delete_certificate',
                                { certificateId: cert.id },
                                'Delete Certificate?',
                                'User will need to retake exam for a new one.'
                              )
                            }
                          >
                            🗑️ Delete
                          </ActionButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Danger Zone */}
              <section className="p-6 rounded-xl bg-[#FF9999]/10 border border-[#FF9999]/30">
                <h2 className="text-xl font-semibold mb-4 text-[#FF9999]">⚠️ Danger Zone</h2>
                <p className="text-white/60 text-sm mb-4">These actions are destructive and cannot be easily undone.</p>
                <div className="flex flex-wrap gap-3">
                  <ActionButton
                    variant="danger"
                    onClick={() =>
                      executeAction(
                        'reset_user',
                        { userId: customer.profile?.id, email: customer.profile?.email },
                        'Reset All User Data?',
                        'This will delete all progress, exams, and certificates. Auth account stays.'
                      )
                    }
                  >
                    🔄 Reset All Progress
                  </ActionButton>
                  <ActionButton
                    variant="danger"
                    onClick={() =>
                      executeAction(
                        'delete_user',
                        { userId: customer.profile?.id, email: customer.profile?.email },
                        'Permanently Delete User?',
                        'This will delete EVERYTHING including the auth account. Cannot be undone.'
                      )
                    }
                  >
                    💀 Delete User Account
                  </ActionButton>
                </div>
              </section>
            </>
          )}
        </div>
      )}

      {/* Action Log */}
      {actionLog.length > 0 && (
        <section className="mt-8 p-6 rounded-xl bg-white/5 border border-white/10">
          <h2 className="text-xl font-semibold mb-4">📜 Action Log (This Session)</h2>
          <div className="space-y-2">
            {actionLog.map((log) => (
              <div key={log.id} className="flex items-center gap-4 text-sm p-3 bg-white/5 rounded-lg flex-wrap">
                <span className="text-white/50">{formatDate(log.timestamp)}</span>
                <span className="font-medium">{log.action}</span>
                <span className="text-white/60">→ {log.target_user}</span>
                <span className="text-[#77DD77] ml-auto">{log.details}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2C2C] rounded-xl p-6 max-w-md w-full border border-white/20">
            <h3 className="text-xl font-bold mb-2">{showConfirmModal.title}</h3>
            <p className="text-white/70 mb-6">{showConfirmModal.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmModal(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => performAction(showConfirmModal.action, showConfirmModal.params)}
                className="px-4 py-2 rounded-lg bg-[#FF9999] text-[#1C1C1C] font-semibold hover:bg-[#FFB3B3] transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
