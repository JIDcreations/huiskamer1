"use client";

import { useMemo } from "react";
import { activityFor, isOpenOneOff, PSY_ID, upcoming, useActivitySource, useTaskEntries } from "@/lib/data";
import type { Client } from "@/lib/types";

/** Per cliënt: volgende afspraak, laatste activiteit en open opdrachten. */
export function useClientMeta(clients: Client[]) {
  const source = useActivitySource();
  const entries = useTaskEntries();
  return useMemo(() => {
    const activity = activityFor(source, {}).filter((a) => a.kind !== "appointment" && !(a.kind === "tafel" && a.authorId === PSY_ID));
    return new Map(
      clients.map((c) => {
        const own = source.appointments.filter((a) => a.clientId === c.id);
        const tasks = source.tasks.filter((t) => t.clientId === c.id && !t.archived);
        return [
          c.id,
          {
            next: upcoming(own)[0],
            last: activity.find((a) => a.clientId === c.id),
            openTasks: tasks.filter((t) => t.recurrence || isOpenOneOff(t, entries)).length,
          },
        ];
      })
    );
  }, [clients, source, entries]);
}
