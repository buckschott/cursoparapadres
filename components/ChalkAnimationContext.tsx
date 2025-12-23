'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AnimationPhase = 
  | 'idle'
  | 'drawing-title'
  | 'holding-title'
  | 'drawing-subtext'
  | 'holding-subtext'
  | 'drawing-badge'
  | 'drawing-arrow'
  | 'holding-all'
  | 'erasing-title'
  | 'erasing-subtext'
  | 'erasing-badge'
  | 'erasing-arrow'
  | 'paused';

interface ChalkAnimationContextType {
  phase: AnimationPhase;
  reducedMotion: boolean;
}

const ChalkAnimationContext = createContext<ChalkAnimationContextType>({
  phase: 'idle',
  reducedMotion: false,
});

export function useChalkAnimation() {
  return useContext(ChalkAnimationContext);
}

// Timing configuration (in milliseconds)
const TIMING = {
  drawTitle: 1200,
  holdTitle: 800,
  drawSubtext: 1200,
  holdSubtext: 800,
  drawBadge: 1000,
  drawArrow: 1500,      // Badge and arrow are continuous
  holdAll: 3000,
  eraseTitle: 600,
  eraseSubtext: 600,
  eraseBadge: 600,
  eraseArrow: 600,
  pauseBeforeRepeat: 1500,
};

export function ChalkAnimationProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);
    
    if (prefersReducedMotion) {
      setPhase('holding-all'); // Show all elements static
      return;
    }

    const runAnimation = () => {
      let elapsed = 0;

      // Phase 1: Draw title
      setPhase('drawing-title');
      elapsed += TIMING.drawTitle;

      // Phase 2: Hold title
      setTimeout(() => setPhase('holding-title'), elapsed);
      elapsed += TIMING.holdTitle;

      // Phase 3: Draw subtext
      setTimeout(() => setPhase('drawing-subtext'), elapsed);
      elapsed += TIMING.drawSubtext;

      // Phase 4: Hold subtext
      setTimeout(() => setPhase('holding-subtext'), elapsed);
      elapsed += TIMING.holdSubtext;

      // Phase 5: Draw badge (continuous into arrow)
      setTimeout(() => setPhase('drawing-badge'), elapsed);
      elapsed += TIMING.drawBadge;

      // Phase 6: Draw arrow (immediately after badge, no hold)
      setTimeout(() => setPhase('drawing-arrow'), elapsed);
      elapsed += TIMING.drawArrow;

      // Phase 7: Hold everything
      setTimeout(() => setPhase('holding-all'), elapsed);
      elapsed += TIMING.holdAll;

      // Phase 8: Erase title
      setTimeout(() => setPhase('erasing-title'), elapsed);
      elapsed += TIMING.eraseTitle;

      // Phase 9: Erase subtext
      setTimeout(() => setPhase('erasing-subtext'), elapsed);
      elapsed += TIMING.eraseSubtext;

      // Phase 10: Erase badge
      setTimeout(() => setPhase('erasing-badge'), elapsed);
      elapsed += TIMING.eraseBadge;

      // Phase 11: Erase arrow
      setTimeout(() => setPhase('erasing-arrow'), elapsed);
      elapsed += TIMING.eraseArrow;

      // Phase 12: Pause
      setTimeout(() => setPhase('paused'), elapsed);
      elapsed += TIMING.pauseBeforeRepeat;

      // Restart
      setTimeout(() => runAnimation(), elapsed);
    };

    // Start after a brief delay
    const startTimeout = setTimeout(runAnimation, 500);

    return () => clearTimeout(startTimeout);
  }, []);

  return (
    <ChalkAnimationContext.Provider value={{ phase, reducedMotion }}>
      {children}
    </ChalkAnimationContext.Provider>
  );
}
