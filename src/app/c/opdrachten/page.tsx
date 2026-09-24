"use client";

import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/shared/panel";
import { TaskRow } from "@/components/shared/task-row";
import { WeekDots } from "@/components/shared/week-dots";
import { EmptyState } from "@/components/ui/empty-state";
import {
  CURRENT_CLIENT_ID,
  isOpenOneOff,
  recurrenceLabel,
  tasksForDay,
  usePsychologist,
  useTaskEntries,
  useTasks,
  weekProgress,
} from "@/lib/data";
import { formatDayMonth } from "@/lib/format";

export default function Opdrachten() {
  const psy = usePsychologist();
  const tasks = useTasks(CURRENT_CLIENT_ID);
  const entries = useTaskEntries();
  const today = tasksForDay(tasks, entries);
  const recurring = tasks.filter((t) => t.recurrence);
  const finishedOneOffs = tasks.filter((t) => !t.recurrence && !isOpenOneOff(t, entries));

  return (
    <>
      <PageHeader title="Opdrachten" eyebrow={`Van ${psy.firstName}, op je eigen tempo`} />

      {tasks.length === 0 ? (
        <div className="mt-8 rounded-card bg-surface shadow-soft">
          <EmptyState title="Geen opdrachten" description={`Als ${psy.firstName} je iets meegeeft, vind je het hier.`} />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Panel title="Vandaag" bodyClassName="pt-1">
            {today.length ? (
              <div className="divide-y divide-surface-2/70">
                {today.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            ) : (
              <p className="py-3 text-[14px] text-muted">Niets voor vandaag. Geen druk.</p>
            )}
          </Panel>

          <div className="flex flex-col gap-5">
            {recurring.length > 0 && (
              <Panel title="Deze week" description="Gevuld is gedaan. Een lege dag is ook oké." bodyClassName="pt-1">
                <ul className="divide-y divide-surface-2/70">
                  {recurring.map((t) => {
                    const p = weekProgress(t, entries);
                    return (
                      <li key={t.id} className="flex items-center justify-between gap-4 py-3.5">
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-medium">{t.title}</p>
                          <p className="text-[12px] text-muted">
                            {recurrenceLabel(t)}, {p.done} van {p.total} dagen
                          </p>
                        </div>
                        <WeekDots days={p.days} />
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            )}

            {finishedOneOffs.length > 0 && (
              <Panel title="Afgerond" bodyClassName="pt-1">
                <ul className="divide-y divide-surface-2/70">
                  {finishedOneOffs.map((t) => {
                    const e = entries.find((x) => x.taskId === t.id && x.completed);
                    return (
                      <li key={t.id} className="py-3">
                        <p className="text-[14px] font-medium text-muted">{t.title}</p>
                        {e && <p className="text-[12px] text-faint">Gedaan op {formatDayMonth(e.updatedAt)}</p>}
                      </li>
                    );
                  })}
                </ul>
              </Panel>
            )}
          </div>
        </div>
      )}
    </>
  );
}
