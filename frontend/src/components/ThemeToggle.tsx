import { Moon, Sun } from "lucide-react";

import { useThemeStore } from "@/stores/themeStore";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
