"use client";

import { useMemo } from "react";
import Link from "next/link";
import { parseISO } from "date-fns";
import { AgendaList } from "@/components/sessions/agenda-list";
import { SessionTaskRow } from "@/components/sessions/session-view";
import { minutesOf, typeLabel } from "@/lib/appointments";
import { moodLabel, moods } from "@/components/shared/mood";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { moodStrip, pastSessions, taskState, upcoming, useAppointments, useJournal, useTasks } from "@/lib/data";
import { formatAppointment, formatRelativeDay, formatShortDate, plural } from "@/lib/format";
import type { Client } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Stemming uit gedeelde check-ins, laatste twee weken. Enkel wat gedeeld is. */
export function MoodStrip({ clientId }: { clientId: string }) {
  const journal = useJournal(clientId, { sharedOnly: true });
  const days = useMemo(() => moodStrip(journal, 14), [journal]);

  if (!days.some((d) => d.mood)) return <p className="py-2 text-[14px] text-muted">Nog geen check-ins gedeeld.</p>;

  return (
    <div>
      <div className="flex h-24 items-end gap-1.5" role="img" aria-label="Stemming uit gedeelde check-ins, laatste twee weken">
        {days.map((d) => (
          <div
            key={d.day}
            className="flex h-full flex-1 flex-col items-center justify-end"
            title={d.mood ? `${formatShortDate(d.date)}: ${moodLabel(d.mood)}` : `${formatShortDate(d.date)}: geen check-in`}
          >
            {d.mood ? (
              <span className="w-full max-w-4 rounded-full bg-taupe/70" style={{ height: `${d.mood * 18}%` }} />
            ) : (
              <span className="size-1 rounded-full bg-surface-2" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-faint">
        <span>2 weken geleden</span>
        <span>
          {moods[0].label} tot {moods[4].label.toLowerCase()}
        </span>
        <span>Vandaag</span>
      </div>
    </div>
  );
}

export function Overview({ client, onPlan }: { client: Client; onPlan: () => void }) {
  const appointments = useAppointments(client.id);
  const next = upcoming(appointments)[0];
  const last = pastSessions(appointments)[0];
  const journal = useJournal(client.id, { sharedOnly: true });
  const tasks = useTasks(client.id);
  const open = tasks.filter((t) => taskState(t, journal) === "open");
  const sinceLast = last ? journal.filter((j) => j.createdAt > last.end).length : journal.length;

  return (
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2">
      <div className="flex flex-col gap-5">
        <Panel title="Volgende sessie">
          {next ? (
            <>
              <p className="text-[20px] font-semibold tracking-tight tabular-nums">{formatAppointment(next.start)}</p>
              <p className="mt-1 text-[14px] text-muted">
                {typeLabel[next.type]}, {next.mode}, {minutesOf(next)} minuten
              </p>
            </>
          ) : (
            <>
              <p className="text-[14px] text-muted">Niets gepland.</p>
              <Button size="sm" className="mt-3" onClick={onPlan}>
                Afspraak plannen
              </Button>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
            {last && (
              <Link href={`/p/clienten/${client.id}/sessies/${last.id}`} className="underline decoration-surface-2 underline-offset-4 hover:text-text">
                Laatste sessie: {formatRelativeDay(parseISO(last.start))}
              </Link>
            )}
            <Link href={`/p/clienten/${client.id}?tab=logboek`} className={cn("underline decoration-surface-2 underline-offset-4 hover:text-text", !sinceLast && "no-underline")}>
              {sinceLast ? `${plural(sinceLast, "gedeelde entry", "gedeelde entries")} sindsdien` : "Sindsdien niets gedeeld"}
            </Link>
          </div>
        </Panel>

        <Panel title="Voor volgende keer" description="Wat jullie willen bespreken" className="scroll-mt-24" >
          <div id="voor-volgende-keer" className="scroll-mt-24">
            <AgendaList clientId={client.id} viewer="psy" entryHref={(id) => `/p/clienten/${client.id}?tab=logboek&entry=${id}`} />
          </div>
        </Panel>
      </div>
      <div className="flex flex-col gap-5">

        <Panel title="Open opdrachten" href={`/p/clienten/${client.id}?tab=opdrachten`} hrefLabel="Opdrachten" bodyClassName="pt-1">
          {open.length ? (
            <ul className="divide-y divide-surface-2/70">
              {open.map((t) => (
                <SessionTaskRow key={t.id} task={t} journal={journal} />
              ))}
            </ul>
          ) : (
            <p className="py-3 text-[14px] text-muted">Geen open opdrachten.</p>
          )}
        </Panel>

        <Panel title="Stemming" description="Uit gedeelde check-ins, laatste twee weken">
          <MoodStrip clientId={client.id} />
        </Panel>
      </div>
    </div>
  );
}
