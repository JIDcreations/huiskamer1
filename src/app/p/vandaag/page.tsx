"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, isSameDay, parseISO, subDays } from "date-fns";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ActivityItem } from "@/components/psy/activity";
import { AppointmentDetailSheet, NewAppointmentSheet } from "@/components/psy/appointment-sheet";
import { Panel } from "@/components/shared/panel";
import { statusLabel, typeLabel } from "@/components/shared/appointment-card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { activityFor, useActivitySource, useAppointments, useClientsRaw, usePsychologist, useVisit, type Activity } from "@/lib/data";
import { formatLongDate, formatTime, greeting, plural } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

function DayAgenda({ appointments, onOpen }: { appointments: Appointment[]; onOpen: (a: Appointment) => void }) {
  const clients = useClientsRaw();
  const now = new Date();
  return (
    <ol className="flex flex-col">
      {appointments.map((a) => {
        const c = clients.find((x) => x.id === a.clientId);
        const start = parseISO(a.start);
        const end = parseISO(a.end);
        const current = start <= now && end > now;
        const done = end <= now || a.status !== "gepland";
        return (
          <li key={a.id}>
            <button
              onClick={() => onOpen(a)}
              className={cn(
                "flex w-full items-center gap-4 rounded-xl px-2 py-3 text-left transition-colors hover:bg-oat-soft/60",
                current && "bg-oat-soft"
              )}
            >
              <span className={cn("w-12 shrink-0 text-[15px] font-semibold tabular-nums", done && !current && "text-faint")}>{formatTime(start)}</span>
              {c && <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="sm" />}
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[14px] font-medium", a.status === "geannuleerd" && "text-faint line-through")}>
                  {c?.firstName} {c?.lastName}
                </span>
                <span className="block text-[12px] text-muted">
                  {typeLabel[a.type]}, {a.mode}
                </span>
              </span>
              <span className="text-[12px] text-muted">{current ? "Nu bezig" : a.status !== "gepland" ? statusLabel[a.status] : done ? "Voorbij" : ""}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function Vandaag() {
  const psy = usePsychologist();
  const all = useAppointments();
  const clients = useClientsRaw();
  const source = useActivitySource();
  const since = useVisit("psy", "vandaag");
  const [open, setOpen] = useState<Appointment | null>(null);
  const [creating, setCreating] = useState(false);

  const today = all.filter((a) => isSameDay(parseISO(a.start), new Date()));
  const tomorrowDate = addDays(new Date(), 1);
  const tomorrow = all.filter((a) => isSameDay(parseISO(a.start), tomorrowDate) && a.status === "gepland");

  // Wat er tussen de sessies gebeurde: laatste drie dagen, zonder je eigen werk.
  const activity = useMemo(
    () =>
      activityFor(source, { since: subDays(new Date(), 3).toISOString() }).filter(
        (a) => a.kind !== "appointment" && !(a.kind === "tafel" && a.authorId === psy.id)
      ),
    [source, psy.id]
  );
  const fresh = activity.filter((a) => a.at > since);
  // Opdrachten bundelen: één regel per opdracht, met het aantal keer.
  const byClient = useMemo(() => {
    const map = new Map<string, { activity: Activity; count: number }[]>();
    const tasks = new Map<string, { activity: Activity; count: number }>();
    for (const a of activity) {
      if (a.kind === "task") {
        const existing = tasks.get(a.task.id);
        if (existing) {
          existing.count += 1;
          continue;
        }
      }
      const item = { activity: a, count: 1 };
      if (a.kind === "task") tasks.set(a.task.id, item);
      map.set(a.clientId, [...(map.get(a.clientId) ?? []), item]);
    }
    return [...map.entries()];
  }, [activity]);

  const counts = {
    journal: fresh.filter((a) => a.kind === "journal").length,
    tafel: fresh.filter((a) => a.kind === "tafel").length,
    task: fresh.filter((a) => a.kind === "task").length,
  };
  const summary = [
    counts.journal && plural(counts.journal, "gedeelde logboekentry", "gedeelde logboekentries"),
    counts.tafel && plural(counts.tafel, "wijziging op de Tafel", "wijzigingen op de Tafel"),
    counts.task && plural(counts.task, "afgeronde opdracht", "afgeronde opdrachten"),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(new Date())}
        title={`${greeting()}, ${psy.firstName}`}
        actions={
          <Button variant="secondary" onClick={() => setCreating(true)}>
            <Plus /> Afspraak
          </Button>
        }
      />
      <p className="mt-3 max-w-2xl text-[15px] text-muted">
        {today.length ? `Vandaag ${plural(today.length, "afspraak", "afspraken")}.` : "Geen afspraken vandaag."}{" "}
        {summary.length ? `Sinds je laatste bezoek: ${summary.join(", ")}.` : "Sinds je laatste bezoek is er niets nieuws."}
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
        <div className="flex flex-col gap-5">
          <Panel title="Vandaag" href="/p/agenda" hrefLabel="Agenda" bodyClassName="pt-1">
            {today.length ? <DayAgenda appointments={today} onOpen={setOpen} /> : <p className="py-3 text-[14px] text-muted">Een dag zonder sessies.</p>}
          </Panel>
          {tomorrow.length > 0 && (
            <Panel title="Morgen" bodyClassName="pt-1">
              <DayAgenda appointments={tomorrow} onOpen={setOpen} />
            </Panel>
          )}
        </div>

        <Panel title="Tussen de sessies" description="Wat je cliënten deelden, de laatste drie dagen." bodyClassName="pt-2">
          {byClient.length ? (
            <div className="flex flex-col gap-5">
              {byClient.map(([clientId, items]) => {
                const c = clients.find((x) => x.id === clientId);
                if (!c) return null;
                return (
                  <section key={clientId}>
                    <Link href={`/p/clienten/${clientId}?tab=tijdlijn`} className="mb-1 flex items-center gap-2.5 px-2 text-[14px] font-semibold hover:underline hover:decoration-surface-2 hover:underline-offset-4">
                      <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="xs" />
                      {c.firstName} {c.lastName}
                    </Link>
                    <div className="flex flex-col">
                      {items.slice(0, 3).map(({ activity: a, count }, i) => (
                        <ActivityItem key={i} activity={a} count={count} isNew={a.at > since} />
                      ))}
                      {items.length > 3 && (
                        <Link href={`/p/clienten/${clientId}?tab=tijdlijn`} className="px-2 pt-1 text-[13px] text-muted hover:text-text">
                          Meer in de tijdlijn van {c.firstName}
                        </Link>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <p className="py-3 text-[14px] text-muted">Rustig de laatste dagen.</p>
          )}
        </Panel>
      </div>

      <AppointmentDetailSheet key={open?.id ?? "geen"} appointment={open} onClose={() => setOpen(null)} />
      {creating && <NewAppointmentSheet open={creating} onOpenChange={setCreating} />}
    </>
  );
}
