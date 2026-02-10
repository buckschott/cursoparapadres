'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { ANIMATION } from '@/constants/animation';

// ============================================
// TOAST TYPES & CONTEXT
// ============================================

type ToastType = 'error' | 'success' | 'info';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  subMessage?: string;
  action?: ToastAction;
  showHelpLink?: boolean; // Defaults to true for errors
}

interface ToastContextType {
  showToast: (
    type: ToastType, 
    message: string, 
    subMessage?: string,
    action?: ToastAction,
    showHelpLink?: boolean
  ) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// ============================================
// TOAST TIMING CONSTANTS
// ============================================
// SUCCESS and INFO use the central ANIMATION.TOAST_DURATION (5000ms).
// ERROR and EXIT_ANIMATION are Toast-specific overrides.

const TOAST_TIMING = {
  ERROR: 8000,    // Errors need more reading time
  SUCCESS: ANIMATION.TOAST_DURATION,
  INFO: ANIMATION.TOAST_DURATION,
  EXIT_ANIMATION: 300,
} as const;

// ============================================
// TOAST PROVIDER
// ============================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((
    type: ToastType, 
    message: string, 
    subMessage?: string,
    action?: ToastAction,
    showHelpLink?: boolean
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    // Default: show help link on errors unless explicitly disabled
    const shouldShowHelpLink = showHelpLink ?? (type === 'error');
    
    setToasts(prev => [...prev, { 
      id, 
      type, 
      message, 
      subMessage, 
      action,
      showHelpLink: shouldShowHelpLink
    }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

// ============================================
// TOAST CONTAINER
// ============================================

/**
 * Toast container - positioned above header and modals.
 * 
 * Z-index: 450 (between modal at 400 and checkout overlay at 500)
 * This ensures toasts appear above modals but below the checkout overlay.
 */
function ToastContainer({ 
  toasts, 
  onDismiss 
}: { 
  toasts: Toast[]; 
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed top-[85px] left-0 right-0 z-[450] flex flex-col items-center gap-3 px-4 pointer-events-none"
      role="region"
      aria-label="Notificaciones"
    >
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ============================================
// INDIVIDUAL TOAST
// ============================================

function ToastItem({ 
  toast, 
  onDismiss 
}: { 
  toast: Toast; 
  onDismiss: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Get timeout based on toast type
  const timeout = toast.type === 'error' 
    ? TOAST_TIMING.ERROR 
    : toast.type === 'success' 
      ? TOAST_TIMING.SUCCESS 
      : TOAST_TIMING.INFO;

  useEffect(() => {
    const showTimer = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(showTimer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout]);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, TOAST_TIMING.EXIT_ANIMATION);
  };

  const handleActionClick = () => {
    if (toast.action?.onClick) {
      toast.action.onClick();
      handleDismiss();
    }
  };

  const styles = {
    error: {
      bg: 'bg-[#2A2A2A]',
      border: 'border-[#FFB347]/50',
      icon: <ErrorIcon />,
      iconBg: 'bg-[#FFB347]/20',
      progressColor: 'bg-[#FFB347]',
    },
    success: {
      bg: 'bg-[#2A2A2A]',
      border: 'border-[#77DD77]/50',
      icon: <SuccessIcon />,
      iconBg: 'bg-[#77DD77]/20',
      progressColor: 'bg-[#77DD77]',
    },
    info: {
      bg: 'bg-[#2A2A2A]',
      border: 'border-[#7EC8E3]/50',
      icon: <InfoIcon />,
      iconBg: 'bg-[#7EC8E3]/20',
      progressColor: 'bg-[#7EC8E3]',
    },
  };

  const style = styles[toast.type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        pointer-events-auto
        w-full max-w-md
        ${style.bg} ${style.border}
        border-2 rounded-xl
        shadow-xl shadow-black/30
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-y-0 opacity-100' 
          : '-translate-y-4 opacity-0'
        }
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center`}>
          {style.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pt-1">
          <p className="text-white font-semibold text-sm leading-tight">
            {toast.message}
          </p>
          
          {toast.subMessage && (
            <p className="text-white/65 text-sm mt-1">
              {toast.subMessage}
            </p>
          )}

          {/* Action Button and/or Help Link */}
          {(toast.action || toast.showHelpLink) && (
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {/* Action Button */}
              {toast.action && (
                <button
                  onClick={handleActionClick}
                  className={`
                    px-4 py-1.5 rounded-lg text-sm font-semibold
                    transition-all duration-200
                    ${toast.type === 'error' 
                      ? 'bg-[#FFB347] text-[#1C1C1C] hover:bg-[#FFC060]' 
                      : toast.type === 'success'
                        ? 'bg-[#77DD77] text-[#1C1C1C] hover:bg-[#88EE88]'
                        : 'bg-[#7EC8E3] text-[#1C1C1C] hover:bg-[#9DD8F3]'
                    }
                  `}
                >
                  {toast.action.label}
                </button>
              )}

              {/* Help Link (auto-included for errors) */}
              {toast.showHelpLink && (
                <a 
                  href="mailto:hola@claseparapadres.com?subject=Necesito%20ayuda&body=Hola%2C%20necesito%20ayuda%20con..."
                  className="text-[#7EC8E3] text-sm hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  ¿Necesita ayuda?
                </a>
              )}
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          aria-label="Cerrar notificación"
        >
          <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10 rounded-b-xl overflow-hidden">
        <div 
          className={`h-full ${style.progressColor} toast-progress`}
          style={{
            animation: isVisible && !isLeaving 
              ? `toastShrink ${timeout}ms linear forwards` 
              : 'none',
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// ICONS
// ============================================

function ErrorIcon() {
  return (
    <svg 
      className="w-5 h-5 text-[#FFB347]" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3c.2 0 .5.1.6.3l8.5 14.8c.3.5-.1 1.1-.6 1.1H3.5c-.5 0-.9-.6-.6-1.1l8.5-14.8c.1-.2.4-.3.6-.3z" />
      <path d="M12 8.5v4" strokeWidth="2.5" />
      <circle cx="12" cy="15.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg 
      className="w-5 h-5 text-[#77DD77]" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5 5-5" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg 
      className="w-5 h-5 text-[#7EC8E3]" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v0" strokeWidth="3" />
      <path d="M12 12v4" strokeWidth="2.5" />
    </svg>
  );
}

// ============================================
// PRE-BUILT ERROR HELPERS
// ============================================

/**
 * Common error messages with standardized formatting.
 * Use these instead of writing custom error strings.
 * 
 * Example:
 *   const { showToast } = useToast();
 *   showToast(...TOAST_ERRORS.NETWORK);
 *   showToast(...TOAST_ERRORS.SAVE_FAILED(() => handleRetry()));
 */
export const TOAST_ERRORS = {
  // Network/Connection errors
  NETWORK: [
    'error',
    'Error de conexión',
    'Verifique su internet e intente de nuevo.',
    undefined,
    true
  ] as const,

  // Generic save failure with retry
  SAVE_FAILED: (retryFn: () => void) => [
    'error',
    'No se pudo guardar',
    'Sus cambios no fueron guardados.',
    { label: 'Reintentar', onClick: retryFn },
    true
  ] as const,

  // Session expired
  SESSION_EXPIRED: [
    'error',
    'Sesión expirada',
    'Por favor, inicie sesión de nuevo.',
    { label: 'Iniciar Sesión', onClick: () => window.location.href = '/iniciar-sesion' },
    false
  ] as const,

  // Payment error
  PAYMENT_FAILED: [
    'error',
    'Error en el pago',
    'No pudimos procesar su pago. Intente con otra tarjeta.',
    undefined,
    true
  ] as const,

  // Load error with retry
  LOAD_FAILED: (retryFn: () => void) => [
    'error',
    'Error al cargar',
    'No pudimos cargar los datos.',
    { label: 'Reintentar', onClick: retryFn },
    true
  ] as const,

  // Generic error
  GENERIC: [
    'error',
    'Algo salió mal',
    'Por favor, intente de nuevo.',
    undefined,
    true
  ] as const,
} as const;

/**
 * Common success messages
 */
export const TOAST_SUCCESS = {
  SAVED: [
    'success',
    '¡Guardado!',
    'Sus cambios fueron guardados exitosamente.',
  ] as const,

  SENT: [
    'success',
    '¡Enviado!',
    'Su mensaje fue enviado exitosamente.',
  ] as const,

  PROGRESS_SAVED: [
    'success',
    'Progreso guardado',
    undefined,
  ] as const,
} as const;
