"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import type { Recurrence, TaskKind } from "@/lib/types";
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
  recurrence?: Recurrence;
  dueDate?: string;
  minutes?: number;
  scaleLabel?: string;
};

type Repeat = "eenmalig" | "dag" | "week";
const dayNames = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/** Formulier voor een opdracht of sjabloon. `withDates` toont deadline of einddatum. */
export function TaskFields({ value, onChange, withDates }: { value: TaskDraft; onChange: (v: TaskDraft) => void; withDates?: boolean }) {
  const repeat: Repeat = value.recurrence ? value.recurrence.every : "eenmalig";
  const set = (patch: Partial<TaskDraft>) => onChange({ ...value, ...patch });

  return (
    <div className="grid gap-4">
      <div>
        <Label htmlFor="t-title">Titel</Label>
        <Input id="t-title" value={value.title} onChange={(e) => set({ title: e.target.value })} placeholder="Bv. Korte wandeling" />
      </div>
      <div>
        <Label htmlFor="t-desc">Uitleg voor je cliënt</Label>
        <Textarea id="t-desc" value={value.description} onChange={(e) => set({ description: e.target.value })} placeholder="Kort en concreet." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
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
      <div>
        <Label>Herhaling</Label>
        <Segmented
          label="Herhaling"
          value={repeat}
          onChange={(r) =>
            set({
              recurrence: r === "eenmalig" ? undefined : r === "dag" ? { every: "dag", until: value.recurrence?.until } : { every: "week", days: value.recurrence?.days ?? [1, 3, 5], until: value.recurrence?.until },
            })
          }
          options={[
            { value: "eenmalig", label: "Eenmalig" },
            { value: "dag", label: "Elke dag" },
            { value: "week", label: "Vaste dagen" },
          ]}
        />
        {repeat === "week" && (
          <div className="mt-3 flex gap-1">
            {dayNames.map((d, i) => {
              const on = value.recurrence?.days?.includes(i + 1);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    const days = new Set(value.recurrence?.days ?? []);
                    if (on) days.delete(i + 1);
                    else days.add(i + 1);
                    set({ recurrence: { ...value.recurrence!, days: [...days].sort() } });
                  }}
                  className={cn("size-9 rounded-full text-[13px] transition-colors", on ? "bg-accent text-on-accent" : "bg-oat-soft text-muted hover:bg-surface-2")}
                >
                  {d}
                </button>
              );
            })}
          </div>
        )}
      </div>
      {withDates && (
        <div>
          {repeat === "eenmalig" ? (
            <>
              <Label htmlFor="t-due">Tegen wanneer?</Label>
              <Input id="t-due" type="date" value={value.dueDate ?? ""} onChange={(e) => set({ dueDate: e.target.value || undefined })} />
            </>
          ) : (
            <>
              <Label htmlFor="t-until">Tot wanneer? (optioneel)</Label>
              <Input
                id="t-until"
                type="date"
                value={value.recurrence?.until ?? ""}
                onChange={(e) => set({ recurrence: { ...value.recurrence!, until: e.target.value || undefined } })}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}

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

export function useTaskDraft(initial?: Partial<TaskDraft>) {
  return useState<TaskDraft>({ title: "", description: "", kind: "afvinken", ...initial });
}
