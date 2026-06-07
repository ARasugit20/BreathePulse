import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/authStore";

const CHART_COLORS = ["hsl(199, 89%, 48%)", "hsl(172, 66%, 50%)", "hsl(262, 83%, 58%)"];

export function DashboardPage() {
  const token = useAuthStore((s) => s.token);

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.getAnalytics(token),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-muted-foreground">
        Loading analytics...
      </div>
    );
  }

  const weeklyData =
    analytics?.weekly_stats.map((stat) => ({
      day: format(parseISO(stat.day), "EEE"),
      minutes: Math.round(stat.total_minutes * 10) / 10,
      sessions: stat.sessions,
    })) ?? [];

  const patternData = analytics
    ? Object.entries(analytics.pattern_breakdown).map(([name, value]) => ({
        name: name === "4-7-8" ? "4-7-8" : name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  const hrvTrendData =
    analytics?.hrv_trend.map((point) => ({
      date: format(parseISO(point.date), "MMM d"),
      hrv: point.hrv_ms,
    })) ?? [];

  const dailyGoal = analytics?.daily_goal;

  const stats = [
    { label: "Total Sessions", value: analytics?.total_sessions ?? 0 },
    { label: "Total Minutes", value: analytics?.total_minutes ?? 0 },
    { label: "Current Streak", value: `${analytics?.current_streak ?? 0} days` },
    { label: "Longest Streak", value: `${analytics?.longest_streak ?? 0} days` },
    { label: "Consistency", value: `${analytics?.consistency_score ?? 0}%` },
    { label: "Avg HRV", value: analytics?.avg_hrv_ms ? `${analytics.avg_hrv_ms} ms` : "—" },
  ];

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">Your breathing wellness at a glance</p>
      </div>

      {dailyGoal && (
        <Card className={dailyGoal.goal_met ? "border-accent" : undefined}>
          <CardHeader>
            <CardTitle>Today&apos;s Goal</CardTitle>
            <CardDescription>
              {dailyGoal.completed_minutes} of {dailyGoal.goal_minutes} minutes
              {dailyGoal.goal_met ? " — goal met!" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={dailyGoal.percent_complete} aria-label="Daily goal progress" />
            <p className="mt-2 text-sm text-muted-foreground">
              {dailyGoal.percent_complete}% complete
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Activity</CardTitle>
            <CardDescription>Minutes practiced per day (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64" aria-label="Weekly activity bar chart">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="minutes" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pattern Breakdown</CardTitle>
            <CardDescription>Sessions by breathing technique</CardDescription>
          </CardHeader>
          <CardContent>
            {patternData.length > 0 ? (
              <div className="h-64" aria-label="Pattern breakdown pie chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={patternData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {patternData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-muted-foreground">
                Complete a session to see your pattern breakdown
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HRV Trend</CardTitle>
          <CardDescription>Heart rate variability across recent sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {hrvTrendData.length > 0 ? (
            <div className="h-64" aria-label="HRV trend line chart">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hrvTrendData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" unit=" ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="hrv"
                    stroke="hsl(172, 66%, 50%)"
                    strokeWidth={2}
                    dot={{ fill: "hsl(172, 66%, 50%)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground">
              Complete sessions with HRV data to see your trend
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Heatmap</CardTitle>
          <CardDescription>Daily session count over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.map((day) => (
              <div key={day.day} className="text-center">
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground transition-colors"
                  style={{
                    backgroundColor: `hsl(199, 89%, ${Math.min(48 + day.sessions * 12, 85)}%)`,
                  }}
                  aria-label={`${day.day}: ${day.sessions} sessions`}
                >
                  {day.sessions}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{day.day}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
