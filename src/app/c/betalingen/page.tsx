"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CreditCard, Smartphone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AttestButton, InvoiceStatus } from "@/components/shared/invoice";
import { Panel, SectionLabel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { actions, CURRENT_CLIENT_ID, useAppointments, useInvoices, usePsychologist } from "@/lib/data";
import { formatDayMonth, formatMoney, formatRelativeDay } from "@/lib/format";
import type { Invoice } from "@/lib/types";
import { cn } from "@/lib/utils";

const methods = [
  { id: "bancontact", label: "Bancontact", hint: "Met je bankkaart of app", icon: CreditCard },
  { id: "payconiq", label: "Payconiq", hint: "Scan met je bank-app", icon: Smartphone },
];

function PaySheet({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const [method, setMethod] = useState("bancontact");
  const [state, setState] = useState<"kiezen" | "bezig" | "klaar">("kiezen");

  function pay() {
    if (!invoice) return;
    setState("bezig");
    setTimeout(() => {
      actions.payInvoice(invoice.id);
      setState("klaar");
    }, 1400);
  }

  return (
    <Sheet
      open={Boolean(invoice)}
      onOpenChange={(o) => !o && onClose()}
      title={state === "klaar" ? "Betaald" : "Factuur betalen"}
      description={invoice ? `Factuur ${invoice.number}, ${formatMoney(invoice.amount)}` : undefined}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "klaar" ? (
          <motion.div key="klaar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6 text-center">
            <motion.span
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex size-14 items-center justify-center rounded-full bg-accent text-on-accent"
            >
              <Check className="size-6 stroke-[2]" />
            </motion.span>
            <p className="mt-4 text-[16px] font-medium">Dankjewel, alles is in orde.</p>
            <p className="mt-1 text-[14px] text-muted">Je attest voor de mutualiteit staat klaar bij je historiek.</p>
            <Button className="mt-6" onClick={onClose}>
              Sluiten
            </Button>
          </motion.div>
        ) : (
          <motion.div key="kiezen" exit={{ opacity: 0 }}>
            <div role="radiogroup" aria-label="Betaalmethode" className="flex flex-col gap-2">
              {methods.map((m) => (
                <button
                  key={m.id}
                  role="radio"
                  aria-checked={method === m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl px-4 py-3.5 text-left ring-1 ring-inset transition-colors",
                    method === m.id ? "bg-surface ring-muted" : "bg-oat-soft ring-transparent hover:bg-surface-2/60"
                  )}
                >
                  <m.icon className="size-5 stroke-[1.5] text-muted" />
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium">{m.label}</span>
                    <span className="block text-[13px] text-muted">{m.hint}</span>
                  </span>
                  <span className={cn("size-4 rounded-full ring-[1.5px] ring-inset", method === m.id ? "bg-accent ring-accent" : "ring-taupe")} />
                </button>
              ))}
            </div>
            <p className="mt-4 text-[12px] text-faint">Demo: er wordt niets echt betaald.</p>
            <Button size="lg" className="mt-5 w-full" disabled={state === "bezig"} onClick={pay}>
              {state === "bezig" ? "Even geduld..." : `Betaal ${invoice ? formatMoney(invoice.amount) : ""}`}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

export default function Betalingen() {
  const psy = usePsychologist();
  const invoices = useInvoices(CURRENT_CLIENT_ID);
  const appointments = useAppointments(CURRENT_CLIENT_ID);
  const [paying, setPaying] = useState<Invoice | null>(null);
  const open = invoices.filter((f) => f.status !== "betaald");
  const paid = invoices.filter((f) => f.status === "betaald");
  const sessionOf = (f: Invoice) => appointments.find((a) => a.id === f.appointmentId);

  return (
    <>
      <PageHeader title="Betalingen" eyebrow={`Facturen van ${psy.practiceName}`} />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Panel title="Openstaand" bodyClassName="pt-1">
            {open.length ? (
              <ul className="divide-y divide-surface-2/70">
                {open.map((f) => {
                  const s = sessionOf(f);
                  return (
                    <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-medium">Sessie van {s ? formatDayMonth(s.start) : formatDayMonth(f.issuedAt)}</p>
                        <p className="text-[13px] text-muted">
                          {f.status === "vervallen" || new Date(f.dueAt) < new Date()
                            ? `Factuur ${f.number}. De termijn is voorbij, je kan gewoon nog betalen.`
                            : `Factuur ${f.number}, te betalen tegen ${formatRelativeDay(f.dueAt)}`}
                        </p>
                      </div>
                      <p className="text-[15px] font-semibold tabular-nums">{formatMoney(f.amount)}</p>
                      <Button size="sm" onClick={() => setPaying(f)}>
                        Betalen
                      </Button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="py-3 text-[14px] text-muted">Alles is betaald. Niets te doen.</p>
            )}
          </Panel>

          <Panel title="Historiek" bodyClassName="pt-1">
            {!paid.length && <p className="py-3 text-[14px] text-muted">Nog niets betaald. Je betaalde facturen en attesten vind je hier.</p>}
            <ul className="divide-y divide-surface-2/70">
              {paid.map((f) => {
                const s = sessionOf(f);
                return (
                  <li key={f.id} className="flex items-center gap-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-medium">Sessie van {s ? formatDayMonth(s.start) : formatDayMonth(f.issuedAt)}</p>
                      <p className="text-[12px] text-muted">
                        {f.number}, betaald op {f.paidAt ? formatDayMonth(f.paidAt) : "onbekend"}
                      </p>
                    </div>
                    <span className="text-[14px] tabular-nums text-muted">{formatMoney(f.amount)}</span>
                    <InvoiceStatus invoice={f} />
                    <AttestButton invoice={f} />
                  </li>
                );
              })}
            </ul>
          </Panel>
        </div>

        <div className="px-1">
          <SectionLabel>Terugbetaling</SectionLabel>
          <p className="text-[13px] leading-relaxed text-muted">
            Na betaling krijg je een attest. Bezorg het aan je mutualiteit: die betaalt vaak een deel terug. Hoeveel hangt af van je
            ziekenfonds.
          </p>
        </div>
      </div>

      <PaySheet key={paying?.id ?? "geen"} invoice={paying} onClose={() => setPaying(null)} />
    </>
  );
}
