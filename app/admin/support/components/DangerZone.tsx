// =============================================================================
// DANGER ZONE COMPONENT
// =============================================================================
// Path: /app/admin/support/components/DangerZone.tsx
// =============================================================================

'use client';

import React, { useState } from 'react';
import { ConfirmButton } from './ui';

// ============================================================================
// TYPES
// ============================================================================

interface DangerZoneProps {
  userId: string;
  onDeleteUser: () => void;
  onResetAllProgress: () => void;
  onDeleteAllData: () => void;
  isExecutingAction: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * DangerZone - Contains destructive actions that require extra confirmation.
 */
export default function DangerZone({
  userId,
  onDeleteUser,
  onResetAllProgress,
  onDeleteAllData,
  isExecutingAction,
}: DangerZoneProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-[#FF9999]/5 border border-[#FF9999]/20 rounded-xl overflow-hidden">
      {/* Header - Click to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#FF9999]/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <div className="text-left">
            <h3 className="font-bold text-[#FF9999]">Danger Zone</h3>
            <p className="text-sm text-white/40">Destructive actions - use with caution</p>
          </div>
        </div>
        <svg 
          className={`w-5 h-5 text-[#FF9999] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4">
          {/* Reset All Progress */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Reset All Progress</h4>
              <p className="text-sm text-white/40">
                Clears lessons completed for all courses. User keeps purchases.
              </p>
            </div>
            <ConfirmButton
              onClick={onResetAllProgress}
              disabled={isExecutingAction}
              confirmText="⚠️ Reset ALL progress?"
            >
              🔄 Reset Progress
            </ConfirmButton>
          </div>

          {/* Delete All Data */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
            <div>
              <h4 className="font-medium text-white">Delete All Course Data</h4>
              <p className="text-sm text-white/40">
                Removes progress, exam attempts, and certificates. Purchases remain.
              </p>
            </div>
            <ConfirmButton
              onClick={onDeleteAllData}
              disabled={isExecutingAction}
              confirmText="⚠️ Delete course data?"
            >
              🗑️ Delete Course Data
            </ConfirmButton>
          </div>

          {/* Delete User */}
          <div className="flex items-center justify-between p-4 bg-[#FF9999]/10 rounded-lg border border-[#FF9999]/20">
            <div>
              <h4 className="font-medium text-[#FF9999]">Delete User Account</h4>
              <p className="text-sm text-white/40">
                Permanently removes user from auth and all data. Cannot be undone.
              </p>
            </div>
            <ConfirmButton
              onClick={onDeleteUser}
              disabled={isExecutingAction}
              confirmText="⚠️ PERMANENTLY DELETE?"
              timeout={5000}
            >
              ☠️ Delete User
            </ConfirmButton>
          </div>

          {/* Warning */}
          <div className="p-3 bg-[#FFE566]/10 border border-[#FFE566]/20 rounded-lg">
            <p className="text-xs text-[#FFE566]">
              ⚠️ These actions cannot be undone. Always confirm with a supervisor before deleting user data.
              For refunds, use Stripe dashboard instead of deleting data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
