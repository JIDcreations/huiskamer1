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
import { capitalize, formatLongDate, formatTime, greeting, plural } from "@/lib/format";

const joinList = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} en ${xs[xs.length - 1]}`);
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
          <li key={a.id} className={cn("flex flex-wrap items-center gap-x-2 rounded-2xl pr-2 transition-colors hover:bg-oat-soft", current && "bg-sun-soft hover:bg-sun-soft")}>
            <button onClick={() => onOpen(a)} className="flex min-w-0 flex-1 basis-[15rem] items-center gap-4 rounded-xl px-2 py-3 text-left">
              <span className={cn("w-14 shrink-0 font-display text-[21px] tabular-nums", done && !current && "text-faint")}>{formatTime(start)}</span>
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
                className="mb-3 ml-[5.5rem] shrink-0 rounded-full bg-plum-soft px-3 py-1 text-[12.5px] text-plum-ink transition-colors hover:bg-plum-ink hover:text-on-accent sm:mb-0 sm:ml-0"
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
        image={beelden.vaas}
        detail={beelden.schaduw}
        eyebrow={capitalize(formatLongDate(new Date()))}
        title={
          <>
            {greeting()}, <span className="text-sun-ink">{psy.firstName}</span>
          </>
        }
        actions={
          <Button onClick={() => setCreating(true)}>
            <Plus /> Afspraak
          </Button>
        }
      >
        {today.length ? `Vandaag ${plural(today.length, "afspraak", "afspraken")}.` : "Geen afspraken vandaag."}{" "}
        {summary.length ? `Sinds je laatste bezoek: ${joinList(summary as string[])}.` : "Sinds je laatste bezoek is er niets nieuws."}
      </PageHeader>

      <div className="mt-10 grid grid-cols-1 items-start gap-5 md:mt-14 lg:grid-cols-2">
        <Panel title="Vandaag" href="/p/agenda" hrefLabel="Agenda" bodyClassName="pt-1" className={cn(!tomorrow.length && "lg:col-span-2")}>
          {today.length ? <DayAgenda appointments={today} onOpen={setOpen} /> : <p className="py-3 text-[14px] text-muted">Een dag zonder sessies.</p>}
        </Panel>
        {tomorrow.length > 0 && (
          <Panel title="Morgen" bodyClassName="pt-1">
            <DayAgenda appointments={tomorrow} onOpen={setOpen} />
          </Panel>
        )}
      </div>

      {/* Een prikbord: per cliënt één pin met wat er tussen de sessies gebeurde. */}
      <section aria-labelledby="tussen" className="mt-14">
        <h2 id="tussen" className="type-title">
          Tussen de sessies
        </h2>
        <p className="mt-2 text-[16px] text-muted">Wat je cliënten deelden, de laatste drie dagen.</p>
        {byClient.length ? (
          <div className="mt-7 gap-4 md:columns-2 xl:columns-3">
            {byClient.map(([clientId, items]) => {
              const c = clients.find((x) => x.id === clientId);
              if (!c) return null;
              // Alles wat nieuw is sinds je laatste bezoek, aangevuld tot drie regels.
              const shown = items.filter((it, i) => i < PER_CLIENT || it.activity.at > since);
              const rest = items.length - shown.length;
              return (
                <section key={clientId} className="mb-4 break-inside-avoid rounded-[22px] bg-surface p-4 shadow-[0_0_0_1px_var(--edge)] md:p-5">
                  <Link
                    href={`/p/clienten/${clientId}?tab=logboek`}
                    className="mb-2 flex items-center gap-3 px-2 font-display text-[21px] leading-tight hover:underline hover:decoration-taupe hover:decoration-1 hover:underline-offset-4"
                  >
                    <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="md" />
                    {c.firstName} {c.lastName}
                  </Link>
                  <div className="flex flex-col">
                    {shown.map(({ activity: a, count }, i) => (
                      <ActivityItem key={i} activity={a} count={count} isNew={a.at > since} />
                    ))}
                    {rest > 0 && (
                      <Link href={`/p/clienten/${clientId}?tab=logboek`} className="self-start rounded-full px-2 pt-1 text-[13px] text-muted underline decoration-taupe decoration-1 underline-offset-4 hover:text-text">
                        Nog {rest} in het logboek van {c.firstName}
                      </Link>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <p className="mt-5 text-[14px] text-muted">Rustig de laatste dagen.</p>
        )}
      </section>

      <AppointmentDetailSheet key={open?.id ?? "geen"} appointment={open} onClose={() => setOpen(null)} />
      {creating && <NewAppointmentSheet open={creating} onOpenChange={setCreating} />}
    </>
  );
}
