import { create } from "zustand";

interface AuthStore {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string | null, email?: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  email: null,
  isAuthenticated: false,
  setAuth: (token, email = null) =>
    set({ token, email, isAuthenticated: token !== null }),
  clearAuth: () => set({ token: null, email: null, isAuthenticated: false }),
}));
