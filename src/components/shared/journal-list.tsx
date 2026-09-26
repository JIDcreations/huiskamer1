"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isToday, isYesterday, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CalendarPlus, CalendarX, MessageSquareText, MoreHorizontal } from "lucide-react";
import { MoodDots } from "@/components/shared/mood";
import { ShareBadge, ShareIcon } from "@/components/shared/share";
import { Segmented } from "@/components/ui/segmented";
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import {
  actions,
  excerpt,
  groupByDay,
  isOnAgenda,
  journalKindLabel,
  useAgendaRaw,
  useAppointments,
  usePsychologist,
  useTask,
  weekStrip,
} from "@/lib/data";
import { capitalize, formatDayMonth, formatLongDate, formatTime } from "@/lib/format";
import type { JournalEntry, JournalKind, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

export type JournalFilter = "alles" | JournalKind;

export const filterOptions: { value: JournalFilter; label: string }[] = [
  { value: "alles", label: "Alles" },
  { value: "checkin", label: "Check-ins" },
  { value: "notitie", label: "Notities" },
  { value: "opdracht", label: "Opdrachten" },
];

export function dayHeading(day: string) {
  const d = parseISO(day);
  if (isToday(d)) return "Vandaag";
  if (isYesterday(d)) return "Gisteren";
  return capitalize(formatLongDate(d));
}

/** Het label van een entry: soort, of bij een opdracht de titel ervan. */
export function entryLabel(entry: JournalEntry, tasks: Task[]) {
  if (entry.kind === "opdracht") return tasks.find((t) => t.id === entry.taskId)?.title ?? journalKindLabel.opdracht;
  return journalKindLabel[entry.kind];
}

/** Wat er in een entry staat, kort. */
export function entrySummary(entry: JournalEntry, task?: Task) {
  const text = excerpt(entry.blocks, 200);
  if (entry.kind === "opdracht" && task?.kind === "schaal" && entry.scale) {
    return `${task.scaleLabel ?? "Score"}: ${entry.scale} op 10${text ? `. ${text}` : ""}`;
  }
  if (entry.kind === "opdracht" && !text) return task?.kind === "meditatie" ? `${task.minutes ?? 10} minuten gedaan` : "Gedaan";
  return text;
}

// ------------------------------------------------------------------ Weekstrookje

const letters = ["ma", "di", "wo", "do", "vr", "za", "zo"];

/** De enige plek met weekvoortgang: per dag een bolletje voor de check-in en stipjes voor opdrachten. */
export function WeekStrip({ entries, className }: { entries: JournalEntry[]; className?: string }) {
  const days = weekStrip(entries);
  return (
    <ol aria-label="Deze week" className={cn("grid grid-cols-7 gap-1", className)}>
      {days.map((d, i) => (
        <li
          key={d.day}
          className={cn("flex flex-col items-center gap-2 rounded-xl py-2.5", d.isToday && "bg-oat-soft")}
          aria-label={`${formatLongDate(d.date)}: ${d.checkin ? "check-in gedaan" : "geen check-in"}, ${d.tasks} ${d.tasks === 1 ? "opdracht" : "opdrachten"}`}
        >
          <span className={cn("text-[11px] leading-none", d.isToday ? "font-semibold text-text" : "text-faint")}>{letters[i]}</span>
          <span
            aria-hidden
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-[12px] tabular-nums transition-colors",
              d.checkin ? "bg-accent text-on-accent" : d.future ? "text-faint" : "text-muted ring-1 ring-inset ring-surface-2"
            )}
          >
            {d.date.getDate()}
          </span>
          <span aria-hidden className="flex h-1 gap-[3px]">
            {Array.from({ length: Math.min(d.tasks, 4) }, (_, k) => (
              <span key={k} className="size-1 rounded-full bg-taupe" />
            ))}
          </span>
        </li>
      ))}
    </ol>
  );
}

// ------------------------------------------------------------------ Rij

export function JournalRow({
  entry,
  href,
  viewer,
  task,
}: {
  entry: JournalEntry;
  href: string;
  viewer: "client" | "psy";
  task?: Task;
}) {
  const psy = usePsychologist();
  const agenda = useAgendaRaw();
  const appointments = useAppointments();
  const linked = useTask(entry.taskId);
  const t = task ?? linked;
  const onAgenda = isOnAgenda(agenda, appointments, entry.id);
  const label = entryLabel(entry, t ? [t] : []);
  const summary = entrySummary(entry, t);

  function takeAlong() {
    const id = actions.addAgendaItem({ clientId: entry.clientId, by: entry.clientId, journalEntryId: entry.id });
    toast(id ? "Meegenomen naar je volgende sessie" : "Er is nog geen sessie gepland");
  }

  return (
    <li className="group relative flex gap-4 px-5 py-4 transition-colors hover:bg-oat-soft/40 md:px-6">
      <span className="w-11 shrink-0 pt-px text-[12px] tabular-nums text-faint">{formatTime(entry.createdAt)}</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[12px] font-medium text-muted">{label}</span>
          {entry.mood && <MoodDots value={entry.mood} />}
        </div>
        <Link href={href} className="mt-1 block outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-taupe">
          {entry.title && <span className="block text-[15px] font-semibold tracking-tight">{entry.title}</span>}
          {summary ? (
            <span className={cn("line-clamp-2 text-[15px] leading-relaxed", entry.title ? "text-muted" : "text-text")}>{summary}</span>
          ) : (
            !entry.title && <span className="text-[14px] text-faint">Enkel een woord</span>
          )}
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          {viewer === "client" && <ShareBadge shared={entry.sharedWithPsychologist} />}
          {onAgenda?.appointment && onAgenda.appointment.status === "gepland" && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
              <CalendarCheck className="size-3.5 stroke-[1.75] text-taupe" />
              Mee naar de sessie van {formatDayMonth(onAgenda.appointment.start)}
            </span>
          )}
          {entry.psychologistNote && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
              <MessageSquareText className="size-3.5 stroke-[1.5] text-taupe" />
              {viewer === "client" ? `${psy.firstName} schreef een kanttekening` : "Jouw kanttekening"}
            </span>
          )}
        </div>
      </div>

      {viewer === "client" && (
        <div className="relative z-10 -mr-2 -mt-1 shrink-0">
          <Menu>
            <MenuTrigger
              aria-label="Meer"
              className="inline-flex size-8 items-center justify-center rounded-full text-taupe opacity-100 transition-colors hover:bg-surface-2/60 hover:text-muted data-[state=open]:bg-surface-2/60 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:data-[state=open]:opacity-100"
            >
              <MoreHorizontal className="size-4 stroke-[1.5]" />
            </MenuTrigger>
            <MenuContent>
              {onAgenda?.appointment?.status === "gepland" ? (
                <MenuItem
                  onSelect={() => {
                    actions.removeAgendaItem(onAgenda.item.id);
                    toast("Niet meer mee naar de sessie");
                  }}
                >
                  <CalendarX /> Niet meer meenemen
                </MenuItem>
              ) : (
                <MenuItem onSelect={takeAlong}>
                  <CalendarPlus /> Neem mee naar de sessie
                </MenuItem>
              )}
              <MenuSeparator />
              <MenuItem
                onSelect={() => {
                  const next = !entry.sharedWithPsychologist;
                  actions.updateJournal(entry.id, { sharedWithPsychologist: next });
                  toast(next ? `Gedeeld met ${psy.firstName}` : "Enkel voor jou");
                }}
              >
                <ShareIcon shared={!entry.sharedWithPsychologist} className="size-4" />
                {entry.sharedWithPsychologist ? "Enkel voor mij maken" : `Delen met ${psy.firstName}`}
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      )}
    </li>
  );
}

// ------------------------------------------------------------------ Tijdlijn

/** Eén tijdlijn, nieuwste bovenaan, per dag gegroepeerd. Zelfde vorm bij cliënt en psycholoog. */
export function JournalTimeline({
  entries,
  viewer,
  hrefFor,
  empty,
}: {
  entries: JournalEntry[];
  viewer: "client" | "psy";
  hrefFor: (entry: JournalEntry) => string;
  empty: React.ReactNode;
}) {
  const [filter, setFilter] = useState<JournalFilter>("alles");
  const visible = useMemo(() => entries.filter((e) => filter === "alles" || e.kind === filter), [entries, filter]);
  const groups = groupByDay(visible);

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <Segmented label="Toon" size="sm" value={filter} onChange={setFilter} options={filterOptions} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex flex-col gap-6"
        >
          {groups.length === 0 && empty}
          {groups.map((g) => (
            <section key={g.day} aria-label={dayHeading(g.day)}>
              <h2 className="mb-2 px-1 text-[13px] font-medium text-muted">{dayHeading(g.day)}</h2>
              <ul className="divide-y divide-surface-2/70 overflow-hidden card">
                {g.items.map((e) => (
                  <JournalRow key={e.id} entry={e} viewer={viewer} href={hrefFor(e)} />
                ))}
              </ul>
            </section>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
