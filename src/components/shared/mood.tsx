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

/** Elke stemming een eigen kleur, van schemerblauw (zwaar) naar zon (licht). */
export const moodColor = (m: Mood) => `var(--mood-${m})`;

/** Vijf bolletjes, gevuld tot de stemming, in de kleur van die stemming. */
export function MoodDots({ value, className }: { value?: Mood; className?: string }) {
  if (!value) return null;
  return (
    <span className={cn("inline-flex items-center gap-2 text-[12px] font-medium text-muted", className)}>
      <span aria-hidden className="inline-flex gap-[3px]">
        {moods.map((m) => (
          <span
            key={m.value}
            className="size-[7px] rounded-full"
            style={{ background: m.value <= value ? moodColor(value) : "var(--sand)" }}
          />
        ))}
      </span>
      {moodLabel(value)}
    </span>
  );
}

export function MoodPicker({ value, onChange, className }: { value?: Mood; onChange: (m: Mood | undefined) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Hoe voel je je?" className={cn("-ml-3 flex flex-wrap gap-x-0.5 gap-y-1", className)}>
      {moods.map((m) => {
        const active = m.value === value;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : m.value)}
            style={{ "--m": moodColor(m.value) } as React.CSSProperties}
            className={cn(
              "group inline-flex h-10 items-center gap-2 rounded-full pl-3 pr-3.5 font-display text-[18px] whitespace-nowrap outline-none transition-[background-color,box-shadow,color] duration-200 focus-visible:ring-1 focus-visible:ring-pine active:scale-[0.98] sm:text-[19px]",
              active
                ? "bg-[color-mix(in_srgb,var(--m)_22%,var(--cream))] text-text"
                : "text-muted hover:bg-[color-mix(in_srgb,var(--m)_12%,var(--cream))] hover:text-text"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-3 rounded-full bg-(--m) transition-transform duration-300 ease-out-soft",
                active ? "scale-125" : "group-hover:scale-110"
              )}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
