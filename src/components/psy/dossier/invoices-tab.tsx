"use client";

import { AttestButton, InvoiceStatus } from "@/components/shared/invoice";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "@/components/ui/toast";
import { actions, useAppointments, useInvoices } from "@/lib/data";
import { formatDayMonth, formatMoney } from "@/lib/format";
import type { Client } from "@/lib/types";

export function InvoicesTab({ client }: { client: Client }) {
  const invoices = useInvoices(client.id);
  const appointments = useAppointments(client.id);
  const open = invoices.filter((f) => f.status !== "betaald").reduce((s, f) => s + f.amount, 0);

  return (
    <Panel title="Facturen" description={open ? `${formatMoney(open)} staat nog open` : "Alles betaald"} bodyClassName="pt-1">
      {invoices.length ? (
        <ul className="divide-y divide-surface-2/70">
          {invoices.map((f) => {
            const s = appointments.find((a) => a.id === f.appointmentId);
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-medium">Sessie van {formatDayMonth(s?.start ?? f.issuedAt)}</p>
                  <p className="text-[12px] text-muted">
                    {f.number}, vervalt {formatDayMonth(f.dueAt)}
                  </p>
                </div>
                <span className="text-[14px] tabular-nums">{formatMoney(f.amount)}</span>
                <InvoiceStatus invoice={f} />
                {f.status !== "betaald" ? (
                  <Button
                    variant="quiet"
                    size="sm"
                    onClick={() => {
                      actions.payInvoice(f.id);
                      toast("Gemarkeerd als betaald");
                    }}
                  >
                    Betaald
                  </Button>
                ) : (
                  <AttestButton invoice={f} />
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyState title="Nog geen facturen" description="Na een sessie verschijnt hier de factuur." />
      )}
    </Panel>
  );
}
