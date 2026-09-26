"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Zet de hele demo terug naar de beginstaat, na een bevestiging.
 * "link": stille tekstknop (login, menu's). "icon": rond knopje naast de zwevende rolwissel.
 */
export function DemoReset({ variant = "link", className }: { variant?: "link" | "icon" | "button"; className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const trigger =
    variant === "icon" ? (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Demo opnieuw beginnen"
        title="Demo opnieuw beginnen"
        className={cn(
          "glass inline-flex size-9 items-center justify-center rounded-full text-muted shadow-soft ring-1 ring-surface-2 transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-taupe",
          className
        )}
      >
        <RotateCcw className="size-4 stroke-[1.5]" />
      </button>
    ) : variant === "button" ? (
      <Button variant="secondary" size="sm" className={className} onClick={() => setOpen(true)}>
        Demo opnieuw beginnen
      </Button>
    ) : (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "rounded-full text-[12px] text-faint underline decoration-surface-2 underline-offset-4 transition-colors hover:text-muted",
          className
        )}
      >
        Demo opnieuw beginnen
      </button>
    );

  return (
    <>
      {trigger}
      <Sheet open={open} onOpenChange={setOpen} title="Demo opnieuw beginnen?" description="Alles wat je in de demo schreef of aanpaste, verdwijnt. Ook de kennismaking voor de cliënt start opnieuw.">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuleren
          </Button>
          <Button
            onClick={() => {
              actions.resetDemo();
              setOpen(false);
              toast("Demo staat weer aan het begin");
              if (pathname !== "/") router.push("/");
            }}
          >
            Opnieuw beginnen
          </Button>
        </div>
      </Sheet>
    </>
  );
}
