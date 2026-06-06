import { useCallback, useEffect, useRef, useState } from "react";

import type { BreathPhase, PatternSlug } from "@/types";
import {
  getNextPhase,
  getPhaseDuration,
  getPhaseLabel,
  PATTERN_TIMINGS,
  PHASE_ORDER,
} from "@/utils/breathing";

export type SessionStatus = "idle" | "running" | "paused" | "completed";

interface BreathingEngineState {
  status: SessionStatus;
  currentPhase: BreathPhase;
  phaseTimeRemaining: number;
  currentCycle: number;
  totalCycles: number;
  elapsedSeconds: number;
}

interface UseBreathingEngineOptions {
  pattern: PatternSlug;
  cycles?: number;
  onCycleComplete?: (cycle: number) => void;
  onSessionComplete?: (stats: { duration: number; cycles: number }) => void;
  enableAudio?: boolean;
}

function playTone(frequency: number, duration: number, volume = 0.1) {
  try {
    const ctx = new AudioContext();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

export function useBreathingEngine({
  pattern,
  cycles = 4,
  onCycleComplete,
  onSessionComplete,
  enableAudio = true,
}: UseBreathingEngineOptions) {
  const timing = PATTERN_TIMINGS[pattern];
  const activePhases = PHASE_ORDER.filter((p) => getPhaseDuration(timing, p) > 0);
  const firstPhase = activePhases[0] ?? "inhale";

  const [state, setState] = useState<BreathingEngineState>({
    status: "idle",
    currentPhase: firstPhase,
    phaseTimeRemaining: getPhaseDuration(timing, firstPhase),
    currentCycle: 1,
    totalCycles: cycles,
    elapsedSeconds: 0,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPhaseRef = useRef<BreathPhase>(firstPhase);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setState({
      status: "idle",
      currentPhase: firstPhase,
      phaseTimeRemaining: getPhaseDuration(timing, firstPhase),
      currentCycle: 1,
      totalCycles: cycles,
      elapsedSeconds: 0,
    });
    prevPhaseRef.current = firstPhase;
  }, [clearTimer, cycles, firstPhase, timing]);

  const advancePhase = useCallback(() => {
    setState((prev) => {
      const next = getNextPhase(prev.currentPhase, timing);

      if (next === "cycleComplete") {
        onCycleComplete?.(prev.currentCycle);

        if (prev.currentCycle >= prev.totalCycles) {
          clearTimer();
          onSessionComplete?.({
            duration: prev.elapsedSeconds,
            cycles: prev.totalCycles,
          });
          return { ...prev, status: "completed" as const };
        }

        const nextPhase = firstPhase;
        return {
          ...prev,
          currentCycle: prev.currentCycle + 1,
          currentPhase: nextPhase,
          phaseTimeRemaining: getPhaseDuration(timing, nextPhase),
        };
      }

      const duration = getPhaseDuration(timing, next);
      return {
        ...prev,
        currentPhase: next,
        phaseTimeRemaining: duration,
      };
    });
  }, [clearTimer, firstPhase, onCycleComplete, onSessionComplete, timing]);

  const start = useCallback(() => {
    clearTimer();
    setState((prev) => ({
      ...prev,
      status: "running",
      currentPhase: firstPhase,
      phaseTimeRemaining: getPhaseDuration(timing, firstPhase),
      currentCycle: 1,
      elapsedSeconds: 0,
    }));
    prevPhaseRef.current = firstPhase;
  }, [clearTimer, firstPhase, timing]);

  const pause = useCallback(() => {
    clearTimer();
    setState((prev) => ({ ...prev, status: "paused" }));
  }, [clearTimer]);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, status: "running" }));
  }, []);

  useEffect(() => {
    if (state.status !== "running") return;

    intervalRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.phaseTimeRemaining > 1) {
          return {
            ...prev,
            phaseTimeRemaining: prev.phaseTimeRemaining - 1,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        }
        return {
          ...prev,
          phaseTimeRemaining: 0,
          elapsedSeconds: prev.elapsedSeconds + 1,
        };
      });
    }, 1000);

    return clearTimer;
  }, [state.status, clearTimer]);

  useEffect(() => {
    if (state.status !== "running" || state.phaseTimeRemaining > 0) return;
    advancePhase();
  }, [state.phaseTimeRemaining, state.status, advancePhase]);

  useEffect(() => {
    if (!enableAudio || state.status !== "running") return;
    if (prevPhaseRef.current !== state.currentPhase) {
      const freqs: Record<BreathPhase, number> = {
        inhale: 440,
        hold: 523,
        exhale: 349,
        holdAfterExhale: 294,
        rest: 262,
      };
      playTone(freqs[state.currentPhase], 0.15);
      prevPhaseRef.current = state.currentPhase;
    }
  }, [state.currentPhase, state.status, enableAudio]);

  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const progress =
    state.totalCycles > 0
      ? ((state.currentCycle - 1) / state.totalCycles) * 100 +
        (1 / state.totalCycles) *
          (1 -
            state.phaseTimeRemaining /
              Math.max(getPhaseDuration(timing, state.currentPhase), 1)) *
          100
      : 0;

  return {
    ...state,
    phaseLabel: getPhaseLabel(state.currentPhase),
    progress: Math.min(progress, 100),
    start,
    pause,
    resume,
    reset,
  };
}
