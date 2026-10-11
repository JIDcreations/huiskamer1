"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MapPin, Plus, Video } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { beelden } from "@/lib/beelden";
import { AgendaList } from "@/components/sessions/agenda-list";
import { BookingSheets, type BookingFlow } from "@/components/sessions/booking";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  canChange,
  CURRENT_CLIENT_ID,
  excerpt,
  newBlocks,
  pastSessions,
  upcoming,
  useAppointments,
  usePsychologist,
  useSeenLookup,
  useSessionPages,
} from "@/lib/data";
import { capitalize, formatDayMonth, formatLongDate, formatRelativeDay, formatTime } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

function NextSession({ appointment, onFlow }: { appointment: Appointment; onFlow: (f: BookingFlow) => void }) {
  const psy = usePsychologist();
  const changeable = canChange(appointment, psy);
  const Icon = appointment.mode === "online" ? Video : MapPin;
  return (
    <div className="text-on-accent">
      <p className="inline-flex items-center gap-2 text-[13px] font-medium text-sun">
        <span aria-hidden className="size-2 rounded-full bg-sun" />
        Volgende sessie
      </p>
      <p className="mt-2 type-title text-on-accent">
        {/^(vandaag|morgen)$/.test(formatRelativeDay(appointment.start))
          ? `${capitalize(formatRelativeDay(appointment.start))}, ${formatDayMonth(appointment.start)}`
          : capitalize(formatLongDate(appointment.start))}
      </p>
      <p className="mt-2 text-[15px] tabular-nums">
        {formatTime(appointment.start)} tot {formatTime(appointment.end)}
        <span className="text-on-accent/75"> bij {psy.name}</span>
      </p>
      <p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-on-accent/75">
        <Icon className="size-4 shrink-0 stroke-[1.5] text-sun" />
        {appointment.mode === "online" ? "Online. De link verschijnt hier 10 minuten op voorhand." : psy.address}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button variant="sun" size="sm" disabled={!changeable} onClick={() => onFlow({ kind: "move", appointment })}>
          Verzetten
        </Button>
        <Button variant="ghost" size="sm" className="text-on-accent hover:bg-on-accent/10 active:bg-on-accent/15" disabled={!changeable} onClick={() => onFlow({ kind: "cancel", appointment })}>
          Annuleren
        </Button>
      </div>
      <p className="mt-3 text-[12px] text-on-accent/70">
        {changeable
          ? `Verzetten of annuleren kan kosteloos tot ${psy.cancellationHours} uur op voorhand.`
          : `Minder dan ${psy.cancellationHours} uur op voorhand. Wil je toch iets veranderen? Bel ${psy.firstName} op ${psy.phone}.`}
      </p>
    </div>
  );
}

export default function Sessies() {
  const psy = usePsychologist();
  const appointments = useAppointments(CURRENT_CLIENT_ID);
  const next = upcoming(appointments)[0];
  const later = upcoming(appointments).slice(1);
  const history = pastSessions(appointments);
  const pages = useSessionPages(CURRENT_CLIENT_ID);
  const seen = useSeenLookup("client");
  const [flow, setFlow] = useState<BookingFlow>(null);

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        image={beelden.thee}
        title="Sessies"
        eyebrow={`Bij ${psy.name}`}
        actions={
          <Button variant="sun" onClick={() => setFlow({ kind: "book" })}>
            <Plus /> <span className="hidden sm:inline">Nieuwe afspraak boeken</span>
            <span className="sm:hidden">Boeken</span>
          </Button>
        }
      />

      <Panel className={cn("mt-6", next && "bg-pine")}>
        {next ? (
          <NextSession appointment={next} onFlow={setFlow} />
        ) : (
          <EmptyState
            className="py-8"
            title="Geen sessie gepland"
            description="Kies een moment dat past. Je ziet meteen wat er vrij is."
            action={<Button onClick={() => setFlow({ kind: "book" })}>Nieuwe afspraak boeken</Button>}
          />
        )}
        {later.length > 0 && (
          <p className={cn("mt-5 border-t pt-4 text-[13px] tabular-nums", next ? "border-on-accent/15 text-on-accent/75" : "border-surface-2 text-muted")}>
            Daarna: {later.map((a) => `${formatDayMonth(a.start)} om ${formatTime(a.start)}`).join(", ")}
          </p>
        )}
      </Panel>

      <Panel
        className="mt-5"
        title="Voor volgende keer"
        description={next ? `Wat je op ${formatDayMonth(next.start)} wil bespreken` : "Wat je in je volgende sessie wil bespreken"}
      >
        <AgendaList clientId={CURRENT_CLIENT_ID} viewer="client" entryHref={(id) => `/c/logboek/${id}`} />
      </Panel>

      <section className="mt-10" aria-labelledby="voorbij">
        <h2 id="voorbij" className="type-subtitle mb-3 px-1">
          Voorbije sessies
        </h2>
        {history.length ? (
          <ul className="divide-y divide-surface-2/70 overflow-hidden card">
            {history.map((a) => {
              const page = pages.find((p) => p.appointmentId === a.id);
              const fresh = page ? newBlocks([...page.summary, ...page.reactions], CURRENT_CLIENT_ID, seen(`session:${a.id}`)).length : 0;
              const text = page ? excerpt(page.summary, 120) : "";
              return (
                <li key={a.id}>
                  <Link href={`/c/sessies/${a.id}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-oat-soft/40 md:px-6">
                    <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-sky-soft text-sky-ink">
                      <p className="text-[10px] font-semibold leading-none tracking-wide uppercase">{formatLongDate(a.start).slice(0, 2)}</p>
                      <p className="font-display text-[20px] leading-tight tabular-nums">{new Date(a.start).getDate()}</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[15px] font-medium">
                        {capitalize(formatLongDate(a.start))}
                        {fresh > 0 && <span className="rounded-full bg-clay-ink px-1.5 py-px text-[10px] font-semibold text-on-accent">Nieuw</span>}
                      </p>
                      <p className={cn("truncate text-[13px]", text ? "text-muted" : "text-faint")}>
                        {text || (a.type === "intake" ? "Intake" : "Nog geen samenvatting")}
                      </p>
                    </div>
                    <ChevronRight className="size-4 shrink-0 stroke-[1.5] text-taupe transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-1 text-[14px] text-muted">Na je eerste sessie vind je hier wat jullie bespraken.</p>
        )}
      </section>

      <BookingSheets clientId={CURRENT_CLIENT_ID} flow={flow} onClose={() => setFlow(null)} />
    </div>
  );
}
