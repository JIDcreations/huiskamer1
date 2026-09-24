"use client";

import { useState } from "react";
import { Archive, MoreHorizontal, Plus, RotateCcw } from "lucide-react";
import { AssignTaskSheet } from "@/components/psy/assign-task";
import { kindLabel } from "@/components/psy/task-form";
import { Panel } from "@/components/shared/panel";
import { WeekDots } from "@/components/shared/week-dots";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { actions, isOpenOneOff, recurrenceLabel, useTaskEntries, useTasks, weekProgress } from "@/lib/data";
import { formatDayMonth, formatRelativeDay } from "@/lib/format";
import type { Client, Task } from "@/lib/types";

function TaskCard({ task }: { task: Task }) {
  const entries = useTaskEntries();
  const own = entries.filter((e) => e.taskId === task.id && e.completed).sort((a, b) => b.date.localeCompare(a.date));
  const p = task.recurrence ? weekProgress(task, entries) : null;
  const open = !task.recurrence && isOpenOneOff(task, entries);

  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[15px] font-medium">{task.title}</p>
          <p className="text-[12px] text-muted">
            {kindLabel[task.kind]}, {task.recurrence ? recurrenceLabel(task) : task.dueDate ? `tegen ${formatRelativeDay(task.dueDate)}` : "eenmalig"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {p ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-[12px] text-muted sm:inline">
                {p.done} van {p.total}
              </span>
              <WeekDots days={p.days} />
            </div>
          ) : (
            <span className="text-[12px] text-muted">{open ? "Nog open" : `Gedaan op ${formatDayMonth(own[0]?.updatedAt ?? task.createdAt)}`}</span>
          )}
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
                  toast(task.archived ? "Teruggezet" : "Gearchiveerd");
                }}
              >
                {task.archived ? <RotateCcw /> : <Archive />} {task.archived ? "Terugzetten" : "Archiveren"}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>

      {task.kind === "tekst" && own.some((e) => e.answer) && (
        <ul className="mt-3 flex flex-col gap-2">
          {own
            .filter((e) => e.answer)
            .slice(0, 3)
            .map((e) => (
              <li key={e.id} className="rounded-xl bg-oat-soft px-3.5 py-2.5 text-[14px] leading-relaxed">
                <span className="mb-0.5 block text-[12px] text-muted">{formatRelativeDay(e.date)}</span>
                {e.answer}
              </li>
            ))}
        </ul>
      )}

      {task.kind === "schaal" && own.length > 0 && (
        <div className="mt-3 flex items-end gap-1.5" aria-label={`${task.scaleLabel ?? "Score"}, laatste keren`}>
          {own
            .slice(0, 10)
            .reverse()
            .map((e) => (
              <div key={e.id} className="flex flex-col items-center gap-1">
                <span className="w-5 rounded-sm bg-surface-2" style={{ height: `${(e.scale ?? 0) * 4}px` }} title={`${e.scale} op 10`}>
                  <span className="block h-full w-full rounded-sm bg-faint/60" />
                </span>
                <span className="text-[10px] tabular-nums text-faint">{e.scale}</span>
              </div>
            ))}
          <span className="ml-2 pb-4 text-[12px] text-muted">{task.scaleLabel}</span>
        </div>
      )}
    </div>
  );
}

export function TasksTab({ client }: { client: Client }) {
  const active = useTasks(client.id);
  const archived = useTasks(client.id, { archived: true });
  const [assigning, setAssigning] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <Panel
        title="Lopende opdrachten"
        action={
          <Button size="sm" onClick={() => setAssigning(true)}>
            <Plus /> Opdracht geven
          </Button>
        }
        bodyClassName="pt-1"
      >
        {active.length ? (
          <div className="divide-y divide-surface-2/70">
            {active.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        ) : (
          <EmptyState title="Geen opdrachten" description={`Geef ${client.firstName} iets kleins mee voor tussen de sessies.`} />
        )}
      </Panel>
      {archived.length > 0 && (
        <Panel title="Gearchiveerd" bodyClassName="pt-1">
          <div className="divide-y divide-surface-2/70 opacity-80">
            {archived.map((t) => (
              <TaskCard key={t.id} task={t} />
            ))}
          </div>
        </Panel>
      )}
      {assigning && <AssignTaskSheet open={assigning} onOpenChange={setAssigning} clientId={client.id} />}
    </div>
  );
}
