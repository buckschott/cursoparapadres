'use client';

import { useEffect, useRef } from 'react';

// ============================================
// SCROLL REVEAL HOOK
// ============================================

/**
 * Hook for scroll-triggered reveal animations.
 * Adds 'scroll-reveal-active' class when element enters viewport.
 * 
 * @param options - IntersectionObserver options
 * @returns ref to attach to container element
 * 
 * @example
 * ```tsx
 * const mainRef = useScrollReveal();
 * return <main ref={mainRef}>
 *   <div className="scroll-reveal">I fade in!</div>
 * </main>
 * ```
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLElement>(null);
  
  // Serialize options for stable dependency comparison.
  // Prevents re-running the effect when callers pass inline objects.
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    // Respect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // If reduced motion, immediately show all elements
      const elements = containerRef.current?.querySelectorAll('.scroll-reveal');
      elements?.forEach(el => el.classList.add('scroll-reveal-active'));
      return;
    }

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
      ...options,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-reveal-active');
          // Once revealed, stop observing (one-time animation)
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = containerRef.current?.querySelectorAll('.scroll-reveal');
    elements?.forEach(el => observer.observe(el));

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsKey]);

  return containerRef;
}
