"use client";

import { useState } from "react";
import { BlocksView } from "@/components/editor/blocks-view";
import { MoodDots } from "@/components/shared/mood";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { actions, useJournal, usePsychologist } from "@/lib/data";
import { capitalize, formatLongDate, formatTime, formatWhen } from "@/lib/format";
import type { Client, JournalEntry } from "@/lib/types";

function NoteEditor({ entry, client }: { entry: JournalEntry; client: Client }) {
  const psy = usePsychologist();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(entry.psychologistNote?.text ?? "");

  if (editing) {
    return (
      <div className="mt-4 rounded-xl bg-oat-soft p-4">
        <Textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Een korte kanttekening." className="bg-surface" />
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-[12px] text-muted">{client.firstName} ziet dit bij de entry.</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              Annuleren
            </Button>
            <Button
              size="sm"
              onClick={() => {
                actions.setJournalNote(entry.id, text);
                setEditing(false);
                toast(text.trim() ? "Kanttekening bewaard" : "Kanttekening verwijderd");
              }}
            >
              Bewaren
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (entry.psychologistNote) {
    return (
      <div className="mt-4 rounded-xl bg-oat-soft px-4 py-3">
        <p className="text-[12px] text-muted">
          Jouw kanttekening, {formatWhen(entry.psychologistNote.createdAt)}
          <button className="ml-2 underline decoration-surface-2 underline-offset-2 hover:text-text" onClick={() => setEditing(true)}>
            Aanpassen
          </button>
        </p>
        <p className="mt-1 text-[14px] leading-relaxed">{entry.psychologistNote.text}</p>
        <span className="sr-only">{psy.name}</span>
      </div>
    );
  }

  return (
    <Button variant="quiet" size="sm" className="-ml-3 mt-3" onClick={() => setEditing(true)}>
      Kanttekening schrijven
    </Button>
  );
}

/** Enkel gedeelde entries. Niet-gedeelde bestaan hier niet, ook niet als aantal. */
export function JournalTab({ client }: { client: Client }) {
  const entries = useJournal(client.id, { sharedOnly: true }).filter((e) => e.blocks.length || e.title);

  if (!entries.length) {
    return <EmptyState title="Nog niets gedeeld" description={`Als ${client.firstName} een logboekentry deelt, lees je ze hier.`} />;
  }

  return (
    <div className="mx-auto flex max-w-[720px] flex-col gap-4">
      {entries.map((e) => (
        <article key={e.id} id={e.id} className="scroll-mt-24 rounded-card bg-surface px-5 py-5 shadow-soft ring-1 ring-surface-2/60 md:px-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] text-muted">
              {capitalize(formatLongDate(e.createdAt))}, {formatTime(e.createdAt)}
            </p>
            <MoodDots value={e.mood} />
          </div>
          {e.title && <h3 className="mt-2 text-[17px] font-semibold tracking-tight">{e.title}</h3>}
          <BlocksView blocks={e.blocks} className="mt-2 text-[15px]" />
          {e.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {e.tags.map((t) => (
                <span key={t} className="rounded-full bg-oat-soft px-2 py-0.5 text-[12px] text-muted">
                  {t}
                </span>
              ))}
            </div>
          )}
          <NoteEditor entry={e} client={client} />
        </article>
      ))}
    </div>
  );
}
