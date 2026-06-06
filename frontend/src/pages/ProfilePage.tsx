import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { isSupabaseConfigured, supabase } from "@/services/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { PatternSlug } from "@/types";

export function ProfilePage() {
  const { token, email, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api.getProfile(token),
  });

  const updateProfile = useMutation({
    mutationFn: (data: Parameters<typeof api.updateProfile>[0]) => api.updateProfile(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const handleLogin = async () => {
    if (!supabase) {
      setAuth("dev-token", "dev@breathepulse.local");
      toast.success("Signed in (dev mode)");
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setAuth(data.session?.access_token ?? null, data.user?.email);
    toast.success("Signed in");
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    clearAuth();
    toast.success("Signed out");
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
      </div>

      {!isAuthenticated ? (
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              {isSupabaseConfigured
                ? "Sign in with your Supabase account"
                : "Dev mode — click sign in to use the app without Supabase"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isSupabaseConfigured && (
              <>
                <div>
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
            <Button onClick={handleLogin} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>{email ?? profile?.email ?? "Dev user"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <input
                  id="displayName"
                  type="text"
                  defaultValue={profile?.display_name ?? ""}
                  onBlur={(e) =>
                    updateProfile.mutate({ display_name: e.target.value || undefined })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="dailyGoal" className="text-sm font-medium">
                  Daily Goal (minutes)
                </label>
                <input
                  id="dailyGoal"
                  type="number"
                  min={1}
                  max={120}
                  defaultValue={profile?.daily_goal_minutes ?? 10}
                  onBlur={(e) =>
                    updateProfile.mutate({ daily_goal_minutes: Number(e.target.value) })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label htmlFor="preferredPattern" className="text-sm font-medium">
                  Preferred Pattern
                </label>
                <select
                  id="preferredPattern"
                  defaultValue={profile?.preferred_pattern ?? "box"}
                  onChange={(e) =>
                    updateProfile.mutate({
                      preferred_pattern: e.target.value as PatternSlug,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="box">Box Breathing</option>
                  <option value="4-7-8">4-7-8</option>
                  <option value="wim-hof">Wim Hof</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
