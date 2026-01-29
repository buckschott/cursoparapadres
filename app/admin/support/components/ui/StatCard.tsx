// =============================================================================
// STAT CARD COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ui/StatCard.tsx
// =============================================================================

'use client';

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  onClick?: () => void;
  clickable?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StatCard - A dashboard metric card.
 * 
 * Usage:
 * <StatCard label="Total Customers" value={1234} icon="👤" />
 * <StatCard label="Revenue" value="$12,345" trend="up" />
 * <StatCard label="Stuck Students" value={5} clickable onClick={showModal} />
 */
export default function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  onClick,
  clickable = false,
  className = '',
}: StatCardProps) {
  const isClickable = clickable || !!onClick;

  const trendColors = {
    up: 'text-[#77DD77]',
    down: 'text-[#FF9999]',
    neutral: 'text-white/60',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  const content = (
    <>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-white/60">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {trend && (
          <span className={`text-sm ${trendColors[trend]}`}>
            {trendIcons[trend]}
          </span>
        )}
      </div>
      {subValue && (
        <span className="text-xs text-white/40 mt-1 block">{subValue}</span>
      )}
      {isClickable && (
        <span className="text-xs text-[#7EC8E3] mt-2 block">
          Click to view details →
        </span>
      )}
    </>
  );

  if (isClickable) {
    return (
      <button
        onClick={onClick}
        className={`
          bg-white/5 border border-white/10 rounded-xl p-4 text-left
          hover:bg-white/10 hover:border-[#7EC8E3]/30 
          transition-all duration-200
          cursor-pointer
          ${className}
        `}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`
        bg-white/5 border border-white/10 rounded-xl p-4
        ${className}
      `}
    >
      {content}
    </div>
  );
}

// ============================================================================
// STAT CARD GRID
// ============================================================================

interface StatCardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * StatCardGrid - Grid layout for multiple stat cards.
 */
export function StatCardGrid({ children, columns = 4, className = '' }: StatCardGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
      {children}
    </div>
  );
}

// ============================================================================
// ALERT STAT CARD (for warnings/errors)
// ============================================================================

interface AlertStatCardProps {
  label: string;
  value: string | number;
  severity: 'warning' | 'error' | 'info';
  onClick?: () => void;
  className?: string;
}

/**
 * AlertStatCard - A stat card with alert styling.
 */
export function AlertStatCard({
  label,
  value,
  severity,
  onClick,
  className = '',
}: AlertStatCardProps) {
  const severityStyles = {
    warning: 'bg-[#FFE566]/10 border-[#FFE566]/30 text-[#FFE566]',
    error: 'bg-[#FF9999]/10 border-[#FF9999]/30 text-[#FF9999]',
    info: 'bg-[#7EC8E3]/10 border-[#7EC8E3]/30 text-[#7EC8E3]',
  };

  const icons = {
    warning: '⚠️',
    error: '🔴',
    info: 'ℹ️',
  };

  const content = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span>{icons[severity]}</span>
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
      {onClick && (
        <span className="text-xs opacity-70 mt-2 block">
          Click to view →
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`
          border rounded-xl p-4 text-left
          hover:opacity-80 transition-all duration-200
          cursor-pointer
          ${severityStyles[severity]}
          ${className}
        `}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`
        border rounded-xl p-4
        ${severityStyles[severity]}
        ${className}
      `}
    >
      {content}
    </div>
  );
}
