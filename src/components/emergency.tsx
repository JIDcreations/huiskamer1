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
          "group inline-flex h-10 items-center gap-2 rounded-full pl-1 pr-3.5 text-[13px] font-semibold text-clay-ink outline-none transition-colors duration-300 ease-out-soft hover:bg-clay-soft focus-visible:ring-2 focus-visible:ring-clay",
          className
        )}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-clay-soft transition-[background-color,transform] duration-300 ease-out-soft group-hover:scale-105 group-hover:bg-clay group-hover:text-on-accent">
          <Phone className="size-3.5 stroke-[1.75]" />
        </span>
        <span className="hidden sm:inline">Hulp nodig?</span>
        <span className="sm:hidden">Hulp</span>
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
              <span className="font-display text-[32px] leading-none tabular-nums">{l.number}</span>
            </a>
          ))}
          <p className="pt-3 text-[13px] text-muted">Bij direct gevaar: bel 112.</p>
        </div>
      </Sheet>
    </>
  );
}
