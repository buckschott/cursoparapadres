// =============================================================================
// CONFIRM MODAL COMPONENT
// =============================================================================
// Path: /app/admin/support/components/modals/ConfirmModal.tsx
// =============================================================================

'use client';

import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ConfirmModal - A modal dialog for confirming actions.
 * 
 * Usage:
 * <ConfirmModal
 *   isOpen={showModal}
 *   title="Delete User"
 *   message="Are you sure you want to delete this user? This cannot be undone."
 *   variant="danger"
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowModal(false)}
 * />
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const confirmStyles = {
    default: 'bg-[#7EC8E3] hover:bg-[#9DD8F3] text-[#1C1C1C]',
    danger: 'bg-[#FF9999] hover:bg-[#FFAAAA] text-[#1C1C1C]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1C1C1C] border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>

        {/* Message */}
        <p className="text-white/70 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${confirmStyles[variant]}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
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
// PROMPT MODAL (with input)
// ============================================================================

interface PromptModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  inputLabel: string;
  inputPlaceholder?: string;
  inputType?: 'text' | 'email' | 'textarea';
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * PromptModal - A modal with an input field.
 */
export function PromptModal({
  isOpen,
  title,
  message,
  inputLabel,
  inputPlaceholder = '',
  inputType = 'text',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}: PromptModalProps) {
  const [value, setValue] = React.useState('');

  React.useEffect(() => {
    if (!isOpen) setValue('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-[#1C1C1C] border border-white/20 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/70 mb-4">{message}</p>

        {/* Input */}
        <label className="block text-sm text-white/60 mb-2">{inputLabel}</label>
        {inputType === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            rows={4}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50 mb-4"
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#7EC8E3]/50 mb-4"
          />
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading || !value.trim()}
            className="px-4 py-2 rounded-lg bg-[#7EC8E3] hover:bg-[#9DD8F3] text-[#1C1C1C] font-medium transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
