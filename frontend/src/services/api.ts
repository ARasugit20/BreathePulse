import type {
  AnalyticsSummary,
  BreathingPattern,
  BreathingSession,
  PatternSlug,
  UserProfile,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new ApiError(response.status, error.detail ?? "Request failed");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  health: () => request<{ status: string }>("/health"),

  getProfile: (token?: string | null) =>
    request<UserProfile>("/api/v1/users/me", {}, token),

  updateProfile: (
    data: Partial<Pick<UserProfile, "display_name" | "daily_goal_minutes" | "preferred_pattern">>,
    token?: string | null,
  ) =>
    request<UserProfile>("/api/v1/users/me", { method: "PATCH", body: JSON.stringify(data) }, token),

  getPatterns: () => request<BreathingPattern[]>("/api/v1/sessions/patterns"),

  getSessions: (token?: string | null) =>
    request<BreathingSession[]>("/api/v1/sessions", {}, token),

  createSession: (
    data: {
      pattern_slug: PatternSlug;
      duration_seconds: number;
      cycles_completed: number;
      avg_heart_rate?: number;
      hrv_ms?: number;
      notes?: string;
    },
    token?: string | null,
  ) =>
    request<BreathingSession>(
      "/api/v1/sessions",
      { method: "POST", body: JSON.stringify(data) },
      token,
    ),

  deleteSession: (id: string, token?: string | null) =>
    request<void>(`/api/v1/sessions/${id}`, { method: "DELETE" }, token),

  getAnalytics: (token?: string | null) =>
    request<AnalyticsSummary>("/api/v1/analytics/summary", {}, token),
};

export { ApiError };
