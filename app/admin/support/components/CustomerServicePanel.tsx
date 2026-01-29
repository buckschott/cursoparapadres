// =============================================================================
// CUSTOMER SERVICE PANEL COMPONENT
// =============================================================================
// Path: /app/admin/support/components/CustomerServicePanel.tsx
// =============================================================================

'use client';

import React, { useState } from 'react';
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
}

// ============================================================================
// TEMPLATE OPTIONS
// ============================================================================

const TEMPLATES: { value: TemplateName; label: string; icon: string }[] = [
  { value: 'password', label: 'Password Reset', icon: '🔑' },
  { value: 'access', label: 'Course Access', icon: '📚' },
  { value: 'certificate', label: 'Certificate Help', icon: '📜' },
  { value: 'certificate_resend', label: 'Resend Certificate', icon: '📧' },
  { value: 'exam', label: 'Exam Help', icon: '📝' },
  { value: 'refund', label: 'Refund Confirmation', icon: '💰' },
  { value: 'payment_issue', label: 'Payment Issue', icon: '💳' },
  { value: 'attorney_copy', label: 'Attorney Copy Request', icon: '⚖️' },
  { value: 'tech_support', label: 'Technical Support', icon: '🔧' },
  { value: 'deadline', label: 'Deadline Question', icon: '⏰' },
  { value: 'duplicate_account', label: 'Duplicate Account', icon: '👥' },
  { value: 'class_swap', label: 'Class Swap', icon: '🔄' },
  { value: 'general', label: 'General Response', icon: '💬' },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CustomerServicePanel - Translation workflow for customer support emails.
 * 
 * Features:
 * - Translate incoming Spanish emails to English
 * - Auto-detect customer email and topic
 * - Pre-written Spanish templates
 * - Translate English responses to Spanish
 * - Three send options: Copy, Mac Mail, Resend
 */
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
}: CustomerServicePanelProps) {
  const [emailSubject, setEmailSubject] = useState('Respuesta de Clase para Padres');
  const [showTemplates, setShowTemplates] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // --------------------------------------------------------------------------
  // HANDLERS
  // --------------------------------------------------------------------------

  const handleTranslateIncoming = () => {
    if (incomingEmail.trim()) {
      onTranslateIncoming(incomingEmail);
    }
  };

  const handleTranslateOutgoing = () => {
    if (outgoingResponse.trim()) {
      onTranslateOutgoing(outgoingResponse);
    }
  };

  const handleSendViaResend = () => {
    if (detectedEmail && translatedOutgoing) {
      onSendEmail(detectedEmail, emailSubject, translatedOutgoing);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!translatedOutgoing) return;
    
    try {
      await navigator.clipboard.writeText(translatedOutgoing);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
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

  const handleOpenInMacMail = () => {
    if (!detectedEmail || !translatedOutgoing) return;
    
    // Build mailto URL with subject and body
    const subject = encodeURIComponent(emailSubject);
    const body = encodeURIComponent(translatedOutgoing);
    const mailtoUrl = `mailto:${detectedEmail}?subject=${subject}&body=${body}`;
    
    // Open in default mail client
    window.location.href = mailtoUrl;
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">📧 Customer Service</h3>
        <p className="text-sm text-white/40 mt-1">
          Translate customer emails and respond in Spanish
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* ================================================================ */}
        {/* INCOMING EMAIL SECTION */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Original (Spanish) */}
          <div>
            <label className="text-sm text-white/60 block mb-2">
              📩 Incoming Email (Spanish)
            </label>
            <textarea
              value={incomingEmail}
              onChange={(e) => onIncomingChange(e.target.value)}
              placeholder="Paste customer email here..."
              rows={6}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50 resize-none"
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
            <label className="text-sm text-white/60 block mb-2">
              🔤 Translation (English)
            </label>
            <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white/70 min-h-[156px]">
              {translatedIncoming || (
                <span className="text-white/30">Translation will appear here...</span>
              )}
            </div>
            
            {/* Detected Info */}
            {(detectedEmail || detectedTopic) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {detectedEmail && (
                  <button
                    onClick={() => onLookupCustomer(detectedEmail)}
                    className="px-2 py-1 bg-[#7EC8E3]/20 text-[#7EC8E3] rounded text-xs hover:bg-[#7EC8E3]/30 transition-colors"
                  >
                    📧 {detectedEmail} → Look up
                  </button>
                )}
                {detectedTopic && (
                  <span className="px-2 py-1 bg-white/10 text-white/60 rounded text-xs">
                    🏷️ {detectedTopic}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10" />

        {/* ================================================================ */}
        {/* RESPONSE SECTION */}
        {/* ================================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Response (English) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-white/60">
                ✍️ Your Response (English)
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-xs text-[#7EC8E3] hover:underline"
                >
                  📋 Templates
                </button>
                {showTemplates && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowTemplates(false)} 
                    />
                    <div className="absolute right-0 top-full mt-1 bg-[#2C2C2C] border border-white/20 rounded-lg shadow-xl z-20 w-56 max-h-80 overflow-y-auto">
                      {TEMPLATES.map((template) => (
                        <button
                          key={template.value}
                          onClick={() => {
                            onSelectTemplate(template.value);
                            setShowTemplates(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/10 transition-colors"
                        >
                          <span>{template.icon}</span>
                          <span>{template.label}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <textarea
              value={outgoingResponse}
              onChange={(e) => onOutgoingChange(e.target.value)}
              placeholder="Type your response in English or select a template..."
              rows={6}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50 resize-none"
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

          {/* Translated Response (Spanish) */}
          <div>
            <label className="text-sm text-white/60 block mb-2">
              📤 Final Response (Spanish)
            </label>
            <div className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white/70 min-h-[156px] whitespace-pre-wrap">
              {translatedOutgoing || (
                <span className="text-white/30">Spanish translation will appear here...</span>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* SEND SECTION */}
        {/* ================================================================ */}
        {translatedOutgoing && (
          <div className="bg-[#77DD77]/10 border border-[#77DD77]/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-[#77DD77] mb-3">Ready to Send</h4>
            
            {/* Email Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">To:</label>
                {detectedEmail ? (
                  <span className="text-sm text-white">{detectedEmail}</span>
                ) : (
                  <span className="text-sm text-white/40 italic">No email detected</span>
                )}
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs text-white/40 block mb-1">Subject:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full p-2 rounded bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#77DD77]/50"
                />
              </div>
            </div>

            {/* Send Buttons */}
            <div className="flex flex-wrap gap-3">
              {/* Copy to Clipboard */}
              <button
                onClick={handleCopyToClipboard}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  copySuccess
                    ? 'bg-[#77DD77] text-[#1C1C1C]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {copySuccess ? '✅ Copied!' : '📋 Copy to Clipboard'}
              </button>

              {/* Open in Mac Mail */}
              <button
                onClick={handleOpenInMacMail}
                disabled={!detectedEmail}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  detectedEmail
                    ? 'bg-[#7EC8E3]/20 text-[#7EC8E3] hover:bg-[#7EC8E3]/30'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                📧 Open in Mac Mail
              </button>

              {/* Send via Resend */}
              <button
                onClick={handleSendViaResend}
                disabled={!detectedEmail}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  detectedEmail
                    ? 'bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88]'
                    : 'bg-white/5 text-white/30 cursor-not-allowed'
                }`}
              >
                📤 Send via Resend
              </button>
            </div>

            {/* No email warning */}
            {!detectedEmail && (
              <p className="mt-3 text-xs text-white/40">
                💡 Tip: Paste an email in the incoming field to auto-detect the recipient, 
                or use Copy to Clipboard.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
