"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Lock, MoreHorizontal, Trash2 } from "lucide-react";
import { Editor } from "@/components/editor/editor";
import { MoodPicker } from "@/components/shared/mood";
import { TagInput } from "@/components/shared/tag-input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { actions, CURRENT_CLIENT_ID, useJournal, useJournalEntry, usePsychologist } from "@/lib/data";
import { capitalize, formatLongDate, formatTime, formatWhen } from "@/lib/format";
import { useAutosave } from "@/lib/use-autosave";
import type { Block } from "@/lib/types";

const open = new Map<string, number>();

export default function Entry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const psy = usePsychologist();
  const entry = useJournalEntry(id);
  const all = useJournal(CURRENT_CLIENT_ID);
  const suggestions = useMemo(() => [...new Set(all.flatMap((e) => e.tags))], [all]);
  const [title, setTitle] = useState(entry?.title ?? "");
  const blocksSave = useAutosave<Block[]>((blocks) => actions.updateJournal(id, { blocks }));
  const titleSave = useAutosave<string>((t) => actions.updateJournal(id, { title: t }));
  const saving = blocksSave.status === "saving" || titleSave.status === "saving";
  const saved = !saving && (blocksSave.status === "saved" || titleSave.status === "saved");

  // Een lege entry die je verlaat, verdwijnt vanzelf. Pas als ze echt nergens meer open staat.
  useEffect(() => {
    open.set(id, (open.get(id) ?? 0) + 1);
    return () => {
      blocksSave.flush();
      titleSave.flush();
      open.set(id, (open.get(id) ?? 1) - 1);
      setTimeout(() => {
        if (!open.get(id)) actions.pruneJournal(id);
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!entry || entry.clientId !== CURRENT_CLIENT_ID) {
    return (
      <div className="rounded-card bg-surface shadow-soft">
        <EmptyState title="Deze entry bestaat niet" action={<Button asChild variant="secondary"><Link href="/c/logboek">Naar je logboek</Link></Button>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/c/logboek" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-text">
          <ArrowLeft className="size-4 stroke-[1.5]" /> Logboek
        </Link>
        <div className="flex items-center gap-1">
          <span aria-live="polite" className="inline-flex items-center gap-1.5 text-[12px] text-faint">
            {saving && "Bewaren..."}
            {saved && (
              <>
                <Check className="size-3.5 stroke-[2]" /> Bewaard
              </>
            )}
          </span>
          <Menu>
            <MenuTrigger asChild>
              <Button variant="quiet" size="icon-sm" aria-label="Meer">
                <MoreHorizontal />
              </Button>
            </MenuTrigger>
            <MenuContent>
              <MenuItem
                onSelect={() => {
                  actions.deleteJournal(id);
                  toast("Entry verwijderd");
                  router.push("/c/logboek");
                }}
              >
                <Trash2 /> Entry verwijderen
              </MenuItem>
            </MenuContent>
          </Menu>
        </div>
      </div>

      {/* Delen: altijd zichtbaar, nooit verstopt. */}
      <label className="mb-4 flex cursor-pointer items-center justify-between gap-4 rounded-card bg-surface px-5 py-4 shadow-soft ring-1 ring-surface-2/60">
        <span className="flex items-start gap-3">
          {!entry.sharedWithPsychologist && <Lock className="mt-0.5 size-4 shrink-0 stroke-[1.5] text-faint" />}
          <span>
            <span className="block text-[15px] font-medium">Delen met {psy.firstName}</span>
            <span className="block text-[13px] text-muted">
              {entry.sharedWithPsychologist ? `${psy.firstName} kan deze entry lezen.` : "Enkel jij ziet deze entry."}
            </span>
          </span>
        </span>
        <Toggle
          checked={entry.sharedWithPsychologist}
          onCheckedChange={(v) => {
            actions.updateJournal(id, { sharedWithPsychologist: v });
            toast(v ? `Gedeeld met ${psy.firstName}` : "Enkel voor jou");
          }}
        />
      </label>

      <div className="rounded-card bg-surface px-5 pb-8 pt-7 shadow-soft ring-1 ring-surface-2/60 md:px-10 md:pt-9">
        <p className="mb-5 text-[13px] text-muted">
          {capitalize(formatLongDate(entry.createdAt))}, {formatTime(entry.createdAt)}
        </p>

        <p className="mb-2 text-[13px] text-muted">Hoe voel je je?</p>
        <MoodPicker value={entry.mood} onChange={(mood) => actions.updateJournal(id, { mood })} />

        <div className="mt-8">
          <Editor
            blocks={entry.blocks}
            authorId={CURRENT_CLIENT_ID}
            title={title}
            onTitleChange={(t) => {
              setTitle(t);
              titleSave.schedule(t);
            }}
            titlePlaceholder="Titel, als je wil"
            placeholder="Wat houdt je bezig? Schrijf zoals het komt."
            autoFocus={!entry.blocks.length}
            onChange={blocksSave.schedule}
            className="max-w-none"
          />
        </div>

        <div className="mt-8 border-t border-surface-2 pt-5">
          <p className="mb-2 text-[13px] text-muted">Tags</p>
          <TagInput value={entry.tags} onChange={(tags) => actions.updateJournal(id, { tags })} suggestions={suggestions} />
        </div>
      </div>

      {entry.psychologistNote && (
        <div className="mt-4 rounded-card bg-oat-soft px-5 py-4">
          <p className="text-[13px] text-muted">
            Kanttekening van {psy.firstName}, {formatWhen(entry.psychologistNote.createdAt)}
          </p>
          <p className="mt-1 text-[15px] leading-relaxed">{entry.psychologistNote.text}</p>
        </div>
      )}
    </div>
  );
}
