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
    <div role="radiogroup" aria-label="Hoe voel je je?" className={cn("grid grid-cols-5 gap-2", className)}>
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
              "group flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl px-0.5 py-3.5 text-[11px] font-medium whitespace-nowrap tracking-[-0.01em] outline-none transition-[background-color,box-shadow,transform] duration-200 focus-visible:ring-2 focus-visible:ring-pine active:scale-[0.97] sm:text-[13px]",
              active
                ? "bg-[color-mix(in_srgb,var(--m)_16%,var(--cream))] text-text shadow-[inset_0_0_0_2px_var(--m)]"
                : "bg-surface text-muted shadow-[inset_0_0_0_1px_var(--edge)] hover:bg-[color-mix(in_srgb,var(--m)_9%,var(--cream))] hover:text-text"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-6 rounded-full bg-(--m) shadow-[inset_0_-3px_6px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out-soft sm:size-8",
                active ? "scale-110" : "group-hover:scale-105"
              )}
            />
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
