// =============================================================================
// CERTIFICATES SECTION COMPONENT
// =============================================================================
// Path: /app/admin/support/components/CertificatesSection.tsx
// =============================================================================

'use client';

import React from 'react';
import type { Certificate } from '../types';
import { 
  formatDate, 
  getCourseDisplayName,
  getCertificateVerifyUrl,
  getCertificateDownloadUrl,
  copyToClipboard,
} from '../utils';
import { StatusBadge, ActionButton, ConfirmButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface CertificatesSectionProps {
  certificates: Certificate[];
  onRegenerateCertificate: (courseType: string) => void;
  onResendToAttorney: (certificateId: string) => void;
  isExecutingAction: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CertificatesSection - Displays certificates with management options.
 */
export default function CertificatesSection({
  certificates,
  onRegenerateCertificate,
  onResendToAttorney,
  isExecutingAction,
}: CertificatesSectionProps) {
  if (certificates.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">🏆 Certificates</h3>
        <p className="text-white/60">No certificates issued yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10">
        <h3 className="text-lg font-bold text-white">🏆 Certificates</h3>
      </div>

      <div className="divide-y divide-white/10">
        {certificates.map((cert) => (
          <CertificateCard
            key={cert.id}
            certificate={cert}
            onRegenerate={() => onRegenerateCertificate(cert.course_type)}
            onResendToAttorney={() => onResendToAttorney(cert.id)}
            isExecutingAction={isExecutingAction}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CERTIFICATE CARD
// ============================================================================

interface CertificateCardProps {
  certificate: Certificate;
  onRegenerate: () => void;
  onResendToAttorney: () => void;
  isExecutingAction: boolean;
}

function CertificateCard({
  certificate,
  onRegenerate,
  onResendToAttorney,
  isExecutingAction,
}: CertificateCardProps) {
  const handleCopyCertNumber = async () => {
    await copyToClipboard(certificate.certificate_number);
  };

  const handleCopyVerifyCode = async () => {
    await copyToClipboard(certificate.verification_code);
  };

  const handleCopyVerifyUrl = async () => {
    await copyToClipboard(getCertificateVerifyUrl(certificate.verification_code));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#77DD77]/20 flex items-center justify-center">
            <span className="text-2xl">📜</span>
          </div>
          <div>
            <h4 className="font-medium text-white">
              {getCourseDisplayName(certificate.course_type)}
            </h4>
            <p className="text-sm text-white/60">
              Issued {formatDate(certificate.issued_at)}
            </p>
          </div>
        </div>
        <StatusBadge status="success">✅ Verified</StatusBadge>
      </div>

      {/* Certificate Details */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/5 rounded-lg p-3">
          <span className="text-xs text-white/40 block mb-1">Certificate #</span>
          <button
            onClick={handleCopyCertNumber}
            className="text-[#7EC8E3] font-mono font-medium hover:underline"
            title="Click to copy"
          >
            {certificate.certificate_number}
          </button>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <span className="text-xs text-white/40 block mb-1">Verification Code</span>
          <button
            onClick={handleCopyVerifyCode}
            className="text-white/80 font-mono hover:text-[#7EC8E3]"
            title="Click to copy"
          >
            {certificate.verification_code}
          </button>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <span className="text-xs text-white/40 block mb-1">Participant Name</span>
          <span className="text-white/80">{certificate.participant_name || '—'}</span>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <span className="text-xs text-white/40 block mb-1">Court Info</span>
          <span className="text-white/80">
            {certificate.court_county && certificate.court_state
              ? `${certificate.court_county}, ${certificate.court_state}`
              : certificate.court_state || '—'}
          </span>
        </div>
      </div>

      {/* Case Number (if present) */}
      {certificate.case_number && (
        <div className="bg-white/5 rounded-lg p-3 mb-4">
          <span className="text-xs text-white/40 block mb-1">Case Number</span>
          <span className="text-white/80 font-mono">{certificate.case_number}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
        <a
          href={getCertificateDownloadUrl(certificate.id)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 text-sm bg-[#77DD77]/20 hover:bg-[#77DD77]/30 text-[#77DD77] border border-[#77DD77]/30 rounded-lg transition-colors"
        >
          📥 Download PDF
        </a>
        
        <button
          onClick={handleCopyVerifyUrl}
          className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg transition-colors"
        >
          🔗 Copy Verify URL
        </button>

        <ActionButton
          onClick={onResendToAttorney}
          disabled={isExecutingAction}
        >
          📧 Resend to Attorney
        </ActionButton>

        <ConfirmButton
          onClick={onRegenerate}
          disabled={isExecutingAction}
          confirmText="⚠️ Regenerate with current profile?"
        >
          🔄 Regenerate Certificate
        </ConfirmButton>
      </div>

      {/* Regenerate Hint */}
      <p className="text-xs text-white/40 mt-3">
        💡 Regenerate pulls fresh data from profile (name, court info). Use after fixing profile errors.
      </p>
    </div>
  );
}
