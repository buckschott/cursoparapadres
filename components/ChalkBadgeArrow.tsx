'use client';

import { useChalkAnimation } from './ChalkAnimationContext';

export default function ChalkBadgeArrow() {
  const { phase, reducedMotion } = useChalkAnimation();

  const getState = () => {
    if (reducedMotion) return 'visible';

    if (phase === 'drawing-badge' || phase === 'drawing-arrow') return 'drawing';
    if (['holding-all', 'erasing-title', 'erasing-subtext'].includes(phase)) return 'visible';
    if (phase === 'erasing-badge-arrow') return 'erasing';
    return 'hidden';
  };

  const state = getState();

  const getDrawingClass = () => {
    if (state === 'drawing') {
      if (phase === 'drawing-badge') return 'drawing-badge-portion';
      if (phase === 'drawing-arrow') return 'drawing-arrow-portion';
    }
    return '';
  };

  /*
    Path breakdown (matching reference images):
    
    1. OVAL around badge (counterclockwise from bottom-left gap):
       - Start at M 80 55 (bottom-left, creates gap)
       - Curve up left side to top-left
       - Curve across top to top-right  
       - Curve down right side to bottom-right
       - Curve along bottom toward start (but don't close - leave gap)
       - Exit point around x:200, y:60
    
    2. EXIT from oval bottom-right, curve down:
       - Smooth transition from oval into downward stroke
    
    3. ONE PIGTAIL CURL:
       - Curve left and loop back (like a "q" descender)
       - Single curl, not multiple
    
    4. CONTINUE DOWN toward CTA
    
    5. TRIANGLE pointing DOWN:
       - Left corner, bottom tip, right corner, back to left
       - Hand-drawn feel (slightly imperfect)
  */

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      <svg
        className="absolute left-1/2 -translate-x-1/2 w-[320px] h-[380px] md:w-[400px] md:h-[450px]"
        style={{
          top: '-60px', // Position so oval wraps the badge
          filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
        }}
        viewBox="0 0 300 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
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
              width="340"
              height="420"
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
          <path
            d={`
              M 70 62
              C 40 55, 20 45, 18 30
              C 16 12, 50 5, 100 5
              L 200 5
              C 250 5, 285 12, 283 30
              C 281 48, 255 58, 220 62
              C 200 65, 180 66, 175 68
              
              C 172 85, 175 100, 168 115
              C 160 135, 140 140, 145 120
              C 150 100, 165 105, 158 130
              
              L 152 250
              
              L 110 295
              L 150 350
              L 190 295
              Z
            `}
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
