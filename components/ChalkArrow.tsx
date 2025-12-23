'use client';

import { useChalkAnimation } from './ChalkAnimationContext';

export default function ChalkArrow() {
  const { phase, reducedMotion } = useChalkAnimation();

  // Determine arrow visibility based on current phase
  const getArrowState = () => {
    if (reducedMotion) return 'visible';

    if (phase === 'drawing-arrow') return 'drawing';
    if (['holding-all', 'erasing-title', 'erasing-subtext', 'erasing-badge'].includes(phase)) return 'visible';
    if (phase === 'erasing-arrow') return 'erasing';
    return 'hidden';
  };

  const arrowState = getArrowState();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      {/* Position the arrow above the CTA button */}
      <div className="absolute left-1/2 top-0 -translate-x-[75%] -translate-y-[95%] w-[160px] h-[130px] md:w-[200px] md:h-[160px]">
        <svg
          viewBox="0 0 200 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 1px rgba(255,255,255,0.3))',
          }}
        >
          <defs>
            {/* Chalk texture filter */}
            <filter id="chalkTextureArrow" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
            </filter>

            {/* Eraser mask */}
            <mask id="eraserMaskArrow">
              <rect
                x="-10"
                y="-10"
                width="220"
                height="180"
                fill="white"
                className={arrowState === 'erasing' ? 'arrow-eraser-wipe' : ''}
                style={{
                  transformOrigin: 'right center',
                  transform: arrowState === 'hidden' ? 'scaleX(0)' : 'scaleX(1)',
                }}
              />
            </mask>
          </defs>

          <g filter="url(#chalkTextureArrow)" mask="url(#eraserMaskArrow)">
            {/* Main arrow path with pigtail curls - starts top left, curls down */}
            <path
              d="M 25 15
                 C 35 25, 42 45, 38 62
                 C 34 80, 18 82, 22 65
                 C 26 48, 50 45, 62 58
                 C 74 71, 70 92, 62 100
                 C 54 108, 42 104, 50 90
                 C 58 76, 85 72, 115 85
                 L 165 120"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className={`chalk-arrow-line ${arrowState === 'drawing' ? 'arrow-drawing' : ''} ${arrowState === 'visible' ? 'arrow-visible' : ''}`}
              style={{
                strokeDasharray: 450,
                strokeDashoffset: arrowState === 'hidden' ? 450 : arrowState === 'drawing' ? 450 : 0,
              }}
            />

            {/* Hand-drawn V arrowhead */}
            <path
              d="M 150 108 L 168 122"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className={`chalk-arrowhead ${arrowState === 'drawing' ? 'arrowhead-drawing' : ''} ${arrowState === 'visible' ? 'arrowhead-visible' : ''}`}
              style={{
                strokeDasharray: 25,
                strokeDashoffset: arrowState === 'hidden' ? 25 : arrowState === 'drawing' ? 25 : 0,
              }}
            />
            <path
              d="M 168 122 L 160 138"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              className={`chalk-arrowhead ${arrowState === 'drawing' ? 'arrowhead-drawing' : ''} ${arrowState === 'visible' ? 'arrowhead-visible' : ''}`}
              style={{
                strokeDasharray: 25,
                strokeDashoffset: arrowState === 'hidden' ? 25 : arrowState === 'drawing' ? 25 : 0,
              }}
            />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .chalk-arrow-line {
          transition: none;
        }

        .chalk-arrow-line.arrow-drawing {
          animation: drawArrowLine 1.3s ease-out forwards;
        }

        .chalk-arrow-line.arrow-visible {
          stroke-dashoffset: 0;
        }

        .chalk-arrowhead {
          transition: none;
        }

        .chalk-arrowhead.arrowhead-drawing {
          animation: drawArrowhead 0.2s ease-out 1.3s forwards;
        }

        .chalk-arrowhead.arrowhead-visible {
          stroke-dashoffset: 0;
        }

        @keyframes drawArrowLine {
          from {
            stroke-dashoffset: 450;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawArrowhead {
          from {
            stroke-dashoffset: 25;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .arrow-eraser-wipe {
          animation: eraseArrow 0.6s ease-in-out forwards;
        }

        @keyframes eraseArrow {
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
          .chalk-arrow-line,
          .chalk-arrowhead {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          .arrow-eraser-wipe {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
