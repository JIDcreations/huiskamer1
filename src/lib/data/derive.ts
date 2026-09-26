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
import { nlBE } from "date-fns/locale";
import type {
  AgendaItem,
  Appointment,
  Block,
  Day,
  ID,
  JournalEntry,
  JournalKind,
  Psychologist,
  Rhythm,
  SessionNote,
  SessionPage,
  Task,
} from "@/lib/types";
import { plainText, shortDayNames } from "@/lib/format";

export const dayOf = (d: Date) => format(d, "yyyy-MM-dd");
/** 1 = maandag, 7 = zondag. */
export const weekdayOf = (d: Date) => ((d.getDay() + 6) % 7) + 1;

// ------------------------------------------------------------------ Opdrachten

/** Eén vaste vorm voor het ritme: "Elke dag", "Ma, wo, vr", "3x deze week", "Eenmalig, voor zo 27 sep". */
export function rhythmLabel(rhythm: Rhythm) {
  switch (rhythm.kind) {
    case "dagelijks":
      return "Elke dag";
    case "dagen": {
      const days = [...rhythm.days].sort();
      if (days.length === 7) return "Elke dag";
      const s = days.map((d) => shortDayNames[d - 1]).join(", ");
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    case "perWeek":
      return `${rhythm.times}x deze week`;
    case "eenmalig":
      return `Eenmalig, voor ${format(parseISO(rhythm.due), "EEEEEE d MMM", { locale: nlBE }).replace(/\./g, "")}`;
  }
}

/** Opdracht-entries van een opdracht, nieuwste eerst. */
export function taskEntries(journal: JournalEntry[], taskId: ID) {
  return journal.filter((j) => j.kind === "opdracht" && j.taskId === taskId);
}

export function entryOn(journal: JournalEntry[], taskId: ID, day: Day) {
  return journal.find((j) => j.kind === "opdracht" && j.taskId === taskId && j.day === day);
}

function isActiveOn(task: Task, date: Date) {
  if (task.archived) return false;
  const day = startOfDay(date);
  if (isBefore(day, startOfDay(parseISO(task.createdAt)))) return false;
  if (task.until && dayOf(day) > task.until) return false;
  return true;
}

/** Aantal keer gedaan in de week van `ref`. */
export function weekCount(task: Task, journal: JournalEntry[], ref = new Date()) {
  const start = dayOf(startOfWeek(ref, { weekStartsOn: 1 }));
  const end = dayOf(addDays(startOfWeek(ref, { weekStartsOn: 1 }), 6));
  return taskEntries(journal, task.id).filter((e) => e.day >= start && e.day <= end).length;
}

export type TaskToday = {
  task: Task;
  done: boolean;
  entry?: JournalEntry;
  /** Enkel bij "x per week": hoeveel keer al deze week, inclusief vandaag. */
  progress?: { done: number; total: number };
};

/**
 * Wat telt vandaag? Regels uit het plan:
 * dagelijks elke dag, vaste dagen enkel op die dagen, x per week elke dag tot het aantal gehaald is,
 * eenmalig tot het gedaan is of de datum voorbij is. Gemist verdwijnt stil.
 */
export function taskToday(task: Task, journal: JournalEntry[], date = new Date()): TaskToday | null {
  if (!isActiveOn(task, date)) return null;
  const day = dayOf(date);
  const entry = entryOn(journal, task.id, day);
  const r = task.rhythm;
  switch (r.kind) {
    case "dagelijks":
      return { task, done: Boolean(entry), entry };
    case "dagen":
      return r.days.includes(weekdayOf(date)) ? { task, done: Boolean(entry), entry } : null;
    case "perWeek": {
      const count = weekCount(task, journal, date);
      const before = count - (entry ? 1 : 0);
      if (before >= r.times) return null;
      return { task, done: Boolean(entry), entry, progress: { done: count, total: r.times } };
    }
    case "eenmalig": {
      const any = taskEntries(journal, task.id)[0];
      if (any) return any.day === day ? { task, done: true, entry: any } : null;
      if (r.due < day) return null;
      return { task, done: false };
    }
  }
}

/** Opdrachten voor vandaag, open eerst, afgewerkt onderaan. */
export function tasksForDay(tasks: Task[], journal: JournalEntry[], date = new Date()) {
  const list = tasks.map((t) => taskToday(t, journal, date)).filter((x): x is TaskToday => Boolean(x));
  return [...list.filter((x) => !x.done), ...list.filter((x) => x.done)];
}

export type TaskState = "open" | "gedaan" | "niet gedaan" | "afgelopen";

/** Stand van een opdracht voor het overzicht. Neutraal, zonder schuld. */
export function taskState(task: Task, journal: JournalEntry[], today = new Date()): TaskState {
  if (task.rhythm.kind === "eenmalig") {
    if (taskEntries(journal, task.id).length) return "gedaan";
    return task.rhythm.due < dayOf(today) ? "niet gedaan" : "open";
  }
  if (task.archived || (task.until && task.until < dayOf(today))) return "afgelopen";
  return "open";
}

/** Voortgang van deze week voor herhalende opdrachten: "2 van 3". */
export function weekProgress(task: Task, journal: JournalEntry[], ref = new Date()) {
  const r = task.rhythm;
  if (r.kind === "eenmalig") return null;
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const done = weekCount(task, journal, ref);
  if (r.kind === "perWeek") return { done: Math.min(done, r.times), total: r.times };
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = addDays(start, i);
    if (!isActiveOn(task, d)) continue;
    if (r.kind === "dagelijks" || r.days.includes(weekdayOf(d))) total++;
  }
  return { done, total };
}

// ------------------------------------------------------------------ Logboek

export const journalKindLabel: Record<JournalKind, string> = {
  checkin: "Check-in",
  notitie: "Notitie",
  opdracht: "Opdracht",
};

export function checkinOn(journal: JournalEntry[], day: Day) {
  return journal.find((j) => j.kind === "checkin" && j.day === day);
}

/** Weekstrookje: per dag de check-in en het aantal afgewerkte opdrachten. */
export function weekStrip(journal: JournalEntry[], ref = new Date()) {
  const start = startOfWeek(ref, { weekStartsOn: 1 });
  const today = dayOf(new Date());
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    const day = dayOf(date);
    return {
      date,
      day,
      checkin: checkinOn(journal, day),
      tasks: journal.filter((j) => j.kind === "opdracht" && j.day === day).length,
      isToday: day === today,
      future: day > today,
    };
  });
}

/** Stemming per dag over de laatste `days` dagen. */
export function moodStrip(journal: JournalEntry[], days = 14, ref = new Date()) {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(startOfDay(ref), i - days + 1);
    const day = dayOf(date);
    return { date, day, mood: checkinOn(journal, day)?.mood };
  });
}

export function groupByDay<T extends { day: Day }>(items: T[]) {
  const groups: { day: Day; items: T[] }[] = [];
  for (const item of items) {
    const g = groups.find((x) => x.day === item.day);
    if (g) g.items.push(item);
    else groups.push({ day: item.day, items: [item] });
  }
  return groups;
}

// ------------------------------------------------------------------ Afspraken en sessies

export function upcoming(appointments: Appointment[], now = new Date()) {
  return appointments.filter((a) => a.status === "gepland" && parseISO(a.end) > now);
}

export function past(appointments: Appointment[], now = new Date()) {
  return appointments.filter((a) => a.status !== "gepland" || parseISO(a.end) <= now).reverse();
}

/** Voorbije sessies die echt plaatsvonden, nieuwste eerst. */
export function pastSessions(appointments: Appointment[], now = new Date()) {
  return appointments
    .filter((a) => a.status === "voltooid" || (a.status === "gepland" && parseISO(a.end) <= now))
    .sort((a, b) => b.start.localeCompare(a.start));
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

/**
 * "Voor volgende keer" van een cliënt: punten voor de eerstvolgende sessie, plus punten
 * die bij een geannuleerde of gemiste sessie bleven hangen.
 * Met `forPsy` vallen punten weg die naar een niet-gedeelde entry wijzen.
 */
export function agendaFor(
  agenda: AgendaItem[],
  appointments: Appointment[],
  journal: JournalEntry[],
  clientId: ID,
  opts: { forPsy?: boolean } = {}
) {
  const mine = appointments.filter((a) => a.clientId === clientId);
  const next = upcoming(mine)[0];
  const items = agenda
    .filter((item) => item.clientId === clientId)
    .filter((item) => {
      if (next && item.appointmentId === next.id) return true;
      const a = mine.find((x) => x.id === item.appointmentId);
      return !a || a.status === "geannuleerd" || a.status === "no-show";
    })
    .map((item) => ({ item, entry: item.journalEntryId ? journal.find((j) => j.id === item.journalEntryId) : undefined }))
    .filter(({ item, entry }) => {
      if (item.journalEntryId && !entry) return false;
      if (opts.forPsy && entry && !entry.sharedWithPsychologist) return false;
      return true;
    })
    .sort((a, b) => a.item.createdAt.localeCompare(b.item.createdAt));
  return { next, items };
}

/** Punten die bij een voorbije sessie meegenomen werden. */
export function agendaOfSession(agenda: AgendaItem[], appointmentId: ID) {
  return agenda.filter((i) => i.appointmentId === appointmentId);
}

export function isOnAgenda(agenda: AgendaItem[], appointments: Appointment[], entryId: ID) {
  const item = agenda.find((i) => i.journalEntryId === entryId);
  if (!item) return undefined;
  const a = appointments.find((x) => x.id === item.appointmentId);
  return { item, appointment: a };
}

// ------------------------------------------------------------------ Blokken

/** Blokken die iemand anders schreef sinds `since`. */
export function newBlocks(blocks: Block[], viewerId: ID, since?: string) {
  if (!since) return [];
  return blocks.filter((b) => b.authorId !== viewerId && b.updatedAt > since);
}

export function excerpt(blocks: Block[], max = 140) {
  const text = blocks
    .filter((b) => b.type !== "divider")
    .map((b) => plainText(b.content))
    .filter(Boolean)
    .join(" ");
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}...` : text;
}

// ------------------------------------------------------------------ Activiteit voor de psycholoog

export type Activity =
  | { kind: "journal"; at: string; clientId: ID; entry: JournalEntry }
  | { kind: "session"; at: string; clientId: ID; page: SessionPage; appointment: Appointment; blocks: Block[] }
  | { kind: "agenda"; at: string; clientId: ID; item: AgendaItem; entry?: JournalEntry }
  | { kind: "appointment"; at: string; clientId: ID; appointment: Appointment }
  | { kind: "note"; at: string; clientId: ID; note: SessionNote };

export type ActivitySource = {
  appointments: Appointment[];
  sessionPages: SessionPage[];
  agenda: AgendaItem[];
  journal: JournalEntry[];
  sessionNotes: SessionNote[];
};

/**
 * Alles wat er gebeurde, voor de psycholoog. Niet-gedeelde logboekentries komen hier nooit in,
 * ook niet onrechtstreeks via "Voor volgende keer".
 */
export function activityFor(
  db: ActivitySource,
  opts: { clientId?: ID; since?: string; includeNotes?: boolean; viewerId: ID }
) {
  const { clientId, since, includeNotes, viewerId } = opts;
  const mine = <T extends { clientId: ID }>(x: T) => !clientId || x.clientId === clientId;
  const after = (at: string) => !since || at > since;
  const items: Activity[] = [];

  for (const entry of db.journal) {
    if (!entry.sharedWithPsychologist || !mine(entry) || !after(entry.createdAt)) continue;
    if (entry.kind === "notitie" && !entry.blocks.length && !entry.title) continue;
    items.push({ kind: "journal", at: entry.createdAt, clientId: entry.clientId, entry });
  }

  // Reacties op een sessiepagina, per pagina en per dag gebundeld. Enkel wat de cliënt schreef.
  for (const page of db.sessionPages) {
    if (!mine(page)) continue;
    const appointment = db.appointments.find((a) => a.id === page.appointmentId);
    if (!appointment) continue;
    const groups = new Map<string, Block[]>();
    for (const b of page.reactions) {
      if (b.authorId === viewerId || !after(b.updatedAt)) continue;
      const key = b.updatedAt.slice(0, 10);
      groups.set(key, [...(groups.get(key) ?? []), b]);
    }
    for (const blocks of groups.values()) {
      const at = blocks.map((b) => b.updatedAt).sort().at(-1)!;
      items.push({ kind: "session", at, clientId: page.clientId, page, appointment, blocks });
    }
  }

  for (const item of db.agenda) {
    if (!mine(item) || item.addedBy === viewerId || !after(item.createdAt)) continue;
    const entry = item.journalEntryId ? db.journal.find((j) => j.id === item.journalEntryId) : undefined;
    if (item.journalEntryId && (!entry || !entry.sharedWithPsychologist)) continue;
    items.push({ kind: "agenda", at: item.createdAt, clientId: item.clientId, item, entry });
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
