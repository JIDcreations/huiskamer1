"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addDays, addMinutes, format } from "date-fns";
import { seed, type Database } from "@/lib/mock/seed";
import { upcoming } from "@/lib/data/derive";
import type {
  Appointment,
  AppointmentMode,
  AppointmentType,
  Block,
  Client,
  ClientPrefs,
  ClientStatus,
  ID,
  JournalEntry,
  Mood,
  Psychologist,
  Role,
  SessionPage,
  Task,
  TaskTemplate,
} from "@/lib/types";

/**
 * In-memory store voor de demo. Enkel `/lib/data` praat hiermee; componenten nooit rechtstreeks.
 * Wordt bewaard in localStorage zodat de demo een herlaadbeurt overleeft.
 */

/** Verhoog bij een wijziging van het datamodel: oude demo's in localStorage worden dan vervangen. */
const SCHEMA = 2;

type Meta = {
  schema: number;
  /** Dag waarop de data gegenereerd werd. Een nieuwe dag geeft verse data rond "vandaag". */
  seededOn: string;
  seededAt: string;
  /** Laatste bezoek per kijker en item: `${role}:${id}` → ISO. */
  seen: Record<string, string>;
};

type Actions = {
  // Sessies
  /** Geeft de gedeelde pagina van een sessie, en maakt ze aan als ze nog niet bestaat. */
  ensureSessionPage: (appointmentId: ID) => ID;
  updateSessionPage: (id: ID, patch: Partial<Pick<SessionPage, "summary" | "reactions">>) => void;

  // Voor volgende keer
  /** Zet iets op de lijst van de eerstvolgende sessie. Geeft niets terug als er geen sessie gepland is. */
  addAgendaItem: (input: { clientId: ID; by: ID; text?: string; journalEntryId?: ID }) => ID | undefined;
  removeAgendaItem: (id: ID) => void;

  // Logboek
  createJournal: (clientId: ID, init?: Partial<Pick<JournalEntry, "kind" | "mood" | "title" | "blocks">>) => ID;
  updateJournal: (id: ID, patch: Partial<Pick<JournalEntry, "title" | "blocks" | "mood" | "tags" | "sharedWithPsychologist" | "scale">>) => void;
  deleteJournal: (id: ID) => void;
  /** Verwijdert een notitie als ze helemaal leeg is. */
  pruneJournal: (id: ID) => void;
  setJournalNote: (id: ID, text: string) => void;
  /** Check-in van vandaag bewaren (of aanvullen als die al bestaat). */
  saveCheckin: (clientId: ID, input: { mood: Mood; text?: string; shared?: boolean }) => ID;
  /** Opdracht gedaan: maakt of werkt de opdracht-entry voor die dag bij. */
  completeTask: (taskId: ID, input?: { day?: string; text?: string; scale?: number; shared?: boolean }) => ID;
  uncompleteTask: (taskId: ID, day?: string) => void;

  // Sessienotities
  createSessionNote: (clientId: ID, appointmentId?: ID) => ID;
  updateSessionNote: (id: ID, blocks: Block[]) => void;
  deleteSessionNote: (id: ID) => void;

  // Opdrachten
  createTask: (task: Omit<Task, "id" | "createdAt">) => ID;
  updateTask: (id: ID, patch: Partial<Task>) => void;
  archiveTask: (id: ID, archived?: boolean) => void;
  saveTemplate: (template: Omit<TaskTemplate, "id"> & { id?: ID }) => ID;
  deleteTemplate: (id: ID) => void;

  // Afspraken
  createAppointment: (input: { clientId: ID; start: string; type: AppointmentType; mode: AppointmentMode; minutes?: number }) => ID;
  rescheduleAppointment: (id: ID, start: string) => void;
  setAppointmentStatus: (id: ID, status: Appointment["status"]) => void;

  // Betalingen
  payInvoice: (id: ID) => void;

  // Cliënten en praktijk
  createClient: (input: Pick<Client, "firstName" | "lastName" | "email" | "phone"> & { reason?: string }) => ID;
  setClientStatus: (id: ID, status: ClientStatus) => void;
  updateClient: (id: ID, patch: Partial<Client>) => void;
  updatePsychologist: (patch: Partial<Psychologist>) => void;

  // Voorkeuren van de cliënt
  updatePrefs: (patch: Partial<ClientPrefs>) => void;

  // Overig
  markSeen: (role: Role, id: ID) => void;
  resetDemo: () => void;
};

export type StoreState = Database & Meta & Actions;

let n = 0;
export function uid(prefix: string) {
  n += 1;
  return `${prefix}-${Date.now().toString(36)}${n.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

const now = () => new Date().toISOString();
const today = () => format(new Date(), "yyyy-MM-dd");

/** Tekst naar blokken, één alinea per regel. */
function textBlocks(text: string, authorId: ID): Block[] {
  const t = now();
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => ({ id: uid("b"), type: "paragraph" as const, content: escapeHTML(line), authorId, updatedAt: t }));
}

function escapeHTML(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function fresh(): Database & Meta {
  const d = new Date();
  return { ...seed(d), schema: SCHEMA, seededOn: format(d, "yyyy-MM-dd"), seededAt: d.toISOString(), seen: {} };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...fresh(),

      // ------------------------------------------------------------ Sessies
      ensureSessionPage: (appointmentId) => {
        const existing = get().sessionPages.find((p) => p.appointmentId === appointmentId);
        if (existing) return existing.id;
        const a = get().appointments.find((x) => x.id === appointmentId);
        const id = uid("sp");
        set((s) => ({
          sessionPages: [...s.sessionPages, { id, clientId: a?.clientId ?? "", appointmentId, summary: [], reactions: [], updatedAt: now() }],
        }));
        return id;
      },
      updateSessionPage: (id, patch) =>
        set((s) => ({ sessionPages: s.sessionPages.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)) })),

      // ------------------------------------------------------------ Voor volgende keer
      addAgendaItem: ({ clientId, by, text, journalEntryId }) => {
        const next = upcoming(get().appointments.filter((a) => a.clientId === clientId))[0];
        if (!next) return undefined;
        if (journalEntryId) {
          const existing = get().agenda.find((i) => i.journalEntryId === journalEntryId && i.appointmentId === next.id);
          if (existing) return existing.id;
        }
        const id = uid("ag");
        set((s) => ({
          agenda: [...s.agenda, { id, clientId, appointmentId: next.id, text: text?.trim() || undefined, journalEntryId, addedBy: by, createdAt: now() }],
        }));
        return id;
      },
      removeAgendaItem: (id) => set((s) => ({ agenda: s.agenda.filter((i) => i.id !== id) })),

      // ------------------------------------------------------------ Logboek
      createJournal: (clientId, init) => {
        const id = uid("j");
        const t = now();
        set((s) => ({
          journal: [
            {
              id,
              clientId,
              kind: "notitie",
              day: today(),
              createdAt: t,
              updatedAt: t,
              blocks: [],
              tags: [],
              sharedWithPsychologist: s.prefs.defaultShare,
              ...init,
            },
            ...s.journal,
          ],
        }));
        return id;
      },
      updateJournal: (id, patch) =>
        set((s) => ({ journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: now() } : j)) })),
      deleteJournal: (id) =>
        set((s) => ({ journal: s.journal.filter((j) => j.id !== id), agenda: s.agenda.filter((i) => i.journalEntryId !== id) })),
      pruneJournal: (id) =>
        set((s) => {
          const j = s.journal.find((x) => x.id === id);
          if (!j || j.kind !== "notitie" || j.blocks.length || j.title?.trim() || j.mood || j.tags.length) return {};
          return { journal: s.journal.filter((x) => x.id !== id), agenda: s.agenda.filter((i) => i.journalEntryId !== id) };
        }),
      setJournalNote: (id, text) =>
        set((s) => ({
          journal: s.journal.map((j) =>
            j.id === id ? { ...j, psychologistNote: text.trim() ? { text: text.trim(), createdAt: now() } : undefined } : j
          ),
        })),
      saveCheckin: (clientId, { mood, text, shared }) => {
        const day = today();
        const existing = get().journal.find((j) => j.clientId === clientId && j.kind === "checkin" && j.day === day);
        const blocks = text?.trim() ? textBlocks(text, clientId) : undefined;
        if (existing) {
          get().updateJournal(existing.id, {
            mood,
            ...(blocks ? { blocks: [...existing.blocks, ...blocks] } : {}),
            ...(shared !== undefined ? { sharedWithPsychologist: shared } : {}),
          });
          return existing.id;
        }
        const id = get().createJournal(clientId, { kind: "checkin", mood, blocks: blocks ?? [] });
        if (shared !== undefined) get().updateJournal(id, { sharedWithPsychologist: shared });
        return id;
      },
      completeTask: (taskId, input = {}) => {
        const task = get().tasks.find((t) => t.id === taskId);
        const day = input.day ?? today();
        const existing = get().journal.find((j) => j.kind === "opdracht" && j.taskId === taskId && j.day === day);
        const blocks = input.text !== undefined ? textBlocks(input.text, task?.clientId ?? "") : undefined;
        if (existing) {
          get().updateJournal(existing.id, {
            ...(blocks ? { blocks } : {}),
            ...(input.scale !== undefined ? { scale: input.scale } : {}),
            ...(input.shared !== undefined ? { sharedWithPsychologist: input.shared } : {}),
          });
          return existing.id;
        }
        const id = uid("j");
        const t = now();
        set((s) => ({
          journal: [
            {
              id,
              clientId: task?.clientId ?? "",
              kind: "opdracht",
              day,
              taskId,
              createdAt: t,
              updatedAt: t,
              blocks: blocks ?? [],
              scale: input.scale,
              tags: [],
              sharedWithPsychologist: input.shared ?? s.prefs.defaultShare,
            },
            ...s.journal,
          ],
        }));
        return id;
      },
      uncompleteTask: (taskId, day) => {
        const d = day ?? today();
        const entry = get().journal.find((j) => j.kind === "opdracht" && j.taskId === taskId && j.day === d);
        if (entry) get().deleteJournal(entry.id);
      },

      // ------------------------------------------------------------ Sessienotities
      createSessionNote: (clientId, appointmentId) => {
        const id = uid("sn");
        const t = now();
        set((s) => ({ sessionNotes: [...s.sessionNotes, { id, clientId, appointmentId, createdAt: t, updatedAt: t, blocks: [] }] }));
        return id;
      },
      updateSessionNote: (id, blocks) =>
        set((s) => ({ sessionNotes: s.sessionNotes.map((x) => (x.id === id ? { ...x, blocks, updatedAt: now() } : x)) })),
      deleteSessionNote: (id) => set((s) => ({ sessionNotes: s.sessionNotes.filter((x) => x.id !== id) })),

      // ------------------------------------------------------------ Opdrachten
      createTask: (task) => {
        const id = uid("k");
        set((s) => ({ tasks: [...s.tasks, { ...task, id, createdAt: now() }] }));
        return id;
      },
      updateTask: (id, patch) => set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      archiveTask: (id, archived = true) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, archived } : t)) })),
      saveTemplate: (template) => {
        const id = template.id ?? uid("tt");
        set((s) => ({
          templates: s.templates.some((t) => t.id === id)
            ? s.templates.map((t) => (t.id === id ? { ...template, id } : t))
            : [...s.templates, { ...template, id }],
        }));
        return id;
      },
      deleteTemplate: (id) => set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),

      // ------------------------------------------------------------ Afspraken
      createAppointment: ({ clientId, start, type, mode, minutes }) => {
        const id = uid("a");
        const end = addMinutes(new Date(start), minutes ?? get().psychologist.sessionMinutes).toISOString();
        set((s) => ({
          appointments: [...s.appointments, { id, clientId, start, end, type, mode, status: "gepland" as const }].sort((a, b) =>
            a.start.localeCompare(b.start)
          ),
        }));
        return id;
      },
      rescheduleAppointment: (id, start) =>
        set((s) => ({
          appointments: s.appointments
            .map((a) => {
              if (a.id !== id) return a;
              const minutes = (new Date(a.end).getTime() - new Date(a.start).getTime()) / 60000;
              return { ...a, start, end: addMinutes(new Date(start), minutes).toISOString(), status: "gepland" as const };
            })
            .sort((a, b) => a.start.localeCompare(b.start)),
        })),
      setAppointmentStatus: (id, status) =>
        set((s) => {
          const appointments = s.appointments.map((a) => (a.id === id ? { ...a, status } : a));
          const a = appointments.find((x) => x.id === id);
          let invoices = s.invoices;
          // Een voltooide of gemiste sessie krijgt een factuur, één keer.
          if (a && (status === "voltooid" || status === "no-show") && !s.invoices.some((f) => f.appointmentId === id)) {
            const numbers = s.invoices.map((f) => Number(f.number.split("-")[1])).filter(Boolean);
            const next = (numbers.length ? Math.max(...numbers) : 100) + 1;
            invoices = [
              ...s.invoices,
              {
                id: uid("f"),
                number: `${new Date().getFullYear()}-0${next}`,
                clientId: a.clientId,
                appointmentId: id,
                amount: s.psychologist.hourlyRate,
                issuedAt: now(),
                dueAt: addDays(new Date(), 14).toISOString(),
                status: "open",
              },
            ];
          }
          return { appointments, invoices };
        }),

      // ------------------------------------------------------------ Betalingen
      payInvoice: (id) =>
        set((s) => ({
          invoices: s.invoices.map((f) => (f.id === id ? { ...f, status: "betaald" as const, paidAt: now(), attestUrl: "#" } : f)),
        })),

      // ------------------------------------------------------------ Cliënten en praktijk
      createClient: (input) => {
        const id = uid("c");
        set((s) => ({
          clients: [
            ...s.clients,
            { ...input, id, status: "actief" as const, startedAt: now(), psychologistId: s.psychologist.id },
          ],
        }));
        return id;
      },
      setClientStatus: (id, status) =>
        set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, status } : c)) })),
      updateClient: (id, patch) => set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      updatePsychologist: (patch) => set((s) => ({ psychologist: { ...s.psychologist, ...patch } })),

      // ------------------------------------------------------------ Voorkeuren
      updatePrefs: (patch) => set((s) => ({ prefs: { ...s.prefs, ...patch } })),

      // ------------------------------------------------------------ Overig
      markSeen: (role, id) => set((s) => ({ seen: { ...s.seen, [`${role}:${id}`]: now() } })),
      resetDemo: () => set(fresh()),
    }),
    {
      name: "huiskamer-demo",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      // Nieuwe dag, nieuwe demo: zo staan de afspraken altijd rond vandaag.
      merge: (persisted, current) => {
        const p = persisted as Partial<StoreState> | undefined;
        if (!p) return current;
        // Nieuwe dag of nieuw datamodel: verse demo, maar onboarding en voorkeuren blijven.
        if (p.schema !== SCHEMA || p.seededOn !== current.seededOn) return p.schema === SCHEMA && p.prefs ? { ...current, prefs: p.prefs } : current;
        return { ...current, ...p };
      },
    }
  )
);

