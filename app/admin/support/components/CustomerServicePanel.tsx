// =============================================================================
// CUSTOMER SERVICE PANEL COMPONENT — V2 (Perfect Rating)
// =============================================================================
// Path: /app/admin/support/components/CustomerServicePanel.tsx
// =============================================================================
// Changes from V1:
// - Big push-button templates replace tiny dropdown
// - Auto-suggests matching template when topic is detected
// - "Open in Gmail" replaces "Open in Mac Mail"
// - One-click send: select template → send instantly
// - Combined action+reply buttons (reset password + send email, etc.)
// =============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import type { TemplateName } from '../types';
import { ActionButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface CustomerServicePanelProps {
  // Translation state
  incomingEmail: string;
  translatedIncoming: string;
  outgoingResponse: string;
  translatedOutgoing: string;
  detectedEmail: string;
  detectedTopic: string;
  isTranslating: boolean;
  
  // Handlers
  onIncomingChange: (text: string) => void;
  onOutgoingChange: (text: string) => void;
  onTranslateIncoming: (text: string) => void;
  onTranslateOutgoing: (text: string) => void;
  onSelectTemplate: (template: TemplateName) => void;
  onSendEmail: (to: string, subject: string, body: string) => void;
  onLookupCustomer: (email: string) => void;

  // Combined action handlers (optional — available when customer is loaded)
  onResetPassword?: (email: string) => Promise<{ success: boolean; message: string }>;
  onGrantAccess?: () => Promise<{ success: boolean; message: string }>;
  onResendCertificateEmail?: () => Promise<{ success: boolean; message: string }>;
  onSwapClass?: () => Promise<{ success: boolean; message: string }>;

  // Customer context (to enable combined actions)
  customerLoaded?: boolean;
  customerEmail?: string;
  customerName?: string;
}

// ============================================================================
// TEMPLATE CONFIG
// ============================================================================

interface TemplateConfig {
  value: TemplateName;
  label: string;
  icon: string;
  description: string;
  combinedAction?: 'reset_password' | 'grant_access' | 'resend_certificate' | 'swap_class';
  combinedActionLabel?: string;
}

const TEMPLATES: TemplateConfig[] = [
  { 
    value: 'password', 
    label: 'Password Reset', 
    icon: '🔑',
    description: 'Send reset link + instructions',
    combinedAction: 'reset_password',
    combinedActionLabel: '🔑 Reset Password & Send Email',
  },
  { 
    value: 'access', 
    label: 'Course Access', 
    icon: '📚',
    description: 'Login instructions + access fix',
    combinedAction: 'grant_access',
    combinedActionLabel: '🔓 Grant Access & Send Email',
  },
  { 
    value: 'certificate', 
    label: 'Certificate Help', 
    icon: '📜',
    description: 'Download steps + attorney option',
  },
  { 
    value: 'certificate_resend', 
    label: 'Resend Certificate', 
    icon: '📧',
    description: 'Re-send certificate email',
    combinedAction: 'resend_certificate',
    combinedActionLabel: '📧 Resend Certificate & Send Email',
  },
  { 
    value: 'exam', 
    label: 'Exam Help', 
    icon: '📝',
    description: 'Exam tips, retake info, passing score',
  },
  { 
    value: 'refund', 
    label: 'Refund Confirmation', 
    icon: '💰',
    description: 'Confirm refund + timeline',
  },
  { 
    value: 'payment_issue', 
    label: 'Payment Issue', 
    icon: '💳',
    description: 'Fix payment + restore access',
  },
  { 
    value: 'attorney_copy', 
    label: 'Attorney Copy', 
    icon: '⚖️',
    description: 'Request attorney info for cert',
  },
  { 
    value: 'tech_support', 
    label: 'Tech Support', 
    icon: '🔧',
    description: 'Browser/device troubleshooting',
  },
  { 
    value: 'deadline', 
    label: 'Deadline Question', 
    icon: '⏰',
    description: 'Completion time + instant cert',
  },
  { 
    value: 'duplicate_account', 
    label: 'Duplicate Account', 
    icon: '👥',
    description: 'Merge accounts confirmation',
  },
  { 
    value: 'class_swap', 
    label: 'Class Swap', 
    icon: '🔄',
    description: 'Switch class type',
    combinedAction: 'swap_class',
    combinedActionLabel: '🔄 Swap Class & Send Email',
  },
  { 
    value: 'general', 
    label: 'General Response', 
    icon: '💬',
    description: 'Custom response template',
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function CustomerServicePanel({
  incomingEmail,
  translatedIncoming,
  outgoingResponse,
  translatedOutgoing,
  detectedEmail,
  detectedTopic,
  isTranslating,
  onIncomingChange,
  onOutgoingChange,
  onTranslateIncoming,
  onTranslateOutgoing,
  onSelectTemplate,
  onSendEmail,
  onLookupCustomer,
  onResetPassword,
  onGrantAccess,
  onResendCertificateEmail,
  onSwapClass,
  customerLoaded,
  customerEmail,
  customerName,
}: CustomerServicePanelProps) {
  const [emailSubject, setEmailSubject] = useState('Respuesta de Clase para Padres');
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateName | null>(null);
  const [sendingTemplate, setSendingTemplate] = useState(false);
  const [executingAction, setExecutingAction] = useState(false);
  const [mode, setMode] = useState<'template' | 'custom'>('template');

  // --------------------------------------------------------------------------
  // AUTO-SELECT TEMPLATE WHEN TOPIC IS DETECTED
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (detectedTopic && !selectedTemplate) {
      const match = TEMPLATES.find(t => t.value === detectedTopic);
      if (match) {
        setSelectedTemplate(match.value);
      }
    }
  }, [detectedTopic, selectedTemplate]);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleTranslateIncoming = () => {
    if (incomingEmail.trim()) {
      setSelectedTemplate(null); // Reset so auto-suggest picks up new topic
      onTranslateIncoming(incomingEmail);
    }
  };

  const handleTemplateClick = async (template: TemplateName) => {
    setSelectedTemplate(template);
    setMode('template');
    onSelectTemplate(template);
  };

  const handleOneClickSend = async () => {
    if (!detectedEmail || !translatedOutgoing) return;
    setSendingTemplate(true);
    try {
      onSendEmail(detectedEmail, emailSubject, translatedOutgoing);
    } finally {
      setSendingTemplate(false);
      setSelectedTemplate(null);
    }
  };

  const handleCombinedAction = async (template: TemplateConfig) => {
    if (!template.combinedAction) return;
    setExecutingAction(true);

    try {
      let result: { success: boolean; message: string } | undefined;

      switch (template.combinedAction) {
        case 'reset_password':
          if (onResetPassword && (customerEmail || detectedEmail)) {
            result = await onResetPassword(customerEmail || detectedEmail);
          }
          break;
        case 'grant_access':
          if (onGrantAccess) result = await onGrantAccess();
          break;
        case 'resend_certificate':
          if (onResendCertificateEmail) result = await onResendCertificateEmail();
          break;
        case 'swap_class':
          if (onSwapClass) result = await onSwapClass();
          break;
      }

      // If action succeeded, also send the template email
      if (result?.success && detectedEmail && translatedOutgoing) {
        onSendEmail(detectedEmail, emailSubject, translatedOutgoing);
      }
    } finally {
      setExecutingAction(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!translatedOutgoing) return;
    try {
      await navigator.clipboard.writeText(translatedOutgoing);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = translatedOutgoing;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleOpenInGmail = () => {
    if (!translatedOutgoing) return;
    const to = detectedEmail || '';
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(translatedOutgoing);
    // Gmail compose URL
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const handleTranslateOutgoing = () => {
    if (outgoingResponse.trim()) {
      onTranslateOutgoing(outgoingResponse);
    }
  };

  // --------------------------------------------------------------------------
  // HELPERS
  // --------------------------------------------------------------------------

  const isTemplateMatch = (template: TemplateName): boolean => {
    return detectedTopic === template;
  };

  const canUseCombinedAction = (template: TemplateConfig): boolean => {
    if (!template.combinedAction) return false;
    if (!customerLoaded && !detectedEmail) return false;

    switch (template.combinedAction) {
      case 'reset_password':
        return !!(onResetPassword && (customerEmail || detectedEmail));
      case 'grant_access':
        return !!onGrantAccess;
      case 'resend_certificate':
        return !!onResendCertificateEmail;
      case 'swap_class':
        return !!onSwapClass;
      default:
        return false;
    }
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">📧 Customer Service</h3>
        <p className="text-sm text-white/40 mt-1">
          Translate → Choose Template → Send. One-click support.
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ================================================================ */}
        {/* STEP 1: PASTE & TRANSLATE INCOMING EMAIL                        */}
        {/* ================================================================ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7EC8E3]/20 text-[#7EC8E3] text-sm font-bold">1</span>
            <h4 className="text-white font-medium">Paste Customer Email</h4>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original (Spanish) */}
            <div>
              <label className="text-xs text-white/50 block mb-1.5">
                📩 Original (Spanish)
              </label>
              <textarea
                value={incomingEmail}
                onChange={(e) => onIncomingChange(e.target.value)}
                placeholder="Paste customer email here..."
                rows={5}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50 resize-none text-sm"
              />
              <div className="mt-2">
                <ActionButton
                  onClick={handleTranslateIncoming}
                  disabled={isTranslating || !incomingEmail.trim()}
                  loading={isTranslating}
                  variant="primary"
                >
                  🔄 Translate to English
                </ActionButton>
              </div>
            </div>

            {/* Translated (English) */}
            <div>
              <label className="text-xs text-white/50 block mb-1.5">
                📤 Translation (English)
              </label>
              <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white/80 min-h-[132px] text-sm">
                {translatedIncoming || (
                  <span className="text-white/25">Translation will appear here...</span>
                )}
              </div>
              
              {/* Detected Info Badges */}
              {(detectedEmail || detectedTopic) && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {detectedEmail && (
                    <button
                      onClick={() => onLookupCustomer(detectedEmail)}
                      className="px-2.5 py-1 bg-[#7EC8E3]/20 text-[#7EC8E3] rounded-md text-xs font-medium hover:bg-[#7EC8E3]/30 transition-colors"
                    >
                      📧 {detectedEmail} → Look up
                    </button>
                  )}
                  {detectedTopic && (
                    <span className="px-2.5 py-1 bg-[#77DD77]/20 text-[#77DD77] rounded-md text-xs font-medium">
                      🎯 Detected: {TEMPLATES.find(t => t.value === detectedTopic)?.label || detectedTopic}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* ================================================================ */}
        {/* STEP 2: CHOOSE RESPONSE                                         */}
        {/* ================================================================ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#7EC8E3]/20 text-[#7EC8E3] text-sm font-bold">2</span>
              <h4 className="text-white font-medium">Choose Response</h4>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setMode('template')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === 'template'
                    ? 'bg-[#7EC8E3]/20 text-[#7EC8E3]'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                📋 Templates
              </button>
              <button
                onClick={() => setMode('custom')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  mode === 'custom'
                    ? 'bg-[#7EC8E3]/20 text-[#7EC8E3]'
                    : 'text-white/40 hover:text-white/60'
                }`}
              >
                ✏️ Custom Reply
              </button>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TEMPLATE MODE — Big Push Buttons                               */}
          {/* ============================================================== */}
          {mode === 'template' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {TEMPLATES.map((template) => {
                const isMatch = isTemplateMatch(template.value);
                const isSelected = selectedTemplate === template.value;
                
                return (
                  <button
                    key={template.value}
                    onClick={() => handleTemplateClick(template.value)}
                    className={`
                      relative flex flex-col items-start p-3 rounded-lg border text-left transition-all duration-200
                      ${isSelected
                        ? 'bg-[#77DD77]/15 border-[#77DD77]/50 ring-1 ring-[#77DD77]/30'
                        : isMatch
                          ? 'bg-[#7EC8E3]/10 border-[#7EC8E3]/40 ring-1 ring-[#7EC8E3]/20'
                          : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }
                    `}
                  >
                    {/* Match indicator */}
                    {isMatch && !isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-[#7EC8E3] rounded-full text-[10px]">
                        ⭐
                      </span>
                    )}
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 bg-[#77DD77] rounded-full text-[10px]">
                        ✓
                      </span>
                    )}

                    <span className="text-lg mb-1">{template.icon}</span>
                    <span className={`text-xs font-medium leading-tight ${
                      isSelected ? 'text-[#77DD77]' : isMatch ? 'text-[#7EC8E3]' : 'text-white/80'
                    }`}>
                      {template.label}
                    </span>
                    <span className="text-[10px] text-white/30 mt-0.5 leading-tight">
                      {template.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ============================================================== */}
          {/* CUSTOM MODE — Type in English, translate to Spanish            */}
          {/* ============================================================== */}
          {mode === 'custom' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 block mb-1.5">
                  ✏️ Type in English
                </label>
                <textarea
                  value={outgoingResponse}
                  onChange={(e) => onOutgoingChange(e.target.value)}
                  placeholder="Type your response in English..."
                  rows={5}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50 resize-none text-sm"
                />
                <div className="mt-2">
                  <ActionButton
                    onClick={handleTranslateOutgoing}
                    disabled={isTranslating || !outgoingResponse.trim()}
                    loading={isTranslating}
                    variant="primary"
                  >
                    🔄 Translate to Spanish
                  </ActionButton>
                </div>
              </div>

              <div>
                <label className="text-xs text-white/50 block mb-1.5">
                  📤 Spanish Translation
                </label>
                <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white/80 min-h-[132px] whitespace-pre-wrap text-sm">
                  {translatedOutgoing || (
                    <span className="text-white/25">Spanish translation will appear here...</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================ */}
        {/* STEP 3: PREVIEW & SEND                                          */}
        {/* ================================================================ */}
        {(translatedOutgoing || (selectedTemplate && mode === 'template')) && (
          <>
            <div className="border-t border-white/10" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#77DD77]/20 text-[#77DD77] text-sm font-bold">3</span>
                <h4 className="text-white font-medium">Preview & Send</h4>
              </div>

              {/* Preview Card */}
              {translatedOutgoing && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4">
                  {/* To / Subject */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3 pb-3 border-b border-white/10">
                    <div>
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">To</label>
                      {detectedEmail ? (
                        <span className="text-sm text-white font-medium">{detectedEmail}</span>
                      ) : (
                        <span className="text-sm text-white/30 italic">No email detected — use Gmail or Copy</span>
                      )}
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-[10px] text-white/30 uppercase tracking-wider block mb-0.5">Subject</label>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full p-1.5 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#77DD77]/50"
                      />
                    </div>
                  </div>

                  {/* Preview Body */}
                  <div className="text-sm text-white/60 whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {translatedOutgoing}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SEND BUTTONS                                              */}
              {/* ======================================================== */}
              <div className="flex flex-wrap gap-2">
                {/* PRIMARY: Send via Resend (branded email) */}
                {detectedEmail && translatedOutgoing && (
                  <button
                    onClick={handleOneClickSend}
                    disabled={sendingTemplate}
                    className="px-5 py-2.5 rounded-lg font-medium text-sm bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingTemplate ? '⏳ Sending...' : '📤 Send via Resend'}
                  </button>
                )}

                {/* COMBINED ACTION + SEND (when customer is loaded) */}
                {selectedTemplate && (() => {
                  const template = TEMPLATES.find(t => t.value === selectedTemplate);
                  if (template && canUseCombinedAction(template) && translatedOutgoing) {
                    return (
                      <button
                        onClick={() => handleCombinedAction(template)}
                        disabled={executingAction}
                        className="px-5 py-2.5 rounded-lg font-medium text-sm bg-[#FFB347]/90 text-[#1C1C1C] hover:bg-[#FFB347] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {executingAction ? '⏳ Processing...' : template.combinedActionLabel}
                      </button>
                    );
                  }
                  return null;
                })()}

                {/* Open in Gmail */}
                {translatedOutgoing && (
                  <button
                    onClick={handleOpenInGmail}
                    className="px-5 py-2.5 rounded-lg font-medium text-sm bg-[#7EC8E3]/20 text-[#7EC8E3] hover:bg-[#7EC8E3]/30 transition-all"
                  >
                    📧 Open in Gmail
                  </button>
                )}

                {/* Copy to Clipboard */}
                {translatedOutgoing && (
                  <button
                    onClick={handleCopyToClipboard}
                    className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
                      copySuccess
                        ? 'bg-[#77DD77] text-[#1C1C1C]'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    {copySuccess ? '✅ Copied!' : '📋 Copy'}
                  </button>
                )}
              </div>

              {/* Helpful tips */}
              {!detectedEmail && translatedOutgoing && (
                <p className="mt-3 text-xs text-white/30">
                  💡 No recipient detected. Use &quot;Open in Gmail&quot; to compose manually, or &quot;Copy&quot; to paste into any email client.
                </p>
              )}

              {selectedTemplate && !translatedOutgoing && (
                <p className="mt-3 text-xs text-white/30 animate-pulse">
                  ⏳ Loading template...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
