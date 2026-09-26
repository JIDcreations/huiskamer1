"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Archive, MoreHorizontal, Plus, RotateCcw } from "lucide-react";
import { AssignTaskSheet } from "@/components/psy/assign-task";
import { kindLabel } from "@/components/psy/task-form";
import { entrySummary } from "@/components/shared/journal-list";
import { Panel } from "@/components/shared/panel";
import { RhythmLabel } from "@/components/shared/rhythm";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { actions, taskEntries, taskState, useAppointments, useJournal, useTasks, weekProgress } from "@/lib/data";
import { formatDayMonth, formatRelativeDay } from "@/lib/format";
import type { Client, JournalEntry, Task } from "@/lib/types";

/** Voortgang uit gedeelde opdracht-entries. Wat enkel voor de cliënt is, telt hier niet mee. */
function TaskCard({ task, journal, clientId }: { task: Task; journal: JournalEntry[]; clientId: string }) {
  const appointments = useAppointments(clientId);
  const own = taskEntries(journal, task.id).sort((a, b) => b.day.localeCompare(a.day));
  const state = taskState(task, journal);
  const p = weekProgress(task, journal);
  const from = appointments.find((a) => a.id === task.appointmentId);

  const status =
    task.rhythm.kind === "eenmalig"
      ? state === "gedaan"
        ? `Gedaan op ${formatDayMonth(own[0].day)}`
        : state === "niet gedaan"
          ? "Niet gedaan"
          : "Open"
      : p
        ? `${p.done} van ${p.total} deze week`
        : "";

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium">{task.title}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-muted">
            <RhythmLabel rhythm={task.rhythm} />
            <span aria-hidden className="size-[3px] rounded-full bg-taupe" />
            {kindLabel[task.kind]}
            {from && (
              <>
                <span aria-hidden className="size-[3px] rounded-full bg-taupe" />
                <Link href={`/p/clienten/${clientId}/sessies/${from.id}`} className="underline decoration-surface-2 underline-offset-4 hover:text-text">
                  Sessie {formatDayMonth(from.start)}
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-muted tabular-nums">{status}</span>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="quiet" size="icon-sm" aria-label="Meer">
                <MoreHorizontal />
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                onSelect={() => {
                  actions.archiveTask(task.id, !task.archived);
                  toast(task.archived ? "Teruggezet" : "Gestopt");
                }}
              >
                {task.archived ? <RotateCcw /> : <Archive />} {task.archived ? "Terugzetten" : "Stoppen met deze opdracht"}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>

      {task.kind === "schaal" && own.some((e) => e.scale) && (
        <div className="mt-3 flex items-end gap-1.5" aria-label={`${task.scaleLabel ?? "Score"}, laatste keren`}>
          {own
            .slice(0, 12)
            .reverse()
            .map((e) => (
              <div key={e.id} className="flex flex-col items-center gap-1" title={`${formatRelativeDay(e.day)}: ${e.scale} op 10`}>
                <span className="w-4 rounded-full bg-taupe/60" style={{ height: `${(e.scale ?? 0) * 4}px` }} />
                <span className="text-[10px] tabular-nums text-faint">{e.scale}</span>
              </div>
            ))}
        </div>
      )}

      {task.kind !== "schaal" && own.some((e) => e.blocks.length) && (
        <ul className="mt-3 flex flex-col gap-2">
          {own
            .filter((e) => e.blocks.length)
            .slice(0, 3)
            .map((e) => (
              <li key={e.id}>
                <Link
                  href={`/p/clienten/${clientId}?tab=logboek&entry=${e.id}`}
                  className="block rounded-xl bg-oat-soft px-3.5 py-2.5 text-[14px] leading-relaxed transition-colors hover:bg-surface-2/70"
                >
                  <span className="mb-0.5 block text-[12px] text-muted">{formatRelativeDay(e.day)}</span>
                  {entrySummary(e, task)}
                </Link>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

export function TasksTab({ client }: { client: Client }) {
  const active = useTasks(client.id);
  const archived = useTasks(client.id, { archived: true });
  const journal = useJournal(client.id, { sharedOnly: true });
  const [assigning, setAssigning] = useState(false);
  const { open, past } = useMemo(() => {
    const open = active.filter((t) => taskState(t, journal) === "open");
    const past = [...active.filter((t) => taskState(t, journal) !== "open"), ...archived];
    return { open, past };
  }, [active, archived, journal]);

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Lopende opdrachten"
        description="Voortgang uit wat gedeeld is"
        action={
          <Button size="sm" onClick={() => setAssigning(true)}>
            <Plus /> Opdracht geven
          </Button>
        }
        bodyClassName="pt-1"
      >
        {open.length ? (
          <div className="divide-y divide-surface-2/70">
            {open.map((t) => (
              <TaskCard key={t.id} task={t} journal={journal} clientId={client.id} />
            ))}
          </div>
        ) : (
          <EmptyState title="Geen lopende opdrachten" description={`Geef ${client.firstName} iets kleins mee, liefst vanuit een sessie.`} />
        )}
      </Panel>
      {past.length > 0 && (
        <Panel title="Voorbij" bodyClassName="pt-1">
          <div className="divide-y divide-surface-2/70 opacity-85">
            {past.map((t) => (
              <TaskCard key={t.id} task={t} journal={journal} clientId={client.id} />
            ))}
          </div>
        </Panel>
      )}
      {assigning && <AssignTaskSheet open={assigning} onOpenChange={setAssigning} clientId={client.id} />}
    </div>
  );
}
