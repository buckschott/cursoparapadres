'use client';

import { useState, useEffect } from 'react';
import { ANIMATION, Z_INDEX } from '@/constants/animation';

interface BundleInterstitialProps {
  isOpen: boolean;
  originalCourse: 'coparenting' | 'parenting';
  onChooseBundle: () => void;
  onContinueSingle: () => void;
  onClose: () => void;
}

/**
 * Interstitial modal shown when user attempts to purchase a single class.
 * Offers the bundle upgrade opportunity before checkout.
 * 
 * Features:
 * - Clear savings messaging ($40 saved)
 * - Explains one-time nature of bundle pricing
 * - Two clear CTAs: Bundle or Continue
 * - Respects reduced motion preferences
 * - Keyboard accessible (Escape to close)
 */
export default function BundleInterstitial({
  isOpen,
  originalCourse,
  onChooseBundle,
  onContinueSingle,
  onClose,
}: BundleInterstitialProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const courseName = originalCourse === 'coparenting' 
    ? 'Clase de Coparentalidad' 
    : 'Clase de Crianza';

  return (
    <div
      className={`
        fixed inset-0 flex items-center justify-center p-4
        bg-black/80 backdrop-blur-sm
        ${prefersReducedMotion ? '' : 'animate-fade-in'}
      `}
      style={{ zIndex: Z_INDEX.MODAL }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="bundle-interstitial-title"
    >
      <div
        className={`
          relative w-full max-w-md
          bg-[#1C1C1C] border border-white/20 rounded-2xl
          p-6 md:p-8
          ${prefersReducedMotion ? '' : 'animate-scale-in'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
          aria-label="Cerrar"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Savings badge */}
        <div className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#77DD77]/20 text-[#77DD77] rounded-full text-sm font-semibold">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Ahorre $40
          </span>
        </div>

        {/* Title */}
        <h2 
          id="bundle-interstitial-title"
          className="text-2xl md:text-3xl font-bold text-white text-center mb-3"
        >
          ¿Sabía que puede ahorrar?
        </h2>

        {/* Explanation */}
        <p className="text-white/70 text-center mb-6">
          El <span className="text-white font-semibold">Paquete Completo</span> incluye 
          ambas clases por solo <span className="text-[#77DD77] font-bold">$80</span> — 
          en lugar de $120 si las compra por separado.
        </p>

        {/* Comparison box */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
            <span className="text-white/70">Una clase</span>
            <span className="text-white font-semibold">$60</span>
          </div>
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
            <span className="text-white/70">Dos clases (separadas)</span>
            <span className="text-white/50 line-through">$120</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[#77DD77] font-semibold">El Paquete Completo</span>
            <span className="text-[#77DD77] font-bold text-lg">$80</span>
          </div>
        </div>

        {/* One-time warning */}
        <div className="flex items-start gap-3 bg-[#FFE566]/10 border border-[#FFE566]/30 rounded-lg p-3 mb-6">
          <svg 
            className="w-5 h-5 text-[#FFE566] flex-shrink-0 mt-0.5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="text-white/80 text-sm">
            <span className="font-semibold text-[#FFE566]">Importante:</span> El precio del paquete 
            solo está disponible antes de su primera compra. Después, cada clase cuesta $60.
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <button
            onClick={onChooseBundle}
            className="
              w-full py-4 px-6 rounded-full
              bg-[#77DD77] text-[#1C1C1C]
              text-lg font-bold
              transition-all duration-200
              hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/20
              active:scale-[0.98]
            "
          >
            Obtener el Paquete — $80 →
          </button>
          
          <button
            onClick={onContinueSingle}
            className="
              w-full py-3 px-6 rounded-full
              bg-transparent border border-white/30 text-white
              text-base font-medium
              transition-all duration-200
              hover:bg-white/10 hover:border-white/50
              active:scale-[0.98]
            "
          >
            Continuar con {courseName} — $60
          </button>
        </div>
      </div>
    </div>
  );
}
