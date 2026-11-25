"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isToday, isYesterday, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CalendarPlus, CalendarX, MoreHorizontal } from "@/components/icons";
import { MoodMark } from "@/components/shared/mood";
import { MarginNote, PencilCircle } from "@/components/shared/pencil";
import { ShareBadge, ShareIcon } from "@/components/shared/share";
import { Button } from "@/components/ui/button";
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
import { capitalize, formatDayMonth, formatLongDate, formatTime, formatWhen } from "@/lib/format";
import type { JournalEntry, JournalKind, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { kindTone } from "@/components/shared/kind";

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

/** Markeerstift achter de datum: een check-in die dag. Licht scheef, nooit een perfecte cirkel. */
function Highlight() {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className="absolute inset-0 -z-10 size-full -rotate-6 text-sun">
      <path d="M6.5 9.2c4.6-4.4 13.7-5.6 18.6-1.4 4.6 3.9 4.4 11.6.4 15.9-4.2 4.6-12.4 5.3-17.2 1.6C3.6 21.6 2.6 13 6.5 9.2Z" fill="currentColor" opacity=".85" />
    </svg>
  );
}

/** Turfstreepjes: één per afgewerkte opdracht, de vijfde schuin erdoor. */
function Tally({ count, className }: { count: number; className?: string }) {
  const n = Math.min(count, 5);
  return (
    <svg aria-hidden viewBox="0 0 22 10" className={cn("h-2.5 w-[22px] overflow-visible", className)} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
      {Array.from({ length: Math.min(n, 4) }, (_, k) => (
        <path key={k} d={`M${4 + k * 4.6} ${1.2 + (k % 2) * 0.4}c.2 2.6.1 5.1-.3 7.6`} />
      ))}
      {n === 5 && <path d="M1.5 7.6c5.6-1.8 12.2-4 18.6-6" />}
    </svg>
  );
}

/** De enige plek met weekvoortgang: markeerstift voor de check-in, turfstreepjes voor opdrachten, vandaag omcirkeld. */
export function WeekStrip({ entries, compact, className }: { entries: JournalEntry[]; compact?: boolean; className?: string }) {
  const days = weekStrip(entries);
  return (
    <ol aria-label="Deze week" className={cn("grid grid-cols-7", compact ? "gap-0.5" : "gap-1.5 md:gap-2", className)}>
      {days.map((d, i) => (
        <li
          key={d.day}
          className={cn("flex flex-col items-center gap-2", compact ? "py-1.5" : "py-3")}
          aria-label={`${formatLongDate(d.date)}${d.isToday ? ", vandaag" : ""}: ${d.checkin ? "check-in gedaan" : "geen check-in"}, ${d.tasks} ${d.tasks === 1 ? "opdracht" : "opdrachten"}`}
        >
          <span className={cn("text-[11px] leading-none", d.isToday ? "font-semibold text-text" : "text-faint")}>{letters[i]}</span>
          <span
            aria-hidden
            className={cn(
              "relative isolate flex size-8 items-center justify-center text-[13px] tabular-nums",
              d.checkin ? "font-semibold text-ink" : d.future ? "text-faint" : "text-muted",
              d.isToday && "font-semibold text-text"
            )}
          >
            {d.checkin && <Highlight />}
            {d.date.getDate()}
            {d.isToday && <PencilCircle className="-inset-1 text-clay" delay={0.25} />}
          </span>
          <Tally count={d.tasks} className={d.tasks ? "text-pine" : "invisible"} />
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
    <li className="group relative flex border-t border-edge py-4 pr-4 transition-colors first:border-t-0 hover:bg-oat-soft/40 md:pr-6">
      <span className="w-(--margin) shrink-0 pr-3 pt-px text-right text-[12px] tabular-nums text-faint">{formatTime(entry.createdAt)}</span>
      <div className="min-w-0 flex-1 pl-4 md:pl-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className={cn("rounded-md px-2 py-0.5 text-[12px] font-medium", kindTone[entry.kind])}>{label}</span>
          {entry.mood && <MoodMark value={entry.mood} />}
        </div>
        <Link href={href} className="mt-1 block outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-taupe">
          {entry.title && <span className="block text-[15px] font-semibold">{entry.title}</span>}
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
        </div>
        {entry.psychologistNote && (
          <MarginNote className="mt-3" author={viewer === "client" ? psy.firstName : "Jouw kanttekening"} when={formatWhen(entry.psychologistNote.createdAt)}>
            <span className="line-clamp-3">{entry.psychologistNote.text}</span>
          </MarginNote>
        )}
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

/** Een week aan dagen tegelijk; oudere dagen komen er op vraag bij. */
const DAYS_PER_PAGE = 7;

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
  const [days, setDays] = useState(DAYS_PER_PAGE);
  const visible = useMemo(() => entries.filter((e) => filter === "alles" || e.kind === filter), [entries, filter]);
  const allGroups = groupByDay(visible);
  const groups = allGroups.slice(0, days);
  const changeFilter = (f: JournalFilter) => {
    setFilter(f);
    setDays(DAYS_PER_PAGE);
  };

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <Segmented label="Toon" size="sm" value={filter} onChange={changeFilter} options={filterOptions} />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={filter}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5"
        >
          {groups.length === 0 ? (
            empty
          ) : (
            <div className="notebook pb-2">
              {groups.map((g) => (
                <section key={g.day} aria-label={dayHeading(g.day)}>
                  <h2 className="pb-1 pl-[calc(var(--margin)+1rem)] pr-4 pt-6 font-display text-[19px] leading-tight md:pl-[calc(var(--margin)+1.25rem)]">
                    {dayHeading(g.day)}
                  </h2>
                  <ul>
                    {g.items.map((e) => (
                      <JournalRow key={e.id} entry={e} viewer={viewer} href={hrefFor(e)} />
                    ))}
                  </ul>
                </section>
              ))}
              {allGroups.length > days && (
                <div className="border-t border-edge py-4 pl-[calc(var(--margin)+1rem)] md:pl-[calc(var(--margin)+1.25rem)]">
                  <Button variant="quiet" size="sm" className="-ml-3" onClick={() => setDays((d) => d + DAYS_PER_PAGE)}>
                    Oudere dagen tonen
                  </Button>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
