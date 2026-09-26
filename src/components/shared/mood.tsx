"use client";

import type { Mood } from "@/lib/types";
import { cn } from "@/lib/utils";

export const moods: { value: Mood; label: string }[] = [
  { value: 1, label: "Zwaar" },
  { value: 2, label: "Onrustig" },
  { value: 3, label: "Gaat wel" },
  { value: 4, label: "Rustig" },
  { value: 5, label: "Licht" },
];

export const moodLabel = (m?: Mood) => moods.find((x) => x.value === m)?.label;

/** Vijf zachte bolletjes, gevuld tot de stemming. Geen kleuren buiten het palet. */
export function MoodDots({ value, className }: { value?: Mood; className?: string }) {
  if (!value) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 text-[12px] text-muted", className)}>
      <span aria-hidden className="inline-flex gap-[3px]">
        {moods.map((m) => (
          <span key={m.value} className={cn("size-[6px] rounded-full", m.value <= value ? "bg-muted" : "bg-surface-2")} />
        ))}
      </span>
      {moodLabel(value)}
    </span>
  );
}

export function MoodPicker({ value, onChange, className }: { value?: Mood; onChange: (m: Mood | undefined) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Hoe voel je je?" className={cn("grid grid-cols-5 gap-1.5 sm:flex sm:flex-wrap", className)}>
      {moods.map((m) => {
        const active = m.value === value;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : m.value)}
            className={cn(
              "inline-flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-taupe sm:h-9 sm:flex-row sm:gap-2 sm:rounded-full sm:px-3.5 sm:py-0 sm:text-[13px]",
              active ? "bg-accent text-on-accent" : "bg-oat-soft text-muted hover:bg-surface-2 hover:text-text"
            )}
          >
            <span aria-hidden className="inline-flex gap-[2px]">
              {moods.map((d) => (
                <span
                  key={d.value}
                  className={cn(
                    "size-[5px] rounded-full",
                    d.value <= m.value ? (active ? "bg-on-accent" : "bg-muted") : active ? "bg-on-accent/30" : "bg-surface-2"
                  )}
                />
              ))}
            </span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
