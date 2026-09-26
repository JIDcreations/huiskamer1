"use client";

import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { AgendaList } from "@/components/sessions/agenda-list";
import { typeLabel } from "@/components/shared/appointment-card";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import {
  excerpt,
  newBlocks,
  pastSessions,
  PSY_ID,
  upcoming,
  useAppointments,
  useSeenLookup,
  useSessionNotes,
  useSessionPages,
} from "@/lib/data";
import { capitalize, formatAppointment, formatLongDate } from "@/lib/format";
import type { Client } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Per sessie de gedeelde pagina, met een slotje als er privénotities zijn. */
export function SessionsTab({ client, onPlan }: { client: Client; onPlan: () => void }) {
  const appointments = useAppointments(client.id);
  const next = upcoming(appointments)[0];
  const history = pastSessions(appointments);
  const pages = useSessionPages(client.id);
  const notes = useSessionNotes(client.id);
  const seen = useSeenLookup("psy");
  const base = `/p/clienten/${client.id}`;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
      <section aria-labelledby="sessies-voorbij" className="order-2 lg:order-1">
        <h2 id="sessies-voorbij" className="mb-2 px-1 text-[15px] font-semibold tracking-tight">
          Voorbije sessies
        </h2>
        {history.length ? (
          <ul className="divide-y divide-surface-2/70 overflow-hidden card">
            {history.map((a) => {
              const page = pages.find((p) => p.appointmentId === a.id);
              const note = notes.find((n) => n.appointmentId === a.id && n.blocks.length);
              const fresh = page ? newBlocks(page.reactions, PSY_ID, seen(`session:${a.id}`)).length : 0;
              const text = page ? excerpt(page.summary, 110) : "";
              return (
                <li key={a.id}>
                  <Link href={`${base}/sessies/${a.id}`} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-oat-soft/40">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-[15px] font-medium">
                        {capitalize(formatLongDate(a.start))}
                        {fresh > 0 && <span aria-label="Nieuwe reactie" className="size-2 rounded-full bg-accent" />}
                      </p>
                      <p className={cn("truncate text-[13px]", text ? "text-muted" : "text-faint")}>
                        {text || `${typeLabel[a.type]}, nog geen samenvatting`}
                      </p>
                    </div>
                    {note && (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-2/70 px-2 py-0.5 text-[11px] text-muted">
                        <Lock className="size-3 stroke-[1.75]" /> Notities
                      </span>
                    )}
                    <ChevronRight className="size-4 shrink-0 stroke-[1.5] text-taupe transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-1 text-[14px] text-muted">Nog geen sessies. Na de eerste sessie schrijf je hier wat jullie bespraken.</p>
        )}
      </section>

      <div className="order-1 flex flex-col gap-5 lg:order-2">
        <Panel title="Volgende sessie">
          {next ? (
            <p className="text-[17px] font-semibold tracking-tight tabular-nums">{formatAppointment(next.start)}</p>
          ) : (
            <>
              <p className="text-[14px] text-muted">Niets gepland.</p>
              <Button size="sm" className="mt-3" onClick={onPlan}>
                Afspraak plannen
              </Button>
            </>
          )}
        </Panel>
        <Panel title="Voor volgende keer">
          <AgendaList clientId={client.id} viewer="psy" entryHref={(id) => `${base}?tab=logboek&entry=${id}`} />
        </Panel>
      </div>
    </div>
  );
}
