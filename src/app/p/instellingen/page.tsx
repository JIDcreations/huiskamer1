"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoReset } from "@/components/demo-reset";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { actions, usePsychologist } from "@/lib/data";
import type { Psychologist, WeeklySlot } from "@/lib/types";

const weekdays = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"];

function Availability({ value, onChange }: { value: WeeklySlot[]; onChange: (v: WeeklySlot[]) => void }) {
  return (
    <ul className="divide-y divide-surface-2/70">
      {weekdays.map((name, i) => {
        const day = i + 1;
        const slot = value.find((s) => s.weekday === day);
        const update = (patch: Partial<WeeklySlot>) => onChange(value.map((s) => (s.weekday === day ? { ...s, ...patch } : s)));
        return (
          <li key={day} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
            <label className="flex w-40 cursor-pointer items-center gap-3">
              <Toggle
                checked={Boolean(slot)}
                onCheckedChange={(on) =>
                  onChange(on ? [...value, { weekday: day, start: "09:00", end: "17:00" }].sort((a, b) => a.weekday - b.weekday) : value.filter((s) => s.weekday !== day))
                }
                aria-label={`${name} beschikbaar`}
              />
              <span className="text-[14px] font-medium">{name}</span>
            </label>
            {slot ? (
              <div className="flex items-center gap-2">
                <Input type="time" step={900} value={slot.start} onChange={(e) => update({ start: e.target.value })} className="h-9 w-28" aria-label={`${name} van`} />
                <span className="text-[13px] text-muted">tot</span>
                <Input type="time" step={900} value={slot.end} onChange={(e) => update({ end: e.target.value })} className="h-9 w-28" aria-label={`${name} tot`} />
              </div>
            ) : (
              <span className="text-[13px] text-faint">Niet beschikbaar</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Instellingen() {
  const psy = usePsychologist();
  const [form, setForm] = useState<Psychologist>(psy);
  const dirty = JSON.stringify(form) !== JSON.stringify(psy);
  const text = (k: "name" | "practiceName" | "email" | "phone" | "address", label: string, type = "text") => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value, ...(k === "name" ? { firstName: e.target.value.split(" ")[0] } : {}) })} />
    </div>
  );
  const num = (k: "hourlyRate" | "sessionMinutes" | "cancellationHours", label: string, suffix: string) => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <div className="relative">
        <Input id={k} type="number" min={0} value={form[k]} onChange={(e) => setForm({ ...form, [k]: Number(e.target.value) })} className="pr-16" />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-faint">{suffix}</span>
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title="Instellingen"
        actions={
          <Button
            disabled={!dirty}
            onClick={() => {
              actions.updatePsychologist(form);
              toast("Instellingen bewaard");
            }}
          >
            Bewaren
          </Button>
        }
      />

      <div className="mt-8 grid max-w-3xl gap-5">
        <Panel title="Praktijk">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {text("name", "Je naam")}
            {text("practiceName", "Naam van de praktijk")}
            {text("email", "E-mail", "email")}
            {text("phone", "Telefoon", "tel")}
            <div className="sm:col-span-2">{text("address", "Adres")}</div>
          </div>
        </Panel>

        <Panel title="Sessies en tarief">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {num("hourlyRate", "Tarief per sessie", "euro")}
            {num("sessionMinutes", "Duur", "minuten")}
            {num("cancellationHours", "Kosteloos annuleren tot", "uur")}
          </div>
        </Panel>

        <div id="beschikbaarheid" className="scroll-mt-24">
          <Panel title="Beschikbaarheid" description="Cliënten kunnen enkel binnen deze uren boeken." bodyClassName="pt-1">
            <Availability value={form.availability} onChange={(availability) => setForm({ ...form, availability })} />
          </Panel>
        </div>

        <Panel title="Opdrachtsjablonen">
          <p className="text-[14px] text-muted">
            Je sjablonen beheer je in de{" "}
            <Link href="/p/opdrachten" className="text-text underline decoration-surface-2 underline-offset-4">
              opdrachtenbibliotheek
            </Link>
            .
          </p>
        </Panel>

        <Panel title="Demo">
          <p className="text-[14px] text-muted">Zet alle demodata terug naar het begin. Handig voor een nieuwe demonstratie.</p>
          <DemoReset variant="button" className="mt-3" />
        </Panel>
      </div>

    </>
  );
}
