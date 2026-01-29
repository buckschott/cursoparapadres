// =============================================================================
// ADMIN SUPPORT HOOK
// =============================================================================
// Path: /app/admin/support/hooks/useAdminSupport.ts
// =============================================================================

'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import type {
  CustomerData,
  DashboardStats,
  SystemHealth,
  ActionLog,
  Message,
  SearchType,
  ProfileEditData,
  TranslationResult,
  TemplateResult,
  TemplateName,
  ActionResult,
  StuckStudent,
} from '../types';
import { detectSearchType } from '../utils';

// ============================================================================
// DEFAULT VALUES
// ============================================================================

const defaultStats: DashboardStats = {
  totalCustomers: 0,
  totalGraduates: 0,
  completionRate: 0,
  attorneyRate: 0,
  avgDaysToComplete: 0,
  courseBreakdown: { coparenting: 0, parenting: 0, bundle: 0 },
  topStates: [],
  recentActivity: { purchases: 0, graduates: 0 },
  examStats: { passRate: 0, firstAttemptPassRate: 0, totalAttempts: 0 },
  stuckStudents: 0,
};

const defaultHealth: SystemHealth = {
  supabase: 'healthy',
  stripe: 'healthy',
  resend: 'healthy',
  lastCheck: new Date().toISOString(),
};

// ============================================================================
// HOOK
// ============================================================================

export function useAdminSupport() {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  
  // Dashboard data
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(defaultHealth);
  
  // Customer data
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [stuckStudents, setStuckStudents] = useState<StuckStudent[]>([]);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('email');
  const [message, setMessage] = useState<Message | null>(null);
  const [actionLog, setActionLog] = useState<ActionLog[]>([]);
  
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingCustomer, setIsLoadingCustomer] = useState(false);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingStuckStudents, setIsLoadingStuckStudents] = useState(false);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  
  // Translation state (for customer service panel)
  const [incomingEmail, setIncomingEmail] = useState('');
  const [translatedIncoming, setTranslatedIncoming] = useState('');
  const [outgoingResponse, setOutgoingResponse] = useState('');
  const [translatedOutgoing, setTranslatedOutgoing] = useState('');
  const [detectedEmail, setDetectedEmail] = useState('');
  const [detectedTopic, setDetectedTopic] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // -------------------------------------------------------------------------
  // AUTH HELPER
  // -------------------------------------------------------------------------

  /**
   * Get the current user's access token for API authorization.
   * Returns null if not authenticated.
   */
  const getAuthToken = useCallback(async (): Promise<string | null> => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }, []);

  /**
   * Build headers object with Authorization if token is available.
   */
  const buildHeaders = useCallback(async (includeContentType = true): Promise<HeadersInit> => {
    const token = await getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (includeContentType) {
      headers['Content-Type'] = 'application/json';
    }
    
    return headers;
  }, [getAuthToken]);

  // -------------------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------------------

  const showMessage = useCallback((type: Message['type'], text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }, []);

  const addToActionLog = useCallback((action: string, targetUser: string, details: string) => {
    const newEntry: ActionLog = {
      id: Date.now().toString(),
      action,
      target_user: targetUser,
      details,
      timestamp: new Date().toISOString(),
    };
    setActionLog(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 actions
  }, []);

  const clearActionLog = useCallback(() => {
    setActionLog([]);
  }, []);

  // -------------------------------------------------------------------------
  // DASHBOARD API
  // -------------------------------------------------------------------------

  const loadDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const headers = await buildHeaders(false);
      const response = await fetch('/api/admin/support/dashboard-stats', {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
      showMessage('error', 'Failed to load dashboard statistics');
    } finally {
      setIsLoadingStats(false);
    }
  }, [buildHeaders, showMessage]);

  const loadSystemHealth = useCallback(async () => {
    setIsLoadingHealth(true);
    try {
      const headers = await buildHeaders(false);
      const response = await fetch('/api/admin/support/system-health', {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Failed to load health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error('Error loading health:', error);
      showMessage('error', 'Failed to load system health');
    } finally {
      setIsLoadingHealth(false);
    }
  }, [buildHeaders, showMessage]);

  // -------------------------------------------------------------------------
  // CUSTOMER SEARCH API
  // -------------------------------------------------------------------------

  const searchCustomer = useCallback(async (query?: string, type?: SearchType) => {
    const searchValue = query ?? searchQuery;
    const searchTypeValue = type ?? searchType;
    
    if (!searchValue.trim()) {
      showMessage('warning', 'Please enter a search query');
      return;
    }

    setIsLoadingCustomer(true);
    setCustomer(null);

    try {
      const headers = await buildHeaders(true);
      
      // POST with JSON body (matching the API expectation)
      const response = await fetch('/api/admin/support/customer-lookup', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: searchValue.trim(),
          type: searchTypeValue,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Search failed');
      }
      
      const data = await response.json();
      
      if (data.error) {
        showMessage('error', data.error);
        return;
      }
      
      if (!data.profile && !data.authUser) {
        showMessage('warning', 'No customer found');
        return;
      }
      
      setCustomer(data);
      showMessage('success', 'Customer found');
      addToActionLog('Search', data.profile?.email || searchValue, `Found via ${searchTypeValue}`);
    } catch (error) {
      console.error('Search error:', error);
      showMessage('error', error instanceof Error ? error.message : 'Search failed. Please try again.');
    } finally {
      setIsLoadingCustomer(false);
    }
  }, [searchQuery, searchType, buildHeaders, showMessage, addToActionLog]);

  const smartSearch = useCallback(async (query: string) => {
    const detectedType = detectSearchType(query);
    setSearchType(detectedType);
    setSearchQuery(query);
    await searchCustomer(query, detectedType);
  }, [searchCustomer]);

  const clearCustomer = useCallback(() => {
    setCustomer(null);
    setSearchQuery('');
  }, []);

  // -------------------------------------------------------------------------
  // STUCK STUDENTS API
  // -------------------------------------------------------------------------

  const loadStuckStudents = useCallback(async () => {
    setIsLoadingStuckStudents(true);
    try {
      const headers = await buildHeaders(false);
      const response = await fetch('/api/admin/support/stuck-students', {
        method: 'GET',
        headers,
      });
      if (!response.ok) throw new Error('Failed to load stuck students');
      const data = await response.json();
      setStuckStudents(data.students || []);
      return data.students || [];
    } catch (error) {
      console.error('Error loading stuck students:', error);
      showMessage('error', 'Failed to load stuck students');
      return [];
    } finally {
      setIsLoadingStuckStudents(false);
    }
  }, [buildHeaders, showMessage]);

  // -------------------------------------------------------------------------
  // QUICK ACTIONS API
  // -------------------------------------------------------------------------

  const executeAction = useCallback(async (
    action: string,
    params: Record<string, unknown>
  ): Promise<ActionResult> => {
    setIsExecutingAction(true);
    
    try {
      const headers = await buildHeaders(true);
      const response = await fetch('/api/admin/support/quick-actions', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...params }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.error || result.message || 'Action failed';
        showMessage('error', errorMsg);
        return { success: false, message: errorMsg };
      }

      showMessage('success', result.message || 'Action completed');
      addToActionLog(
        action,
        (params.userId as string) || (params.email as string) || 'Unknown',
        result.message || 'Success'
      );

      // Refresh customer data after action
      if (customer?.profile?.email) {
        await searchCustomer(customer.profile.email, 'email');
      }

      return { success: true, message: result.message, data: result };
    } catch (error) {
      console.error('Action error:', error);
      const errorMsg = 'Action failed. Please try again.';
      showMessage('error', errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsExecutingAction(false);
    }
  }, [customer, buildHeaders, searchCustomer, showMessage, addToActionLog]);

  // Convenience methods for common actions
  const resetPassword = useCallback((userId: string, email: string) => {
    return executeAction('reset_password', { userId, email });
  }, [executeAction]);

  const resendWelcomeEmail = useCallback((userId: string, email: string, courseType: string) => {
    return executeAction('resend_welcome_email', { userId, email, courseType });
  }, [executeAction]);

  const resendAttorneyEmail = useCallback((userId: string, certificateId: string) => {
    return executeAction('resend_attorney_email', { userId, certificateId });
  }, [executeAction]);

  const updateProfile = useCallback((userId: string, updates: Partial<ProfileEditData>) => {
    return executeAction('update_profile', { userId, ...updates });
  }, [executeAction]);

  const grantCourseAccess = useCallback((userId: string, courseType: string) => {
    return executeAction('grant_course_access', { userId, courseType });
  }, [executeAction]);

  const resetCourseProgress = useCallback((userId: string, courseType: string) => {
    return executeAction('reset_progress', { userId, courseType });
  }, [executeAction]);

  // Reset progress for ALL courses (both coparenting and parenting)
  const resetAllProgress = useCallback(async (userId: string) => {
    setIsExecutingAction(true);
    try {
      // Reset both courses
      await executeAction('reset_progress', { userId, courseType: 'coparenting' });
      await executeAction('reset_progress', { userId, courseType: 'parenting' });
      showMessage('success', 'All course progress reset');
      return { success: true, message: 'All course progress reset' };
    } catch (error) {
      console.error('Reset all progress error:', error);
      showMessage('error', 'Failed to reset all progress');
      return { success: false, message: 'Failed to reset all progress' };
    } finally {
      setIsExecutingAction(false);
    }
  }, [executeAction, showMessage]);

  const deleteExamAttempts = useCallback((userId: string, courseType: string) => {
    return executeAction('delete_exam_attempts', { userId, courseType });
  }, [executeAction]);

  const regenerateCertificate = useCallback((userId: string, courseType: string) => {
    return executeAction('generate_certificate', { userId, courseType });
  }, [executeAction]);

  const swapClass = useCallback((userId: string, purchaseId: string, targetCourse: string) => {
    return executeAction('swap_class', { userId, purchaseId, targetCourse });
  }, [executeAction]);

  const deleteUser = useCallback((userId: string) => {
    return executeAction('delete_user', { userId });
  }, [executeAction]);

  const deleteAllCourseData = useCallback((userId: string) => {
    return executeAction('reset_user', { userId });
  }, [executeAction]);

  // -------------------------------------------------------------------------
  // TRANSLATION API (Customer Service)
  // -------------------------------------------------------------------------

  const translateIncoming = useCallback(async (text: string): Promise<TranslationResult | null> => {
    if (!text.trim()) return null;
    
    setIsTranslating(true);
    try {
      const headers = await buildHeaders(true);
      const response = await fetch('/api/admin/support/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'translate_incoming', text }),
      });

      if (!response.ok) throw new Error('Translation failed');
      
      const result = await response.json();
      
      setTranslatedIncoming(result.translation || '');
      if (result.detectedEmail) setDetectedEmail(result.detectedEmail);
      if (result.detectedTopic) setDetectedTopic(result.detectedTopic);
      
      return {
        translation: result.translation || '',
        detectedEmail: result.detectedEmail || null,
        detectedTopic: result.detectedTopic || null,
        summary: result.summary || null,
      };
    } catch (error) {
      console.error('Translation error:', error);
      showMessage('error', 'Translation failed');
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [buildHeaders, showMessage]);

  const translateOutgoing = useCallback(async (text: string): Promise<string | null> => {
    if (!text.trim()) return null;
    
    setIsTranslating(true);
    try {
      const headers = await buildHeaders(true);
      const response = await fetch('/api/admin/support/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'translate_outgoing', text }),
      });

      if (!response.ok) throw new Error('Translation failed');
      
      const result = await response.json();
      setTranslatedOutgoing(result.translation || '');
      
      return result.translation;
    } catch (error) {
      console.error('Translation error:', error);
      showMessage('error', 'Translation failed');
      return null;
    } finally {
      setIsTranslating(false);
    }
  }, [buildHeaders, showMessage]);

  const getTemplate = useCallback(async (templateName: TemplateName): Promise<TemplateResult | null> => {
    try {
      const headers = await buildHeaders(true);
      const response = await fetch('/api/admin/support/translate', {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'get_template', template: templateName }),
      });

      if (!response.ok) throw new Error('Failed to get template');
      
      const result = await response.json();
      
      // Set the template in the outgoing field
      if (result.body) {
        setOutgoingResponse(result.body);
        setTranslatedOutgoing(result.body); // Template is already in Spanish
      }
      
      return {
        subject: result.subject || '',
        body: result.body || '',
      };
    } catch (error) {
      console.error('Template error:', error);
      showMessage('error', 'Failed to load template');
      return null;
    }
  }, [buildHeaders, showMessage]);

  // -------------------------------------------------------------------------
  // EMAIL API
  // -------------------------------------------------------------------------

  const sendSupportEmail = useCallback(async (
    to: string,
    subject: string,
    body: string
  ): Promise<boolean> => {
    try {
      const headers = await buildHeaders(true);
      const response = await fetch('/api/admin/support/send-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({ to, subject, body }),
      });

      if (!response.ok) throw new Error('Failed to send email');
      
      showMessage('success', `Email sent to ${to}`);
      addToActionLog('Send Email', to, subject);
      
      // Clear the email fields
      setIncomingEmail('');
      setTranslatedIncoming('');
      setOutgoingResponse('');
      setTranslatedOutgoing('');
      setDetectedEmail('');
      setDetectedTopic('');
      
      return true;
    } catch (error) {
      console.error('Email error:', error);
      showMessage('error', 'Failed to send email');
      return false;
    }
  }, [buildHeaders, showMessage, addToActionLog]);

  // -------------------------------------------------------------------------
  // RETURN
  // -------------------------------------------------------------------------

  return {
    // Dashboard state
    stats,
    systemHealth,
    isLoadingStats,
    isLoadingHealth,
    loadDashboardStats,
    loadSystemHealth,

    // Customer state
    customer,
    isLoadingCustomer,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchCustomer,
    smartSearch,
    clearCustomer,

    // Stuck students
    stuckStudents,
    isLoadingStuckStudents,
    loadStuckStudents,

    // Actions
    isExecutingAction,
    executeAction,
    resetPassword,
    resendWelcomeEmail,
    resendAttorneyEmail,
    updateProfile,
    grantCourseAccess,
    resetCourseProgress,
    resetAllProgress,
    deleteExamAttempts,
    regenerateCertificate,
    swapClass,
    deleteUser,
    deleteAllCourseData,

    // Translation (customer service)
    incomingEmail,
    setIncomingEmail,
    translatedIncoming,
    setTranslatedIncoming,
    outgoingResponse,
    setOutgoingResponse,
    translatedOutgoing,
    setTranslatedOutgoing,
    detectedEmail,
    setDetectedEmail,
    detectedTopic,
    setDetectedTopic,
    isTranslating,
    translateIncoming,
    translateOutgoing,
    getTemplate,

    // Email
    sendSupportEmail,

    // UI state
    message,
    showMessage,
    actionLog,
    addToActionLog,
    clearActionLog,
  };
}

export default useAdminSupport;
