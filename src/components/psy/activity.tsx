"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Files, Lock, NotebookPen } from "lucide-react";
import { MoodDots } from "@/components/shared/mood";
import { statusLabel, typeLabel } from "@/components/shared/appointment-card";
import { excerpt, PSY_ID, usePersonName, type Activity } from "@/lib/data";
import { formatTime, formatWhen, plainText, plural } from "@/lib/format";
import { cn } from "@/lib/utils";

const icons = { journal: NotebookPen, tafel: Files, task: CheckCircle2, appointment: CalendarDays, note: Lock };

export function activityHref(a: Activity) {
  const base = `/p/clienten/${a.clientId}`;
  switch (a.kind) {
    case "journal":
      return `${base}?tab=logboek#${a.entry.id}`;
    case "tafel":
      return `${base}/tafel/${a.page.id}`;
    case "task":
      return `${base}?tab=opdrachten`;
    case "appointment":
    case "note":
      return `${base}?tab=sessienotities`;
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
  const Icon = icons[a.kind];
  const who = showClient ? name(a.clientId) : null;

  let title: React.ReactNode;
  let body: React.ReactNode = null;

  switch (a.kind) {
    case "journal":
      title = (
        <>
          {who && <strong className="font-medium">{who}, </strong>}
          {who ? "logboek" : "Logboek"}
          {a.entry.title ? `: ${a.entry.title}` : ""}
        </>
      );
      body = (
        <>
          <span className="line-clamp-2">{excerpt(a.entry.blocks, 220)}</span>
          {a.entry.mood && <MoodDots value={a.entry.mood} className="mt-1.5" />}
        </>
      );
      break;
    case "tafel":
      title = (
        <>
          {a.authorId === PSY_ID ? "Jij" : who ?? name(a.authorId)} op de Tafel: {a.page.title || "Zonder titel"}
        </>
      );
      body = (
        <span className="line-clamp-2">
          {excerpt(a.blocks, 200) || plural(a.blocks.length, "blok aangepast", "blokken aangepast")}
        </span>
      );
      break;
    case "task": {
      const detail = a.entry.answer ? plainText(a.entry.answer) : a.entry.scale ? `${a.task.scaleLabel ?? "Score"}: ${a.entry.scale} op 10` : null;
      title = (
        <>
          {who && <strong className="font-medium">{who}, </strong>}
          {a.task.title} gedaan{count > 1 ? `, ${count} keer` : ""}
        </>
      );
      body = detail && <span className="line-clamp-2">{detail}</span>;
      break;
    }
    case "appointment":
      title = (
        <>
          {who && <strong className="font-medium">{who}, </strong>}
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
        <Icon className="size-4 stroke-[1.5] text-muted" />
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
