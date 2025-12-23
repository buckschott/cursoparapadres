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
            One continuous path matching the hand drawing:
            1. Start from upper left
            2. Swoop loosely around/over the badge (not a tight circle)
            3. Exit lower right of badge
            4. First pigtail curl
            5. Second pigtail curl  
            6. Line going down toward CTA
            7. Triangle arrowhead (3 connected lines pointing DOWN)
          */}
          <path
            d="M 50 60
               C 30 40, 50 10, 150 5
               C 280 0, 400 10, 420 50
               C 440 90, 380 100, 320 95
               C 280 92, 260 100, 280 130
               
               C 290 160, 260 175, 255 155
               C 250 135, 275 130, 285 150
               C 295 170, 280 195, 265 200
               C 250 205, 245 190, 260 180
               
               L 240 280
               
               L 200 320
               L 240 280
               L 280 320"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className={`badge-arrow-path ${state === 'drawing' ? getDrawingClass() : ''} ${state === 'visible' ? 'badge-arrow-visible' : ''}`}
            style={{
              strokeDasharray: 1600,
              strokeDashoffset: state === 'hidden' ? 1600 : state === 'visible' ? 0 : 1600,
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
            stroke-dashoffset: 1600;
          }
          to {
            stroke-dashoffset: 900;
          }
        }

        @keyframes drawArrowPortion {
          from {
            stroke-dashoffset: 900;
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
