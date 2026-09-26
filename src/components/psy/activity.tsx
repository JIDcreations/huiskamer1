"use client";

import Link from "next/link";
import { CalendarDays, CalendarPlus, CheckCircle2, Lock, MessagesSquare, NotebookPen, Sun } from "lucide-react";
import { entrySummary } from "@/components/shared/journal-list";
import { MoodDots, moodLabel } from "@/components/shared/mood";
import { statusLabel, typeLabel } from "@/lib/appointments";
import { excerpt, usePersonName, useTask, type Activity } from "@/lib/data";
import { formatDayMonth, formatTime, formatWhen, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

function ActivityIcon({ activity: a }: { activity: Activity }) {
  const cls = "size-4 stroke-[1.5] text-muted";
  if (a.kind === "journal") {
    if (a.entry.kind === "checkin") return <Sun className={cls} />;
    if (a.entry.kind === "opdracht") return <CheckCircle2 className={cls} />;
    return <NotebookPen className={cls} />;
  }
  if (a.kind === "session") return <MessagesSquare className={cls} />;
  if (a.kind === "agenda") return <CalendarPlus className={cls} />;
  if (a.kind === "note") return <Lock className={cls} />;
  return <CalendarDays className={cls} />;
}

export function activityHref(a: Activity) {
  const base = `/p/clienten/${a.clientId}`;
  switch (a.kind) {
    case "journal":
      return `${base}?tab=logboek&entry=${a.entry.id}`;
    case "session":
      return `${base}/sessies/${a.appointment.id}`;
    case "agenda":
      return `${base}#voor-volgende-keer`;
    case "appointment":
      return `${base}/sessies/${a.appointment.id}`;
    case "note":
      return a.note.appointmentId ? `${base}/sessies/${a.note.appointmentId}` : `${base}?tab=sessies`;
  }
}

/** Eén regel in een tijdlijn of overzicht. */
export function ActivityItem({
  activity: a,
  isNew,
  showClient,
  timeOnly,
  count = 1,
}: {
  activity: Activity;
  isNew?: boolean;
  showClient?: boolean;
  timeOnly?: boolean;
  /** Aantal keer dat deze opdracht gedaan werd in de getoonde periode. */
  count?: number;
}) {
  const name = usePersonName();
  const task = useTask(a.kind === "journal" ? a.entry.taskId : undefined);
  const who = showClient ? name(a.clientId) : null;
  const lead = who && <strong className="font-medium">{who}, </strong>;

  let title: React.ReactNode;
  let body: React.ReactNode = null;

  switch (a.kind) {
    case "journal": {
      const e = a.entry;
      if (e.kind === "checkin") {
        title = (
          <>
            {lead}
            {count > 1 ? `${count} check-ins, laatste: ` : who ? "check-in: " : "Check-in: "}
            {moodLabel(e.mood)?.toLowerCase()}
          </>
        );
        body = e.blocks.length ? <span className="line-clamp-2">{excerpt(e.blocks, 200)}</span> : null;
      } else if (e.kind === "opdracht") {
        title = (
          <>
            {lead}
            {task?.title ?? "Opdracht"} gedaan{count > 1 ? `, ${count} keer` : ""}
          </>
        );
        const detail = entrySummary(e, task);
        body = detail && detail !== "Gedaan" ? <span className="line-clamp-2">{detail}</span> : null;
      } else {
        title = (
          <>
            {lead}
            {who ? "notitie" : "Notitie"}
            {e.title ? `: ${e.title}` : ""}
          </>
        );
        body = (
          <>
            <span className="line-clamp-2">{excerpt(e.blocks, 220)}</span>
            {e.mood && <MoodDots value={e.mood} className="mt-1.5" />}
          </>
        );
      }
      break;
    }
    case "session":
      title = (
        <>
          {lead}
          {who ? "reageerde" : "Reactie"} bij de sessie van {formatDayMonth(a.appointment.start)}
        </>
      );
      body = <span className="line-clamp-2">{excerpt(a.blocks, 200) || plural(a.blocks.length, "blok", "blokken")}</span>;
      break;
    case "agenda":
      title = (
        <>
          {lead}
          {who ? "zette iets" : "Iets"} op &ldquo;Voor volgende keer&rdquo;
        </>
      );
      body = <span className="line-clamp-2">{a.entry ? a.entry.title || excerpt(a.entry.blocks, 160) : a.item.text}</span>;
      break;
    case "appointment":
      title = (
        <>
          {lead}
          {typeLabel[a.appointment.type]}, {statusLabel[a.appointment.status].toLowerCase()}
        </>
      );
      break;
    case "note":
      title = "Sessienotitie";
      body = <span className="line-clamp-1">{excerpt(a.note.blocks, 140)}</span>;
      break;
  }

  return (
    <Link href={activityHref(a)} className="group flex gap-3.5 rounded-xl px-2 py-3 transition-colors hover:bg-oat-soft/60">
      <span
        className={cn(
          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
          a.kind === "note" ? "bg-surface-2" : "bg-oat-soft"
        )}
      >
        <ActivityIcon activity={a} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="min-w-0 text-[14px] text-text">{title}</span>
          <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-faint">
            {isNew && <span aria-label="Nieuw" className="size-1.5 rounded-full bg-accent" />}
            {timeOnly ? formatTime(a.at) : formatWhen(a.at)}
          </span>
        </span>
        {body && <span className="mt-0.5 block text-[13px] leading-relaxed text-muted">{body}</span>}
      </span>
    </Link>
  );
}
