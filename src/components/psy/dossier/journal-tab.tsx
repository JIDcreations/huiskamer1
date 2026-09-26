"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlocksView } from "@/components/editor/blocks-view";
import { JournalTimeline, WeekStrip } from "@/components/shared/journal-list";
import { MoodDots } from "@/components/shared/mood";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, journalKindLabel, useJournal, usePsychologist, useTask } from "@/lib/data";
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
  const router = useRouter();
  const params = useSearchParams();
  const entries = useJournal(client.id, { sharedOnly: true }).filter((e) => e.kind !== "notitie" || e.blocks.length || e.title);
  const openId = params.get("entry");
  const open = entries.find((e) => e.id === openId);
  const base = `/p/clienten/${client.id}?tab=logboek`;
  const task = useTask(open?.taskId);

  return (
    <div className="mx-auto max-w-[760px]">
      <Panel bodyClassName="px-2 py-2 md:px-3">
        <WeekStrip entries={entries} />
      </Panel>
      <div className="mt-8">
        <JournalTimeline
          entries={entries}
          viewer="psy"
          hrefFor={(e) => `${base}&entry=${e.id}`}
          empty={
            <div className="card">
              <EmptyState title="Nog niets gedeeld" description={`Als ${client.firstName} iets deelt, lees je het hier.`} />
            </div>
          }
        />
      </div>

      <Sheet
        open={Boolean(open)}
        onOpenChange={(o) => !o && router.replace(base, { scroll: false })}
        title={open ? (open.kind === "opdracht" ? task?.title ?? "Opdracht" : open.title || journalKindLabel[open.kind]) : ""}
        description={open ? `${capitalize(formatLongDate(open.createdAt))}, ${formatTime(open.createdAt)}` : undefined}
        className="md:max-w-xl"
      >
        {open && (
          <div>
            {open.mood && <MoodDots value={open.mood} className="mb-3" />}
            {open.kind === "opdracht" && task?.kind === "schaal" && open.scale && (
              <p className="mb-3 text-[15px]">
                {task.scaleLabel ?? "Score"}: <span className="font-semibold tabular-nums">{open.scale}</span> op 10
              </p>
            )}
            {open.blocks.length ? (
              <BlocksView blocks={open.blocks} className="text-[15px]" />
            ) : (
              <p className="text-[14px] text-muted">{open.kind === "opdracht" ? "Gedaan, zonder notitie." : "Enkel een woord, zonder tekst."}</p>
            )}
            {open.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {open.tags.map((t) => (
                  <span key={t} className="rounded-full bg-oat-soft px-2 py-0.5 text-[12px] text-muted">
                    {t}
                  </span>
                ))}
              </div>
            )}
            <NoteEditor key={open.id} entry={open} client={client} />
          </div>
        )}
      </Sheet>
    </div>
  );
}
