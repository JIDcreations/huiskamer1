import { addDays, addMinutes, format, setHours, setMinutes, startOfDay, startOfWeek } from "date-fns";
import type {
  AgendaItem,
  Appointment,
  Block,
  Client,
  ClientPrefs,
  Invoice,
  JournalEntry,
  Mood,
  Psychologist,
  Rhythm,
  SessionNote,
  SessionPage,
  Task,
  TaskKind,
  TaskTemplate,
} from "@/lib/types";
import { stories, type Story } from "@/lib/mock/stories";

export const PSY_ID = "p1";
export const CURRENT_CLIENT_ID = "c1";

export type Database = {
  psychologist: Psychologist;
  clients: Client[];
  appointments: Appointment[];
  sessionPages: SessionPage[];
  agenda: AgendaItem[];
  journal: JournalEntry[];
  sessionNotes: SessionNote[];
  templates: TaskTemplate[];
  tasks: Task[];
  invoices: Invoice[];
  prefs: ClientPrefs;
};

/** Deterministisch "toeval" tussen 0 en 1, zodat de demo elke keer hetzelfde voelt. */
function rand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

const pick = <T,>(list: T[], seed: string) => list[Math.floor(rand(seed) * list.length) % list.length];

export function seed(now = new Date()): Database {
  const today = startOfDay(now);
  const iso = (d: Date) => d.toISOString();
  const dayKey = (d: Date) => format(d, "yyyy-MM-dd");
  /** Tijdstip op een dag relatief aan vandaag: `at(-2, "14:30")`. */
  const at = (offset: number, time: string) => {
    const [h, m] = time.split(":").map(Number);
    return setMinutes(setHours(addDays(today, offset), h), m);
  };
  const weekdayOf = (d: Date) => ((d.getDay() + 6) % 7) + 1;

  let blockCounter = 0;
  const block = (type: Block["type"], content: string, authorId: string, updatedAt: string, extra: Partial<Block> = {}): Block => ({
    id: `sb${++blockCounter}`,
    type,
    content,
    authorId,
    updatedAt,
    ...extra,
  });
  /** Tekst naar blokken. Een regel die met "> " begint wordt een citaat, "- [ ] " een checklist, "## " een kop. */
  const toBlocks = (lines: string[], authorId: string, t: string) =>
    lines.map((line) => {
      if (line.startsWith("> ")) return block("quote", line.slice(2), authorId, t);
      if (line.startsWith("## ")) return block("heading", line.slice(3), authorId, t, { level: 3 });
      if (line.startsWith("- [ ] ")) return block("checklist", line.slice(6), authorId, t, { checked: false });
      if (line.startsWith("- [x] ")) return block("checklist", line.slice(6), authorId, t, { checked: true });
      return block("paragraph", line, authorId, t);
    });

  // ---------------------------------------------------------------- Praktijk

  const psychologist: Psychologist = {
    id: PSY_ID,
    name: "Sarah Peeters",
    firstName: "Sarah",
    practiceName: "Praktijk De Linde",
    email: "sarah@praktijkdelinde.be",
    phone: "0470 12 34 56",
    address: "Lindestraat 14, 9000 Gent",
    hourlyRate: 75,
    sessionMinutes: 50,
    cancellationHours: 24,
    availability: [
      { weekday: 1, start: "09:00", end: "17:00" },
      { weekday: 2, start: "09:00", end: "17:00" },
      { weekday: 3, start: "12:00", end: "18:00" },
      { weekday: 4, start: "09:00", end: "17:00" },
      { weekday: 5, start: "09:00", end: "13:00" },
    ],
  };

  const started = (daysAgo: number) => iso(addDays(today, -daysAgo));

  const clients: Client[] = [
    { id: "c1", firstName: "Lotte", lastName: "Janssens", email: "lotte.janssens@voorbeeld.be", phone: "0485 22 31 90", birthDate: "1997-03-14", status: "actief", startedAt: started(70), psychologistId: PSY_ID, reason: "Piekeren en slecht slapen, drukke job in de zorg." },
    { id: "c2", firstName: "Arne", lastName: "Maes", email: "arne.maes@voorbeeld.be", phone: "0472 81 40 12", birthDate: "1988-11-02", status: "actief", startedAt: started(120), psychologistId: PSY_ID, reason: "Rouw na het overlijden van zijn vader." },
    { id: "c3", firstName: "Fien", lastName: "Wouters", email: "fien.wouters@voorbeeld.be", phone: "0496 55 18 73", birthDate: "2003-06-21", status: "actief", startedAt: started(45), psychologistId: PSY_ID, reason: "Faalangst rond examens." },
    { id: "c4", firstName: "Jonas", lastName: "De Smet", email: "jonas.desmet@voorbeeld.be", phone: "0478 09 66 21", birthDate: "1981-01-30", status: "actief", startedAt: started(200), psychologistId: PSY_ID, reason: "Burn-out, re-integratie op het werk." },
    { id: "c5", firstName: "Elise", lastName: "Vermeulen", email: "elise.vermeulen@voorbeeld.be", phone: "0491 44 02 58", birthDate: "1994-09-08", status: "actief", startedAt: started(30), psychologistId: PSY_ID, reason: "Paniekaanvallen, vooral op de trein." },
    { id: "c6", firstName: "Robbe", lastName: "Claes", email: "robbe.claes@voorbeeld.be", phone: "0468 37 90 14", birthDate: "1999-12-11", status: "actief", startedAt: started(16), psychologistId: PSY_ID, reason: "Somberheid, weinig energie sinds de winter." },
    { id: "c7", firstName: "Nora", lastName: "Willems", email: "nora.willems@voorbeeld.be", phone: "0487 63 25 47", birthDate: "1990-04-17", status: "gepauzeerd", startedAt: started(150), psychologistId: PSY_ID, reason: "Relatieproblemen." },
    { id: "c8", firstName: "Tom", lastName: "Jacobs", email: "tom.jacobs@voorbeeld.be", phone: "0475 18 72 36", birthDate: "1985-07-25", status: "afgerond", startedAt: started(300), psychologistId: PSY_ID, reason: "Stress en perfectionisme." },
  ];

  // ---------------------------------------------------------------- Afspraken

  // Sessies liggen relatief aan vandaag, zodat de demo altijd afspraken vandaag heeft, ook in het weekend.
  const appointments: Appointment[] = [];
  for (const client of clients) {
    const story = stories[client.id];
    const s = story.schedule;
    let first = true;
    for (let w = -3; w <= 2; w++) {
      if (s.biweekly && w % 2 !== 0) continue;
      if (s.weeks && !s.weeks.includes(w)) continue;
      const start = at(w * 7 + s.offset, s.time);
      if (start < new Date(client.startedAt)) continue;
      const end = addMinutes(start, psychologist.sessionMinutes);
      let status: Appointment["status"] = end < now ? "voltooid" : "gepland";
      if (s.noShow?.includes(w)) status = "no-show";
      if (s.cancelled?.includes(w)) status = "geannuleerd";
      appointments.push({
        id: `a-${client.id}-${w + 3}`,
        clientId: client.id,
        start: iso(start),
        end: iso(end),
        type: first && s.intakeFirst ? "intake" : "opvolging",
        mode: s.mode,
        status,
      });
      first = false;
    }
  }
  appointments.sort((a, b) => a.start.localeCompare(b.start));

  // ---------------------------------------------------------------- Facturen

  const invoices: Invoice[] = [];
  let invoiceNo = 131;
  for (const a of appointments) {
    if (a.status !== "voltooid" && a.status !== "no-show") continue;
    const issued = new Date(a.end);
    const age = (now.getTime() - issued.getTime()) / 86_400_000;
    const isLatest = !appointments.some(
      (b) => b.clientId === a.clientId && b.start > a.start && (b.status === "voltooid" || b.status === "no-show")
    );
    let status: Invoice["status"] = age > 10 ? "betaald" : isLatest ? "open" : "betaald";
    if (a.status === "no-show") status = "vervallen";
    // Randgeval voor de demo: Lotte heeft één factuur waarvan de termijn voorbij is.
    if (a.clientId === "c1" && age > 14 && age < 24) status = "vervallen";
    invoices.push({
      id: `f-${a.id}`,
      number: `${now.getFullYear()}-0${invoiceNo++}`,
      clientId: a.clientId,
      appointmentId: a.id,
      amount: psychologist.hourlyRate,
      issuedAt: a.end,
      dueAt: iso(addDays(issued, 14)),
      status,
      paidAt: status === "betaald" ? iso(addDays(issued, 3)) : undefined,
      attestUrl: status === "betaald" ? "#" : undefined,
    });
  }

  // ---------------------------------------------------------------- Opdrachtenbibliotheek

  const templates: TaskTemplate[] = [
    { id: "tt1", title: "Ademhaling 4-7-8", description: "Vier tellen in, zeven vasthouden, acht uit. Vier keer herhalen.", kind: "meditatie", minutes: 5, defaultRhythm: { kind: "dagelijks" } },
    { id: "tt2", title: "Gedachtenschema", description: "Beschrijf de situatie, je gedachte, je gevoel en wat je deed. Daarna: welke andere gedachte is ook mogelijk?", kind: "tekst", defaultRhythm: { kind: "perWeek", times: 2 } },
    { id: "tt3", title: "Dankbaarheidslijst", description: "Schrijf drie kleine dingen op waar je vandaag dankbaar voor bent.", kind: "tekst", defaultRhythm: { kind: "dagen", days: [1, 3, 5] } },
    { id: "tt4", title: "Slaaplogboek", description: "Hoe goed sliep je vannacht?", kind: "schaal", scaleLabel: "Slaapkwaliteit", defaultRhythm: { kind: "dagelijks" } },
    { id: "tt5", title: "Meditatie 10 minuten", description: "Zit rustig, volg je adem. Afdwalen mag, gewoon terugkeren.", kind: "meditatie", minutes: 10, defaultRhythm: { kind: "dagelijks" } },
    { id: "tt6", title: "Korte wandeling", description: "Twintig minuten buiten, zonder doel.", kind: "afvinken", defaultRhythm: { kind: "perWeek", times: 3 } },
    { id: "tt7", title: "Piekermoment", description: "Kies een vast moment van 15 minuten om te piekeren. Daarbuiten mag het wachten.", kind: "afvinken", defaultRhythm: { kind: "dagelijks" } },
  ];

  // ---------------------------------------------------------------- Per cliënt: sessies, opdrachten, logboek

  const sessionPages: SessionPage[] = [];
  const sessionNotes: SessionNote[] = [];
  const tasks: Task[] = [];
  const journal: JournalEntry[] = [];
  const agenda: AgendaItem[] = [];

  const psyTime = (d: Date) => {
    // De psycholoog schrijft tussen 9u en 18u.
    const h = d.getHours() + d.getMinutes() / 60;
    if (h < 9) return setMinutes(setHours(d, 9), 5);
    if (h >= 18) return setMinutes(setHours(d, 17), 50);
    return d;
  };
  const past = (d: Date) => d <= now;

  for (const client of clients) {
    const story: Story = stories[client.id];
    const cid = client.id;
    // Sessies van vandaag hebben nog geen verslag: dat schrijft de psycholoog later.
    const done = appointments.filter((a) => a.clientId === cid && a.status === "voltooid" && new Date(a.start) < today);
    // Het verhaal loopt tot de laatste voorbije sessie: sessie i hoort bij de i-de van achteraan geteld.
    const shift = done.length - story.sessions.length;
    const mapped = story.sessions.map((_, i) => done[shift + i] as Appointment | undefined);

    // Sessiepagina's en privénotities.
    story.sessions.forEach((s, i) => {
      const a = mapped[i];
      if (!a) return;
      const end = new Date(a.end);
      const written = iso(psyTime(addMinutes(end, 35)));
      const reactions: Block[] = [];
      for (const r of s.reactions ?? []) {
        const when = addMinutes(end, r.afterHours * 60);
        if (!past(when)) continue;
        const t = iso(r.by === "psy" ? psyTime(when) : when);
        reactions.push(...toBlocks(r.lines, r.by === "psy" ? PSY_ID : cid, t));
      }
      sessionPages.push({
        id: `sp-${a.id}`,
        clientId: cid,
        appointmentId: a.id,
        summary: toBlocks(s.summary, PSY_ID, written),
        reactions,
        updatedAt: [written, ...reactions.map((b) => b.updatedAt)].sort().at(-1)!,
      });
      if (s.private) {
        const t = iso(psyTime(addMinutes(end, 10)));
        sessionNotes.push({ id: `sn-${a.id}`, clientId: cid, appointmentId: a.id, createdAt: t, updatedAt: t, blocks: toBlocks(s.private, PSY_ID, t) });
      }
    });

    // Opdrachten, gelinkt aan de sessie waaruit ze komen.
    for (const ts of story.tasks) {
      const a = ts.from !== undefined ? mapped[ts.from] : undefined;
      const created = a ? psyTime(addMinutes(new Date(a.end), 45)) : at(-(ts.createdDaysAgo ?? 14), "10:00");
      const template = templates.find((t) => t.id === ts.templateId);
      const rhythm: Rhythm = ts.rhythm.kind === "eenmalig" ? { kind: "eenmalig", due: dayKey(addDays(today, ts.dueOffset ?? 3)) } : ts.rhythm;
      const task: Task = {
        id: ts.id,
        clientId: cid,
        appointmentId: a?.id,
        templateId: ts.templateId,
        title: ts.title ?? template?.title ?? "Opdracht",
        description: ts.description ?? template?.description ?? "",
        kind: (ts.kind ?? template?.kind ?? "afvinken") as TaskKind,
        rhythm,
        minutes: ts.minutes ?? template?.minutes,
        scaleLabel: ts.scaleLabel ?? template?.scaleLabel,
        createdAt: iso(created),
        archived: ts.archived,
      };
      tasks.push(task);

      // Wat de cliënt er al mee deed.
      const firstDay = startOfDay(addDays(created, 1));
      const weekCount = new Map<string, number>();
      for (let d = firstDay; d <= today; d = addDays(d, 1)) {
        const key = dayKey(d);
        const isToday = key === dayKey(today);
        const wk = dayKey(startOfWeek(d, { weekStartsOn: 1 }));
        let due = false;
        if (task.rhythm.kind === "dagelijks") due = true;
        if (task.rhythm.kind === "dagen") due = task.rhythm.days.includes(weekdayOf(d));
        if (task.rhythm.kind === "perWeek") {
          const cap = wk === dayKey(startOfWeek(today, { weekStartsOn: 1 })) ? task.rhythm.times - 1 : task.rhythm.times;
          due = (weekCount.get(wk) ?? 0) < cap;
        }
        if (task.rhythm.kind === "eenmalig") due = ts.doneOffset !== undefined && key === dayKey(addDays(today, ts.doneOffset));
        if (!due) continue;

        let doIt: boolean;
        if (isToday) doIt = Boolean(ts.doneToday);
        else if (task.rhythm.kind === "eenmalig") doIt = true;
        else doIt = rand(`${task.id}${key}`) < (task.rhythm.kind === "perWeek" ? 0.5 : story.diligence);
        if (!doIt) continue;

        const when = isToday && ts.doneToday ? at(0, ts.doneToday) : at(Math.round((d.getTime() - today.getTime()) / 86_400_000), ts.time ?? story.writeTime);
        if (!past(when)) continue;
        if (task.rhythm.kind === "perWeek") weekCount.set(wk, (weekCount.get(wk) ?? 0) + 1);

        const t = iso(when);
        const answer = ts.answers ? pick(ts.answers, `${task.id}a${key}`) : undefined;
        const lines = answer ? answer.split("\n").filter(Boolean) : [];
        journal.push({
          id: `jt-${task.id}-${key}`,
          clientId: cid,
          kind: "opdracht",
          day: key,
          taskId: task.id,
          createdAt: t,
          updatedAt: t,
          blocks: toBlocks(lines, cid, t),
          scale: task.kind === "schaal" ? Math.max(3, Math.min(9, Math.round(4 + rand(`${task.id}s${key}`) * 4 + (story.trend ?? 0)))) : undefined,
          tags: [],
          sharedWithPsychologist: rand(`${task.id}p${key}`) > (ts.privateRate ?? 0.12),
        });
      }
    }

    // Check-ins: een woord per dag, soms een zin.
    const start = Math.max(-20, -Math.floor((today.getTime() - new Date(client.startedAt).getTime()) / 86_400_000));
    for (let off = start; off <= 0; off++) {
      if (client.status !== "actief" && off > -18) break;
      if (off === 0 && !story.checkinToday) continue;
      const key = dayKey(addDays(today, off));
      if (off < 0 && rand(`ci${cid}${key}`) > story.checkinRate) continue;
      const when = off === 0 ? at(0, story.checkinToday!) : at(off, story.checkinTime);
      if (!past(when)) continue;
      // Stemming volgt het verloop van het verhaal, met wat schommeling.
      const progress = (off - start) / Math.max(1, -start);
      const base = story.mood[0] + (story.mood[1] - story.mood[0]) * progress;
      const mood = Math.max(1, Math.min(5, Math.round(base + (rand(`m${cid}${key}`) - 0.5) * 1.6))) as Mood;
      const text = rand(`ct${cid}${key}`) < 0.45 ? pick(story.checkinTexts, `ctx${cid}${key}`) : undefined;
      const t = iso(when);
      journal.push({
        id: `jc-${cid}-${key}`,
        clientId: cid,
        kind: "checkin",
        day: key,
        createdAt: t,
        updatedAt: t,
        blocks: text ? toBlocks([text], cid, t) : [],
        mood,
        tags: [],
        sharedWithPsychologist: rand(`cp${cid}${key}`) > 0.1,
      });
    }

    // Vrije notities.
    for (const n of story.notes) {
      const when = at(n.day, n.time);
      if (!past(when)) continue;
      const t = iso(when);
      journal.push({
        id: n.id,
        clientId: cid,
        kind: "notitie",
        day: dayKey(when),
        createdAt: t,
        updatedAt: t,
        title: n.title,
        blocks: toBlocks(n.text, cid, t),
        mood: n.mood,
        tags: n.tags ?? [],
        sharedWithPsychologist: n.shared !== false,
        psychologistNote:
          n.note && past(psyTime(addMinutes(when, 60 * 16)))
            ? { text: n.note, createdAt: iso(psyTime(addMinutes(when, 60 * 16))) }
            : undefined,
      });
    }

    // Voor volgende keer.
    const next = appointments.find((a) => a.clientId === cid && a.status === "gepland");
    if (next) {
      story.agenda.forEach((item, i) => {
        const t = iso(item.by === "psy" ? psyTime(at(item.day, "12:10")) : at(item.day, "21:15"));
        if (item.journalId && !journal.some((j) => j.id === item.journalId)) return;
        agenda.push({
          id: `ag-${cid}-${i}`,
          clientId: cid,
          appointmentId: next.id,
          text: item.text,
          journalEntryId: item.journalId,
          addedBy: item.by === "psy" ? PSY_ID : cid,
          createdAt: t,
        });
      });
    }
  }

  journal.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    psychologist,
    clients,
    appointments,
    sessionPages,
    agenda,
    journal,
    sessionNotes,
    templates,
    tasks,
    invoices,
    prefs: { onboarded: false, checkinReminder: undefined, taskReminders: true, appointmentReminder: true, defaultShare: true },
  };
}
