"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { addDays, addMinutes, format } from "date-fns";
import { seed, type Database } from "@/lib/mock/seed";
import type {
  Appointment,
  AppointmentMode,
  AppointmentType,
  Block,
  Client,
  ClientStatus,
  ID,
  JournalEntry,
  Psychologist,
  Role,
  TablePage,
  Task,
  TaskTemplate,
} from "@/lib/types";

/**
 * In-memory store voor de demo. Enkel `/lib/data` praat hiermee; componenten nooit rechtstreeks.
 * Wordt bewaard in localStorage zodat de demo een herlaadbeurt overleeft.
 */

type Meta = {
  /** Dag waarop de data gegenereerd werd. Een nieuwe dag geeft verse data rond "vandaag". */
  seededOn: string;
  seededAt: string;
  /** Laatste bezoek per kijker en item: `${role}:${id}` → ISO. */
  seen: Record<string, string>;
};

type Actions = {
  // Tafel
  createPage: (clientId: ID, by: ID, init?: { title?: string; blocks?: Block[] }) => ID;
  updatePage: (id: ID, patch: Partial<Pick<TablePage, "title" | "blocks">>) => void;
  togglePin: (id: ID) => void;
  deletePage: (id: ID) => void;

  // Logboek
  createJournal: (clientId: ID) => ID;
  updateJournal: (id: ID, patch: Partial<Pick<JournalEntry, "title" | "blocks" | "mood" | "tags" | "sharedWithPsychologist">>) => void;
  deleteJournal: (id: ID) => void;
  /** Verwijdert een entry als ze helemaal leeg is. */
  pruneJournal: (id: ID) => void;
  setJournalNote: (id: ID, text: string) => void;

  // Sessienotities
  createSessionNote: (clientId: ID, appointmentId?: ID) => ID;
  updateSessionNote: (id: ID, blocks: Block[]) => void;
  deleteSessionNote: (id: ID) => void;

  // Opdrachten
  createTask: (task: Omit<Task, "id" | "createdAt">) => ID;
  updateTask: (id: ID, patch: Partial<Task>) => void;
  archiveTask: (id: ID, archived?: boolean) => void;
  setTaskEntry: (taskId: ID, date: string, patch: { completed?: boolean; answer?: string; scale?: number }) => void;
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

function fresh(): Database & Meta {
  const d = new Date();
  return { ...seed(d), seededOn: format(d, "yyyy-MM-dd"), seededAt: d.toISOString(), seen: {} };
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ...fresh(),

      // ------------------------------------------------------------ Tafel
      createPage: (clientId, by, init) => {
        const id = uid("tp");
        const t = now();
        set((s) => ({
          tablePages: [
            { id, clientId, title: init?.title ?? "", blocks: init?.blocks ?? [], pinned: false, createdBy: by, createdAt: t, updatedAt: t },
            ...s.tablePages,
          ],
        }));
        return id;
      },
      updatePage: (id, patch) =>
        set((s) => ({
          tablePages: s.tablePages.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)),
        })),
      togglePin: (id) =>
        set((s) => ({ tablePages: s.tablePages.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p)) })),
      deletePage: (id) => set((s) => ({ tablePages: s.tablePages.filter((p) => p.id !== id) })),

      // ------------------------------------------------------------ Logboek
      createJournal: (clientId) => {
        const id = uid("j");
        const t = now();
        set((s) => ({
          journal: [{ id, clientId, createdAt: t, updatedAt: t, blocks: [], tags: [], sharedWithPsychologist: true }, ...s.journal],
        }));
        return id;
      },
      updateJournal: (id, patch) =>
        set((s) => ({ journal: s.journal.map((j) => (j.id === id ? { ...j, ...patch, updatedAt: now() } : j)) })),
      deleteJournal: (id) => set((s) => ({ journal: s.journal.filter((j) => j.id !== id) })),
      pruneJournal: (id) =>
        set((s) => ({
          journal: s.journal.filter(
            (j) => j.id !== id || j.blocks.length > 0 || Boolean(j.title?.trim()) || Boolean(j.mood) || j.tags.length > 0
          ),
        })),
      setJournalNote: (id, text) =>
        set((s) => ({
          journal: s.journal.map((j) =>
            j.id === id ? { ...j, psychologistNote: text.trim() ? { text: text.trim(), createdAt: now() } : undefined } : j
          ),
        })),

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
      setTaskEntry: (taskId, date, patch) =>
        set((s) => {
          const existing = s.taskEntries.find((e) => e.taskId === taskId && e.date === date);
          if (existing) {
            return {
              taskEntries: s.taskEntries.map((e) => (e === existing ? { ...e, ...patch, updatedAt: now() } : e)),
            };
          }
          return {
            taskEntries: [
              ...s.taskEntries,
              { id: uid("e"), taskId, date, completed: false, ...patch, updatedAt: now() },
            ],
          };
        }),
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
        if (!p || p.seededOn !== current.seededOn) return current;
        return { ...current, ...p };
      },
    }
  )
);

