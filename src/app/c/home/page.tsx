"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, NotebookPen } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { NextAppointment } from "@/components/shared/appointment-card";
import { MoodPicker } from "@/components/shared/mood";
import { Panel } from "@/components/shared/panel";
import { TaskRow } from "@/components/shared/task-row";
import { Button } from "@/components/ui/button";
import {
  actions,
  CURRENT_CLIENT_ID,
  entryFor,
  dayOf,
  newBlocks,
  tasksForDay,
  upcoming,
  useAppointments,
  useCurrentClient,
  useInvoices,
  usePsychologist,
  useSeenLookup,
  useTablePages,
  useTaskEntries,
  useTasks,
} from "@/lib/data";
import { formatLongDate, formatMoney, formatWhen, greeting, plural } from "@/lib/format";
import type { Mood } from "@/lib/types";

export default function ClientHome() {
  const router = useRouter();
  const client = useCurrentClient();
  const psy = usePsychologist();
  const appointments = useAppointments(CURRENT_CLIENT_ID);
  const next = upcoming(appointments)[0];
  const tasks = useTasks(CURRENT_CLIENT_ID);
  const entries = useTaskEntries();
  const today = tasksForDay(tasks, entries);
  const doneToday = today.filter((t) => entryFor(entries, t.id, dayOf(new Date()))?.completed).length;
  const pages = useTablePages(CURRENT_CLIENT_ID);
  const seen = useSeenLookup("client");
  const fresh = useMemo(
    () => pages.map((p) => ({ page: p, blocks: newBlocks(p, CURRENT_CLIENT_ID, seen(p.id)) })).filter((x) => x.blocks.length),
    [pages, seen]
  );
  const open = useInvoices(CURRENT_CLIENT_ID).filter((f) => f.status !== "betaald");

  function writeWithMood(mood: Mood | undefined) {
    const id = actions.createJournal(CURRENT_CLIENT_ID);
    if (mood) actions.updateJournal(id, { mood });
    router.push(`/c/logboek/${id}`);
  }

  return (
    <>
      <PageHeader eyebrow={formatLongDate(new Date())} title={`${greeting()}, ${client.firstName}`} />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Panel>
            {next ? (
              <NextAppointment appointment={next}>
                <Button variant="secondary" size="sm" asChild>
                  <Link href="/c/afspraken">Bekijk afspraken</Link>
                </Button>
              </NextAppointment>
            ) : (
              <div>
                <p className="text-[13px] text-muted">Volgende afspraak</p>
                <p className="mt-1 text-[20px] font-semibold tracking-tight">Nog niets gepland</p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href="/c/afspraken">Afspraak maken</Link>
                </Button>
              </div>
            )}
          </Panel>

          <Panel
            title="Vandaag"
            description={today.length ? `${doneToday} van ${today.length} gedaan. Op je eigen tempo.` : undefined}
            href="/c/opdrachten"
            hrefLabel="Alle opdrachten"
            bodyClassName="pt-1"
          >
            {today.length ? (
              <div className="divide-y divide-surface-2/70">
                {today.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            ) : (
              <p className="py-3 text-[14px] text-muted">Geen opdrachten vandaag. Geniet ervan.</p>
            )}
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Hoe gaat het vandaag?" description="Een woord is genoeg om te beginnen.">
            <MoodPicker onChange={writeWithMood} />
            <Button variant="ghost" size="sm" className="-ml-3 mt-3" onClick={() => writeWithMood(undefined)}>
              <NotebookPen /> Schrijf in je logboek
            </Button>
          </Panel>

          <Panel title="Nieuw op de Tafel" href="/c/tafel" hrefLabel="Naar de Tafel" bodyClassName="pt-1">
            {fresh.length ? (
              <ul className="divide-y divide-surface-2/70">
                {fresh.map(({ page, blocks }) => (
                  <li key={page.id}>
                    <Link href={`/c/tafel/${page.id}`} className="group flex items-center gap-3 py-3">
                      <span className="size-2 shrink-0 rounded-full bg-accent" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium group-hover:underline group-hover:decoration-surface-2 group-hover:underline-offset-4">
                          {page.title || "Zonder titel"}
                        </span>
                        <span className="block text-[12px] text-muted">
                          {psy.firstName} schreef {plural(blocks.length, "blok", "blokken")}, {formatWhen(blocks[0].updatedAt)}
                        </span>
                      </span>
                      <ChevronRight className="size-4 stroke-[1.5] text-faint" />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-[14px] text-muted">Niets nieuw sinds je laatste bezoek.</p>
            )}
          </Panel>

          {open.length > 0 && (
            <Link
              href="/c/betalingen"
              className="flex items-center justify-between gap-3 rounded-card bg-oat-soft px-5 py-4 transition-colors hover:bg-surface-2/70"
            >
              <span>
                <span className="block text-[14px] font-medium">{plural(open.length, "openstaande factuur", "openstaande facturen")}</span>
                <span className="block text-[13px] text-muted">{formatMoney(open.reduce((s, f) => s + f.amount, 0))}, bekijk en betaal</span>
              </span>
              <ChevronRight className="size-4 stroke-[1.5] text-faint" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
