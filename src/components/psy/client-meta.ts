"use client";

import { useMemo } from "react";
import { activityFor, PSY_ID, taskState, upcoming, useActivitySource, useTasks } from "@/lib/data";
import type { Client } from "@/lib/types";

/** Per cliënt: volgende afspraak, laatste activiteit en open opdrachten. Enkel gedeelde entries tellen. */
export function useClientMeta(clients: Client[]) {
  const source = useActivitySource();
  const tasks = useTasks();
  return useMemo(() => {
    const activity = activityFor(source, { viewerId: PSY_ID }).filter((a) => a.kind !== "appointment");
    const shared = source.journal.filter((j) => j.sharedWithPsychologist);
    return new Map(
      clients.map((c) => {
        const own = source.appointments.filter((a) => a.clientId === c.id);
        return [
          c.id,
          {
            next: upcoming(own)[0],
            last: activity.find((a) => a.clientId === c.id),
            openTasks: tasks.filter((t) => t.clientId === c.id && taskState(t, shared) === "open").length,
          },
        ];
      })
    );
  }, [clients, source, tasks]);
}
