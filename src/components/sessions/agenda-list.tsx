"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { entryLabel, entrySummary } from "@/components/shared/journal-list";
import { ShareIcon } from "@/components/shared/share";
import { Avatar } from "@/components/ui/avatar";
import { toast } from "@/components/ui/toast";
import { actions, useAgenda, usePersonName, useTasks, PSY_ID } from "@/lib/data";
import { formatDayMonth } from "@/lib/format";
import type { ID } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * "Voor volgende keer": wat cliënt en psycholoog in de volgende sessie willen bespreken.
 * Bij de psycholoog verschijnen enkel punten met een gedeelde entry.
 */
export function AgendaList({
  clientId,
  viewer,
  entryHref,
  compact,
}: {
  clientId: ID;
  viewer: "client" | "psy";
  entryHref: (id: ID) => string;
  compact?: boolean;
}) {
  const { next, items } = useAgenda(clientId, { forPsy: viewer === "psy" });
  const tasks = useTasks(clientId);
  const name = usePersonName();
  const [text, setText] = useState("");
  const me = viewer === "psy" ? PSY_ID : clientId;

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const id = actions.addAgendaItem({ clientId, by: me, text });
    if (id) setText("");
    else toast("Er is nog geen sessie gepland");
  }

  return (
    <div>
      {items.length === 0 ? (
        <p className="py-2 text-[14px] text-muted">
          {viewer === "client"
            ? "Nog niets. Zet hier een vraag, of neem een entry uit je logboek mee."
            : "Nog niets op de lijst voor de volgende sessie."}
        </p>
      ) : (
        <ul className="divide-y divide-surface-2/70">
          <AnimatePresence initial={false}>
            {items.map(({ item, entry }) => {
              const mine = item.addedBy === me;
              const by = item.addedBy === PSY_ID ? "psy" : "client";
              return (
                <motion.li
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-start gap-3 overflow-hidden py-3"
                >
                  <Avatar name={name(item.addedBy, "full")} tone={by} size="xs" className="mt-0.5" />
                  <div className="min-w-0 flex-1">
                    {entry ? (
                      <Link href={entryHref(entry.id)} className="block rounded-md outline-none focus-visible:ring-2 focus-visible:ring-taupe">
                        <span className="flex items-center gap-1.5 text-[12px] text-muted">
                          {viewer === "client" && <ShareIcon shared={entry.sharedWithPsychologist} />}
                          {entryLabel(entry, tasks)}, {formatDayMonth(entry.createdAt)}
                        </span>
                        <span className={cn("mt-0.5 block text-[15px] leading-snug hover:underline hover:decoration-surface-2 hover:underline-offset-4", compact && "line-clamp-1")}>
                          {entry.title || entrySummary(entry, tasks.find((t) => t.id === entry.taskId)) || "Check-in"}
                        </span>
                        {viewer === "client" && !entry.sharedWithPsychologist && (
                          <span className="mt-0.5 block text-[12px] text-faint">Enkel voor jou, als geheugensteun.</span>
                        )}
                      </Link>
                    ) : (
                      <p className="text-[15px] leading-snug">{item.text}</p>
                    )}
                  </div>
                  {mine && (
                    <button
                      type="button"
                      aria-label="Van de lijst halen"
                      onClick={() => actions.removeAgendaItem(item.id)}
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-taupe transition-colors hover:bg-oat-soft hover:text-muted md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
                    >
                      <X className="size-3.5 stroke-[1.75]" />
                    </button>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {next && (
        <form onSubmit={add} className="mt-2 flex items-center gap-2 rounded-xl bg-oat-soft/70 py-1 pl-3.5 pr-1 focus-within:ring-2 focus-within:ring-taupe/60">
          <label htmlFor={`agenda-${clientId}`} className="sr-only">
            Iets toevoegen voor {formatDayMonth(next.start)}
          </label>
          <input
            id={`agenda-${clientId}`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={viewer === "client" ? "Typ een vraag of iets dat je wil bespreken" : "Iets om volgende keer te bespreken"}
            className="h-9 min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            aria-label="Toevoegen"
            disabled={!text.trim()}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent transition-opacity disabled:opacity-30"
          >
            <Plus className="size-4 stroke-[2]" />
          </button>
        </form>
      )}
    </div>
  );
}
