'use client';

import { useChalkAnimation } from './ChalkAnimationContext';
import { ReactNode } from 'react';

interface ChalkCircleProps {
  children: ReactNode;
  target: 'title' | 'subtext';
  className?: string;
}

export default function ChalkCircle({ children, target, className = '' }: ChalkCircleProps) {
  const { phase, reducedMotion } = useChalkAnimation();

  // Determine visibility based on current phase
  const getCircleState = () => {
    if (reducedMotion) return 'visible';

    switch (target) {
      case 'title':
        if (phase === 'drawing-title') return 'drawing';
        if (['holding-title', 'drawing-subtext', 'holding-subtext', 'drawing-badge', 'drawing-arrow', 'holding-all'].includes(phase)) return 'visible';
        if (phase === 'erasing-title') return 'erasing';
        return 'hidden';

      case 'subtext':
        if (phase === 'drawing-subtext') return 'drawing';
        if (['holding-subtext', 'drawing-badge', 'drawing-arrow', 'holding-all', 'erasing-title'].includes(phase)) return 'visible';
        if (phase === 'erasing-subtext') return 'erasing';
        return 'hidden';

      default:
        return 'hidden';
    }
  };

  const circleState = getCircleState();

  // Open/broken circle paths - small gap at bottom (~95% closed)
  // These don't close (no Z), leaving a small gap
  const getPath = () => {
    switch (target) {
      case 'title':
        // Wide oval for title - almost closed, small gap at bottom center
        return 'M 45 85 C 20 75, 5 55, 5 40 C 5 20, 20 5, 50 5 C 80 5, 95 20, 95 40 C 95 55, 80 75, 55 85';
      case 'subtext':
        // Medium oval for subtext - almost closed
        return 'M 45 88 C 18 78, 2 58, 2 40 C 2 18, 20 2, 50 2 C 80 2, 98 18, 98 40 C 98 58, 82 78, 55 88';
      default:
        return '';
    }
  };

  // Larger padding to ensure circle doesn't touch text
  const getPadding = () => {
    switch (target) {
      case 'title':
        return 'px-8 py-6 md:px-12 md:py-8';
      case 'subtext':
        return 'px-6 py-5 md:px-10 md:py-7';
      default:
        return 'p-6';
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* The actual content */}
      <div className={`relative z-10 ${getPadding()}`}>
        {children}
      </div>

      {/* The chalk circle SVG overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{
          overflow: 'visible',
          filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
        }}
      >
        <defs>
          {/* Chalk texture filter */}
          <filter id={`chalkTexture-${target}`} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Eraser mask */}
          <mask id={`eraserMask-${target}`}>
            <rect
              x="-20"
              y="-20"
              width="140"
              height="140"
              fill="white"
              className={circleState === 'erasing' ? 'chalk-eraser-wipe' : ''}
              style={{
                transformOrigin: 'right center',
                transform: circleState === 'hidden' ? 'scaleX(0)' : 'scaleX(1)',
              }}
            />
          </mask>
        </defs>

        <path
          d={getPath()}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#chalkTexture-${target})`}
          mask={`url(#eraserMask-${target})`}
          className={`chalk-circle-path ${circleState === 'drawing' ? 'chalk-drawing' : ''} ${circleState === 'visible' ? 'chalk-visible' : ''}`}
          style={{
            strokeDasharray: 400,
            strokeDashoffset: circleState === 'hidden' ? 400 : circleState === 'drawing' ? 400 : 0,
          }}
        />
      </svg>

      <style jsx>{`
        .chalk-circle-path {
          transition: none;
        }

        .chalk-circle-path.chalk-drawing {
          animation: drawCircle 1.2s ease-out forwards;
        }

        .chalk-circle-path.chalk-visible {
          stroke-dashoffset: 0;
        }

        @keyframes drawCircle {
          from {
            stroke-dashoffset: 400;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .chalk-eraser-wipe {
          animation: eraseWipe 0.6s ease-in-out forwards;
        }

        @keyframes eraseWipe {
          from {
            transform: scaleX(1);
            transform-origin: right center;
          }
          to {
            transform: scaleX(0);
            transform-origin: right center;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chalk-circle-path {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          .chalk-eraser-wipe {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
