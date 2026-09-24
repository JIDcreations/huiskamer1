"use client";

/**
 * De enige toegang tot data voor componenten. Vandaag een mock store, later een echte API.
 */

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useStore, type StoreState } from "@/lib/mock/store";
import { CURRENT_CLIENT_ID, PSY_ID } from "@/lib/mock/seed";
import type { EditorAuthor } from "@/components/editor/authorship";
import type { ID, Role } from "@/lib/types";

export { CURRENT_CLIENT_ID, PSY_ID };
export * from "@/lib/data/derive";

// ------------------------------------------------------------------ Hydratatie

let hydrated = false;
const listeners = new Set<() => void>();

function subscribeHydration(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Laadt de demo uit localStorage. Eén keer, bij het openen van het platform. */
export function useHydrateStore() {
  useEffect(() => {
    if (hydrated) return;
    Promise.resolve(useStore.persist.rehydrate()).finally(() => {
      hydrated = true;
      listeners.forEach((l) => l());
    });
  }, []);
  return useSyncExternalStore(
    subscribeHydration,
    () => hydrated,
    () => false
  );
}

// ------------------------------------------------------------------ Lezen

const byName = (a: { lastName: string; firstName: string }, b: { lastName: string; firstName: string }) =>
  a.firstName.localeCompare(b.firstName, "nl");

export const usePsychologist = () => useStore((s) => s.psychologist);
export const useClientsRaw = () => useStore((s) => s.clients);

export function useClients() {
  const clients = useStore((s) => s.clients);
  return useMemo(() => [...clients].sort(byName), [clients]);
}

export const useClient = (id: ID | undefined) => useStore((s) => s.clients.find((c) => c.id === id));
export const useCurrentClient = () => useClient(CURRENT_CLIENT_ID)!;

export function useAppointments(clientId?: ID) {
  const all = useStore((s) => s.appointments);
  return useMemo(() => (clientId ? all.filter((a) => a.clientId === clientId) : all), [all, clientId]);
}

export function useTablePages(clientId: ID) {
  const all = useStore((s) => s.tablePages);
  return useMemo(
    () => all.filter((p) => p.clientId === clientId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [all, clientId]
  );
}

export const useTablePage = (id: ID | undefined) => useStore((s) => s.tablePages.find((p) => p.id === id));

export function useJournal(clientId: ID, opts: { sharedOnly?: boolean } = {}) {
  const all = useStore((s) => s.journal);
  const { sharedOnly } = opts;
  return useMemo(
    () =>
      all
        .filter((j) => j.clientId === clientId && (!sharedOnly || j.sharedWithPsychologist))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [all, clientId, sharedOnly]
  );
}

export const useJournalEntry = (id: ID | undefined) => useStore((s) => s.journal.find((j) => j.id === id));

export function useSessionNotes(clientId: ID) {
  const all = useStore((s) => s.sessionNotes);
  return useMemo(
    () => all.filter((n) => n.clientId === clientId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [all, clientId]
  );
}

export const useTemplates = () => useStore((s) => s.templates);

export function useTasks(clientId?: ID, opts: { archived?: boolean } = {}) {
  const all = useStore((s) => s.tasks);
  const { archived = false } = opts;
  return useMemo(
    () => all.filter((t) => (!clientId || t.clientId === clientId) && Boolean(t.archived) === archived),
    [all, clientId, archived]
  );
}

export const useTaskEntries = () => useStore((s) => s.taskEntries);

export function useInvoices(clientId?: ID) {
  const all = useStore((s) => s.invoices);
  return useMemo(
    () =>
      (clientId ? all.filter((f) => f.clientId === clientId) : all).sort((a, b) => b.issuedAt.localeCompare(a.issuedAt)),
    [all, clientId]
  );
}

/** Alles wat de afgeleide functies nodig hebben, in één keer. */
export function useActivitySource() {
  const appointments = useStore((s) => s.appointments);
  const tablePages = useStore((s) => s.tablePages);
  const journal = useStore((s) => s.journal);
  const sessionNotes = useStore((s) => s.sessionNotes);
  const tasks = useStore((s) => s.tasks);
  const taskEntries = useStore((s) => s.taskEntries);
  return useMemo(
    () => ({ appointments, tablePages, journal, sessionNotes, tasks, taskEntries }),
    [appointments, tablePages, journal, sessionNotes, tasks, taskEntries]
  );
}

/**
 * Laatste bezoek van een kijker aan een item. Zonder bezoek: het moment waarop de demo startte,
 * min een dag, zodat recente wijzigingen als nieuw verschijnen.
 */
export function useLastSeen(role: Role, id: ID | undefined) {
  const seen = useStore((s) => (id ? s.seen[`${role}:${id}`] : undefined));
  const seededAt = useStore((s) => s.seededAt);
  return seen ?? new Date(new Date(seededAt).getTime() - 86_400_000).toISOString();
}

/** Opzoekfunctie voor laatste bezoeken, voor lijsten. */
export function useSeenLookup(role: Role) {
  const seen = useStore((s) => s.seen);
  const seededAt = useStore((s) => s.seededAt);
  return useMemo(() => {
    const fallback = new Date(new Date(seededAt).getTime() - 86_400_000).toISOString();
    return (id: ID) => seen[`${role}:${id}`] ?? fallback;
  }, [seen, seededAt, role]);
}

/** Legt de waarde van het laatste bezoek vast bij het openen, en markeert het item als gezien. */
export function useVisit(role: Role, id: ID | undefined) {
  const lastSeen = useLastSeen(role, id);
  const [since, setSince] = useState<{ id?: ID; at: string }>({ id, at: lastSeen });
  if (since.id !== id) setSince({ id, at: lastSeen });

  useEffect(() => {
    if (!id) return;
    // Markeer als gezien bij vertrek, zodat de "nieuw"-markering blijft staan tijdens het bezoek.
    return () => useStore.getState().markSeen(role, id);
  }, [role, id]);

  return since.at;
}

export function useAuthors(clientId: ID | undefined): Record<string, EditorAuthor> {
  const psy = usePsychologist();
  const client = useClient(clientId);
  return useMemo(() => {
    const map: Record<string, EditorAuthor> = { [psy.id]: { name: psy.name, role: "psy" } };
    if (client) map[client.id] = { name: `${client.firstName} ${client.lastName}`, role: "client" };
    return map;
  }, [psy, client]);
}

export function usePersonName() {
  const psy = usePsychologist();
  const clients = useStore((s) => s.clients);
  return (id: ID, style: "first" | "full" = "first") => {
    if (id === psy.id) return style === "first" ? psy.firstName : psy.name;
    const c = clients.find((x) => x.id === id);
    if (!c) return "Onbekend";
    return style === "first" ? c.firstName : `${c.firstName} ${c.lastName}`;
  };
}

// ------------------------------------------------------------------ Schrijven

type ActionKeys = {
  [K in keyof StoreState]: StoreState[K] extends (...args: never[]) => unknown ? K : never;
}[keyof StoreState];

type Actions = Pick<StoreState, ActionKeys>;

/** Acties kunnen overal aangeroepen worden, ook buiten React. */
export const actions: Actions = new Proxy({} as Actions, {
  get: (_, key: string) => (...args: unknown[]) =>
    (useStore.getState() as unknown as Record<string, (...a: unknown[]) => unknown>)[key](...args),
});
