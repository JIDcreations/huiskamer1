"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarCheck, CalendarPlus, Check, MoreHorizontal, Trash2 } from "lucide-react";
import { Editor } from "@/components/editor/editor";
import { MoodPicker } from "@/components/shared/mood";
import { RhythmLabel } from "@/components/shared/rhythm";
import { ShareSwitch } from "@/components/shared/share";
import { TagInput } from "@/components/shared/tag-input";
import { ScalePicker } from "@/components/shared/task-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import {
  actions,
  CURRENT_CLIENT_ID,
  isOnAgenda,
  journalKindLabel,
  useAgendaRaw,
  useAppointments,
  useJournal,
  useJournalEntry,
  usePsychologist,
  useTask,
} from "@/lib/data";
import { capitalize, formatDayMonth, formatLongDate, formatTime, formatWhen } from "@/lib/format";
import { useAutosave } from "@/lib/use-autosave";
import type { Block } from "@/lib/types";

const open = new Map<string, number>();

export default function Entry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const psy = usePsychologist();
  const entry = useJournalEntry(id);
  const task = useTask(entry?.taskId);
  const agenda = useAgendaRaw();
  const appointments = useAppointments();
  const onAgenda = isOnAgenda(agenda, appointments, id);
  const planned = onAgenda?.appointment?.status === "gepland" ? onAgenda.appointment : undefined;
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
      <div className="card">
        <EmptyState title="Deze entry bestaat niet" action={<Button asChild variant="secondary"><Link href="/c/logboek">Naar je logboek</Link></Button>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="sr-only">Logboekentry van {formatLongDate(entry.createdAt)}</h1>
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

      {/* Delen: altijd zichtbaar, altijd op dezelfde plek. */}
      <div className="mb-4 card px-5 py-4">
        <ShareSwitch
          shared={entry.sharedWithPsychologist}
          onChange={(v) => {
            actions.updateJournal(id, { sharedWithPsychologist: v });
            toast(v ? `Gedeeld met ${psy.firstName}` : "Enkel voor jou");
          }}
        />
      </div>

      <div className="card px-5 pb-8 pt-7 md:px-10 md:pt-9">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[13px] font-medium text-muted">{entry.kind === "opdracht" ? task?.title ?? "Opdracht" : journalKindLabel[entry.kind]}</p>
          <p className="text-[13px] text-faint">
            {capitalize(formatLongDate(entry.createdAt))}, {formatTime(entry.createdAt)}
          </p>
        </div>

        {entry.kind === "opdracht" && task && (
          <div className="mb-6 rounded-xl bg-oat-soft/70 px-4 py-3">
            <p className="text-[14px] leading-relaxed text-muted">{task.description}</p>
            <RhythmLabel rhythm={task.rhythm} className="mt-1.5" />
          </div>
        )}

        {entry.kind === "opdracht" && task?.kind === "schaal" && (
          <div className="mb-6">
            <p className="mb-2 text-[13px] text-muted">{task.scaleLabel ?? "Score"}, van 1 tot 10</p>
            <ScalePicker value={entry.scale} onChange={(scale) => actions.updateJournal(id, { scale })} label={task.scaleLabel ?? task.title} />
          </div>
        )}

        {entry.kind !== "opdracht" && (
          <>
            <p className="mb-2 text-[13px] text-muted">Hoe voel je je?</p>
            <MoodPicker value={entry.mood} onChange={(mood) => actions.updateJournal(id, { mood })} />
          </>
        )}

        <div className={entry.kind === "opdracht" ? "" : "mt-8"}>
          <Editor
            blocks={entry.blocks}
            authorId={CURRENT_CLIENT_ID}
            title={entry.kind === "notitie" ? title : undefined}
            onTitleChange={
              entry.kind === "notitie"
                ? (t) => {
                    setTitle(t);
                    titleSave.schedule(t);
                  }
                : undefined
            }
            titlePlaceholder="Titel, als je wil"
            placeholder={
              entry.kind === "checkin"
                ? "Wil je er iets bij zeggen?"
                : entry.kind === "opdracht"
                  ? "Je antwoord of een notitie"
                  : "Wat houdt je bezig? Schrijf zoals het komt."
            }
            autoFocus={entry.kind === "notitie" && !entry.blocks.length}
            onChange={blocksSave.schedule}
            className="max-w-none"
          />
        </div>

        {entry.kind === "notitie" && (
          <div className="mt-8 border-t border-surface-2 pt-5">
            <p className="mb-2 text-[13px] text-muted">Tags</p>
            <TagInput value={entry.tags} onChange={(tags) => actions.updateJournal(id, { tags })} suggestions={suggestions} />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-1">
        {planned ? (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted">
            <CalendarCheck className="size-4 stroke-[1.5] text-taupe" />
            Op de agenda voor {formatDayMonth(planned.start)}
          </span>
        ) : (
          <Button
            variant="soft"
            size="sm"
            onClick={() => {
              const added = actions.addAgendaItem({ clientId: CURRENT_CLIENT_ID, by: CURRENT_CLIENT_ID, journalEntryId: id });
              toast(added ? "Op de agenda voor je volgende sessie" : "Er is nog geen sessie gepland");
            }}
          >
            <CalendarPlus /> Neem mee naar de sessie
          </Button>
        )}
        {planned && (
          <Button
            variant="quiet"
            size="sm"
            onClick={() => {
              actions.removeAgendaItem(onAgenda!.item.id);
              toast("Van de agenda gehaald");
            }}
          >
            Van de agenda halen
          </Button>
        )}
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
