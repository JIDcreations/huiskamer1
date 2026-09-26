"use client";

import Link from "next/link";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import { CheckIn } from "@/components/shared/checkin";
import { Panel } from "@/components/shared/panel";
import { TaskRow } from "@/components/shared/task-row";
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
import { formatLongDate, formatMoney, formatRelativeDay, formatTime, greeting } from "@/lib/format";

/** Hooguit één regel context: een sessie binnen 2 dagen, anders een openstaande factuur. */
function ContextLine() {
  const psy = usePsychologist();
  const next = upcoming(useAppointments(CURRENT_CLIENT_ID))[0];
  const open = useInvoices(CURRENT_CLIENT_ID).filter((f) => f.status !== "betaald");

  let line: { href: string; text: string } | null = null;
  if (next && differenceInCalendarDays(parseISO(next.start), new Date()) <= 2) {
    line = {
      href: "/c/sessies",
      text: `Sessie met ${psy.firstName} ${formatRelativeDay(next.start)} om ${formatTime(next.start)}${next.mode === "online" ? ", online" : ""}`,
    };
  } else if (open.length) {
    const total = open.reduce((s, f) => s + f.amount, 0);
    line = { href: "/c/betalingen", text: `Er staat nog ${formatMoney(total)} open` };
  }
  if (!line) return null;

  return (
    <Link
      href={line.href}
      className="group mt-6 flex items-center justify-between gap-3 border-t border-surface-2 pt-5 text-[14px] text-muted transition-colors hover:text-text"
    >
      <span className="first-letter:uppercase">{line.text}</span>
      <ChevronRight className="size-4 shrink-0 stroke-[1.5] text-taupe transition-transform duration-200 group-hover:translate-x-0.5" />
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
    <div className="mx-auto max-w-[680px]">
      <PageHeader eyebrow={formatLongDate(new Date())} title={`${greeting()}, ${client.firstName}`} />

      <Panel className="mt-8">
        <CheckIn key={checkin?.id ?? "new"} clientId={CURRENT_CLIENT_ID} today={checkin} />
      </Panel>

      <section className="mt-8" aria-labelledby="voor-vandaag">
        <div className="mb-1 flex items-baseline justify-between gap-3 px-1">
          <h2 id="voor-vandaag" className="text-[15px] font-semibold tracking-tight">
            Voor vandaag
          </h2>
          <Link href="/c/opdrachten" className="text-[13px] text-muted transition-colors hover:text-text">
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
              className="px-1 pb-2 pt-1 text-[14px] text-muted"
            >
              Klaar voor vandaag. Goed gedaan.
            </motion.p>
          )}
        </AnimatePresence>

        {today.length ? (
          <ul className="divide-y divide-surface-2/70 px-1">
            {today.map((item) => (
              <TaskRow key={item.task.id} item={item} />
            ))}
          </ul>
        ) : (
          <p className="px-1 py-3 text-[14px] text-muted">Niets gepland vandaag. Geen druk.</p>
        )}
      </section>

      <ContextLine />
    </div>
  );
}
