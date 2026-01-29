// =============================================================================
// CUSTOMER OVERVIEW COMPONENT
// =============================================================================
// Path: /app/admin/support/components/CustomerOverview.tsx
// =============================================================================

'use client';

import React from 'react';
import type { CustomerData } from '../types';
import { formatDate, getStripeSearchUrl, copyToClipboard } from '../utils';
import { StatusBadge, ActionButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface CustomerOverviewProps {
  customer: CustomerData;
  onEditProfile: () => void;
  onResetPassword: () => void;
  onClear: () => void;
  isExecutingAction: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CustomerOverview - Displays customer profile info and account-level actions.
 */
export default function CustomerOverview({
  customer,
  onEditProfile,
  onResetPassword,
  onClear,
  isExecutingAction,
}: CustomerOverviewProps) {
  const { profile, authUser, orphan } = customer;

  const handleCopyEmail = async () => {
    const email = profile?.email || authUser?.email;
    if (email) {
      await copyToClipboard(email);
    }
  };

  const handleCopyUserId = async () => {
    const userId = profile?.id || authUser?.id;
    if (userId) {
      await copyToClipboard(userId);
    }
  };

  // Orphan user warning
  if (orphan) {
    return (
      <div className="bg-[#FFE566]/10 border border-[#FFE566]/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-[#FFE566] mb-2">Orphan User Detected</h3>
            <p className="text-white/70 mb-4">
              This user exists in Supabase Auth but has no profile record in the database.
              This usually means the webhook failed during account creation.
            </p>
            {authUser && (
              <div className="bg-black/20 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/40">Email:</span>
                    <span className="text-white ml-2">{authUser.email}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Auth ID:</span>
                    <span className="text-white/60 ml-2 font-mono text-xs">
                      {authUser.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div>
                    <span className="text-white/40">Created:</span>
                    <span className="text-white/60 ml-2">{formatDate(authUser.created_at)}</span>
                  </div>
                  <div>
                    <span className="text-white/40">Email Verified:</span>
                    <span className="ml-2">
                      {authUser.email_confirmed_at ? (
                        <StatusBadge status="success">Yes</StatusBadge>
                      ) : (
                        <StatusBadge status="warning">No</StatusBadge>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-white/60">
              Check Stripe for their payment, then use &quot;Recover from Stripe Session&quot; to fix.
            </p>
          </div>
          <button
            onClick={onClear}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#7EC8E3]/20 flex items-center justify-center">
            <span className="text-xl">👤</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {profile.full_name || profile.legal_name || 'No Name'}
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={handleCopyEmail}
                className="text-[#7EC8E3] hover:underline"
                title="Click to copy"
              >
                {profile.email}
              </button>
              <span className="text-white/20">•</span>
              <button
                onClick={handleCopyUserId}
                className="text-white/40 font-mono text-xs hover:text-white/60"
                title="Click to copy User ID"
              >
                {profile.id.slice(0, 8)}...
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={getStripeSearchUrl(profile.email)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white/70 transition-colors"
          >
            💳 View in Stripe
          </a>
          <button
            onClick={onClear}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Clear"
          >
            <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Info */}
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3">Account Information</h3>
            <div className="space-y-3">
              <InfoRow 
                label="Status" 
                value={
                  <div className="flex gap-2">
                    {authUser?.email_confirmed_at ? (
                      <StatusBadge status="success">✅ Email Verified</StatusBadge>
                    ) : (
                      <StatusBadge status="warning">⏳ Email Unverified</StatusBadge>
                    )}
                    {profile.profile_completed ? (
                      <StatusBadge status="success">✅ Profile Complete</StatusBadge>
                    ) : (
                      <StatusBadge status="warning">⏳ Profile Incomplete</StatusBadge>
                    )}
                  </div>
                }
              />
              <InfoRow label="Created" value={formatDate(profile.created_at)} />
              <InfoRow label="Last Sign In" value={formatDate(authUser?.last_sign_in_at)} />
              <InfoRow label="Phone" value={profile.phone || '—'} />
            </div>
          </div>

          {/* Court Info */}
          <div>
            <h3 className="text-sm font-medium text-white/60 mb-3">Court Information</h3>
            <div className="space-y-3">
              <InfoRow label="Legal Name" value={profile.legal_name || '—'} />
              <InfoRow 
                label="Court" 
                value={
                  profile.court_county && profile.court_state
                    ? `${profile.court_county}, ${profile.court_state}`
                    : profile.court_state || '—'
                }
              />
              <InfoRow label="Case Number" value={profile.case_number || '—'} />
              <InfoRow 
                label="Attorney" 
                value={
                  profile.attorney_name ? (
                    <span>
                      {profile.attorney_name}
                      {profile.attorney_email && (
                        <span className="text-white/40 text-xs ml-2">({profile.attorney_email})</span>
                      )}
                    </span>
                  ) : '—'
                }
              />
            </div>
          </div>
        </div>

        {/* Admin Notes */}
        {profile.admin_notes && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/60 mb-2">📝 Admin Notes</h3>
            <p className="text-sm text-white/70 bg-white/5 rounded-lg p-3">
              {profile.admin_notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-white/10 flex flex-wrap gap-3">
          <ActionButton
            onClick={onEditProfile}
            disabled={isExecutingAction}
          >
            ✏️ Edit Profile
          </ActionButton>
          <ActionButton
            onClick={onResetPassword}
            disabled={isExecutingAction}
            variant="primary"
          >
            🔑 Send Password Reset
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// INFO ROW SUB-COMPONENT
// ============================================================================

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between items-start">
      <span className="text-sm text-white/40">{label}</span>
      <span className="text-sm text-white/80 text-right">{value}</span>
    </div>
  );
}
