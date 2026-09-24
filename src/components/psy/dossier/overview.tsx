"use client";

import { useMemo } from "react";
import Link from "next/link";
import { addDays, format, parseISO, startOfDay, subDays } from "date-fns";
import { ActivityItem } from "@/components/psy/activity";
import { minutesOf, typeLabel } from "@/components/shared/appointment-card";
import { moodLabel } from "@/components/shared/mood";
import { Panel } from "@/components/shared/panel";
import { WeekDots } from "@/components/shared/week-dots";
import { Button } from "@/components/ui/button";
import {
  activityFor,
  past,
  PSY_ID,
  upcoming,
  useActivitySource,
  useAppointments,
  useJournal,
  useTaskEntries,
  useTasks,
  weekProgress,
} from "@/lib/data";
import { formatAppointment, formatRelativeDay } from "@/lib/format";
import type { Client } from "@/lib/types";
import { cn } from "@/lib/utils";

function MoodStrip({ client }: { client: Client }) {
  const entries = useJournal(client.id, { sharedOnly: true });
  const days = useMemo(() => {
    const start = subDays(startOfDay(new Date()), 13);
    return Array.from({ length: 14 }, (_, i) => {
      const d = addDays(start, i);
      const key = format(d, "yyyy-MM-dd");
      const moods = entries.filter((e) => e.mood && e.createdAt.slice(0, 10) === key).map((e) => e.mood!);
      const mood = moods.length ? Math.round(moods.reduce((a, b) => a + b, 0) / moods.length) : undefined;
      return { d, key, mood };
    });
  }, [entries]);

  if (!days.some((d) => d.mood)) return <p className="py-2 text-[14px] text-muted">Nog geen stemming gedeeld.</p>;

  return (
    <div>
      <div className="flex h-20 items-end gap-1.5" role="img" aria-label="Stemming uit gedeelde logboekentries, laatste twee weken">
        {days.map((d) => (
          <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1" title={d.mood ? `${formatRelativeDay(d.d)}: ${moodLabel(d.mood as 1)}` : undefined}>
            {d.mood ? (
              <span className="w-full max-w-4 rounded-full bg-taupe/70" style={{ height: `${d.mood * 12}px` }} />
            ) : (
              <span className="size-1 rounded-full bg-surface-2" />
            )}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-faint">
        <span>2 weken geleden</span>
        <span>Vandaag</span>
      </div>
    </div>
  );
}

export function Overview({ client, onPlan }: { client: Client; onPlan: () => void }) {
  const appointments = useAppointments(client.id);
  const next = upcoming(appointments)[0];
  const last = past(appointments).find((a) => a.status === "voltooid");
  const source = useActivitySource();
  const recent = useMemo(
    () =>
      activityFor(source, { clientId: client.id, since: last?.end })
        .filter((a) => a.kind !== "appointment" && !(a.kind === "tafel" && a.authorId === PSY_ID))
        .slice(0, 5),
    [source, client.id, last?.end]
  );
  const tasks = useTasks(client.id).filter((t) => t.recurrence);
  const entries = useTaskEntries();

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Volgende afspraak">
        {next ? (
          <>
            <p className="text-[20px] font-semibold tracking-tight">{formatAppointment(next.start)}</p>
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
        {last && <p className="mt-4 text-[13px] text-faint">Laatste sessie: {formatRelativeDay(parseISO(last.start))}</p>}
      </Panel>

      <Panel title="Stemming" description="Uit gedeelde logboekentries">
        <MoodStrip client={client} />
      </Panel>

      <Panel title="Sinds de laatste sessie" href={`/p/clienten/${client.id}?tab=tijdlijn`} hrefLabel="Tijdlijn" bodyClassName="pt-1">
        {recent.length ? (
          <div className="-mx-2 flex flex-col">
            {recent.map((a, i) => (
              <ActivityItem key={i} activity={a} />
            ))}
          </div>
        ) : (
          <p className="py-3 text-[14px] text-muted">Nog niets gedeeld sinds de laatste sessie.</p>
        )}
      </Panel>

      <Panel title="Opdrachten deze week" href={`/p/clienten/${client.id}?tab=opdrachten`} hrefLabel="Opdrachten" bodyClassName="pt-1">
        {tasks.length ? (
          <ul className="divide-y divide-surface-2/70">
            {tasks.map((t) => {
              const p = weekProgress(t, entries);
              return (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium">{t.title}</span>
                    <span className={cn("block text-[12px] text-muted")}>
                      {p.done} van {p.total} dagen
                    </span>
                  </span>
                  <WeekDots days={p.days} />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="py-3 text-[14px] text-muted">
            Geen herhalende opdrachten.{" "}
            <Link href={`/p/clienten/${client.id}?tab=opdrachten`} className="underline decoration-surface-2 underline-offset-4 hover:text-text">
              Opdracht geven
            </Link>
          </p>
        )}
      </Panel>
    </div>
  );
}
