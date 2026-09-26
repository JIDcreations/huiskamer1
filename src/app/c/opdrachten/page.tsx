"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { SessionTaskRow } from "@/components/sessions/session-view";
import { EmptyState } from "@/components/ui/empty-state";
import { CURRENT_CLIENT_ID, taskState, useAppointments, useJournal, useTasks } from "@/lib/data";
import { formatDayMonth } from "@/lib/format";
import type { Task } from "@/lib/types";

function Group({ title, tasks, hint }: { title: string; tasks: Task[]; hint?: string }) {
  const journal = useJournal(CURRENT_CLIENT_ID);
  const appointments = useAppointments(CURRENT_CLIENT_ID);
  if (!tasks.length) return null;
  return (
    <section className="mt-8">
      <h2 className="mb-1 px-1 text-[15px] font-semibold tracking-tight">{title}</h2>
      {hint && <p className="mb-2 px-1 text-[13px] text-muted">{hint}</p>}
      <ul className="divide-y divide-surface-2/70 card px-5 md:px-6">
        {tasks.map((t) => {
          const from = appointments.find((a) => a.id === t.appointmentId);
          return (
            <SessionTaskRow
              key={t.id}
              task={t}
              journal={journal}
              action={
                from && (
                  <Link
                    href={`/c/sessies/${from.id}`}
                    className="hidden shrink-0 text-[12px] text-faint underline decoration-surface-2 underline-offset-4 hover:text-muted sm:inline"
                  >
                    Sessie {formatDayMonth(from.start)}
                  </Link>
                )
              }
            />
          );
        })}
      </ul>
    </section>
  );
}

export default function Opdrachten() {
  const active = useTasks(CURRENT_CLIENT_ID);
  const archived = useTasks(CURRENT_CLIENT_ID, { archived: true });
  const journal = useJournal(CURRENT_CLIENT_ID);

  const groups = useMemo(() => {
    const all = [...active, ...archived].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const state = (t: Task) => taskState(t, journal);
    return {
      open: all.filter((t) => state(t) === "open"),
      done: all.filter((t) => state(t) === "gedaan"),
      rest: all.filter((t) => state(t) === "niet gedaan" || state(t) === "afgelopen"),
    };
  }, [active, archived, journal]);

  const empty = !groups.open.length && !groups.done.length && !groups.rest.length;

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader title="Alle opdrachten" eyebrow="Wat je vandaag doet, staat in Vandaag" />
      {empty ? (
        <div className="mt-8 card">
          <EmptyState title="Nog geen opdrachten" description="Opdrachten spreek je samen af in een sessie. Ze verschijnen dan hier en in Vandaag." />
        </div>
      ) : (
        <>
          <Group title="Lopend" tasks={groups.open} />
          <Group title="Gedaan" tasks={groups.done} />
          <Group title="Voorbij" tasks={groups.rest} hint="Wat niet lukte, is geen probleem. Je kan het altijd bespreken." />
        </>
      )}
    </div>
  );
}
