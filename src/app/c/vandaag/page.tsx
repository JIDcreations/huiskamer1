"use client";

import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { beelden } from "@/lib/beelden";
import { CheckIn } from "@/components/shared/checkin";
import { Panel } from "@/components/shared/panel";
import { TaskRow } from "@/components/shared/task-row";
import { WeekStrip } from "@/components/shared/journal-list";
import {
  checkinOn,
  CURRENT_CLIENT_ID,
  dayOf,
  tasksForDay,
  upcoming,
  useAppointments,
  useCurrentClient,
  useInvoices,
  useJournal,
  usePsychologist,
  useTasks,
} from "@/lib/data";
import { capitalize, formatDayMonth, formatLongDate, formatMoney, formatRelativeDay, formatTime, greeting } from "@/lib/format";

/** De volgende sessie, als donkergroene kaart. Zonder sessie: een openstaande factuur, anders niets. */
function NextUp() {
  const psy = usePsychologist();
  const next = upcoming(useAppointments(CURRENT_CLIENT_ID))[0];
  const open = useInvoices(CURRENT_CLIENT_ID).filter((f) => f.status !== "betaald");

  if (next) {
    const soon = differenceInCalendarDays(parseISO(next.start), new Date()) <= 2;
    return (
      <Link
        href="/c/sessies"
        className="group relative block overflow-hidden rounded-card bg-pine p-7 text-on-accent transition-colors duration-300 hover:bg-pine-deep md:p-8"
      >
        <p className="font-display text-[44px] leading-none first-letter:uppercase">{formatRelativeDay(next.start)}</p>
        <p className="mt-3 text-[15px] text-on-accent/80">
          {soon ? "Je volgende sessie, " : ""}
          {formatDayMonth(next.start)} om {formatTime(next.start)} bij {psy.firstName}
          {next.mode === "online" ? ", online" : ""}
        </p>
        <span className="mt-7 flex items-center justify-between border-t border-on-accent/15 pt-4 text-[14.5px]">
          Naar je sessies
          <span className="flex size-9 items-center justify-center rounded-full bg-sun text-pine transition-transform duration-500 ease-out-soft group-hover:translate-x-1">
            <ChevronRight className="size-4 stroke-[1.5]" />
          </span>
        </span>
      </Link>
    );
  }
  if (!open.length) return null;
  const total = open.reduce((s, f) => s + f.amount, 0);
  return (
    <Link href="/c/betalingen" className="group flex items-center justify-between gap-3 rounded-card bg-sun-soft p-6 text-sun-ink">
      <span>
        <span className="block font-display text-[26px] leading-tight">Er staat nog {formatMoney(total)} open</span>
        <span className="mt-1 block text-[13.5px]">Naar je betalingen</span>
      </span>
      <ChevronRight className="size-5 shrink-0 stroke-[1.75] transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export default function Vandaag() {
  const client = useCurrentClient();
  const journal = useJournal(CURRENT_CLIENT_ID);
  const tasks = useTasks(CURRENT_CLIENT_ID);
  const today = tasksForDay(tasks, journal);
  const checkin = checkinOn(journal, dayOf(new Date()));
  const allDone = today.length > 0 && today.every((t) => t.done);

  return (
    <>
      <PageHeader
        image={beelden.thee}
        eyebrow={capitalize(formatLongDate(new Date()))}
        title={
          <>
            {greeting()}, {client.firstName}
          </>
        }
      />

      <div className="mt-10 grid grid-cols-1 items-start gap-5 md:mt-14 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
        <div className="flex flex-col gap-5 lg:gap-6">
          <Panel bodyClassName="p-6 md:p-8">
            <CheckIn key={checkin?.id ?? "new"} clientId={CURRENT_CLIENT_ID} today={checkin} />
          </Panel>

          <section className="card px-6 pb-3 pt-6 md:px-8 md:pt-7" aria-labelledby="voor-vandaag">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h2 id="voor-vandaag" className="type-subtitle">
                Voor vandaag
              </h2>
              <Link
                href="/c/opdrachten"
                className="text-[14px] text-muted underline decoration-taupe decoration-1 underline-offset-4 transition-colors hover:text-text hover:decoration-pine"
              >
                Alle opdrachten
              </Link>
            </div>

            <AnimatePresence initial={false} mode="popLayout">
              {allDone && (
                <motion.p
                  key="klaar"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="pb-2 pt-1 text-[14px] text-muted"
                >
                  Klaar voor vandaag. Goed gedaan.
                </motion.p>
              )}
            </AnimatePresence>

            {today.length ? (
              <ul className="divide-y divide-surface-2">
                {today.map((item) => (
                  <TaskRow key={item.task.id} item={item} />
                ))}
              </ul>
            ) : (
              <p className="py-3 text-[14px] text-muted">Niets gepland vandaag. Geen druk.</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:gap-6">
          <NextUp />
          <section className="card p-6" aria-labelledby="deze-week">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 id="deze-week" className="type-subtitle">
                Deze week
              </h2>
              <Link
                href="/c/logboek"
                className="text-[14px] text-muted underline decoration-taupe decoration-1 underline-offset-4 transition-colors hover:text-text hover:decoration-pine"
              >
                Logboek
              </Link>
            </div>
            <WeekStrip entries={journal} compact />
          </section>
        </aside>
      </div>
    </>
  );
}
