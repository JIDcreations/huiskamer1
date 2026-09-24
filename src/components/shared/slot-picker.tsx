"use client";

import { useMemo, useState } from "react";
import { addWeeks, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { freeSlots, useAppointments, usePsychologist } from "@/lib/data";
import { capitalize, formatDayMonth, formatLongDate, formatTime } from "@/lib/format";
import type { ID } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Vrije momenten per week, in de beschikbaarheid van de psycholoog. */
export function SlotPicker({ value, onChange, excludeId }: { value: Date | null; onChange: (d: Date) => void; excludeId?: ID }) {
  const psy = usePsychologist();
  const all = useAppointments();
  const [week, setWeek] = useState(0);
  const start = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), week);
  const slots = useMemo(
    () => freeSlots(psy, all.filter((a) => a.id !== excludeId), start, 7),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [psy, all, excludeId, week]
  );
  const byDay = useMemo(() => {
    const map = new Map<string, Date[]>();
    for (const s of slots) {
      const k = format(s, "yyyy-MM-dd");
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="quiet" size="icon-sm" aria-label="Vorige week" disabled={week === 0} onClick={() => setWeek((w) => w - 1)}>
          <ChevronLeft />
        </Button>
        <p className="text-[14px] font-medium">
          {week === 0 ? "Deze week" : week === 1 ? "Volgende week" : `Week van ${formatDayMonth(start)}`}
        </p>
        <Button variant="quiet" size="icon-sm" aria-label="Volgende week" disabled={week >= 5} onClick={() => setWeek((w) => w + 1)}>
          <ChevronRight />
        </Button>
      </div>

      {byDay.length === 0 ? (
        <p className="rounded-xl bg-oat-soft px-4 py-6 text-center text-[14px] text-muted">
          Geen vrije momenten meer deze week. Kijk eens naar de volgende.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {byDay.map(([day, times]) => (
            <div key={day}>
              <p className="mb-2 text-[13px] text-muted">{capitalize(formatLongDate(day))}</p>
              <div className="flex flex-wrap gap-1.5">
                {times.map((t) => {
                  const active = value?.getTime() === t.getTime();
                  return (
                    <button
                      key={t.toISOString()}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onChange(t)}
                      className={cn(
                        "h-9 rounded-full px-4 text-[14px] tabular-nums transition-colors",
                        active ? "bg-accent text-on-accent" : "bg-oat-soft text-text hover:bg-surface-2"
                      )}
                    >
                      {formatTime(t)}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
