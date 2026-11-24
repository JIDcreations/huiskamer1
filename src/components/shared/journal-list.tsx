"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isToday, isYesterday, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, CalendarPlus, CalendarX, MessageSquareText, MoreHorizontal } from "lucide-react";
import { MoodDots } from "@/components/shared/mood";
import { ShareIcon } from "@/components/shared/share";
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
import { capitalize, formatDayMonth, formatLongDate, formatTime } from "@/lib/format";
import type { JournalEntry, JournalKind, Task } from "@/lib/types";
import { cn } from "@/lib/utils";
import { kindDot } from "@/components/shared/kind";

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
export function WeekStrip({ entries, compact, className }: { entries: JournalEntry[]; compact?: boolean; className?: string }) {
  const days = weekStrip(entries);
  return (
    <ol aria-label="Deze week" className={cn("grid grid-cols-7", compact ? "gap-1" : "gap-1.5 md:gap-2", className)}>
      {days.map((d, i) => (
        <li
          key={d.day}
          className={cn("flex flex-col items-center gap-2 rounded-t-full rounded-b-2xl", compact ? "pb-2.5 pt-3.5" : "pb-4 pt-5", d.isToday ? "bg-pine text-on-accent" : "bg-bg shadow-[inset_0_0_0_1px_var(--edge)]")}
          aria-label={`${formatLongDate(d.date)}: ${d.checkin ? "check-in gedaan" : "geen check-in"}, ${d.tasks} ${d.tasks === 1 ? "opdracht" : "opdrachten"}`}
        >
          <span className={cn("text-[12px] leading-none", d.isToday ? "text-on-accent/80" : "text-faint")}>{letters[i]}</span>
          <span
            aria-hidden
            className={cn(
              "flex size-7 items-center justify-center rounded-full text-[12px] tabular-nums transition-colors",
              d.checkin ? "bg-sun font-medium text-ink" : d.future ? (d.isToday ? "text-on-accent" : "text-faint") : d.isToday ? "text-on-accent ring-1 ring-inset ring-on-accent/40" : "text-muted ring-1 ring-inset ring-surface-2"
            )}
          >
            {d.date.getDate()}
          </span>
          <span aria-hidden className="flex h-1 gap-[3px]">
            {Array.from({ length: Math.min(d.tasks, 4) }, (_, k) => (
              <span key={k} className={cn("size-1 rounded-full", d.isToday ? "bg-on-accent" : "bg-taupe")} />
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

  const saved = onAgenda?.appointment?.status === "gepland";
  // Een afgevinkte opdracht zonder tekst is een kleine pin; een notitie met titel een grote.
  const compact = entry.kind === "opdracht" && !entry.title && summary.length <= 40 && !entry.psychologistNote && !saved;
  const footer = saved || !!entry.psychologistNote;

  return (
    <li
      className={cn(
        "group relative mb-4 break-inside-avoid rounded-[22px] shadow-[0_0_0_1px_var(--edge)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_var(--edge-strong)]",
        compact ? "bg-bg px-5 py-4" : "bg-surface p-5 md:p-6"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pr-10 text-[13px] text-muted md:pr-24">
        <span aria-hidden className={cn("size-2 shrink-0 rounded-full", kindDot[entry.kind])} />
        <span className="min-w-0">{label}</span>
        <span aria-hidden className="text-taupe">·</span>
        <span className="shrink-0 tabular-nums">{formatTime(entry.createdAt)}</span>
        {viewer === "client" && (
          <span className="shrink-0" title={entry.sharedWithPsychologist ? `Gedeeld met ${psy.firstName}` : "Enkel voor mij"}>
            <ShareIcon shared={entry.sharedWithPsychologist} className="text-taupe" />
            <span className="sr-only">{entry.sharedWithPsychologist ? `Gedeeld met ${psy.firstName}` : "Enkel voor mij"}</span>
          </span>
        )}
      </div>
      <Link href={href} className={cn("block outline-none after:absolute after:inset-0 after:rounded-[22px] after:content-[''] focus-visible:after:ring-1 focus-visible:after:ring-pine", compact ? "mt-1.5" : "mt-3")}>
        {entry.title && <span className="mb-1.5 block font-display text-[25px] leading-[1.1]">{entry.title}</span>}
        {compact ? (
          <span className="font-display text-[19px] italic">{summary}</span>
        ) : summary ? (
          <span className={cn("line-clamp-5 text-[15.5px] leading-relaxed", entry.title ? "text-muted" : "text-text")}>{summary}</span>
        ) : (
          !entry.title && <span className="font-display text-[19px] italic text-muted">Enkel een woord</span>
        )}
      </Link>
      {entry.mood && <MoodDots value={entry.mood} className="mt-3" />}
      {footer && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-edge pt-3">
          {saved && onAgenda?.appointment && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
              <CalendarCheck className="size-3.5 stroke-[1.25] text-taupe" />
              Mee naar de sessie van {formatDayMonth(onAgenda.appointment.start)}
            </span>
          )}
          {entry.psychologistNote && (
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
              <MessageSquareText className="size-3.5 stroke-[1.25] text-taupe" />
              {viewer === "client" ? `${psy.firstName} schreef een kanttekening` : "Jouw kanttekening"}
            </span>
          )}
        </div>
      )}

      {viewer === "client" && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1">
          {/* Zoals een pin bewaren: deze entry gaat mee naar de volgende sessie. */}
          <motion.button
            type="button"
            layout
            aria-pressed={saved}
            aria-label={saved ? "Bewaard voor de sessie" : "Bewaar voor de sessie"}
            onClick={() => {
              if (saved && onAgenda) {
                actions.removeAgendaItem(onAgenda.item.id);
                toast("Niet meer mee naar de sessie");
              } else takeAlong();
            }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative h-8 overflow-hidden rounded-full px-3.5 text-[13px] outline-none transition-[background-color,color,opacity] duration-300 focus-visible:ring-1 focus-visible:ring-pine",
              saved
                ? "bg-sun-soft text-sun-ink"
                : "hidden bg-pine text-on-accent hover:bg-pine-deep md:inline-block md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
            )}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={saved ? "ja" : "nee"}
                className="block"
                initial={{ y: 12, opacity: 0, filter: "blur(2px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -12, opacity: 0, filter: "blur(2px)" }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {saved ? "Bewaard" : "Bewaar"}
              </motion.span>
            </AnimatePresence>
          </motion.button>
          <Menu>
            <MenuTrigger
              aria-label="Meer"
              className="inline-flex size-8 items-center justify-center rounded-full text-taupe transition-colors hover:bg-surface-2/60 hover:text-muted data-[state=open]:bg-surface-2/60"
            >
              <MoreHorizontal className="size-4 stroke-[1.5]" />
            </MenuTrigger>
            <MenuContent>
              {saved && onAgenda ? (
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
          className="mt-7 flex flex-col gap-8"
        >
          {groups.length === 0 && empty}
          {groups.map((g) => (
            <section key={g.day} aria-label={dayHeading(g.day)}>
              <h2 className="mb-4 px-1 font-display text-[24px] leading-tight">{dayHeading(g.day)}</h2>
              <ul className="gap-4 md:columns-2">
                {g.items.map((e) => (
                  <JournalRow key={e.id} entry={e} viewer={viewer} href={hrefFor(e)} />
                ))}
              </ul>
            </section>
          ))}
          {allGroups.length > days && (
            <Button variant="soft" size="sm" className="self-center" onClick={() => setDays((d) => d + DAYS_PER_PAGE)}>
              Oudere dagen tonen
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
