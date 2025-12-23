/**
 * Animation timing constants for Putting Kids First®
 * 
 * Single source of truth for animation durations across the site.
 * Keep in sync with CSS variables in globals.css where applicable.
 */

export const ANIMATION = {
  // ===== DURATIONS (ms) =====
  
  /** Instant feedback - button clicks, hover states */
  INSTANT: 100,
  
  /** Fast transitions - tooltips, small UI changes */
  FAST: 200,
  
  /** Normal transitions - most UI animations */
  NORMAL: 300,
  
  /** Slow transitions - page elements, overlays */
  SLOW: 600,
  
  /** Reveal animations - scroll-triggered content */
  REVEAL: 800,
  
  // ===== DELAYS (ms) =====
  
  /** Delay before CTA arrow appears in hero */
  CTA_ARROW_DELAY: 5000,
  
  /** Delay between device animations in sequence */
  DEVICE_STAGGER: 800,
  
  /** Time before showing "taking too long" in checkout */
  CHECKOUT_TIMEOUT: 8000,
  
  /** Delay before redirecting to Stripe (let user see overlay) */
  CHECKOUT_REDIRECT_DELAY: 500,
  
  /** Auto-dismiss toast after this duration */
  TOAST_DURATION: 5000,
  
  // ===== PARTICLE EFFECTS (ms) =====
  
  /** Duration of chalk dust particle burst */
  PARTICLE_DURATION: 500,
  
  /** Cleanup delay after particle animation */
  PARTICLE_CLEANUP: 600,
  
} as const;

/**
 * Easing functions - match CSS variables
 * Use with framer-motion or JS animations
 */
export const EASING = {
  /** Smooth deceleration */
  OUT_SMOOTH: [0.4, 0, 0.2, 1],
  
  /** Overshoot for playful animations */
  OUT_BACK: [0.34, 1.56, 0.64, 1],
  
  /** Linear for continuous animations like spinners */
  LINEAR: [0, 0, 1, 1],
} as const;

/**
 * Z-index scale - match CSS variables
 * Document here so JS components can reference if needed
 */
export const Z_INDEX = {
  BASE: 0,
  ABOVE: 10,
  SECTION: 20,
  MOBILE_MENU: 100,
  HEADER: 200,
  TOAST: 300,
  MODAL: 400,
  CHECKOUT_OVERLAY: 500,
} as const;
