"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Check, MapPin, Video } from "lucide-react";
import { BlocksView } from "@/components/editor/blocks-view";
import { Editor } from "@/components/editor/editor";
import { entryLabel } from "@/components/shared/journal-list";
import { RhythmLabel } from "@/components/shared/rhythm";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import {
  actions,
  agendaOfSession,
  PSY_ID,
  taskState,
  useAgendaRaw,
  useAppointment,
  useAuthors,
  useJournal,
  usePersonName,
  usePsychologist,
  useSessionPage,
  useTasks,
  useVisit,
  weekProgress,
} from "@/lib/data";
import { capitalize, formatLongDate, formatTime } from "@/lib/format";
import { useAutosave } from "@/lib/use-autosave";
import type { Block, ID, JournalEntry, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function SectionTitle({ children, hint }: { children: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="text-[13px] font-medium tracking-[0.02em] text-muted">{children}</h2>
      {hint}
    </div>
  );
}

function SaveState({ status }: { status: "idle" | "saving" | "saved" }) {
  return (
    <span aria-live="polite" className="inline-flex items-center gap-1.5 text-[12px] text-faint">
      {status === "saving" && "Bewaren..."}
      {status === "saved" && (
        <>
          <Check className="size-3.5 stroke-[2]" /> Bewaard
        </>
      )}
    </span>
  );
}

/** Eén opdracht uit de sessie, met een neutrale stand. */
export function SessionTaskRow({ task, journal, action }: { task: Task; journal: JournalEntry[]; action?: React.ReactNode }) {
  const state = taskState(task, journal);
  const progress = weekProgress(task, journal);
  const status =
    task.rhythm.kind === "eenmalig"
      ? state === "gedaan"
        ? "Gedaan"
        : state === "niet gedaan"
          ? "Niet gedaan"
          : "Open"
      : state === "afgelopen"
        ? "Afgelopen"
        : progress
          ? `${progress.done} van ${progress.total} deze week`
          : "";
  return (
    <li className="flex items-center gap-3 py-3">
      <span
        aria-hidden
        className={cn(
          "size-2 shrink-0 rounded-full",
          state === "gedaan" ? "bg-accent" : state === "open" ? "ring-[1.5px] ring-inset ring-taupe" : "bg-surface-2"
        )}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[15px] font-medium", (state === "niet gedaan" || state === "afgelopen") && "text-muted")}>{task.title}</p>
        <RhythmLabel rhythm={task.rhythm} />
      </div>
      <span className="shrink-0 text-[12px] text-muted tabular-nums">{status}</span>
      {action}
    </li>
  );
}

/**
 * De gedeelde pagina van een sessie: wat we bespraken, wat we afspraken, reacties.
 * Zelfde pagina bij cliënt en psycholoog; enkel de psycholoog schrijft de samenvatting.
 */
export function SessionView({
  appointmentId,
  viewer,
  backHref,
  entryHref,
  tasksAction,
  aside,
}: {
  appointmentId: ID;
  viewer: "client" | "psy";
  backHref: string;
  entryHref: (id: ID) => string;
  tasksAction?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const psy = usePsychologist();
  const appointment = useAppointment(appointmentId);
  const page = useSessionPage(appointmentId);
  const clientId = appointment?.clientId ?? "";
  const authors = useAuthors(clientId);
  const name = usePersonName();
  const allTasks = useTasks(clientId);
  const archived = useTasks(clientId, { archived: true });
  const tasks = useMemo(() => [...allTasks, ...archived].filter((t) => t.appointmentId === appointmentId), [allTasks, archived, appointmentId]);
  const journal = useJournal(clientId, { sharedOnly: viewer === "psy" });
  const agenda = useAgendaRaw();
  const brought = agendaOfSession(agenda, appointmentId)
    .map((item) => ({ item, entry: item.journalEntryId ? journal.find((j) => j.id === item.journalEntryId) : undefined }))
    .filter(({ item, entry }) => !item.journalEntryId || entry);

  const me = viewer === "psy" ? PSY_ID : clientId;
  const since = useVisit(viewer, `session:${appointmentId}`);
  const highlight = useMemo(() => ({ viewerId: me, since }), [me, since]);

  const pageId = () => page?.id ?? actions.ensureSessionPage(appointmentId);
  const summarySave = useAutosave<Block[]>((summary) => actions.updateSessionPage(pageId(), { summary }));
  const reactionsSave = useAutosave<Block[]>((reactions) => actions.updateSessionPage(pageId(), { reactions }));
  const status =
    summarySave.status === "saving" || reactionsSave.status === "saving"
      ? "saving"
      : summarySave.status === "saved" || reactionsSave.status === "saved"
        ? "saved"
        : "idle";

  if (!appointment) {
    return (
      <div className="card">
        <EmptyState
          title="Deze sessie bestaat niet"
          action={
            <Button asChild variant="secondary">
              <Link href={backHref}>Terug</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const Icon = appointment.mode === "online" ? Video : MapPin;
  const other = viewer === "psy" ? name(clientId) : psy.firstName;

  return (
    <div className={cn("mx-auto", aside ? "max-w-6xl" : "max-w-[760px]")}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href={backHref} className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-text">
          <ArrowLeft className="size-4 stroke-[1.5]" /> Sessies
        </Link>
        <SaveState status={status} />
      </div>

      <div className={cn(aside && "grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]")}>
        <article className="hk-tafel min-w-0 card px-5 pb-8 pt-7 sm:px-8 md:px-10 md:pt-9">
          <header>
            <p className="text-[13px] text-muted">{appointment.type === "intake" ? "Intake" : "Sessie"}</p>
            <h1 className="mt-1 type-title">{capitalize(formatLongDate(appointment.start))}</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] text-muted tabular-nums">
              <Icon className="size-3.5 stroke-[1.5] text-taupe" />
              {formatTime(appointment.start)} tot {formatTime(appointment.end)}, {appointment.mode === "online" ? "online" : "in de praktijk"}
            </p>
          </header>

          {brought.length > 0 && (
            <section className="mt-8">
              <SectionTitle>Meegebracht naar deze sessie</SectionTitle>
              <ul className="flex flex-col gap-1.5">
                {brought.map(({ item, entry }) => (
                  <li key={item.id} className="text-[14px] text-muted">
                    {entry ? (
                      <Link href={entryHref(entry.id)} className="underline decoration-surface-2 underline-offset-4 hover:text-text">
                        {entry.title || entryLabel(entry, tasks)}
                      </Link>
                    ) : (
                      item.text
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8">
            <SectionTitle>Wat we bespraken</SectionTitle>
            {viewer === "psy" ? (
              <Editor
                blocks={page?.summary ?? []}
                authorId={PSY_ID}
                placeholder="Wat bespraken jullie? Kort, in de taal van de cliënt. Typ / voor een kop of citaat."
                onChange={summarySave.schedule}
                className="max-w-none"
              />
            ) : page?.summary.length ? (
              <BlocksView blocks={page.summary} className="max-w-none" />
            ) : (
              <p className="text-[14px] text-muted">{psy.firstName} schrijft hier nog een korte samenvatting.</p>
            )}
          </section>

          <section className="mt-10">
            <SectionTitle hint={tasksAction}>Wat we afspraken</SectionTitle>
            {tasks.length ? (
              <ul className="divide-y divide-surface-2/70 border-y border-surface-2/70">
                {tasks.map((t) => (
                  <SessionTaskRow key={t.id} task={t} journal={journal} />
                ))}
              </ul>
            ) : (
              <p className="text-[14px] text-muted">Geen opdrachten uit deze sessie.</p>
            )}
          </section>

          <section className="mt-10">
            <SectionTitle>Reacties</SectionTitle>
            <p className="-mt-1 mb-4 text-[13px] text-faint">
              {viewer === "client" ? `Schrijf eronder wat je nog kwijt wil. ${psy.firstName} leest mee.` : `Jij en ${other} schrijven hier allebei.`}
            </p>
            <Editor
              blocks={page?.reactions ?? []}
              authorId={me}
              authors={authors}
              showAuthors
              highlight={highlight}
              placeholder="Schrijf een reactie of een vraag. Typ / voor een kop, taak of citaat."
              onChange={reactionsSave.schedule}
              className="max-w-none"
            />
          </section>
        </article>

        {aside}
      </div>
    </div>
  );
}
