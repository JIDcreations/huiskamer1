"use client";

import { useState } from "react";
import { Phone } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const lines = [
  { name: "Zelfmoordlijn", number: "1813", note: "Gratis, dag en nacht" },
  { name: "Tele-Onthaal", number: "106", note: "Gratis, dag en nacht" },
];

export function EmergencyLink({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex h-8 items-center gap-1.5 rounded-full bg-urgent/15 px-3 text-[13px] text-muted transition-colors hover:bg-urgent/25 hover:text-text",
          className
        )}
      >
        <Phone className="size-3.5 stroke-[1.5] text-urgent" />
        Hulp nodig?
      </button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Nu dringend hulp nodig?"
        description="Huiskamer is niet bedoeld voor crisissituaties. Bel meteen iemand die je kan helpen."
      >
        <div className="space-y-2">
          {lines.map((l) => (
            <a
              key={l.number}
              href={`tel:${l.number}`}
              className="flex items-center justify-between rounded-card bg-surface px-5 py-4 ring-1 ring-inset ring-surface-2 transition-colors hover:bg-oat-soft"
            >
              <span>
                <span className="block text-[15px] font-medium">{l.name}</span>
                <span className="block text-[13px] text-muted">{l.note}</span>
              </span>
              <span className="font-display text-[26px] leading-none tabular-nums">{l.number}</span>
            </a>
          ))}
          <p className="pt-3 text-[13px] text-muted">Bij direct gevaar: bel 112.</p>
        </div>
      </Sheet>
    </>
  );
}
