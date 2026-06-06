import type { BreathPhase, PatternSlug, PatternTiming } from "@/types";

export const PATTERN_TIMINGS: Record<PatternSlug, PatternTiming> = {
  box: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
  "4-7-8": { inhale: 4, hold: 7, exhale: 8, holdAfterExhale: 0 },
  "wim-hof": { inhale: 2, hold: 0, exhale: 1, holdAfterExhale: 15 },
};

export const PHASE_ORDER: BreathPhase[] = [
  "inhale",
  "hold",
  "exhale",
  "holdAfterExhale",
];

export function getPhaseDuration(timing: PatternTiming, phase: BreathPhase): number {
  switch (phase) {
    case "inhale":
      return timing.inhale;
    case "hold":
      return timing.hold;
    case "exhale":
      return timing.exhale;
    case "holdAfterExhale":
      return timing.holdAfterExhale;
    default:
      return 0;
  }
}

export function getNextPhase(
  current: BreathPhase,
  timing: PatternTiming,
): BreathPhase | "cycleComplete" {
  const activePhases = PHASE_ORDER.filter((p) => getPhaseDuration(timing, p) > 0);
  const idx = activePhases.indexOf(current);
  if (idx === -1 || idx === activePhases.length - 1) {
    return "cycleComplete";
  }
  return activePhases[idx + 1];
}

export function getPhaseLabel(phase: BreathPhase): string {
  const labels: Record<BreathPhase, string> = {
    inhale: "Breathe In",
    hold: "Hold",
    exhale: "Breathe Out",
    holdAfterExhale: "Hold Empty",
    rest: "Rest",
  };
  return labels[phase];
}

export function calculateSessionDuration(timing: PatternTiming, cycles: number): number {
  const cycleDuration = PHASE_ORDER.reduce(
    (sum, phase) => sum + getPhaseDuration(timing, phase),
    0,
  );
  return cycleDuration * cycles;
}

export function generateSimulatedHRV(baseHrv = 45): number {
  const noise = (Math.random() - 0.5) * 20;
  return Math.round((baseHrv + noise) * 10) / 10;
}

export function generateSimulatedHeartRate(baseHr = 72): number {
  const noise = (Math.random() - 0.5) * 10;
  return Math.round((baseHr + noise) * 10) / 10;
}
