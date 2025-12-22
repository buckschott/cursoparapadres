'use client';

import { useEffect, useState } from 'react';

export default function ChalkArrow() {
  const [animationState, setAnimationState] = useState<'drawing' | 'holding' | 'erasing' | 'paused'>('drawing');
  
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setAnimationState('holding'); // Just show static arrow
      return;
    }

    const runAnimation = () => {
      setAnimationState('drawing');
      
      // Drawing takes 3 seconds
      setTimeout(() => {
        setAnimationState('holding');
      }, 3000);
      
      // Hold for 3 seconds, then erase
      setTimeout(() => {
        setAnimationState('erasing');
      }, 6000);
      
      // Erasing takes 1 second, then pause
      setTimeout(() => {
        setAnimationState('paused');
      }, 7000);
      
      // Pause for 1 second, then restart
      setTimeout(() => {
        runAnimation();
      }, 8000);
    };

    runAnimation();
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible" aria-hidden="true">
      {/* Position the arrow above and to the right of center, pointing to right side of CTA */}
      <div className="absolute left-1/2 bottom-0 -translate-x-[10%] translate-y-[-100%] w-[200px] h-[150px] md:w-[280px] md:h-[200px]">
        <svg
          viewBox="0 0 280 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          style={{
            filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.3))',
          }}
        >
          <defs>
            {/* Eraser mask - reveals from right to left (erases left to right) */}
            <mask id="eraserMask">
              <rect
                x="0"
                y="0"
                width="280"
                height="200"
                fill="white"
                className={`
                  ${animationState === 'erasing' ? 'eraser-wipe' : ''}
                  ${animationState === 'paused' ? 'eraser-complete' : ''}
                `}
                style={{
                  transformOrigin: 'left center',
                }}
              />
            </mask>
            
            {/* Chalk texture filter for hand-drawn feel */}
            <filter id="chalkTexture" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          
          <g mask="url(#eraserMask)" filter="url(#chalkTexture)">
            {/* Main arrow path with pigtail curls */}
            {/* Path: starts top-center, first pigtail curl, second pigtail curl, swoops to bottom-right */}
            <path
              d="M 80 15
                 C 85 25, 90 40, 85 55
                 C 80 75, 55 80, 50 60
                 C 45 40, 55 25, 75 35
                 C 95 45, 105 70, 100 90
                 C 95 115, 70 125, 65 105
                 C 60 85, 75 70, 100 80
                 C 125 90, 150 110, 175 135
                 C 200 155, 225 170, 250 180"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              className={`chalk-line ${animationState === 'drawing' ? 'drawing' : ''} ${animationState === 'holding' || animationState === 'erasing' ? 'drawn' : ''}`}
              style={{
                strokeDasharray: 600,
                strokeDashoffset: animationState === 'paused' ? 600 : undefined,
              }}
            />
            
            {/* Arrowhead - two lines forming the point */}
            <path
              d="M 235 168 L 255 182"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              className={`chalk-line arrowhead ${animationState === 'drawing' ? 'drawing-arrowhead' : ''} ${animationState === 'holding' || animationState === 'erasing' ? 'drawn' : ''}`}
              style={{
                strokeDasharray: 30,
                strokeDashoffset: animationState === 'paused' ? 30 : undefined,
              }}
            />
            <path
              d="M 248 195 L 255 182"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              className={`chalk-line arrowhead ${animationState === 'drawing' ? 'drawing-arrowhead' : ''} ${animationState === 'holding' || animationState === 'erasing' ? 'drawn' : ''}`}
              style={{
                strokeDasharray: 30,
                strokeDashoffset: animationState === 'paused' ? 30 : undefined,
              }}
            />
          </g>
        </svg>
      </div>

      <style jsx>{`
        .chalk-line {
          stroke-dashoffset: 600;
        }
        
        .chalk-line.drawing {
          animation: drawLine 2.5s ease-out forwards;
        }
        
        .chalk-line.drawn {
          stroke-dashoffset: 0;
        }
        
        .arrowhead {
          stroke-dashoffset: 30;
        }
        
        .arrowhead.drawing-arrowhead {
          animation: drawArrowhead 0.4s ease-out 2.5s forwards;
        }
        
        .arrowhead.drawn {
          stroke-dashoffset: 0;
        }
        
        @keyframes drawLine {
          from {
            stroke-dashoffset: 600;
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
        
        .eraser-wipe {
          animation: eraseWipe 1s ease-in-out forwards;
        }
        
        .eraser-complete {
          transform: scaleX(0);
          transform-origin: right center;
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
          .chalk-line,
          .arrowhead {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          .eraser-wipe {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
