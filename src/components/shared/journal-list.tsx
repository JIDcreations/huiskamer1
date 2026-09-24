"use client";

import Link from "next/link";
import { differenceInCalendarWeeks, parseISO, startOfWeek } from "date-fns";
import { Lock, MessageSquareText } from "lucide-react";
import { MoodDots } from "@/components/shared/mood";
import { excerpt } from "@/lib/data";
import { capitalize, formatDayMonth, formatLongDate, formatTime } from "@/lib/format";
import type { JournalEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

export function weekLabel(iso: string) {
  const diff = differenceInCalendarWeeks(new Date(), parseISO(iso), { weekStartsOn: 1 });
  if (diff === 0) return "Deze week";
  if (diff === 1) return "Vorige week";
  return `Week van ${formatDayMonth(startOfWeek(parseISO(iso), { weekStartsOn: 1 }))}`;
}

export function groupByWeek<T extends { createdAt: string }>(items: T[]) {
  const groups: { label: string; items: T[] }[] = [];
  for (const item of items) {
    const label = weekLabel(item.createdAt);
    const g = groups.find((x) => x.label === label);
    if (g) g.items.push(item);
    else groups.push({ label, items: [item] });
  }
  return groups;
}

export function JournalCard({
  entry,
  href,
  psyName,
  showShare = true,
  active,
}: {
  entry: JournalEntry;
  href: string;
  psyName: string;
  showShare?: boolean;
  active?: boolean;
}) {
  const text = excerpt(entry.blocks, 180);
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-card bg-surface px-5 py-4 shadow-soft ring-1 ring-surface-2/60 transition-colors hover:bg-oat-soft/40",
        active && "ring-faint/60"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <p className="text-[13px] text-muted">
          {capitalize(formatLongDate(entry.createdAt))}, {formatTime(entry.createdAt)}
        </p>
        <MoodDots value={entry.mood} />
      </div>
      {entry.title && <p className="mt-1.5 text-[15px] font-semibold tracking-tight">{entry.title}</p>}
      <p className={cn("text-[15px] leading-relaxed text-text", entry.title ? "mt-0.5 text-muted" : "mt-1.5")}>
        {text || <span className="text-faint">Nog leeg</span>}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px] text-muted">
        {entry.tags.map((t) => (
          <span key={t} className="rounded-full bg-oat-soft px-2 py-0.5">
            {t}
          </span>
        ))}
        {showShare && (
          <span className="ml-auto inline-flex items-center gap-1.5">
            {entry.sharedWithPsychologist ? (
              `Gedeeld met ${psyName}`
            ) : (
              <>
                <Lock className="size-3 stroke-[1.75]" /> Enkel voor jou
              </>
            )}
          </span>
        )}
        {entry.psychologistNote && (
          <span className="inline-flex w-full items-center gap-1.5 text-muted">
            <MessageSquareText className="size-3.5 stroke-[1.5] text-faint" />
            {psyName} schreef een kanttekening
          </span>
        )}
      </div>
    </Link>
  );
}
