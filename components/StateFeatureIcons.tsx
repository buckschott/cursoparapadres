'use client';

/**
 * State Page Feature Icons with hand-drawn SVG animations.
 * 
 * All icons use ONLY <path> elements for CSS stroke animation compatibility.
 * The .draw-svg class in globals.css animates stroke-dashoffset.
 * 
 * Icons: Spanish (ES), Phone, Court (Gavel), Email (@)
 */

interface IconProps {
  className?: string;
}

// Spanish icon - "ES" letters in a rounded rectangle frame
export function SpanishIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 1020.3 722.57"
      fill="none"
      className={`draw-svg ${className}`}
      aria-hidden="true"
    >
      {/* E letter - left vertical + top/bottom horizontals (converted from polyline) */}
      <path
        d="M431.82 168.25 L209.7 167.88 L209.88 357.35 L209.6 555.42 L431.82 554.26"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* E letter - middle horizontal (converted from line) */}
      <path
        d="M210.35 355.81 L403.95 355.81"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* S letter */}
      <path
        d="M802.19,205.63c-111.51-86.84-245.54-34.55-243.17,52.28,4,146.66,247.73,53.9,251.06,209.13,1.58,73.68-134.2,145.36-261.65,44.05"
        stroke="currentColor"
        strokeWidth="40"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Rounded rectangle frame */}
      <path
        d="M979.95,712.4q-156.67,0-313.33.16c-156.67,0-156.67-2.09-313.33-2.09s-156.67-.67-313.33-.67c-16.5,0-28.76-12.04-28.76-28.54,0-160-1.2-160-1.2-320s.71-160,.71-320c0-16.5,12.74-29.78,29.24-29.78,156.67,0,156.67-.94,313.33-.94s156.67-.55,313.33-.55,156.67,3.14,313.33,3.14c16.5,0,29.07,11.63,29.07,28.13,0,160,.49,160,.49,320s.79,160,.79,320c0,16.5-13.85,31.14-30.35,31.14Z"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Phone icon - mobile device outline
export function PhoneIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 542.98 1015.9"
      fill="none"
      className={`draw-svg ${className}`}
      aria-hidden="true"
    >
      {/* Inner phone shape */}
      <path
        d="M416.57,990.04c-147.5,0-147.5-.76-295-.76-49.5,0-90.69-39.47-90.69-88.97,0-194.5,1.13-194.5,1.13-389,0-194.5.88-194.5.88-389,0-49.5,39.19-88.32,88.69-88.32,147.5,0,147.5-2.41,295-2.41,49.5,0,91.15,41.24,91.15,90.74,0,194.5-.89,194.5-.89,389,0,194.5-1.79,194.5-1.79,389,0,49.5-38.97,89.73-88.47,89.73Z"
        stroke="currentColor"
        strokeWidth="15"
      />
      {/* Outer phone shape */}
      <path
        d="M423.57,1008.4c-152.5,0-152.5-1.83-305-1.83-60.5,0-109.2-48.77-109.2-109.27,0-195-1.86-195-1.86-390,0-195,1.96-195,1.96-390C9.46,56.81,58.07,7.56,118.57,7.56q152.5,0,305-.06c60.5,0,111.28,49.31,111.28,109.81,0,195,.63,195,.63,390s-3.89,195-3.89,390c0,60.5-47.53,111.1-108.03,111.1Z"
        stroke="currentColor"
        strokeWidth="15"
      />
    </svg>
  );
}

// Court icon - gavel with base
export function CourtIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 1021.09 908.61"
      fill="none"
      className={`draw-svg ${className}`}
      aria-hidden="true"
    >
      {/* Gavel handle/swing */}
      <path
        d="M634.5,363.68c58.54,51.67,117.5,105.11,176.22,158.77,58.74,53.67,116.93,107.9,171.76,163.52,11.52,11.68,23.77,22.73,27.78,38.63,3.89,15.43-6.51,28.17-17.65,39.53-11.15,11.36-25.84,23.28-41.34,19.68-15.41-3.59-25.38-15.05-37.01-25.77-57.3-52.82-112.26-110.83-166.25-169.68-53.97-58.82-106.78-118.8-155.69-179.43"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gavel head - left */}
      <path
        d="M520.76,514.57q-30.27,30.27-60.5,60.59c-3.11,3.11-8.22,2.65-11.33-.46q-105.4-105.4-210.83-210.76c-3.12-3.12-2.94-7.63.19-10.75q30.27-30.27,60.58-60.52c3.11-3.11,8.2-3.91,11.31-.8q105.4,105.4,210.75,210.84c3.11,3.11,2.95,8.75-.17,11.86Z"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gavel head - right */}
      <path
        d="M800.85,234.65c-30.27,30.27-30.57,29.98-60.84,60.25-3.11,3.11-8.51,3.47-11.62.36-105.4-105.4-104.81-105.98-210.21-211.38-3.12-3.12-3.56-8.13-.44-11.25q30.27-30.27,60.52-60.57c3.11-3.11,8.03-2.52,11.14.59q105.4,105.4,210.95,210.65c3.11,3.11,3.62,8.24.51,11.35Z"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Gavel connector lines */}
      <path
        d="M541.77,109.21c-77.16,55.82-151.29,128.29-206.48,207.36"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M705.39,272.81c-57.98,73.83-154.13,170.12-207.28,206.53"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base stand curved part */}
      <path
        d="M522.96,784.28c-4.55-22-16.54-57.78-35.84-71.89-25.8-18.85-72.46-12.14-102.93-12.14-41.26,0-81.4,2.51-122.55,2.51-30.16,0-66.82-3.92-95.21,5.14-34.06,10.86-42.1,43.83-48.34,75.21"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Base platform */}
      <path
        d="M619.56,897.12c-150.48,0-150.48,1.49-300.95,1.49s-150.48-.02-300.95-.02c-3.85,0-7.65-3.4-7.65-7.25,0-46.89.99-46.89.99-93.78,0-3.85,2.81-7.71,6.66-7.71q150.48,0,300.95.17c150.48,0,150.48-.45,300.95-.45,3.85,0,8.15,4.14,8.15,7.99,0,46.89-2.28,46.89-2.28,93.78,0,3.85-2.02,5.78-5.87,5.78Z"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Email icon - @ symbol inside envelope
export function EmailIcon({ className = '' }: IconProps) {
  return (
    <svg
      viewBox="0 0 1020.8 1020.75"
      fill="none"
      className={`draw-svg ${className}`}
      aria-hidden="true"
    >
      {/* Envelope body (converted from polyline) */}
      <path
        d="M151.84 373.27 L10.31 492.39 L10.83 751.13 L10 1010.75 L344.17 1008.81 L677.5 1009.49 L1010.8 1009.62 L1010.4 751.13 L1009.05 493.21 L880.04 371.58"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Envelope flap - V shape (converted from polyline) */}
      <path
        d="M18.07 495.12 L264 640.73 L510.84 784.09 L757.75 642.46 L1003.9 498.83"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom left fold line (converted from polyline) */}
      <path
        d="M15.74 1005.02 L216.27 868.16 L416.92 731.51"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Bottom right fold line (converted from polyline) */}
      <path
        d="M1005.98 1004.94 L807.7 868.32 L609.35 731.81"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Letter/paper inside envelope (converted from polyline) */}
      <path
        d="M152.45 574.04 L153.1 291.85 L153.68 10.28 L510.56 10 L867.45 10.28 L869.26 291.85 L867.66 574.04"
        stroke="currentColor"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* @ symbol - outer swirl */}
      <path
        d="M604.02,555.35c-20.71,6.04-50.03,11.66-88.38,13.05-43.49,1.57-75.82-1.19-107.97-18.51-57.67-31.07-75.61-95.51-82.35-124.41-2.87-12.29-11.71-58.17,1.01-116.1,6.26-28.5,22.27-92.94,85.68-140.54,53.03-39.81,109.08-46.66,127.94-46.66,22.37,0,66.14,2.67,108.66,32.6,43.27,30.46,59.79,71.07,64.99,90.32,13.88,51.37,10.58,89.1,6.85,110.93-7,40.96-21.32,58.75-25.31,63.64-6.34,7.76-18.34,21.72-39.48,28.06-6.72,2.01-26.04,8.25-45.14-.29-32.61-14.58-30.94-53.85-30.35-61.92,1.42-19.22,4.84-29.31,13.12-57.79,7.76-26.7,9.6-35.75,20.35-77.43"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* @ symbol - inner circle */}
      <path
        d="M544.78,245.74c-22.54-6.65-44.99,9.53-52.49,14.8-12.96,9.11-20.03,18.81-28,31.3-24.98,39.17-28.36,69.98-29.34,80.81-1.56,17.16-2.01,32.91,6.33,50.06,3.23,6.65,8.62,19.08,22.55,25.56,25.4,11.82,55.8-10.27,63.41-15.55,17.45-12.1,26.23-24.34,34.01-37.99,11.82-20.72,30.63-53.65,22.41-92.86-1.7-8.12-10.03-47.61-38.88-56.13Z"
        stroke="currentColor"
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ============================================
// STATE FEATURES ARRAY
// Used by StatePageContent.tsx for feature cards
// ============================================

export const STATE_FEATURES = [
  {
    Icon: SpanishIcon,
    title: '100% En Español',
    description: 'Toda la clase está en español — sin traducciones automáticas, sin confusión.',
  },
  {
    Icon: PhoneIcon,
    title: 'Desde Su Teléfono',
    description: 'Complete la clase desde cualquier dispositivo, en cualquier momento.',
  },
  {
    Icon: CourtIcon,
    title: 'Aceptado por Tribunales',
    description: 'Nuestro certificado es aceptado por tribunales en todo el país.',
  },
  {
    Icon: EmailIcon,
    title: 'Certificado Instantáneo',
    description: 'Reciba su certificado por correo electrónico inmediatamente al terminar.',
  },
];
