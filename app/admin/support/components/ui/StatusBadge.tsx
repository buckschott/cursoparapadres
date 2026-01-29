// =============================================================================
// STATUS BADGE COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ui/StatusBadge.tsx
// =============================================================================

'use client';

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type BadgeStatus = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  status: BadgeStatus;
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// COLOR MAPPINGS
// ============================================================================

const statusColors: Record<BadgeStatus, string> = {
  success: 'bg-[#77DD77]/20 text-[#77DD77] border-[#77DD77]/30',
  warning: 'bg-[#FFE566]/20 text-[#FFE566] border-[#FFE566]/30',
  error: 'bg-[#FF9999]/20 text-[#FF9999] border-[#FF9999]/30',
  info: 'bg-[#7EC8E3]/20 text-[#7EC8E3] border-[#7EC8E3]/30',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StatusBadge - A pill-shaped badge for displaying status indicators.
 * 
 * Usage:
 * <StatusBadge status="success">✅ Completed</StatusBadge>
 * <StatusBadge status="warning">⏳ Pending</StatusBadge>
 * <StatusBadge status="error">❌ Failed</StatusBadge>
 * <StatusBadge status="info">📝 In Progress</StatusBadge>
 */
export default function StatusBadge({ status, children, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2 py-1 
        rounded-full 
        text-xs font-medium 
        border 
        ${statusColors[status]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

// ============================================================================
// PRESET BADGES FOR COMMON USE CASES
// ============================================================================

export function EmailVerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <StatusBadge status="success">✅ Email Verified</StatusBadge>
  ) : (
    <StatusBadge status="warning">⏳ Email Unverified</StatusBadge>
  );
}

export function ProfileCompleteBadge({ complete }: { complete: boolean }) {
  return complete ? (
    <StatusBadge status="success">✅ Profile Complete</StatusBadge>
  ) : (
    <StatusBadge status="warning">⏳ Profile Incomplete</StatusBadge>
  );
}

export function PurchaseStatusBadge({ status }: { status: 'active' | 'refunded' }) {
  return status === 'active' ? (
    <StatusBadge status="success">Active</StatusBadge>
  ) : (
    <StatusBadge status="error">Refunded</StatusBadge>
  );
}

export function ExamResultBadge({ passed, completed }: { passed: boolean; completed: boolean }) {
  if (passed) {
    return <StatusBadge status="success">✅ Passed</StatusBadge>;
  }
  if (completed) {
    return <StatusBadge status="error">❌ Failed</StatusBadge>;
  }
  return <StatusBadge status="warning">⏳ In Progress</StatusBadge>;
}

export function CourseProgressBadge({ 
  lessonsCompleted, 
  examPassed, 
  hasCertificate 
}: { 
  lessonsCompleted: number; 
  examPassed: boolean;
  hasCertificate: boolean;
}) {
  if (hasCertificate) {
    return <StatusBadge status="success">✅ Completed</StatusBadge>;
  }
  if (examPassed) {
    return <StatusBadge status="info">🏆 Exam Passed</StatusBadge>;
  }
  if (lessonsCompleted === 15) {
    return <StatusBadge status="info">📝 Ready for Exam</StatusBadge>;
  }
  return <StatusBadge status="warning">🔄 In Progress</StatusBadge>;
}

export function SwapEligibleBadge({ eligible }: { eligible: boolean }) {
  return eligible ? (
    <StatusBadge status="info">🔄 Swap Available</StatusBadge>
  ) : null;
}

export function ServiceHealthBadge({ status }: { status: 'healthy' | 'degraded' | 'down' }) {
  const config = {
    healthy: { status: 'success' as const, label: 'Healthy' },
    degraded: { status: 'warning' as const, label: 'Degraded' },
    down: { status: 'error' as const, label: 'Down' },
  };
  
  const { status: badgeStatus, label } = config[status];
  return <StatusBadge status={badgeStatus}>{label}</StatusBadge>;
}
