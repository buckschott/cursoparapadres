/**
 * Animation timing constants for Putting Kids First®
 * 
 * Single source of truth for animation durations across the site.
 * 
 * ⚠️  SYNC WARNING: These values must match CSS variables in globals.css
 *     When updating timing values, update BOTH files.
 * 
 * CSS Variables (globals.css):
 *   --timing-instant: 100ms    ← ANIMATION.INSTANT
 *   --timing-fast: 200ms       ← ANIMATION.FAST
 *   --timing-normal: 300ms     ← ANIMATION.NORMAL
 *   --timing-slow: 600ms       ← ANIMATION.SLOW
 *   --timing-reveal: 800ms     ← ANIMATION.REVEAL
 */

export const ANIMATION = {
  // ===== DURATIONS (ms) =====
  // Keep in sync with CSS --timing-* variables
  
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
 * 
 * CSS Variables (globals.css):
 *   --ease-out-smooth: cubic-bezier(0.4, 0, 0.2, 1)  ← EASING.OUT_SMOOTH
 *   --ease-out-back: cubic-bezier(0.34, 1.56, 0.64, 1) ← EASING.OUT_BACK
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
 * 
 * CSS Variables (globals.css):
 *   --z-base: 0
 *   --z-above: 10
 *   --z-section: 20
 *   --z-mobile-menu: 100
 *   --z-header: 200
 *   --z-toast: 300
 *   --z-modal: 400
 * 
 * Note: CHECKOUT_OVERLAY is JS-only (not in CSS) since it's
 * only used by the CheckoutOverlay component.
 */
export const Z_INDEX = {
  BASE: 0,
  ABOVE: 10,
  SECTION: 20,
  MOBILE_MENU: 100,
  HEADER: 200,
  MODAL: 400,
  TOAST: 450,  // Above modals so errors are always visible
  CHECKOUT_OVERLAY: 500,
} as const;

/**
 * Layout constants
 * 
 * CSS Variables (globals.css):
 *   --header-height: 73px  ← LAYOUT.HEADER_HEIGHT
 * 
 * Use these when you need pixel values in JS.
 * For CSS, prefer the CSS variables.
 */
export const LAYOUT = {
  /** Fixed header height in pixels */
  HEADER_HEIGHT: 73,
  
  /** Max content width */
  MAX_WIDTH: 1280,
} as const;

/**
 * Helper to convert JS timing to CSS string
 * @example TIMING_CSS(ANIMATION.FAST) → "200ms"
 */
export const TIMING_CSS = (ms: number): string => `${ms}ms`;