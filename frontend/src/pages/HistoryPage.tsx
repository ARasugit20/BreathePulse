import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Clock, Heart, Trash2, Waves } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";
import type { BreathingSession, PatternSlug } from "@/types";
import { cn } from "@/utils/cn";

const PATTERN_LABELS: Record<PatternSlug, string> = {
  box: "Box Breathing",
  "4-7-8": "4-7-8",
  "wim-hof": "Wim Hof",
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function SessionCard({
  session,
  onDelete,
  isDeleting,
}: {
  session: BreathingSession;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 pt-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {PATTERN_LABELS[session.pattern_slug]}
            </span>
            <span className="text-sm text-muted-foreground">
              {format(parseISO(session.completed_at), "MMM d, yyyy · h:mm a")}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              {formatDuration(session.duration_seconds)}
            </span>
            <span>{session.cycles_completed} cycles</span>
            {session.avg_heart_rate && (
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {session.avg_heart_rate} BPM
              </span>
            )}
            {session.hrv_ms && (
              <span className="flex items-center gap-1">
                <Waves className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                {session.hrv_ms} ms HRV
              </span>
            )}
          </div>
          {session.notes && (
            <p className="text-sm text-muted-foreground italic">"{session.notes}"</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(session.id)}
          disabled={isDeleting}
          aria-label={`Delete session from ${format(parseISO(session.completed_at), "MMM d")}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function HistoryPage() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<PatternSlug | "all">("all");

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => api.getSessions(token),
  });

  const deleteSession = useMutation({
    mutationFn: (id: string) => api.deleteSession(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      toast.success("Session deleted");
    },
    onError: () => toast.error("Failed to delete session"),
  });

  const filtered =
    filter === "all" ? sessions : sessions.filter((s) => s.pattern_slug === filter);

  const totalMinutes = Math.round(
    filtered.reduce((sum, s) => sum + s.duration_seconds, 0) / 60,
  );

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Session History</h1>
        <p className="mt-2 text-muted-foreground">
          Review and manage your past breathing sessions
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by pattern">
        {(["all", "box", "4-7-8", "wim-hof"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filter === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {key === "all" ? "All" : PATTERN_LABELS[key]}
          </button>
        ))}
      </div>

      {!isLoading && filtered.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} session{filtered.length !== 1 ? "s" : ""} · {totalMinutes} total minutes
        </p>
      )}

      {isLoading ? (
        <div className="flex h-32 items-center justify-center text-muted-foreground">Loading...</div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No sessions yet</CardTitle>
            <CardDescription>
              Complete a breathing session on the home page to see it here.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onDelete={(id) => deleteSession.mutate(id)}
              isDeleting={deleteSession.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
