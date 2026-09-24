"use client";

import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { Plus } from "lucide-react";
import { Editor } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { actions, excerpt, PSY_ID, useAppointments, useSessionNotes } from "@/lib/data";
import { capitalize, formatLongDate, formatShortDate } from "@/lib/format";
import { useAutosave } from "@/lib/use-autosave";
import type { Block, Client, ID, SessionNote } from "@/lib/types";
import { cn } from "@/lib/utils";

function NoteEditor({ note }: { note: SessionNote }) {
  const save = useAutosave<Block[]>((blocks) => actions.updateSessionNote(note.id, blocks));
  return (
    <Editor
      key={note.id}
      blocks={note.blocks}
      authorId={PSY_ID}
      private
      autoFocus={!note.blocks.length}
      placeholder="Wat viel op, wat wil je volgende keer oppakken?"
      onChange={save.schedule}
      className="max-w-none"
    />
  );
}

/** Privé: enkel voor de psycholoog. Visueel anders, nooit in de cliëntomgeving. */
export function NotesTab({ client }: { client: Client }) {
  const notes = useSessionNotes(client.id);
  const appointments = useAppointments(client.id);
  const sessions = useMemo(
    () =>
      appointments
        .filter((a) => (a.status === "voltooid" || a.status === "no-show" || parseISO(a.start) <= new Date()) && a.status !== "geannuleerd")
        .reverse(),
    [appointments]
  );
  const rows = useMemo(() => {
    const list: { key: string; date: string; label: string; note?: SessionNote; appointmentId?: ID }[] = sessions.map((a) => ({
      key: a.id,
      date: a.start,
      label: a.type === "intake" ? "Intake" : "Sessie",
      note: notes.find((n) => n.appointmentId === a.id),
      appointmentId: a.id,
    }));
    for (const n of notes.filter((n) => !n.appointmentId || !sessions.some((a) => a.id === n.appointmentId))) {
      list.push({ key: n.id, date: n.createdAt, label: "Losse notitie", note: n });
    }
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [sessions, notes]);

  const [selected, setSelected] = useState<string | undefined>(rows[0]?.key);
  const current = rows.find((r) => r.key === selected) ?? rows[0];

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <div className="flex flex-col gap-1">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2 justify-start"
            onClick={() => {
              const id = actions.createSessionNote(client.id);
              setSelected(id);
            }}
          >
            <Plus /> Losse notitie
          </Button>
          {rows.map((r) => (
            <button
              key={r.key}
              onClick={() => setSelected(r.key)}
              className={cn(
                "rounded-xl px-3.5 py-2.5 text-left transition-colors",
                current?.key === r.key ? "bg-surface-2/80" : "hover:bg-oat-soft"
              )}
            >
              <span className="block text-[14px] font-medium">
                {r.label}, {formatShortDate(r.date)}
              </span>
              <span className="block truncate text-[12px] text-muted">{r.note?.blocks.length ? excerpt(r.note.blocks, 60) : "Nog geen notitie"}</span>
            </button>
          ))}
        </div>

        <div>
          {current ? (
            current.note ? (
              <>
                <p className="mb-3 text-[13px] text-muted">
                  {current.label}, {formatLongDate(current.date)}
                </p>
                <NoteEditor note={current.note} />
              </>
            ) : (
              <div className="rounded-card bg-surface-2/70 px-6 py-12 text-center">
                <p className="text-[15px] font-medium">
                  {current.label}, {capitalize(formatLongDate(current.date))}
                </p>
                <p className="mt-1 text-[14px] text-muted">Nog geen notitie bij deze sessie.</p>
                <Button className="mt-5" onClick={() => current.appointmentId && actions.createSessionNote(client.id, current.appointmentId)}>
                  Notitie beginnen
                </Button>
              </div>
            )
          ) : (
            <div className="rounded-card bg-surface-2/70 px-6 py-12 text-center text-[14px] text-muted">Nog geen sessies.</div>
          )}
        </div>
      </div>
    </div>
  );
}
