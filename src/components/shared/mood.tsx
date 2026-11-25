"use client";

import { WeatherCloud, WeatherRain, WeatherSun, WeatherSunCloud, WeatherWind, type Icon } from "@/components/icons";
import { PencilCircle } from "@/components/shared/pencil";
import type { Mood } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Een stemming is het weer van die dag: zwaar is regen, licht is zon. */
export const moods: { value: Mood; label: string; icon: Icon }[] = [
  { value: 1, label: "Zwaar", icon: WeatherRain },
  { value: 2, label: "Onrustig", icon: WeatherWind },
  { value: 3, label: "Gaat wel", icon: WeatherCloud },
  { value: 4, label: "Rustig", icon: WeatherSunCloud },
  { value: 5, label: "Licht", icon: WeatherSun },
];

export const moodLabel = (m?: Mood) => moods.find((x) => x.value === m)?.label;
export const moodIcons: Record<Mood, Icon> = { 1: WeatherRain, 2: WeatherWind, 3: WeatherCloud, 4: WeatherSunCloud, 5: WeatherSun };

/** Klein weerbeeldje met het woord erbij, voor in lijsten. */
export function MoodMark({ value, className }: { value?: Mood; className?: string }) {
  if (!value) return null;
  const Weather = moodIcons[value];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] text-muted", className)}>
      <Weather className="size-[18px] text-pine" />
      {moodLabel(value)}
    </span>
  );
}

/** Kies het weer van vandaag. Wat je kiest, wordt met potlood omcirkeld. */
export function MoodPicker({ value, onChange, className }: { value?: Mood; onChange: (m: Mood | undefined) => void; className?: string }) {
  return (
    <div role="radiogroup" aria-label="Hoe voel je je?" className={cn("grid grid-cols-5 gap-1 sm:gap-2", className)}>
      {moods.map((m) => {
        const active = m.value === value;
        const Weather = m.icon;
        return (
          <button
            key={m.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(active ? undefined : m.value)}
            className={cn(
              "group flex min-w-0 flex-col items-center gap-2.5 rounded-2xl px-0.5 pb-3 pt-4 text-[12px] whitespace-nowrap outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-pine sm:text-[14px]",
              active ? "font-medium text-text" : "text-muted hover:bg-oat-soft hover:text-text"
            )}
          >
            <span className="relative flex size-11 items-center justify-center sm:size-12">
              <Weather
                className={cn(
                  "size-8 transition-transform duration-300 ease-out-soft sm:size-9",
                  active ? "text-pine" : "text-pine/70 group-hover:-translate-y-0.5 group-hover:text-pine"
                )}
              />
              {active && <PencilCircle key={m.value} className="-inset-1 text-clay" />}
            </span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
