'use client';

import { useChalkAnimation } from './ChalkAnimationContext';

export default function ChalkBadgeArrow() {
  const { phase, reducedMotion } = useChalkAnimation();

  // This component handles both badge circle AND arrow as one continuous line
  const getState = () => {
    if (reducedMotion) return 'visible';

    // Starts drawing when badge phase begins, continues through arrow phase
    if (phase === 'drawing-badge' || phase === 'drawing-arrow') return 'drawing';
    if (['holding-all', 'erasing-title', 'erasing-subtext'].includes(phase)) return 'visible';
    if (phase === 'erasing-badge-arrow') return 'erasing';
    return 'hidden';
  };

  const state = getState();

  // Calculate drawing progress based on phase
  const getDrawingClass = () => {
    if (state === 'drawing') {
      if (phase === 'drawing-badge') return 'drawing-badge-portion';
      if (phase === 'drawing-arrow') return 'drawing-arrow-portion';
    }
    return '';
  };

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {/* SVG positioned to wrap around badge and extend down to arrow */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[35%] w-[320px] h-[280px] md:w-[400px] md:h-[350px]"
        viewBox="0 0 400 350"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
        }}
      >
        <defs>
          {/* Chalk texture filter */}
          <filter id="chalkTextureBadgeArrow" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          {/* Eraser mask */}
          <mask id="eraserMaskBadgeArrow">
            <rect
              x="-20"
              y="-20"
              width="440"
              height="390"
              fill="white"
              className={state === 'erasing' ? 'badge-arrow-eraser-wipe' : ''}
              style={{
                transformOrigin: 'right center',
                transform: state === 'hidden' ? 'scaleX(0)' : 'scaleX(1)',
              }}
            />
          </mask>
        </defs>

        <g filter="url(#chalkTextureBadgeArrow)" mask="url(#eraserMaskBadgeArrow)">
          {/* 
            One continuous path:
            1. Start at bottom center of badge area
            2. Go around the badge (wobbly oval)
            3. Continue into pigtail curls
            4. End with arrow pointing down-right
          */}
          <path
            d="M 200 85
               C 240 87, 290 75, 310 60
               C 340 40, 350 35, 350 50
               C 350 70, 320 90, 280 95
               C 240 100, 160 100, 120 95
               C 80 90, 50 70, 50 50
               C 50 30, 80 25, 120 30
               C 160 35, 200 45, 200 85
               C 200 110, 180 130, 175 150
               C 170 175, 155 180, 160 165
               C 165 150, 185 145, 195 160
               C 205 175, 200 195, 190 205
               C 180 215, 165 210, 175 195
               C 185 180, 210 180, 240 200
               L 300 250"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className={`badge-arrow-path ${state === 'drawing' ? getDrawingClass() : ''} ${state === 'visible' ? 'badge-arrow-visible' : ''}`}
            style={{
              strokeDasharray: 1200,
              strokeDashoffset: state === 'hidden' ? 1200 : state === 'visible' ? 0 : 1200,
            }}
          />

          {/* Arrowhead - V shape, two separate strokes */}
          <path
            d="M 280 235 L 302 252"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className={`arrowhead-line ${state === 'drawing' && phase === 'drawing-arrow' ? 'arrowhead-drawing' : ''} ${state === 'visible' ? 'arrowhead-visible' : ''}`}
            style={{
              strokeDasharray: 30,
              strokeDashoffset: state === 'hidden' ? 30 : state === 'visible' ? 0 : 30,
            }}
          />
          <path
            d="M 302 252 L 290 272"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            className={`arrowhead-line ${state === 'drawing' && phase === 'drawing-arrow' ? 'arrowhead-drawing' : ''} ${state === 'visible' ? 'arrowhead-visible' : ''}`}
            style={{
              strokeDasharray: 30,
              strokeDashoffset: state === 'hidden' ? 30 : state === 'visible' ? 0 : 30,
            }}
          />
        </g>
      </svg>

      <style jsx>{`
        .badge-arrow-path {
          transition: none;
        }

        .badge-arrow-path.drawing-badge-portion {
          animation: drawBadgePortion 1s ease-out forwards;
        }

        .badge-arrow-path.drawing-arrow-portion {
          animation: drawArrowPortion 1.5s ease-out forwards;
        }

        .badge-arrow-path.badge-arrow-visible {
          stroke-dashoffset: 0;
        }

        .arrowhead-line {
          transition: none;
        }

        .arrowhead-line.arrowhead-drawing {
          animation: drawArrowhead 0.2s ease-out 1.4s forwards;
        }

        .arrowhead-line.arrowhead-visible {
          stroke-dashoffset: 0;
        }

        @keyframes drawBadgePortion {
          from {
            stroke-dashoffset: 1200;
          }
          to {
            stroke-dashoffset: 700;
          }
        }

        @keyframes drawArrowPortion {
          from {
            stroke-dashoffset: 700;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawArrowhead {
          from {
            stroke-dashoffset: 30;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .badge-arrow-eraser-wipe {
          animation: eraseWipe 1s ease-in-out forwards;
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
          .badge-arrow-path,
          .arrowhead-line {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          .badge-arrow-eraser-wipe {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
