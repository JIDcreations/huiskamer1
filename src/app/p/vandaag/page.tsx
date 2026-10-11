"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, isSameDay, parseISO, subDays } from "date-fns";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { beelden } from "@/lib/beelden";
import { ActivityItem } from "@/components/psy/activity";
import { AppointmentDetailSheet, NewAppointmentSheet } from "@/components/psy/appointment-sheet";
import { Panel } from "@/components/shared/panel";
import { statusLabel, typeLabel } from "@/lib/appointments";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  activityFor,
  agendaFor,
  useActivitySource,
  useAgendaRaw,
  useAppointments,
  useClientsRaw,
  useJournalAll,
  usePsychologist,
  useVisit,
  type Activity,
} from "@/lib/data";
import { formatLongDate, formatTime, greeting, plural } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Oudere regels per cliënt; wat nieuw is, staat er altijd bij. */
const PER_CLIENT = 3;

function DayAgenda({ appointments, onOpen }: { appointments: Appointment[]; onOpen: (a: Appointment) => void }) {
  const clients = useClientsRaw();
  const agenda = useAgendaRaw();
  const all = useAppointments();
  const journal = useJournalAll();
  const now = new Date();
  return (
    <ol className="flex flex-col">
      {appointments.map((a) => {
        const c = clients.find((x) => x.id === a.clientId);
        const start = parseISO(a.start);
        const end = parseISO(a.end);
        const current = start <= now && end > now;
        const done = end <= now || a.status !== "gepland";
        const points = a.status === "gepland" && !done ? agendaFor(agenda, all, journal, a.clientId, { forPsy: true }).items.length : 0;
        return (
          <li key={a.id} className={cn("flex items-center gap-2 rounded-2xl pr-2 transition-colors hover:bg-oat-soft", current && "bg-sun-soft hover:bg-sun-soft")}>
            <button onClick={() => onOpen(a)} className="flex min-w-0 flex-1 items-center gap-4 rounded-xl px-2 py-3 text-left">
              <span className={cn("w-14 shrink-0 font-display text-[19px] tabular-nums", done && !current && "text-faint")}>{formatTime(start)}</span>
              {c && <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="sm" />}
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[14px] font-medium", a.status === "geannuleerd" && "text-faint line-through")}>
                  {c?.firstName} {c?.lastName}
                </span>
                <span className="block text-[12px] text-muted">
                  {typeLabel[a.type]}, {a.mode}
                  {current ? ", nu bezig" : a.status !== "gepland" ? `, ${statusLabel[a.status].toLowerCase()}` : done ? ", voorbij" : ""}
                </span>
              </span>
            </button>
            {a.status === "gepland" && !done && (
              <Link
                href={`/p/clienten/${a.clientId}#voor-volgende-keer`}
                className="shrink-0 rounded-full bg-plum-soft px-2.5 py-1 text-[12px] font-medium text-plum-ink transition-colors hover:bg-plum-ink hover:text-on-accent"
              >
                Voor volgende keer{points ? ` (${points})` : ""}
              </Link>
            )}
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
    () => activityFor(source, { since: subDays(new Date(), 3).toISOString(), viewerId: psy.id }).filter((a) => a.kind !== "appointment" && !(a.kind === "agenda" && a.entry)),
    [source, psy.id]
  );
  const fresh = activity.filter((a) => a.at > since);
  // Bundelen: één regel per opdracht en één voor de check-ins van een cliënt, met het aantal keer.
  const byClient = useMemo(() => {
    const map = new Map<string, { activity: Activity; count: number }[]>();
    const bundles = new Map<string, { activity: Activity; count: number }>();
    for (const a of activity) {
      const key =
        a.kind === "journal" && a.entry.kind === "opdracht"
          ? `t:${a.entry.taskId}`
          : a.kind === "journal" && a.entry.kind === "checkin"
            ? `c:${a.clientId}`
            : null;
      if (key) {
        const existing = bundles.get(key);
        if (existing) {
          existing.count += 1;
          continue;
        }
      }
      const item = { activity: a, count: 1 };
      if (key) bundles.set(key, item);
      map.set(a.clientId, [...(map.get(a.clientId) ?? []), item]);
    }
    return [...map.entries()];
  }, [activity]);

  const kindOf = (a: Activity) => (a.kind === "journal" ? a.entry.kind : a.kind);
  const counts = {
    notitie: fresh.filter((a) => kindOf(a) === "notitie").length,
    opdracht: fresh.filter((a) => kindOf(a) === "opdracht").length,
    reactie: fresh.filter((a) => a.kind === "session").length,
    agenda: fresh.filter((a) => a.kind === "agenda").length,
  };
  const summary = [
    counts.notitie && plural(counts.notitie, "gedeelde notitie", "gedeelde notities"),
    counts.opdracht && plural(counts.opdracht, "afgewerkte opdracht", "afgewerkte opdrachten"),
    counts.reactie && plural(counts.reactie, "reactie bij een sessie", "reacties bij een sessie"),
    counts.agenda && plural(counts.agenda, "punt voor volgende keer", "punten voor volgende keer"),
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        image={beelden.kamer}
        eyebrow={formatLongDate(new Date())}
        title={`${greeting()}, ${psy.firstName}`}
        actions={
          <Button variant="sun" onClick={() => setCreating(true)}>
            <Plus /> Afspraak
          </Button>
        }
      >
        {today.length ? `Vandaag ${plural(today.length, "afspraak", "afspraken")}.` : "Geen afspraken vandaag."}{" "}
        {summary.length ? "Dit is er nieuw sinds je laatste bezoek." : "Sinds je laatste bezoek is er niets nieuws."}
      </PageHeader>

      <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {(
          [
            ["Afspraken vandaag", today.length, "bg-pine text-on-accent", "text-on-accent/75"],
            ["Gedeelde notities", counts.notitie, "bg-clay-soft text-clay-ink", "text-clay-ink/80"],
            ["Afgewerkte opdrachten", counts.opdracht, "bg-moss text-pine", "text-pine/80"],
            ["Voor volgende keer", counts.agenda, "bg-sun-soft text-sun-ink", "text-sun-ink/80"],
          ] as const
        ).map(([label, n, tone, sub]) => (
          <div key={label} className={cn("flex flex-col justify-between gap-3 rounded-[20px] px-4 py-4 md:gap-6 md:px-5", tone)}>
            <dt className={cn("text-[13px] font-medium", sub)}>{label}</dt>
            <dd className="font-display text-[32px] leading-none tabular-nums md:text-[40px]">{n}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
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
                // Alles wat nieuw is sinds je laatste bezoek, aangevuld tot drie regels.
                const shown = items.filter((it, i) => i < PER_CLIENT || it.activity.at > since);
                const rest = items.length - shown.length;
                return (
                  <section key={clientId}>
                    <Link href={`/p/clienten/${clientId}?tab=logboek`} className="mb-1 flex items-center gap-2.5 px-2 text-[15px] font-semibold hover:underline hover:decoration-surface-2 hover:underline-offset-4">
                      <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="sm" />
                      {c.firstName} {c.lastName}
                    </Link>
                    <div className="flex flex-col">
                      {shown.map(({ activity: a, count }, i) => (
                        <ActivityItem key={i} activity={a} count={count} isNew={a.at > since} />
                      ))}
                      {rest > 0 && (
                        <Link href={`/p/clienten/${clientId}?tab=logboek`} className="self-start rounded-full px-2 pt-1 text-[13px] text-muted hover:text-text">
                          Nog {rest} in het logboek van {c.firstName}
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
