"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Lock, Mail, Phone } from "lucide-react";
import { AssignTaskSheet } from "@/components/psy/assign-task";
import { NewAppointmentSheet } from "@/components/psy/appointment-sheet";
import { ClientStatusBadge, clientStatusLabel } from "@/components/psy/client-status";
import { InvoicesTab } from "@/components/psy/dossier/invoices-tab";
import { JournalTab } from "@/components/psy/dossier/journal-tab";
import { Overview } from "@/components/psy/dossier/overview";
import { SessionsTab } from "@/components/psy/dossier/sessions-tab";
import { TasksTab } from "@/components/psy/dossier/tasks-tab";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { toast } from "@/components/ui/toast";
import { actions, useClient } from "@/lib/data";
import { formatFullDate } from "@/lib/format";
import type { ClientStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const dossierTabs = [
  { id: "overzicht", label: "Overzicht" },
  { id: "logboek", label: "Logboek" },
  { id: "sessies", label: "Sessies" },
  { id: "opdrachten", label: "Opdrachten" },
  { id: "betalingen", label: "Betalingen" },
] as const;

export type DossierTab = (typeof dossierTabs)[number]["id"];

export function Dossier({ clientId, tab }: { clientId: string; tab: DossierTab }) {
  const client = useClient(clientId);
  const [planning, setPlanning] = useState(false);
  const [assigning, setAssigning] = useState(false);

  if (!client) {
    return (
      <div className="card">
        <EmptyState
          title="Deze cliënt bestaat niet"
          action={
            <Button variant="secondary" asChild>
              <Link href="/p/clienten">Naar cliënten</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const name = `${client.firstName} ${client.lastName}`;
  const base = `/p/clienten/${client.id}`;

  return (
    <>
      <Link href="/p/clienten" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-text">
        <ArrowLeft className="size-4 stroke-[1.5]" /> Cliënten
      </Link>

      <header className="mt-5 flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={name} tone="client" size="lg" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="type-title">{name}</h1>
              <Menu>
                <MenuTrigger className="inline-flex items-center gap-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2 focus-visible:ring-offset-bg" aria-label={`Status: ${clientStatusLabel[client.status]}, wijzigen`}>
                  <ClientStatusBadge status={client.status} />
                  <ChevronDown className="size-3.5 stroke-[1.5] text-taupe" />
                </MenuTrigger>
                <MenuContent align="start">
                  {(Object.keys(clientStatusLabel) as ClientStatus[]).map((s) => (
                    <MenuItem
                      key={s}
                      onSelect={() => {
                        actions.setClientStatus(client.id, s);
                        toast(`Status: ${clientStatusLabel[s].toLowerCase()}`);
                      }}
                    >
                      {clientStatusLabel[s]}
                    </MenuItem>
                  ))}
                </MenuContent>
              </Menu>
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
              <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1.5 hover:text-text">
                <Mail className="size-3.5 stroke-[1.5] text-taupe" /> {client.email}
              </a>
              {client.phone && (
                <a href={`tel:${client.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-text">
                  <Phone className="size-3.5 stroke-[1.5] text-taupe" /> {client.phone}
                </a>
              )}
              <span>In begeleiding sinds {formatFullDate(client.startedAt)}</span>
            </div>
            {client.reason && (
              <p className="mt-2.5 inline-flex items-start gap-1.5 rounded-lg bg-surface-2/60 px-2.5 py-1.5 text-[13px] text-muted">
                <Lock className="mt-[3px] size-3 shrink-0 stroke-[1.75]" />
                {client.reason}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPlanning(true)}>
            Afspraak plannen
          </Button>
          <Button onClick={() => setAssigning(true)}>Opdracht geven</Button>
        </div>
      </header>

      <nav aria-label="Dossier" className="-mx-5 mt-8 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
        <ul className="flex min-w-max gap-1 border-b border-surface-2">
          {dossierTabs.map((t) => {
            const active = t.id === tab;
            return (
              <li key={t.id}>
                <Link
                  href={t.id === "overzicht" ? base : `${base}?tab=${t.id}`}
                  aria-current={active ? "page" : undefined}
                  scroll={false}
                  className={cn(
                    "-mb-px inline-flex h-11 items-center gap-1.5 border-b-2 px-3 text-[14px] transition-colors",
                    active ? "border-accent font-medium text-text" : "border-transparent text-muted hover:text-text"
                  )}
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="pt-7"
      >
        {tab === "overzicht" && <Overview client={client} onPlan={() => setPlanning(true)} />}
        {tab === "logboek" && <JournalTab client={client} />}
        {tab === "sessies" && <SessionsTab client={client} onPlan={() => setPlanning(true)} />}
        {tab === "opdrachten" && <TasksTab client={client} />}
        {tab === "betalingen" && <InvoicesTab client={client} />}
      </motion.div>

      {planning && <NewAppointmentSheet open={planning} onOpenChange={setPlanning} clientId={client.id} />}
      {assigning && <AssignTaskSheet open={assigning} onOpenChange={setAssigning} clientId={client.id} />}
    </>
  );
}
