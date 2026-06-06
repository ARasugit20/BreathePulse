import { create } from "zustand";

import type { PatternSlug } from "@/types";

interface SessionStore {
  selectedPattern: PatternSlug;
  cycles: number;
  audioEnabled: boolean;
  setPattern: (pattern: PatternSlug) => void;
  setCycles: (cycles: number) => void;
  setAudioEnabled: (enabled: boolean) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  selectedPattern: "box",
  cycles: 4,
  audioEnabled: true,
  setPattern: (pattern) => set({ selectedPattern: pattern }),
  setCycles: (cycles) => set({ cycles }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
}));
