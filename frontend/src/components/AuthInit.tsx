import { useEffect } from "react";

import { isSupabaseConfigured } from "@/services/supabase";
import { useAuthStore } from "@/stores/authStore";

export function AuthInit() {
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuth("dev-token", "dev@breathepulse.local");
    }
  }, [setAuth]);

  return null;
}
