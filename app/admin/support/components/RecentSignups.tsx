// =============================================================================
// RECENT SIGNUPS COMPONENT
// =============================================================================
// Path: /app/admin/support/components/RecentSignups.tsx
// =============================================================================

'use client';

import React from 'react';
import type { RecentSignup } from '../types';

// ============================================================================
// TYPES
// ============================================================================

interface RecentSignupsProps {
  signups: RecentSignup[];
  isLoading: boolean;
  onLookupCustomer: (email: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const COURSE_LABELS: Record<string, { label: string; color: string }> = {
  coparenting: { label: 'Co-Parenting', color: '#7EC8E3' },
  parenting: { label: 'Parenting', color: '#77DD77' },
  bundle: { label: 'Bundle', color: '#B19CD9' },
};

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RecentSignups({
  signups,
  isLoading,
  onLookupCustomer,
}: RecentSignupsProps) {
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg animate-pulse">
              <div className="h-8 w-8 bg-white/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-48 bg-white/10 rounded mb-1" />
                <div className="h-3 w-32 bg-white/10 rounded" />
              </div>
              <div className="h-4 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (signups.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
        <h3 className="text-sm font-medium text-white/60 mb-4">Recent Signups</h3>
        <p className="text-sm text-white/40 text-center py-6">No signups yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-white/60">
          🆕 Recent Signups
        </h3>
        <span className="text-xs text-white/40">
          Last {signups.length}
        </span>
      </div>

      {/* Signup List */}
      <div className="space-y-2">
        {signups.map((signup) => {
          const course = COURSE_LABELS[signup.courseType] || { label: signup.courseType, color: '#fff' };
          const displayName = signup.name || signup.email.split('@')[0];

          return (
            <button
              key={signup.id}
              onClick={() => onLookupCustomer(signup.email)}
              className="
                w-full flex items-center gap-3 p-3 
                bg-white/[0.03] hover:bg-white/[0.08] 
                border border-transparent hover:border-white/10
                rounded-lg transition-all duration-150
                text-left group
              "
            >
              {/* Status Indicator */}
              <div className={`
                w-2 h-2 rounded-full flex-shrink-0
                ${signup.status === 'completed' ? 'bg-[#77DD77]' : 'bg-[#FFE566]'}
              `} />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white font-medium truncate">
                    {displayName}
                  </span>
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: `${course.color}20`,
                      color: course.color,
                    }}
                  >
                    {course.label}
                  </span>
                </div>
                <span className="text-xs text-white/40 truncate block">
                  {signup.email}
                </span>
              </div>

              {/* Amount + Time */}
              <div className="text-right flex-shrink-0">
                <span className="text-sm text-[#77DD77] font-medium block">
                  {formatCurrency(signup.amountPaid)}
                </span>
                <span className="text-[11px] text-white/30">
                  {timeAgo(signup.purchasedAt)}
                </span>
              </div>

              {/* Hover Arrow */}
              <span className="text-white/0 group-hover:text-white/40 transition-colors text-xs flex-shrink-0">
                →
              </span>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#FFE566]" />
          <span className="text-[11px] text-white/30">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#77DD77]" />
          <span className="text-[11px] text-white/30">Completed</span>
        </div>
        <span className="text-[11px] text-white/20 ml-auto">Click to look up</span>
      </div>
    </div>
  );
}
