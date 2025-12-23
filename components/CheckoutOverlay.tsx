'use client';

import { useEffect, useState } from 'react';
import { ANIMATION, Z_INDEX } from '@/constants/animation';

interface CheckoutOverlayProps {
  isVisible: boolean;
}

/**
 * Full-page loading overlay shown during Stripe checkout redirect.
 * Gives users clear feedback that payment is being set up.
 * 
 * Features:
 * - Animated logo/spinner
 * - Reassuring message
 * - Blocks all interaction
 * - Respects reduced motion
 */
export default function CheckoutOverlay({ isVisible }: CheckoutOverlayProps) {
  const [showTimeout, setShowTimeout] = useState(false);

  // Show "taking longer than expected" message after timeout
  useEffect(() => {
    if (!isVisible) {
      setShowTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, ANIMATION.CHECKOUT_TIMEOUT);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Prevent body scroll when overlay is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#1C1C1C] flex flex-col items-center justify-center px-6"
      style={{ zIndex: Z_INDEX.CHECKOUT_OVERLAY }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="checkout-loading-title"
      aria-describedby="checkout-loading-desc"
    >
      {/* Animated spinner with hand-drawn feel */}
      <div className="relative w-20 h-20 mb-8">
        <svg 
          className="w-full h-full checkout-spinner" 
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          {/* Outer ring - draws itself */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#77DD77"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="251"
            strokeDashoffset="251"
            className="checkout-ring"
          />
          {/* Inner spinning arc */}
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="#7EC8E3"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="60 140"
            className="checkout-arc"
          />
        </svg>
        
        {/* Checkmark that appears */}
        <svg 
          className="absolute inset-0 w-full h-full checkout-check"
          viewBox="0 0 100 100"
          aria-hidden="true"
        >
          <path
            d="M30 50 L45 65 L70 35"
            fill="none"
            stroke="#77DD77"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset="60"
            className="checkout-check-path"
          />
        </svg>
      </div>

      {/* Loading message */}
      <h2 
        id="checkout-loading-title"
        className="text-2xl font-bold text-white mb-3 text-center"
      >
        Preparando su pago seguro
      </h2>
      
      <p 
        id="checkout-loading-desc"
        className="text-white/70 text-center max-w-sm mb-6"
      >
        Conectando con Stripe para procesar su inscripción de forma segura...
      </p>

      {/* Timeout message */}
      <div 
        className={`text-center transition-opacity duration-500 ${showTimeout ? 'opacity-100' : 'opacity-0'}`}
      >
        <p className="text-white/50 text-sm">
          Está tomando más tiempo de lo esperado.
          <br />
          Por favor espere o{' '}
          <button 
            onClick={() => window.location.reload()}
            className="text-[#7EC8E3] underline hover:text-[#9DD8F3] transition-colors"
          >
            intente de nuevo
          </button>
        </p>
      </div>

      {/* Trust indicator */}
      <div className="absolute bottom-8 flex items-center gap-2 text-white/40 text-sm">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
        <span>Transacción SSL 100% Segura</span>
      </div>
    </div>
  );
}
