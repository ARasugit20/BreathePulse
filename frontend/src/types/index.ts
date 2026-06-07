export type PatternSlug = "box" | "4-7-8" | "wim-hof";

export type BreathPhase = "inhale" | "hold" | "exhale" | "holdAfterExhale" | "rest";

export interface BreathingPattern {
  id: string;
  slug: PatternSlug;
  name: string;
  description: string;
  inhale_seconds: number;
  hold_seconds: number;
  exhale_seconds: number;
  hold_after_exhale_seconds: number;
  cycles_default: number;
}

export interface BreathingSession {
  id: string;
  user_id: string;
  pattern_slug: PatternSlug;
  duration_seconds: number;
  cycles_completed: number;
  avg_heart_rate: number | null;
  hrv_ms: number | null;
  notes: string | null;
  completed_at: string;
}

export interface UserProfile {
  id: string;
  external_id: string;
  email: string | null;
  display_name: string | null;
  daily_goal_minutes: number;
  preferred_pattern: PatternSlug;
  created_at: string;
}

export interface WeeklyStat {
  day: string;
  sessions: number;
  total_minutes: number;
}

export interface HrvTrendPoint {
  date: string;
  hrv_ms: number;
  session_id: string;
}

export interface DailyGoalProgress {
  goal_minutes: number;
  completed_minutes: number;
  percent_complete: number;
  goal_met: boolean;
}

export interface AnalyticsSummary {
  total_sessions: number;
  total_minutes: number;
  current_streak: number;
  longest_streak: number;
  consistency_score: number;
  avg_hrv_ms: number | null;
  weekly_stats: WeeklyStat[];
  pattern_breakdown: Record<string, number>;
  hrv_trend: HrvTrendPoint[];
  daily_goal: DailyGoalProgress;
}

export interface PatternTiming {
  inhale: number;
  hold: number;
  exhale: number;
  holdAfterExhale: number;
}
