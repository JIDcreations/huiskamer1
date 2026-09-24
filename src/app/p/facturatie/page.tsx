"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { isSameMonth, parseISO } from "date-fns";
import { PageHeader } from "@/components/page-header";
import { AttestButton, InvoiceStatus } from "@/components/shared/invoice";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, useAppointments, useClientsRaw, useInvoices, usePsychologist } from "@/lib/data";
import { formatDayMonth, formatFullDate, formatMoney, plural } from "@/lib/format";
import type { Invoice, InvoiceStatus as Status } from "@/lib/types";

type Filter = "alle" | Status;

function InvoiceSheet({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const psy = usePsychologist();
  const clients = useClientsRaw();
  const appointments = useAppointments();
  const c = clients.find((x) => x.id === invoice.clientId);
  const s = appointments.find((a) => a.id === invoice.appointmentId);
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={`Factuur ${invoice.number}`}>
      <div className="rounded-xl bg-oat-soft px-5 py-5 text-[14px]">
        <div className="flex justify-between gap-4">
          <div>
            <p className="font-medium">{psy.practiceName}</p>
            <p className="text-muted">{psy.name}</p>
            <p className="text-muted">{psy.address}</p>
          </div>
          <div className="text-right">
            <p className="font-medium">
              {c?.firstName} {c?.lastName}
            </p>
            <p className="text-muted">{c?.email}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-between border-t border-surface-2 pt-4">
          <span>Sessie van {s ? formatFullDate(s.start) : formatFullDate(invoice.issuedAt)}</span>
          <span className="tabular-nums">{formatMoney(invoice.amount)}</span>
        </div>
        <div className="mt-2 flex justify-between text-muted">
          <span>Vrijgesteld van btw</span>
          <span />
        </div>
        <div className="mt-4 flex justify-between border-t border-surface-2 pt-4 font-semibold">
          <span>Totaal</span>
          <span className="tabular-nums">{formatMoney(invoice.amount)}</span>
        </div>
        <p className="mt-4 text-[12px] text-muted">
          Uitgereikt op {formatFullDate(invoice.issuedAt)}, te betalen tegen {formatFullDate(invoice.dueAt)}.
        </p>
      </div>
      <div className="mt-5 flex items-center justify-between gap-2">
        <InvoiceStatus invoice={invoice} />
        <div className="flex gap-2">
          <AttestButton invoice={invoice} />
          {invoice.status !== "betaald" && (
            <Button
              size="sm"
              onClick={() => {
                actions.payInvoice(invoice.id);
                toast("Gemarkeerd als betaald");
                onClose();
              }}
            >
              Markeer als betaald
            </Button>
          )}
        </div>
      </div>
    </Sheet>
  );
}

export default function Facturatie() {
  const invoices = useInvoices();
  const clients = useClientsRaw();
  const [filter, setFilter] = useState<Filter>("alle");
  const [open, setOpen] = useState<Invoice | null>(null);

  const totals = useMemo(() => {
    const sum = (list: Invoice[]) => list.reduce((s, f) => s + f.amount, 0);
    const openList = invoices.filter((f) => f.status === "open");
    const late = invoices.filter((f) => f.status === "vervallen");
    const paidMonth = invoices.filter((f) => f.status === "betaald" && f.paidAt && isSameMonth(parseISO(f.paidAt), new Date()));
    return { open: openList, openSum: sum(openList), late, lateSum: sum(late), paidMonthSum: sum(paidMonth), paidMonth };
  }, [invoices]);

  const shown = invoices.filter((f) => filter === "alle" || f.status === filter);
  const name = (id: string) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Onbekend";
  };

  const stat = (label: string, value: string, hint: string) => (
    <div className="rounded-card bg-surface px-5 py-4 shadow-soft ring-1 ring-surface-2/60">
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-1 text-[24px] font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-[12px] text-faint">{hint}</p>
    </div>
  );

  return (
    <>
      <PageHeader title="Facturatie" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stat("Open", formatMoney(totals.openSum), plural(totals.open.length, "factuur", "facturen"))}
        {stat("Vervallen", formatMoney(totals.lateSum), totals.late.length ? plural(totals.late.length, "factuur", "facturen") : "Niets vervallen")}
        {stat("Betaald deze maand", formatMoney(totals.paidMonthSum), plural(totals.paidMonth.length, "factuur", "facturen"))}
      </div>

      <div className="mt-8">
        <Segmented
          label="Filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "alle", label: "Alle" },
            { value: "open", label: "Open" },
            { value: "vervallen", label: "Vervallen" },
            { value: "betaald", label: "Betaald" },
          ]}
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-card bg-surface shadow-soft ring-1 ring-surface-2/60">
        {shown.length === 0 ? (
          <EmptyState title="Niets hier" description="Geen facturen met deze status." />
        ) : (
          <table className="w-full text-left text-[14px]">
            <thead className="hidden border-b border-surface-2 text-[12px] text-faint md:table-header-group">
              <tr>
                <th className="py-3 pl-6 font-medium">Nummer</th>
                <th className="py-3 font-medium">Cliënt</th>
                <th className="py-3 font-medium">Vervalt</th>
                <th className="py-3 text-right font-medium">Bedrag</th>
                <th className="py-3 pl-6 font-medium">Status</th>
                <th className="py-3 pr-6" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-2/70">
              {shown.map((f) => (
                <tr key={f.id} className="transition-colors hover:bg-oat-soft/40">
                  <td className="py-3 pl-5 md:pl-6">
                    <button className="font-medium tabular-nums hover:underline hover:decoration-surface-2 hover:underline-offset-4" onClick={() => setOpen(f)}>
                      {f.number}
                    </button>
                    <span className="block text-[12px] text-muted md:hidden">{name(f.clientId)}</span>
                  </td>
                  <td className="hidden py-3 md:table-cell">
                    <Link href={`/p/clienten/${f.clientId}?tab=betalingen`} className="hover:underline hover:decoration-surface-2 hover:underline-offset-4">
                      {name(f.clientId)}
                    </Link>
                  </td>
                  <td className="hidden py-3 text-muted md:table-cell">{formatDayMonth(f.dueAt)}</td>
                  <td className="py-3 text-right tabular-nums">{formatMoney(f.amount)}</td>
                  <td className="py-3 pl-6">
                    <InvoiceStatus invoice={f} />
                  </td>
                  <td className="py-3 pr-4 text-right md:pr-6">
                    <Button variant="quiet" size="sm" onClick={() => setOpen(f)}>
                      Bekijk
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && <InvoiceSheet key={open.id} invoice={open} onClose={() => setOpen(null)} />}
    </>
  );
}
