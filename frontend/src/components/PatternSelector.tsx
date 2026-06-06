import type { PatternSlug } from "@/types";
import { cn } from "@/utils/cn";

const patterns: { slug: PatternSlug; name: string; description: string }[] = [
  {
    slug: "box",
    name: "Box Breathing",
    description: "4-4-4-4 rhythm for calm focus",
  },
  {
    slug: "4-7-8",
    name: "4-7-8",
    description: "Relaxing breath for sleep & anxiety",
  },
  {
    slug: "wim-hof",
    name: "Wim Hof",
    description: "Power breathing for energy",
  },
];

interface PatternSelectorProps {
  selected: PatternSlug;
  onSelect: (pattern: PatternSlug) => void;
  disabled?: boolean;
}

export function PatternSelector({ selected, onSelect, disabled }: PatternSelectorProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Breathing pattern">
      {patterns.map((pattern) => (
        <button
          key={pattern.slug}
          type="button"
          role="radio"
          aria-checked={selected === pattern.slug}
          disabled={disabled}
          onClick={() => onSelect(pattern.slug)}
          className={cn(
            "rounded-xl border p-4 text-left transition-all",
            selected === pattern.slug
              ? "border-primary bg-primary/5 ring-2 ring-primary"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed",
          )}
        >
          <p className="font-semibold">{pattern.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">{pattern.description}</p>
        </button>
      ))}
    </div>
  );
}
