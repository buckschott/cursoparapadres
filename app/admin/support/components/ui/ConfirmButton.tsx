// =============================================================================
// CONFIRM BUTTON COMPONENT
// =============================================================================
// Path: /app/admin/support/components/ui/ConfirmButton.tsx
// =============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ConfirmButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  confirmText?: string;
  timeout?: number;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ConfirmButton - A danger button that requires double-click to confirm.
 * 
 * First click: Shows confirmation state with pulsing animation
 * Second click (within timeout): Executes the action
 * Timeout expires: Returns to normal state
 * 
 * Usage:
 * <ConfirmButton onClick={handleDelete}>🗑️ Delete User</ConfirmButton>
 * <ConfirmButton 
 *   onClick={handleReset} 
 *   confirmText="⚠️ Click again to RESET"
 *   timeout={5000}
 * >
 *   🔄 Reset All Progress
 * </ConfirmButton>
 */
export default function ConfirmButton({
  onClick,
  disabled = false,
  children,
  confirmText = 'Click again to confirm',
  timeout = 3000,
  className = '',
}: ConfirmButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle click logic
  const handleClick = () => {
    if (disabled) return;

    if (isConfirming) {
      // Second click - execute action
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsConfirming(false);
      onClick();
    } else {
      // First click - enter confirm mode
      setIsConfirming(true);
      timeoutRef.current = setTimeout(() => {
        setIsConfirming(false);
        timeoutRef.current = null;
      }, timeout);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Reset confirming state if disabled changes to true
  useEffect(() => {
    if (disabled && isConfirming) {
      setIsConfirming(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [disabled, isConfirming]);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3 py-2 
        rounded-lg 
        text-sm font-medium 
        border 
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${
          isConfirming
            ? 'bg-[#FF9999] text-[#1C1C1C] border-[#FF9999] animate-pulse'
            : 'bg-[#FF9999]/20 hover:bg-[#FF9999]/30 text-[#FF9999] border-[#FF9999]/30'
        }
        ${className}
      `}
    >
      {isConfirming ? confirmText : children}
    </button>
  );
}

// ============================================================================
// CONFIRM BUTTON WITH CUSTOM STYLING
// ============================================================================

interface ConfirmButtonCustomProps extends ConfirmButtonProps {
  normalStyles?: string;
  confirmStyles?: string;
}

/**
 * ConfirmButtonCustom - Same as ConfirmButton but with customizable styles.
 */
export function ConfirmButtonCustom({
  onClick,
  disabled = false,
  children,
  confirmText = 'Click again to confirm',
  timeout = 3000,
  className = '',
  normalStyles = 'bg-[#FF9999]/20 hover:bg-[#FF9999]/30 text-[#FF9999] border-[#FF9999]/30',
  confirmStyles = 'bg-[#FF9999] text-[#1C1C1C] border-[#FF9999] animate-pulse',
}: ConfirmButtonCustomProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    if (disabled) return;

    if (isConfirming) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsConfirming(false);
      onClick();
    } else {
      setIsConfirming(true);
      timeoutRef.current = setTimeout(() => {
        setIsConfirming(false);
        timeoutRef.current = null;
      }, timeout);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`
        px-3 py-2 
        rounded-lg 
        text-sm font-medium 
        border 
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isConfirming ? confirmStyles : normalStyles}
        ${className}
      `}
    >
      {isConfirming ? confirmText : children}
    </button>
  );
}
