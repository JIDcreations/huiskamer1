"use client";

import { addDays, format } from "date-fns";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { rhythmLabel } from "@/lib/data/derive";
import { shortDayNames } from "@/lib/format";
import type { Rhythm, TaskKind } from "@/lib/types";
import { cn } from "@/lib/utils";

export const kindLabel: Record<TaskKind, string> = {
  afvinken: "Afvinken",
  tekst: "Kort antwoord",
  schaal: "Schaal 1 tot 10",
  meditatie: "Meditatie met timer",
};

export type TaskDraft = {
  title: string;
  description: string;
  kind: TaskKind;
  /** Verplicht bij een opdracht. Bij een sjabloon een voorstel. */
  rhythm?: Rhythm;
  until?: string;
  minutes?: number;
  scaleLabel?: string;
};

type RhythmKind = Rhythm["kind"];
function defaultRhythm(kind: RhythmKind, prev?: Rhythm): Rhythm {
  switch (kind) {
    case "dagelijks":
      return { kind };
    case "dagen":
      return { kind, days: prev?.kind === "dagen" ? prev.days : [1, 3, 5] };
    case "perWeek":
      return { kind, times: prev?.kind === "perWeek" ? prev.times : 3 };
    case "eenmalig":
      return { kind, due: prev?.kind === "eenmalig" ? prev.due : format(addDays(new Date(), 7), "yyyy-MM-dd") };
  }
}

export const rhythmOptions: { value: RhythmKind; label: string }[] = [
  { value: "dagelijks", label: "Elke dag" },
  { value: "dagen", label: "Vaste dagen" },
  { value: "perWeek", label: "x per week" },
  { value: "eenmalig", label: "Eenmalig" },
];

/** Formulier voor een opdracht of sjabloon. `withDates` toont deadline of einddatum. */
export function TaskFields({ value, onChange, withDates }: { value: TaskDraft; onChange: (v: TaskDraft) => void; withDates?: boolean }) {
  const set = (patch: Partial<TaskDraft>) => onChange({ ...value, ...patch });
  const r = value.rhythm;

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="t-title">Titel</Label>
        <Input id="t-title" value={value.title} onChange={(e) => set({ title: e.target.value })} placeholder="Bv. Korte wandeling" />
      </div>
      <div>
        <Label htmlFor="t-desc">Uitleg voor je cliënt</Label>
        <Textarea id="t-desc" value={value.description} onChange={(e) => set({ description: e.target.value })} placeholder="Kort en concreet. Dit staat in de sheet, niet in de lijst." />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="t-kind">Soort</Label>
          <Select id="t-kind" value={value.kind} onChange={(e) => set({ kind: e.target.value as TaskKind })}>
            {Object.entries(kindLabel).map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        {value.kind === "meditatie" && (
          <div>
            <Label htmlFor="t-min">Duur in minuten</Label>
            <Input id="t-min" type="number" min={1} max={60} value={value.minutes ?? 10} onChange={(e) => set({ minutes: Number(e.target.value) })} />
          </div>
        )}
        {value.kind === "schaal" && (
          <div>
            <Label htmlFor="t-scale">Wat meet de schaal?</Label>
            <Input id="t-scale" value={value.scaleLabel ?? ""} onChange={(e) => set({ scaleLabel: e.target.value })} placeholder="Bv. Slaapkwaliteit" />
          </div>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 text-[13px] font-medium text-text">
          Ritme{withDates && <span className="font-normal text-muted">, kies er één</span>}
        </legend>
        <div className="-mx-1 overflow-x-auto px-1">
          <Segmented
            label="Ritme"
            value={r?.kind ?? ("" as RhythmKind)}
            onChange={(k) => set({ rhythm: defaultRhythm(k, r) })}
            options={rhythmOptions}
          />
        </div>

        {r?.kind === "dagen" && (
          <div className="mt-3 flex flex-wrap gap-1">
            {shortDayNames.map((d, i) => {
              const on = r.days.includes(i + 1);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const days = new Set(r.days);
                    if (on) days.delete(i + 1);
                    else days.add(i + 1);
                    set({ rhythm: { kind: "dagen", days: [...days].sort() } });
                  }}
                  className={cn("size-9 rounded-full text-[13px] transition-colors", on ? "bg-accent text-on-accent" : "bg-oat-soft text-muted hover:bg-surface-2")}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}

        {r?.kind === "perWeek" && (
          <div className="mt-3 flex items-center gap-3">
            <Button type="button" variant="soft" size="icon-sm" aria-label="Minder" disabled={r.times <= 1} onClick={() => set({ rhythm: { kind: "perWeek", times: r.times - 1 } })}>
              <Minus />
            </Button>
            <span className="min-w-24 text-center text-[14px] tabular-nums">{r.times}x per week</span>
            <Button type="button" variant="soft" size="icon-sm" aria-label="Meer" disabled={r.times >= 6} onClick={() => set({ rhythm: { kind: "perWeek", times: r.times + 1 } })}>
              <Plus />
            </Button>
          </div>
        )}

        {r && <p className="mt-2 text-[12px] text-muted">Je cliënt ziet: {rhythmLabel(r)}. {rhythmHint[r.kind]}</p>}
      </fieldset>

      {withDates && r && (
        <div>
          {r.kind === "eenmalig" ? (
            <>
              <Label htmlFor="t-due">Voor wanneer?</Label>
              <Input id="t-due" type="date" value={r.due} onChange={(e) => e.target.value && set({ rhythm: { kind: "eenmalig", due: e.target.value } })} />
            </>
          ) : (
            <>
              <Label htmlFor="t-until">Tot wanneer? (optioneel)</Label>
              <Input id="t-until" type="date" value={value.until ?? ""} onChange={(e) => set({ until: e.target.value || undefined })} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

const rhythmHint: Record<RhythmKind, string> = {
  dagelijks: "Staat elke dag in Vandaag.",
  dagen: "Staat enkel op die dagen in Vandaag.",
  perWeek: "Staat elke dag in Vandaag tot het aantal gehaald is.",
  eenmalig: "Staat in Vandaag tot het gedaan is of de datum voorbij is.",
};

export function FormActions({ onCancel, submitLabel, disabled }: { onCancel: () => void; submitLabel: string; disabled?: boolean }) {
  return (
    <div className="mt-6 flex justify-end gap-2 border-t border-surface-2 pt-5">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Annuleren
      </Button>
      <Button type="submit" disabled={disabled}>
        {submitLabel}
      </Button>
    </div>
  );
}
