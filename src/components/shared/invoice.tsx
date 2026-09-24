"use client";

import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import type { Invoice } from "@/lib/types";

export const invoiceStatusLabel = { open: "Open", betaald: "Betaald", vervallen: "Vervallen" } as const;

export function InvoiceStatus({ invoice }: { invoice: Invoice }) {
  const tone = invoice.status === "betaald" ? "calm" : invoice.status === "vervallen" ? "strong" : "outline";
  return <Badge tone={tone}>{invoiceStatusLabel[invoice.status]}</Badge>;
}

export function AttestButton({ invoice }: { invoice: Invoice }) {
  if (invoice.status !== "betaald") return null;
  return (
    <Button
      variant="quiet"
      size="sm"
      onClick={() => toast("Attest voor de mutualiteit: komt in een volgende versie")}
    >
      <FileDown /> Attest
    </Button>
  );
}
