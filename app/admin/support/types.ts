// =============================================================================
// ADMIN SUPPORT PANEL - TYPE DEFINITIONS
// =============================================================================
// Path: /app/admin/support/types.ts
// =============================================================================

// ============================================================================
// DATABASE ENTITY TYPES
// ============================================================================

export interface Profile {
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
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  course_type: 'coparenting' | 'parenting' | 'bundle';
  stripe_payment_id: string | null;
  stripe_customer_id: string | null;
  amount_paid: number;
  purchased_at: string;
  status: 'active' | 'refunded';
  exam_version: string | null;
  has_swapped: boolean;
}

export interface CourseProgress {
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

export interface ExamAttempt {
  id: string;
  user_id: string;
  purchase_id: string | null;
  version: string;
  questions_shown: string[];
  answers_given: Record<string, string> | null;
  score: number | null;
  passed: boolean;
  started_at: string | null;
  completed_at: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_type: 'coparenting' | 'parenting';
  certificate_number: string;
  verification_code: string;
  participant_name: string | null;
  issued_at: string;
  pdf_url: string | null;
  case_number: string | null;
  court_state: string | null;
  court_county: string | null;
}

// ============================================================================
// COMPOSITE TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  last_sign_in_at: string | null;
}

export interface CustomerData {
  profile: Profile | null;
  authUser: AuthUser | null;
  purchases: Purchase[];
  courseProgress: CourseProgress[];
  examAttempts: ExamAttempt[];
  certificates: Certificate[];
  orphan?: boolean;
  message?: string;
}

// ============================================================================
// RECENT SIGNUP TYPE
// ============================================================================

export interface RecentSignup {
  id: string;
  userId: string;
  email: string;
  name: string | null;
  courseType: 'coparenting' | 'parenting' | 'bundle';
  amountPaid: number;
  purchasedAt: string;
  status: 'completed' | 'in_progress';
}

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
  totalCustomers: number;
  totalGraduates: number;
  completionRate: number;
  attorneyRate: number;
  avgDaysToComplete: number;
  courseBreakdown: {
    coparenting: number;
    parenting: number;
    bundle: number;
  };
  topStates: Array<{ state: string; count: number }>;
  recentActivity: {
    purchases: number;
    graduates: number;
  };
  examStats: {
    passRate: number;
    firstAttemptPassRate: number;
    totalAttempts: number;
  };
  stuckStudents: number;
  recentSignups: RecentSignup[];
}

export interface SystemHealth {
  supabase: 'healthy' | 'degraded' | 'down';
  stripe: 'healthy' | 'degraded' | 'down';
  resend: 'healthy' | 'degraded' | 'down';
  lastCheck: string;
}

// ============================================================================
// STUCK STUDENT TYPE
// ============================================================================

export interface StuckStudent {
  id: string;
  email: string;
  full_name: string | null;
  course_type: string;
  purchased_at: string;
  days_stuck: number;
  lessons_completed: number;
  last_activity: string | null;
}

// ============================================================================
// ACTIVITY TIMELINE TYPES
// ============================================================================

export type TimelineEventType = 
  | 'purchase'
  | 'lesson_complete'
  | 'exam_attempt'
  | 'exam_passed'
  | 'certificate_issued'
  | 'profile_updated'
  | 'login'
  | 'support_email';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  details?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

export interface ActionLog {
  id: string;
  action: string;
  target_user: string;
  details: string;
  timestamp: string;
}

export interface ConfirmModalData {
  action: string;
  title: string;
  message: string;
  params: Record<string, unknown>;
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export type SearchType = 'email' | 'name' | 'phone' | 'stripe' | 'certificate';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

export interface Message {
  type: MessageType;
  text: string;
}

export interface ProfileEditData {
  legal_name: string;
  court_state: string;
  court_county: string;
  case_number: string;
  attorney_name: string;
  attorney_email: string;
}

// ============================================================================
// CUSTOMER SERVICE TYPES
// ============================================================================

export interface TranslationResult {
  translation: string;
  detectedEmail?: string | null;
  detectedTopic?: string | null;
  summary?: string | null;
}

export interface TemplateResult {
  subject: string;
  body: string;
}

export type TemplateName = 
  | 'password'
  | 'access'
  | 'certificate'
  | 'certificate_resend'
  | 'refund'
  | 'exam'
  | 'general'
  | 'payment_issue'
  | 'attorney_copy'
  | 'tech_support'
  | 'deadline'
  | 'duplicate_account'
  | 'class_swap';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ActionResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface SwapEligibility {
  eligible: boolean;
  reason?: string;
  currentClass?: string;
  targetClass?: string;
  lessonsCompleted?: number;
}
