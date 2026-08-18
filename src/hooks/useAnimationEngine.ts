import { useCallback, useEffect, useRef, useState } from "react";

export interface AnimationEngine {
  step: number;
  total: number;
  playing: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  goTo: (step: number) => void;
}

/**
 * Shared animation engine used by every visualizer so all step-through
 * controls behave identically.
 */
export function useAnimationEngine(total: number, options?: { baseInterval?: number }): AnimationEngine {
  const baseInterval = options?.baseInterval ?? 700;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const totalRef = useRef(total);
  totalRef.current = total;

  useEffect(() => {
    setStep((s) => (s >= total ? Math.max(0, total - 1) : s));
  }, [total]);

  useEffect(() => {
    if (!playing || total <= 1) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        if (s >= totalRef.current - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, baseInterval / speed);
    return () => window.clearInterval(id);
  }, [playing, speed, total, baseInterval]);

  const play = useCallback(() => {
    setStep((s) => (s >= totalRef.current - 1 ? 0 : s));
    setPlaying(true);
  }, []);
  const pause = useCallback(() => setPlaying(false), []);
  const toggle = useCallback(() => (playing ? pause() : play()), [playing, pause, play]);
  const next = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.min(totalRef.current - 1, s + 1));
  }, []);
  const previous = useCallback(() => {
    setPlaying(false);
    setStep((s) => Math.max(0, s - 1));
  }, []);
  const reset = useCallback(() => {
    setPlaying(false);
    setStep(0);
  }, []);
  const goTo = useCallback((s: number) => {
    setPlaying(false);
    setStep(Math.max(0, Math.min(totalRef.current - 1, s)));
  }, []);

  return { step, total, playing, speed, play, pause, toggle, next, previous, reset, setSpeed, goTo };
}
