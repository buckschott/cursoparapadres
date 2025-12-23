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

  // Different wobble paths for each target to feel hand-drawn
  const getPath = () => {
    switch (target) {
      case 'title':
        // Wide oval for title - wobbly
        return 'M 50 25 C 85 22, 95 30, 97 50 C 99 70, 88 78, 50 80 C 12 82, 2 70, 3 50 C 4 30, 15 23, 50 25 Z';
      case 'subtext':
        // Medium oval for subtext - slightly different wobble
        return 'M 50 22 C 82 20, 96 32, 98 50 C 100 68, 85 80, 50 82 C 15 84, 1 68, 2 50 C 3 32, 18 21, 50 22 Z';
      default:
        return '';
    }
  };

  // Get padding based on target
  const getPadding = () => {
    switch (target) {
      case 'title':
        return 'p-4 md:p-6';
      case 'subtext':
        return 'p-3 md:p-5';
      default:
        return 'p-4';
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
              x="-10"
              y="-10"
              width="120"
              height="120"
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
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#chalkTexture-${target})`}
          mask={`url(#eraserMask-${target})`}
          className={`chalk-circle-path ${circleState === 'drawing' ? 'chalk-drawing' : ''} ${circleState === 'visible' ? 'chalk-visible' : ''}`}
          style={{
            strokeDasharray: 320,
            strokeDashoffset: circleState === 'hidden' ? 320 : circleState === 'drawing' ? 320 : 0,
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
            stroke-dashoffset: 320;
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
