// =============================================================================
// ADMIN SUPPORT PAGE - ORCHESTRATOR
// =============================================================================
// Path: /app/admin/support/page.tsx
// =============================================================================

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';
import { useAdminSupport } from './hooks';
import {
  SystemHealth,
  DashboardStats,
  RecentSignups,
  CustomerSearch,
  CustomerOverview,
  PurchasesSection,
  ProgressSection,
  ExamSection,
  CertificatesSection,
  ActivityTimeline,
  DangerZone,
  ActionLog,
  CustomerServicePanel,
  AttorneyPanel,
} from './components';
import { StuckStudentsModal, ProfileEditModal } from './components/modals';
import type { ProfileEditData, TemplateName, SearchType } from './types';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function AdminSupportPage() {
  // ---------------------------------------------------------------------------
  // AUTH STATE
  // ---------------------------------------------------------------------------
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ---------------------------------------------------------------------------
  // UI STATE
  // ---------------------------------------------------------------------------
  // Customer Service is the DEFAULT tab
  const [activeTab, setActiveTab] = useState<'customer-service' | 'dashboard' | 'attorneys'>('customer-service');
  const [showStuckModal, setShowStuckModal] = useState(false);
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);

  // ---------------------------------------------------------------------------
  // HOOK
  // ---------------------------------------------------------------------------
  const {
    // Dashboard
    stats,
    systemHealth,
    isLoadingStats,
    isLoadingHealth,
    isLoadingStuckStudents,
    loadDashboardStats,
    loadSystemHealth,
    loadStuckStudents,
    stuckStudents,

    // Customer
    customer,
    isLoadingCustomer,
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchCustomer,
    clearCustomer,

    // Actions
    isExecutingAction,
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

    // Translation
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
    isTranslating,
    translateIncoming,
    translateOutgoing,
    getTemplate,

    // Email
    sendSupportEmail,

    // UI
    message,
    showMessage,
    actionLog,
    clearActionLog,
  } = useAdminSupport();

  // ---------------------------------------------------------------------------
  // AUTH CHECK
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user && isAdmin(user.email)) {
        setIsAuthorized(true);
        // Load initial data
        loadDashboardStats();
        loadSystemHealth();
      }
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, [loadDashboardStats, loadSystemHealth]);

  // ---------------------------------------------------------------------------
  // HANDLERS
  // ---------------------------------------------------------------------------
  
  const handleSearch = () => {
    searchCustomer(searchQuery, searchType);
  };

  const handleSmartSearch = (query: string) => {
    // Auto-detect search type based on query format
    let detectedType: SearchType = 'email';
    
    if (query.includes('@')) {
      detectedType = 'email';
    } else if (query.startsWith('cs_') || query.startsWith('pi_')) {
      detectedType = 'stripe';
    } else if (query.startsWith('PKF-') || query.length === 8) {
      detectedType = 'certificate';
    } else if (/^\d+$/.test(query.replace(/[-\s]/g, ''))) {
      detectedType = 'phone';
    } else {
      detectedType = 'name';
    }
    
    setSearchType(detectedType);
    setSearchQuery(query);
    searchCustomer(query, detectedType);
  };

  const handleStuckStudentsClick = async () => {
    await loadStuckStudents();
    setShowStuckModal(true);
  };

  const handleViewStudent = (email: string) => {
    setSearchQuery(email);
    setSearchType('email');
    searchCustomer(email, 'email');
    setShowStuckModal(false);
  };

  const handleEmailStudent = (email: string) => {
    setDetectedEmail(email);
    setActiveTab('customer-service');
    setShowStuckModal(false);
  };

  const handleProfileEdit = async (data: Partial<ProfileEditData>) => {
    if (!customer?.profile?.id) return;
    await updateProfile(customer.profile.id, data);
    setShowProfileEditModal(false);
  };

  const handleResetPassword = async () => {
    if (!customer?.profile?.id || !customer?.profile?.email) return;
    await resetPassword(customer.profile.id, customer.profile.email);
  };

  const handleResendWelcome = async (courseType: string) => {
    if (!customer?.profile?.id || !customer?.profile?.email) return;
    await resendWelcomeEmail(customer.profile.id, customer.profile.email, courseType);
  };

  const handleSwapClass = async (purchaseId: string, targetCourse: string) => {
    if (!customer?.profile?.id) return;
    await swapClass(customer.profile.id, purchaseId, targetCourse);
  };

  const handleResetProgress = async (courseType: string) => {
    if (!customer?.profile?.id) return;
    await resetCourseProgress(customer.profile.id, courseType);
  };

  const handleResetAllProgress = async () => {
    if (!customer?.profile?.id) return;
    await resetAllProgress(customer.profile.id);
  };

  const handleDeleteExamAttempts = async (courseType: string) => {
    if (!customer?.profile?.id) return;
    await deleteExamAttempts(customer.profile.id, courseType);
  };

  const handleRegenerateCertificate = async (certificateId: string) => {
    if (!customer?.profile?.id) return;
    await regenerateCertificate(certificateId, customer.profile.id);
  };

  const handleResendToAttorney = async (certificateId: string) => {
    if (!customer?.profile?.id) return;
    await resendAttorneyEmail(customer.profile.id, certificateId);
  };

  const handleDeleteAllData = async () => {
    if (!customer?.profile?.id) return;
    await deleteAllCourseData(customer.profile.id);
  };

  const handleDeleteUser = async () => {
    if (!customer?.profile?.id) return;
    await deleteUser(customer.profile.id);
    clearCustomer();
  };

  const handleTranslateIncoming = async (text: string) => {
    await translateIncoming(text);
  };

  const handleSelectTemplate = async (templateName: TemplateName) => {
    await getTemplate(templateName);
  };

  const handleTranslateOutgoing = async (text: string) => {
    await translateOutgoing(text);
  };

  const handleSendEmail = async (to: string, subject: string, body: string) => {
    await sendSupportEmail(to, subject, body);
  };

  const handleLookupCustomer = (email: string) => {
    setSearchQuery(email);
    setSearchType('email');
    searchCustomer(email, 'email');
    setActiveTab('dashboard');
  };

  // ---------------------------------------------------------------------------
  // RENDER - AUTH CHECK
  // ---------------------------------------------------------------------------
  
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#77DD77]" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#1C1C1C] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-white/60">You are not authorized to access this page.</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // RENDER - MAIN
  // ---------------------------------------------------------------------------
  
  return (
    <div className="min-h-screen bg-[#1C1C1C] text-white p-6">
      {/* Message Toast */}
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
          message.type === 'success' ? 'bg-[#77DD77] text-[#1C1C1C]' :
          message.type === 'error' ? 'bg-[#FF9999] text-[#1C1C1C]' :
          'bg-[#FFE566] text-[#1C1C1C]'
        }`}>
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <h1 className="text-3xl font-bold mb-2">Admin Support Panel</h1>
        <p className="text-white/60">Customer lookup, translation, and quick actions</p>
      </div>

      {/* ================================================================== */}
      {/* CUSTOMER SEARCH - ALWAYS AT TOP (hidden on Attorneys tab) */}
      {/* ================================================================== */}
      {activeTab !== 'attorneys' && (
        <div className="max-w-7xl mx-auto mb-6">
          <CustomerSearch
            searchQuery={searchQuery}
            searchType={searchType}
            isLoading={isLoadingCustomer}
            onQueryChange={setSearchQuery}
            onTypeChange={setSearchType}
            onSearch={handleSearch}
            onSmartSearch={handleSmartSearch}
          />
        </div>
      )}

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('customer-service')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'customer-service'
                ? 'bg-[#77DD77] text-[#1C1C1C]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            💬 Customer Service
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#77DD77] text-[#1C1C1C]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            📊 Dashboard & Lookup
          </button>
          <button
            onClick={() => setActiveTab('attorneys')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'attorneys'
                ? 'bg-[#77DD77] text-[#1C1C1C]'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            ⚖️ Attorneys
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'customer-service' ? (
          /* Customer Service Tab - DEFAULT */
          <CustomerServicePanel
            incomingEmail={incomingEmail}
            translatedIncoming={translatedIncoming}
            outgoingResponse={outgoingResponse}
            translatedOutgoing={translatedOutgoing}
            detectedEmail={detectedEmail}
            detectedTopic={detectedTopic}
            isTranslating={isTranslating}
            onIncomingChange={setIncomingEmail}
            onOutgoingChange={setOutgoingResponse}
            onTranslateIncoming={handleTranslateIncoming}
            onTranslateOutgoing={handleTranslateOutgoing}
            onSelectTemplate={handleSelectTemplate}
            onSendEmail={handleSendEmail}
            onLookupCustomer={handleLookupCustomer}
          />
        ) : activeTab === 'attorneys' ? (
          /* Attorneys Tab */
          <AttorneyPanel />
        ) : (
          /* Dashboard Tab */
          <div className="space-y-6">
            {/* System Health */}
            <SystemHealth
              health={systemHealth}
              isLoading={isLoadingHealth}
              onRefresh={loadSystemHealth}
            />

            {/* Recent Signups — FIRST thing you see */}
            <RecentSignups
              signups={stats.recentSignups}
              isLoading={isLoadingStats}
              onLookupCustomer={handleLookupCustomer}
            />

            {/* Dashboard Stats */}
            <DashboardStats
              stats={stats}
              isLoading={isLoadingStats}
              onStuckStudentsClick={handleStuckStudentsClick}
            />

            {/* Customer Details (when searched) */}
            {customer && (
              <div className="space-y-6">
                <CustomerOverview
                  customer={customer}
                  onEditProfile={() => setShowProfileEditModal(true)}
                  onResetPassword={handleResetPassword}
                  onClear={clearCustomer}
                  isExecutingAction={isExecutingAction}
                />

                <PurchasesSection
                  purchases={customer.purchases}
                  courseProgress={customer.courseProgress}
                  examAttempts={customer.examAttempts}
                  certificates={customer.certificates}
                  onSwapClass={handleSwapClass}
                  onResendWelcome={handleResendWelcome}
                  isExecutingAction={isExecutingAction}
                />

                <ProgressSection
                  purchases={customer.purchases}
                  courseProgress={customer.courseProgress}
                  examAttempts={customer.examAttempts}
                  certificates={customer.certificates}
                  onResetProgress={handleResetProgress}
                  isExecutingAction={isExecutingAction}
                />

                <ExamSection
                  examAttempts={customer.examAttempts}
                  onDeleteAttempts={handleDeleteExamAttempts}
                  isExecutingAction={isExecutingAction}
                />

                <CertificatesSection
                  certificates={customer.certificates}
                  userId={customer.profile?.id || ''}
                  onRegenerateCertificate={handleRegenerateCertificate}
                  onResendToAttorney={handleResendToAttorney}
                  isExecutingAction={isExecutingAction}
                />

                <ActivityTimeline customer={customer} />

                <DangerZone
                  userId={customer.profile?.id || ''}
                  onDeleteUser={handleDeleteUser}
                  onResetAllProgress={handleResetAllProgress}
                  onDeleteAllData={handleDeleteAllData}
                  isExecutingAction={isExecutingAction}
                />
              </div>
            )}

            {/* Action Log */}
            <ActionLog
              actions={actionLog}
              onClear={clearActionLog}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <StuckStudentsModal
        isOpen={showStuckModal}
        onClose={() => setShowStuckModal(false)}
        students={stuckStudents}
        isLoading={isLoadingStuckStudents}
        onViewStudent={handleViewStudent}
        onEmailStudent={handleEmailStudent}
      />

      <ProfileEditModal
        isOpen={showProfileEditModal}
        onClose={() => setShowProfileEditModal(false)}
        profile={customer?.profile || null}
        onSave={handleProfileEdit}
        isLoading={isExecutingAction}
      />
    </div>
  );
}
