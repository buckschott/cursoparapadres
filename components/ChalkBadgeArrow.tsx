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
        className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[-15%] w-[350px] h-[450px] md:w-[450px] md:h-[550px]"
        viewBox="0 0 450 550"
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
              height="590"
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
            1. Start at bottom-left of badge area
            2. Go counterclockwise around badge (almost closed circle)
            3. End near start point (small gap)
            4. Continue into first pigtail curl
            5. Second pigtail curl  
            6. Line going down toward CTA
            7. Triangle arrowhead pointing DOWN (connected triangle)
               - Go to left point
               - Go to bottom point (tip pointing at CTA)
               - Go to right point
               - Return to start of triangle to close it
          */}
          <path
            d="M 175 75
               C 120 70, 60 55, 45 35
               C 30 15, 50 0, 120 0
               C 200 0, 320 0, 380 0
               C 420 0, 430 20, 415 40
               C 395 65, 330 75, 275 78
               
               C 275 100, 290 120, 285 145
               C 280 170, 260 175, 265 155
               C 270 135, 295 135, 300 155
               C 305 175, 290 195, 275 200
               C 260 205, 255 190, 270 180
               
               L 250 320
               
               L 210 380
               L 250 440
               L 290 380
               L 210 380"
            stroke="#FFFFFF"
            strokeWidth="3"
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
            stroke-dashoffset: 1000;
          }
        }

        @keyframes drawArrowPortion {
          from {
            stroke-dashoffset: 1000;
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
