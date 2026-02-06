// =============================================================================
// ADMIN SUPPORT PANEL - UTILITY FUNCTIONS
// =============================================================================
// Path: /app/admin/support/utils.ts
// =============================================================================

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date string for display.
 * Returns "—" for null/undefined values.
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Format a date string as short date only (no time).
 */
export const formatDateShort = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format a date as relative time (e.g., "3 days ago").
 */
export const formatRelativeTime = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDateShort(dateString);
};

/**
 * Calculate days between two dates.
 */
export const daysBetween = (startDate: string, endDate?: string): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format cents as USD currency string.
 */
export const formatCurrency = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

// ============================================================================
// COURSE DISPLAY NAMES
// ============================================================================

/**
 * Get display name for a course type.
 */
export const getCourseDisplayName = (type: string): string => {
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

/**
 * Get Spanish display name for a course type.
 */
export const getCourseDisplayNameES = (type: string): string => {
  switch (type) {
    case 'coparenting':
      return 'Clase de Coparentalidad';
    case 'parenting':
      return 'Clase de Crianza';
    case 'bundle':
      return 'El Paquete Completo';
    default:
      return type;
  }
};

/**
 * Get the opposite course type for swapping.
 */
export const getSwapTargetCourse = (currentType: string): string | null => {
  if (currentType === 'coparenting') return 'parenting';
  if (currentType === 'parenting') return 'coparenting';
  return null; // Bundle can't be swapped
};

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Truncate a string to a maximum length with ellipsis.
 */
export const truncate = (str: string, maxLength: number): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Generate a random alphanumeric string.
 */
export const generateRandomString = (length: number): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a string is a valid email format.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Check if a string looks like a Stripe ID.
 */
export const isStripeId = (str: string): boolean => {
  return /^(pi_|cs_|cus_|ch_|in_)/.test(str);
};

/**
 * Check if a string looks like a certificate number.
 */
export const isCertificateNumber = (str: string): boolean => {
  return /^PKF-[A-Z0-9]{6}$/i.test(str.trim());
};

/**
 * Check if a string looks like a verification code.
 */
export const isVerificationCode = (str: string): boolean => {
  return /^[A-Z0-9]{8}$/i.test(str.trim());
};

/**
 * Detect the type of search query automatically.
 */
export const detectSearchType = (query: string): 'email' | 'certificate' | 'stripe' | 'phone' | 'name' => {
  const trimmed = query.trim();
  
  if (isValidEmail(trimmed)) return 'email';
  if (isCertificateNumber(trimmed) || isVerificationCode(trimmed)) return 'certificate';
  if (isStripeId(trimmed)) return 'stripe';
  if (/^\d{10,}$/.test(trimmed.replace(/\D/g, ''))) return 'phone';
  return 'name';
};

// ============================================================================
// PROGRESS UTILITIES
// ============================================================================

/**
 * Calculate completion percentage.
 */
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

/**
 * Get lessons as an array of 1-15.
 */
export const getAllLessons = (): number[] => {
  return Array.from({ length: 15 }, (_, i) => i + 1);
};

// ============================================================================
// COPY UTILITIES
// ============================================================================

/**
 * Copy text to clipboard.
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Get the base URL for the site.
 */
export const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://claseparapadres.com';
};

/**
 * Build a Stripe dashboard URL for a payment.
 */
export const getStripePaymentUrl = (paymentId: string): string => {
  return `https://dashboard.stripe.com/payments/${paymentId}`;
};

/**
 * Build a Stripe search URL.
 */
export const getStripeSearchUrl = (email: string): string => {
  return `https://dashboard.stripe.com/search?query=${encodeURIComponent(email)}`;
};

/**
 * Build a certificate verification URL.
 */
export const getCertificateVerifyUrl = (verificationCode: string): string => {
  return `${getBaseUrl()}/verificar/${verificationCode}`;
};

/**
 * Build a certificate download URL.
 */
export const getCertificateDownloadUrl = (certificateId: string): string => {
  return `${getBaseUrl()}/api/certificate/${certificateId}`;
};

// ============================================================================
// SWAP ELIGIBILITY
// ============================================================================

/**
 * Check if a purchase is eligible for class swap.
 * Returns eligibility status and reason.
 */
export interface SwapEligibilityResult {
  eligible: boolean;
  reason: string;
}

export const checkSwapEligibility = (
  purchase: { course_type: string; has_swapped: boolean },
  progress: { lessons_completed: number[] } | null,
  hasPassedExam: boolean,
  hasCertificate: boolean,
  ownsTargetClass: boolean
): SwapEligibilityResult => {
  // Bundle can't be swapped
  if (purchase.course_type === 'bundle') {
    return { eligible: false, reason: 'Bundle purchases cannot be swapped' };
  }

  // Already swapped once
  if (purchase.has_swapped) {
    return { eligible: false, reason: 'Already used one-time swap' };
  }

  // Too much progress
  const lessonsCompleted = progress?.lessons_completed?.length || 0;
  if (lessonsCompleted >= 2) {
    return { eligible: false, reason: `Completed ${lessonsCompleted} lessons (max 1 for swap)` };
  }

  // Already passed exam
  if (hasPassedExam) {
    return { eligible: false, reason: 'Already passed exam' };
  }

  // Already has certificate
  if (hasCertificate) {
    return { eligible: false, reason: 'Already has certificate' };
  }

  // Already owns target class
  if (ownsTargetClass) {
    return { eligible: false, reason: 'Already owns target class' };
  }

  return { eligible: true, reason: 'Eligible for swap' };
};
