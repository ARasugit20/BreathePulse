import { useEffect } from "react";

interface ShortcutHandlers {
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onReset?: () => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onStart,
  onPause,
  onResume,
  onReset,
  enabled = true,
}: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT") {
        return;
      }

      switch (e.key) {
        case " ":
        case "Enter":
          e.preventDefault();
          onStart?.();
          onResume?.();
          break;
        case "p":
        case "P":
          e.preventDefault();
          onPause?.();
          break;
        case "Escape":
          e.preventDefault();
          onReset?.();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onStart, onPause, onResume, onReset]);
}
