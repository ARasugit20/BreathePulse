import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { BreathingRing } from "@/components/BreathingRing";
import { PatternSelector } from "@/components/PatternSelector";
import { SessionNotesDialog } from "@/components/SessionNotesDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useBreathingEngine } from "@/hooks/useBreathingEngine";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import { useSessionStore } from "@/stores/sessionStore";
import {
  generateSimulatedHeartRate,
  generateSimulatedHRV,
  getPhaseDuration,
  PATTERN_TIMINGS,
} from "@/utils/breathing";

export function HomePage() {
  const { selectedPattern, cycles, audioEnabled, setPattern, setCycles, setAudioEnabled } =
    useSessionStore();
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const timing = PATTERN_TIMINGS[selectedPattern];

  const [pendingStats, setPendingStats] = useState<{ duration: number; cycles: number } | null>(
    null,
  );
  const [showNotesDialog, setShowNotesDialog] = useState(false);

  const saveSession = useMutation({
    mutationFn: (data: Parameters<typeof api.createSession>[0]) => api.createSession(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Session saved!");
      setPendingStats(null);
      setShowNotesDialog(false);
    },
    onError: () => toast.error("Failed to save session"),
  });

  const submitSession = useCallback(
    (stats: { duration: number; cycles: number }, notes?: string) => {
      saveSession.mutate({
        pattern_slug: selectedPattern,
        duration_seconds: stats.duration,
        cycles_completed: stats.cycles,
        avg_heart_rate: generateSimulatedHeartRate(),
        hrv_ms: generateSimulatedHRV(),
        notes,
      });
    },
    [saveSession, selectedPattern],
  );

  const onSessionComplete = useCallback((stats: { duration: number; cycles: number }) => {
    setPendingStats(stats);
    setShowNotesDialog(true);
  }, []);

  const engine = useBreathingEngine({
    pattern: selectedPattern,
    cycles,
    enableAudio: audioEnabled,
    onSessionComplete,
  });

  useKeyboardShortcuts({
    enabled: !showNotesDialog,
    onStart: engine.status === "idle" ? engine.start : undefined,
    onResume: engine.status === "paused" ? engine.resume : undefined,
    onPause: engine.status === "running" ? engine.pause : undefined,
    onReset:
      engine.status === "paused" || engine.status === "completed" ? engine.reset : undefined,
  });

  const phaseDuration = getPhaseDuration(timing, engine.currentPhase);
  const isActive = engine.status === "running" || engine.status === "paused";

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <SessionNotesDialog
        open={showNotesDialog}
        onSave={(notes) => pendingStats && submitSession(pendingStats, notes || undefined)}
        onSkip={() => pendingStats && submitSession(pendingStats)}
      />

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Guided Breathing</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a pattern, set your cycles, and breathe with the visual guide
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Shortcuts: Space/Enter to start · P to pause · Esc to reset
        </p>
      </div>

      {!isActive && (
        <Card>
          <CardHeader>
            <CardTitle>Select Pattern</CardTitle>
            <CardDescription>Each technique targets different wellness goals</CardDescription>
          </CardHeader>
          <CardContent>
            <PatternSelector
              selected={selectedPattern}
              onSelect={setPattern}
              disabled={isActive}
            />
            <div className="mt-6 flex items-center gap-4">
              <label htmlFor="cycles" className="text-sm font-medium">
                Cycles
              </label>
              <input
                id="cycles"
                type="range"
                min={1}
                max={10}
                value={cycles}
                onChange={(e) => setCycles(Number(e.target.value))}
                className="flex-1"
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={cycles}
              />
              <span className="w-8 text-center font-mono">{cycles}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAudioEnabled(!audioEnabled)}
                aria-label={audioEnabled ? "Mute audio cues" : "Enable audio cues"}
              >
                {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col items-center gap-6">
        <BreathingRing
          phase={engine.currentPhase}
          phaseTimeRemaining={engine.phaseTimeRemaining}
          phaseDuration={phaseDuration}
          progress={engine.progress}
          phaseLabel={engine.phaseLabel}
        />

        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Cycle {engine.currentCycle} of {engine.totalCycles}
            </span>
            <span>{Math.round(engine.elapsedSeconds)}s elapsed</span>
          </div>
          <Progress value={engine.progress} aria-label="Session progress" />
        </div>

        <div className="flex gap-3">
          {engine.status === "idle" && (
            <Button size="lg" onClick={engine.start} aria-label="Start breathing session">
              <Play className="h-5 w-5" />
              Start Session
            </Button>
          )}
          {engine.status === "running" && (
            <Button size="lg" variant="secondary" onClick={engine.pause} aria-label="Pause session">
              <Pause className="h-5 w-5" />
              Pause
            </Button>
          )}
          {engine.status === "paused" && (
            <Button size="lg" onClick={engine.resume} aria-label="Resume session">
              <Play className="h-5 w-5" />
              Resume
            </Button>
          )}
          {(engine.status === "completed" || engine.status === "paused") && (
            <Button size="lg" variant="outline" onClick={engine.reset} aria-label="Reset session">
              <RotateCcw className="h-5 w-5" />
              Reset
            </Button>
          )}
        </div>

        {engine.status === "completed" && !showNotesDialog && (
          <p className="text-center text-accent font-medium" role="status">
            Session complete! Great work — your progress has been saved.
          </p>
        )}
      </div>
    </div>
  );
}
