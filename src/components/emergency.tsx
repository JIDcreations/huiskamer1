"use client";

import { useState } from "react";
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
          "rounded-sm text-[14px] font-medium text-(--topbar-help) underline decoration-current/35 decoration-1 underline-offset-[5px] outline-none transition-[text-decoration-color] duration-300 ease-out-soft hover:decoration-current focus-visible:ring-2 focus-visible:ring-clay",
          className
        )}
      >
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
