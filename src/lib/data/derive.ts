import {
  addDays,
  addMinutes,
  areIntervalsOverlapping,
  differenceInCalendarDays,
  format,
  isBefore,
  parseISO,
  setHours,
  setMinutes,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type {
  Appointment,
  Block,
  Day,
  ID,
  JournalEntry,
  Psychologist,
  SessionNote,
  TablePage,
  Task,
  TaskEntry,
} from "@/lib/types";
import { plainText } from "@/lib/format";

export const dayOf = (d: Date) => format(d, "yyyy-MM-dd");
/** 1 = maandag, 7 = zondag. */
export const weekdayOf = (d: Date) => ((d.getDay() + 6) % 7) + 1;

// ------------------------------------------------------------------ Opdrachten

/** Moet deze opdracht op deze dag gebeuren? */
export function isDueOn(task: Task, date: Date) {
  if (task.archived) return false;
  const day = startOfDay(date);
  if (isBefore(day, startOfDay(parseISO(task.createdAt)))) return false;
  if (!task.recurrence) return false;
  if (task.recurrence.until && dayOf(day) > task.recurrence.until) return false;
  if (task.recurrence.every === "dag") return true;
  return task.recurrence.days?.includes(weekdayOf(day)) ?? false;
}

export function entryFor(entries: TaskEntry[], taskId: ID, day: Day) {
  return entries.find((e) => e.taskId === taskId && e.date === day);
}

/** Eenmalige opdracht die nog open staat. */
export function isOpenOneOff(task: Task, entries: TaskEntry[]) {
  return !task.archived && !task.recurrence && !entries.some((e) => e.taskId === task.id && e.completed);
}

export type WeekDay = { date: Date; day: Day; due: boolean; done: boolean; isToday: boolean; future: boolean };

export function weekProgress(task: Task, entries: TaskEntry[], ref = new Date()) {
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const today = dayOf(new Date());
  const days: WeekDay[] = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const day = dayOf(date);
    return {
      date,
      day,
      due: isDueOn(task, date),
      done: Boolean(entryFor(entries, task.id, day)?.completed),
      isToday: day === today,
      future: day > today,
    };
  });
  const due = days.filter((d) => d.due);
  return { days, done: due.filter((d) => d.done).length, total: due.length };
}

/** Opdrachten voor vandaag: herhalende van vandaag plus open eenmalige. */
export function tasksForDay(tasks: Task[], entries: TaskEntry[], date = new Date()) {
  return tasks.filter((t) => isDueOn(t, date) || isOpenOneOff(t, entries));
}

export function recurrenceLabel(task: Pick<Task, "recurrence" | "dueDate">) {
  const r = task.recurrence;
  if (!r) return "Eenmalig";
  if (r.every === "dag") return "Elke dag";
  const names = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  return `Elke ${(r.days ?? []).map((d) => names[d - 1]).join(", ")}`;
}

// ------------------------------------------------------------------ Afspraken

export function upcoming(appointments: Appointment[], now = new Date()) {
  return appointments.filter((a) => a.status === "gepland" && parseISO(a.end) > now);
}

export function past(appointments: Appointment[], now = new Date()) {
  return appointments.filter((a) => a.status !== "gepland" || parseISO(a.end) <= now).reverse();
}

export function canChange(a: Appointment, psy: Psychologist, now = new Date()) {
  return a.status === "gepland" && parseISO(a.start).getTime() - now.getTime() > psy.cancellationHours * 3_600_000;
}

/** Vrije momenten binnen de beschikbaarheid, zonder overlap met andere afspraken. */
export function freeSlots(psy: Psychologist, appointments: Appointment[], from: Date, days: number, now = new Date()) {
  const slots: Date[] = [];
  const busy = appointments.filter((a) => a.status === "gepland" || a.status === "voltooid");
  const minStart = addMinutes(now, psy.cancellationHours * 60);

  for (let i = 0; i < days; i++) {
    const date = addDays(startOfDay(from), i);
    for (const window of psy.availability.filter((w) => w.weekday === weekdayOf(date))) {
      const [sh, sm] = window.start.split(":").map(Number);
      const [eh, em] = window.end.split(":").map(Number);
      let t = setMinutes(setHours(date, sh), sm);
      const end = setMinutes(setHours(date, eh), em);
      while (addMinutes(t, psy.sessionMinutes) <= end) {
        const slot = { start: t, end: addMinutes(t, psy.sessionMinutes) };
        const clash = busy.some((a) => areIntervalsOverlapping(slot, { start: parseISO(a.start), end: parseISO(a.end) }));
        if (!clash && t > minStart) slots.push(t);
        t = addMinutes(t, 60);
      }
    }
  }
  return slots;
}

// ------------------------------------------------------------------ Tafel

export function sortPages(pages: TablePage[]) {
  return [...pages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Blokken die iemand anders schreef sinds `since`. */
export function newBlocks(page: TablePage, viewerId: ID, since?: string) {
  if (!since) return [];
  return page.blocks.filter((b) => b.authorId !== viewerId && b.updatedAt > since);
}

export function lastEditor(page: TablePage): Block | undefined {
  return [...page.blocks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
}

export function excerpt(blocks: Block[], max = 140) {
  const text = blocks
    .filter((b) => b.type !== "divider")
    .map((b) => plainText(b.content))
    .filter(Boolean)
    .join(" ");
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}...` : text;
}

// ------------------------------------------------------------------ Tijdlijn en activiteit

export type Activity =
  | { kind: "journal"; at: string; clientId: ID; entry: JournalEntry }
  | { kind: "tafel"; at: string; clientId: ID; page: TablePage; authorId: ID; blocks: Block[] }
  | { kind: "task"; at: string; clientId: ID; task: Task; entry: TaskEntry }
  | { kind: "appointment"; at: string; clientId: ID; appointment: Appointment }
  | { kind: "note"; at: string; clientId: ID; note: SessionNote };

type ActivitySource = {
  appointments: Appointment[];
  tablePages: TablePage[];
  journal: JournalEntry[];
  sessionNotes: SessionNote[];
  tasks: Task[];
  taskEntries: TaskEntry[];
};

/**
 * Alles wat er gebeurde, voor de psycholoog. Niet-gedeelde logboekentries komen hier nooit in.
 */
export function activityFor(db: ActivitySource, opts: { clientId?: ID; since?: string; includeNotes?: boolean }) {
  const { clientId, since, includeNotes } = opts;
  const mine = <T extends { clientId: ID }>(x: T) => !clientId || x.clientId === clientId;
  const after = (at: string) => !since || at > since;
  const items: Activity[] = [];

  for (const entry of db.journal) {
    if (!entry.sharedWithPsychologist || !mine(entry) || !after(entry.createdAt)) continue;
    if (!entry.blocks.length && !entry.title) continue;
    items.push({ kind: "journal", at: entry.createdAt, clientId: entry.clientId, entry });
  }

  // Tafel: per pagina, per auteur, per dag gebundeld.
  for (const page of db.tablePages) {
    if (!mine(page)) continue;
    const groups = new Map<string, Block[]>();
    for (const b of page.blocks) {
      if (!after(b.updatedAt)) continue;
      const key = `${b.authorId}|${b.updatedAt.slice(0, 10)}`;
      groups.set(key, [...(groups.get(key) ?? []), b]);
    }
    for (const [key, blocks] of groups) {
      const authorId = key.split("|")[0];
      const at = blocks.map((b) => b.updatedAt).sort().at(-1)!;
      items.push({ kind: "tafel", at, clientId: page.clientId, page, authorId, blocks });
    }
  }

  for (const entry of db.taskEntries) {
    if (!entry.completed || !after(entry.updatedAt)) continue;
    const task = db.tasks.find((t) => t.id === entry.taskId);
    if (!task || !mine(task)) continue;
    items.push({ kind: "task", at: entry.updatedAt, clientId: task.clientId, task, entry });
  }

  for (const a of db.appointments) {
    if (!mine(a) || !after(a.start) || parseISO(a.start) > new Date()) continue;
    items.push({ kind: "appointment", at: a.start, clientId: a.clientId, appointment: a });
  }

  if (includeNotes) {
    for (const note of db.sessionNotes) {
      if (!mine(note) || !after(note.createdAt) || !note.blocks.length) continue;
      items.push({ kind: "note", at: note.createdAt, clientId: note.clientId, note });
    }
  }

  return items.sort((a, b) => b.at.localeCompare(a.at));
}

export function daysSince(iso: string) {
  return differenceInCalendarDays(new Date(), parseISO(iso));
}
