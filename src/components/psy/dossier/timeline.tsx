"use client";

import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { ActivityItem } from "@/components/psy/activity";
import { statusLabel, typeLabel } from "@/components/shared/appointment-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import Link from "next/link";
import { Lock } from "lucide-react";
import { activityFor, excerpt, useActivitySource, useSessionNotes, type Activity } from "@/lib/data";
import { capitalize, formatLongDate, formatTime } from "@/lib/format";
import type { ID } from "@/lib/types";

type Filter = "alles" | "journal" | "tafel" | "task" | "sessies";

type Segment = {
  /** De sessie die dit stuk afsluit (bovenaan), of null voor "sinds de laatste sessie". */
  session: Extract<Activity, { kind: "appointment" }> | null;
  items: { activity: Activity; count: number }[];
};

/** Tijdlijn per cliënt, opgedeeld in wat er tussen twee sessies gebeurde. */
export function Timeline({ clientId }: { clientId: ID }) {
  const source = useActivitySource();
  const notes = useSessionNotes(clientId);
  const [filter, setFilter] = useState<Filter>("alles");

  const segments = useMemo(() => {
    // Sessienotities horen bij hun sessie: ze staan in de sessiekop, niet in de stroom.
    const all = activityFor(source, { clientId });
    const keep = (a: Activity) => a.kind === "appointment" || filter === "alles" || a.kind === filter;

    const result: Segment[] = [{ session: null, items: [] }];
    for (const a of all) {
      if (a.kind === "appointment") {
        if (a.appointment.status === "geannuleerd" && filter !== "sessies") continue;
        result.push({ session: a, items: [] });
        continue;
      }
      if (!keep(a)) continue;
      const seg = result[result.length - 1];
      // Opdrachten binnen één periode bundelen.
      if (a.kind === "task") {
        const same = seg.items.find((x) => x.activity.kind === "task" && x.activity.task.id === a.task.id);
        if (same) {
          same.count += 1;
          continue;
        }
      }
      seg.items.push({ activity: a, count: 1 });
    }
    return result;
  }, [source, clientId, filter]);

  const empty = segments.every((s) => !s.items.length) && segments.length <= 1;

  return (
    <div>
      <Segmented
        label="Filter"
        size="sm"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "alles", label: "Alles" },
          { value: "journal", label: "Logboek" },
          { value: "tafel", label: "Tafel" },
          { value: "task", label: "Opdrachten" },
          { value: "sessies", label: "Sessies" },
        ]}
      />

      {empty ? (
        <EmptyState title="Nog geen activiteit" description="Wat je cliënt deelt, verschijnt hier." />
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {segments.map((seg, i) => {
            if (!seg.session && !seg.items.length) return null;
            const s = seg.session?.appointment;
            return (
              <section key={seg.session ? seg.session.appointment.id : "nu"}>
                {s ? (
                  <div className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="h-px flex-1 bg-surface-2" />
                      <span className="text-[12px] font-medium text-muted">
                        {typeLabel[s.type]}, {capitalize(formatLongDate(parseISO(s.start)))} om {formatTime(s.start)}
                        {s.status !== "voltooid" && `, ${statusLabel[s.status].toLowerCase()}`}
                      </span>
                      <span className="h-px flex-1 bg-surface-2" />
                    </div>
                    {(() => {
                      const note = notes.find((n) => n.appointmentId === s.id && n.blocks.length);
                      return note ? (
                        <Link
                          href={`/p/clienten/${clientId}?tab=sessienotities`}
                          className="mx-auto mt-2 flex max-w-lg items-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-[12px] text-muted hover:bg-surface-2/80"
                        >
                          <Lock className="size-3 shrink-0 stroke-[1.75]" />
                          <span className="truncate">{excerpt(note.blocks, 120)}</span>
                        </Link>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <p className="py-3 text-[12px] font-medium tracking-[0.06em] text-faint uppercase">Sinds de laatste sessie</p>
                )}
                {filter === "sessies" ? null : seg.items.length ? (
                  <ol className="relative before:absolute before:bottom-4 before:left-[23px] before:top-4 before:w-px before:bg-surface-2">
                    {seg.items.map(({ activity, count }, j) => (
                      <li key={j} className="relative">
                        <ActivityItem activity={activity} count={count} />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="px-2 pb-3 text-[13px] text-faint">
                    {i === 0 ? "Nog niets sinds de laatste sessie." : "Niets gedeeld in deze periode."}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
