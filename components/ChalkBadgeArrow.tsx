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
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      {/* SVG positioned to wrap around badge and extend down to CTA */}
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[30%] w-[350px] h-[400px] md:w-[450px] md:h-[500px]"
        viewBox="0 0 450 500"
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
              width="490"
              height="540"
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
            One continuous path - no breaks:
            1. Start at bottom center of badge
            2. Go LEFT and UP around the badge (counterclockwise)
            3. Come back to bottom (open circle, doesn't close completely)
            4. From bottom, continue into first pigtail curl
            5. Second pigtail curl
            6. Straight-ish line pointing down toward CTA
            7. Triangle arrowhead (3 lines connected, pointing DOWN)
          */}
          <path
            d="M 225 95
               C 180 98, 120 95, 80 75
               C 50 58, 40 40, 55 25
               C 75 8, 130 0, 225 0
               C 320 0, 375 8, 395 25
               C 410 40, 400 58, 370 75
               C 330 95, 270 98, 235 95
               
               C 235 120, 200 140, 195 165
               C 190 190, 175 195, 180 175
               C 185 155, 210 150, 220 170
               C 230 190, 220 215, 210 225
               C 200 235, 185 230, 195 215
               C 205 200, 230 200, 250 220
               L 270 280
               L 225 350
               L 225 320
               L 270 280
               L 225 280"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className={`badge-arrow-path ${state === 'drawing' ? getDrawingClass() : ''} ${state === 'visible' ? 'badge-arrow-visible' : ''}`}
            style={{
              strokeDasharray: 1800,
              strokeDashoffset: state === 'hidden' ? 1800 : state === 'visible' ? 0 : 1800,
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

        @keyframes drawBadgePortion {
          from {
            stroke-dashoffset: 1800;
          }
          to {
            stroke-dashoffset: 1100;
          }
        }

        @keyframes drawArrowPortion {
          from {
            stroke-dashoffset: 1100;
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
          .badge-arrow-path {
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
