import type { BreathPhase } from "@/types";
import { cn } from "@/utils/cn";

interface BreathingRingProps {
  phase: BreathPhase;
  phaseTimeRemaining: number;
  phaseDuration: number;
  progress: number;
  phaseLabel: string;
}

const phaseAnimation: Record<BreathPhase, string> = {
  inhale: "animate-pulse-slow",
  hold: "animate-pulse-medium",
  exhale: "animate-pulse-fast",
  holdAfterExhale: "animate-pulse-medium",
  rest: "animate-pulse-slow",
};

export function BreathingRing({
  phase,
  phaseTimeRemaining,
  phaseDuration,
  progress,
  phaseLabel,
}: BreathingRingProps) {
  const scale =
    phase === "inhale"
      ? 1 + (1 - phaseTimeRemaining / Math.max(phaseDuration, 1)) * 0.15
      : phase === "exhale"
        ? 1.15 - (1 - phaseTimeRemaining / Math.max(phaseDuration, 1)) * 0.15
        : 1.08;

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      role="timer"
      aria-live="polite"
      aria-label={`${phaseLabel}, ${phaseTimeRemaining} seconds remaining`}
    >
      <div
        className={cn(
          "relative flex h-64 w-64 items-center justify-center rounded-full md:h-80 md:w-80",
          phaseAnimation[phase],
        )}
        style={{ transform: `scale(${scale})`, transition: "transform 1s ease-in-out" }}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20" />
        <div className="absolute inset-4 rounded-full border-2 border-primary/30" />
        <div
          className="absolute inset-0 rounded-full border-4 border-primary"
          style={{
            clipPath: `polygon(0 0, 100% 0, 100% ${progress}%, 0 ${progress}%)`,
            opacity: 0.4,
          }}
        />
        <div className="relative z-10 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {phaseLabel}
          </p>
          <p className="mt-2 text-6xl font-bold tabular-nums text-foreground">
            {phaseTimeRemaining}
          </p>
        </div>
      </div>
    </div>
  );
}
