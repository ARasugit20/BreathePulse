import { Activity, BarChart3, History, Settings, Wind } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/utils/cn";

const navItems = [
  { to: "/", label: "Breathe", icon: Wind },
  { to: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/history", label: "History", icon: History },
  { to: "/calibration", label: "Calibration", icon: Activity },
  { to: "/profile", label: "Profile", icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wind className="h-4 w-4" aria-hidden="true" />
            </div>
            BreathePulse
          </Link>
          <div className="flex items-center gap-2">
          <ThemeToggle />
          <nav className="hidden gap-1 md:flex" aria-label="Main navigation">
            {navItems.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm md:hidden"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs",
                location.pathname === to ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
