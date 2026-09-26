"use client";

import { Segmented } from "@/components/ui/segmented";
import { Toggle } from "@/components/ui/toggle";

export const reminderTimes = [
  { value: "08:00", label: "8u" },
  { value: "12:30", label: "12u30" },
  { value: "20:00", label: "20u" },
  { value: "21:30", label: "21u30" },
];

/** Herinnering voor de check-in: aan of uit, en hoe laat. */
export function ReminderPicker({ value, onChange }: { value?: string; onChange: (v: string | undefined) => void }) {
  return (
    <div>
      <label className="flex cursor-pointer items-center justify-between gap-4">
        <span>
          <span className="block text-[14px] font-medium">Seintje voor je check-in</span>
          <span className="block text-[13px] text-muted">{value ? `Elke dag om ${value.replace(":", "u").replace("u00", "u")}` : "Geen herinnering"}</span>
        </span>
        <Toggle aria-label="Seintje voor je check-in" checked={Boolean(value)} onCheckedChange={(on) => onChange(on ? value ?? "20:00" : undefined)} />
      </label>
      {value && (
        <Segmented className="mt-3" label="Hoe laat" size="sm" value={value} onChange={(v) => onChange(v)} options={reminderTimes} />
      )}
    </div>
  );
}
