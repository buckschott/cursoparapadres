// =============================================================================
// ACTION BUTTON COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ui/ActionButton.tsx
// =============================================================================

'use client';

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

export type ButtonVariant = 'default' | 'danger' | 'success' | 'primary';

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  title?: string;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-white/10 hover:bg-white/20 text-white border-[#FFFFFF]/20',
  danger: 'bg-[#FF9999]/20 hover:bg-[#FF9999]/30 text-[#FF9999] border-[#FF9999]/30',
  success: 'bg-[#77DD77]/20 hover:bg-[#77DD77]/30 text-[#77DD77] border-[#77DD77]/30',
  primary: 'bg-[#7EC8E3]/20 hover:bg-[#7EC8E3]/30 text-[#7EC8E3] border-[#7EC8E3]/30',
};

const sizeStyles = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ActionButton - A styled button for admin actions.
 * 
 * Usage:
 * <ActionButton onClick={handleClick}>Default Action</ActionButton>
 * <ActionButton variant="success" onClick={handleSave}>✅ Save</ActionButton>
 * <ActionButton variant="danger" onClick={handleDelete}>🗑️ Delete</ActionButton>
 * <ActionButton variant="primary" loading={isLoading}>Submit</ActionButton>
 */
export default function ActionButton({
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'md',
  children,
  className = '',
  title,
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg 
        font-medium 
        border 
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {loading ? (
        <>
          <LoadingSpinner />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// ============================================================================
// LOADING SPINNER
// ============================================================================

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================================================
// ICON BUTTON VARIANT
// ============================================================================

interface IconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon: React.ReactNode;
  label: string;
  className?: string;
}

/**
 * IconButton - A compact icon-only button with tooltip.
 */
export function IconButton({
  onClick,
  disabled = false,
  variant = 'default',
  icon,
  label,
  className = '',
}: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`
        p-2
        rounded-lg 
        border 
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {icon}
    </button>
  );
}

// ============================================================================
// LINK BUTTON VARIANT
// ============================================================================

interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}

/**
 * LinkButton - A styled button that opens a link.
 */
export function LinkButton({
  href,
  variant = 'default',
  size = 'md',
  children,
  className = '',
  external = true,
}: LinkButtonProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg 
        font-medium 
        border 
        transition-all duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </a>
  );
}
