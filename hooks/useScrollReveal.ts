'use client';

import { useEffect, useRef, useCallback } from 'react';
import { ANIMATION } from '@/constants/animation';

/**
 * Hook for scroll-triggered reveal animations.
 * Adds 'scroll-reveal-active' class when element enters viewport.
 * 
 * @param options - IntersectionObserver options
 * @returns ref to attach to container element
 */
export function useScrollReveal(options?: IntersectionObserverInit) {
  const containerRef = useRef<HTMLElement>(null);

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
  }, [options]);

  return containerRef;
}

/**
 * Hook for device section animation.
 * Sequentially activates devices when section enters viewport.
 */
export function useDeviceAnimation() {
  const containerRef = useRef<HTMLElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Show all devices immediately
      const devices = containerRef.current?.querySelectorAll('.device-animate');
      devices?.forEach(device => {
        device.classList.add('device-active');
        const img = device.querySelector('.device-img') as HTMLImageElement;
        if (img) {
          const deviceType = device.classList.contains('device-phone') ? 'phone' :
                            device.classList.contains('device-tablet') ? 'tablet' :
                            device.classList.contains('device-laptop') ? 'laptop' : 'desktop';
          img.src = `/${deviceType}-2${deviceType !== 'phone' ? '-es' : ''}.svg`;
        }
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const devices = [
            { selector: '.device-phone', newSrc: '/phone-2.svg' },
            { selector: '.device-tablet', newSrc: '/tablet-2-es.svg' },
            { selector: '.device-laptop', newSrc: '/laptop-2-es.svg' },
            { selector: '.device-desktop', newSrc: '/desktop-2-es.svg' }
          ];

          devices.forEach((device, index) => {
            setTimeout(() => {
              const deviceEl = containerRef.current?.querySelector(device.selector);
              if (deviceEl) {
                const img = deviceEl.querySelector('.device-img') as HTMLImageElement;
                if (img) {
                  img.src = device.newSrc;
                }
                deviceEl.classList.add('device-active');
              }
            }, index * ANIMATION.DEVICE_STAGGER);
          });
          
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return containerRef;
}

/**
 * Hook for footer entrance animation.
 * Adds 'footer-visible' class when footer enters viewport.
 */
export function useFooterReveal() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      const cta = footerRef.current?.querySelector('.footer-cta');
      cta?.classList.add('footer-visible');
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cta = footerRef.current?.querySelector('.footer-cta');
          cta?.classList.add('footer-visible');
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return footerRef;
}
