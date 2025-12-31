'use client';

import { useState, useEffect, useRef } from 'react';
import { ANIMATION } from '@/constants/animation';

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
}

/**
 * Primary CTA Button with hand-drawn arrow and chalk dust effect.
 * 
 * Features:
 * - Animated hand-drawn arrow that loops
 * - Chalk dust particle burst on hover
 * - Respects reduced motion preferences
 * - Disabled on touch devices (no hover state)
 */
export default function CTAButton({ href, children, className = '', showArrow = false }: CTAButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ 
    id: number; 
    x: number; 
    y: number; 
    angle: number; 
    speed: number; 
    size: number;
  }>>([]);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);

  // Detect touch device and motion preferences on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    setPrefersReducedMotion(
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }, []);

  // Trigger arrow animation after delay
  useEffect(() => {
    // If reduced motion, show arrow immediately without animation
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, ANIMATION.CTA_ARROW_DELAY);
    
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  // Chalk dust particle burst on hover
  const handleMouseEnter = () => {
    // Skip particles on touch devices (they use tap, not hover)
    if (isTouchDevice) return;
    
    // Skip if user prefers reduced motion
    if (prefersReducedMotion) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const width = rect.width;
    const height = rect.height;
    const newParticles: typeof particles = [];

    // Top edge particles (6)
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Date.now() + i,
        x: (width * (i + 0.5)) / 6,
        y: 0,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.8,
        speed: 1.5 + Math.random() * 2,
        size: 2 + Math.random() * 3,
      });
    }

    // Bottom edge particles (6)
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: Date.now() + 10 + i,
        x: (width * (i + 0.5)) / 6,
        y: height,
        angle: Math.PI / 2 + (Math.random() - 0.5) * 0.8,
        speed: 1.5 + Math.random() * 2,
        size: 2 + Math.random() * 3,
      });
    }

    // Left edge particles (3)
    for (let i = 0; i < 3; i++) {
      newParticles.push({
        id: Date.now() + 20 + i,
        x: 0,
        y: (height * (i + 0.5)) / 3,
        angle: Math.PI + (Math.random() - 0.5) * 0.8,
        speed: 1.5 + Math.random() * 2,
        size: 2 + Math.random() * 3,
      });
    }

    // Right edge particles (3)
    for (let i = 0; i < 3; i++) {
      newParticles.push({
        id: Date.now() + 30 + i,
        x: width,
        y: (height * (i + 0.5)) / 3,
        angle: 0 + (Math.random() - 0.5) * 0.8,
        speed: 1.5 + Math.random() * 2,
        size: 2 + Math.random() * 3,
      });
    }

    setParticles(newParticles);

    // Clean up particles after animation
    setTimeout(() => {
      setParticles([]);
    }, ANIMATION.PARTICLE_CLEANUP);
  };

  return (
    <div className="relative inline-block">
      {/* Hand-drawn arrow - positioned upper-right of button */}
      {showArrow && (
        <div 
          className="absolute -top-[80px] -right-[56px] -rotate-[22.5deg] md:-top-[74px] md:-right-20 md:rotate-0 w-12 h-20 md:w-16 md:h-28 pointer-events-none z-10"
          aria-hidden="true"
        >
          <svg 
            viewBox="0 0 644.81 1020" 
            className="w-full h-full cta-arrow-svg"
            style={{ 
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            <path 
              d="M572.25,10c42.81,75.14,74.9,162.32,57.95,247.12-16.95,84.8-98.15,160.78-183.31,145.73-18.02-3.19-36.14-10.74-47.42-25.16-28.97-37.03,10.15-97.08,57.12-99.15,46.97-2.07,87.42,36.03,106.93,78.8,30.13,66.07,21.80,148.11-21,206.78-42.80,58.67-118.37,91.65-190.49,83.13-39.28-4.64-85.21-40.52-66.18-75.20,4.31-7.86,11.46-13.83,19.17-18.40,30.94-18.33,73.48-14.38,100.51,9.34,27.03,23.72,36.49,65.38,22.34,98.44-9.32,21.78-27.10,38.66-44.83,54.39-110.04,97.61-236.77,176.35-373.03,231.76,41.63-57.96,80.48-117.91,116.39-179.58,33.92,76.79,56.36,158.64,66.34,242-64.81-12.70-123.03-34.16-182.73-62.42" 
              fill="none" 
              stroke="#FFFFFF"
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="20"
              className={`cta-arrow-path ${isVisible ? 'cta-arrow-animate' : ''}`}
            />
          </svg>
        </div>
      )}

      {/* Button */}
      <a
        ref={buttonRef}
        href={href}
        onMouseEnter={handleMouseEnter}
        className={`
          cta-button relative inline-flex items-center justify-center group 
          px-12 py-5 rounded-full text-2xl font-bold 
          transition-all duration-200
          bg-[#77DD77] text-[#1C1C1C] 
          hover:bg-[#88EE88] hover:shadow-lg hover:shadow-[#77DD77]/25
          active:scale-95
          overflow-visible
          ${className}
        `}
      >
        {/* Button text */}
        <span className="relative z-10">{children}</span>

        {/* Chalk dust particles */}
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
              left: particle.x,
              top: particle.y,
              width: particle.size,
              height: particle.size,
              animation: `chalkBurst ${ANIMATION.PARTICLE_DURATION}ms ease-out forwards`,
              '--angle': `${particle.angle}rad`,
              '--speed': particle.speed,
            } as React.CSSProperties}
            aria-hidden="true"
          />
        ))}
      </a>
    </div>
  );
}