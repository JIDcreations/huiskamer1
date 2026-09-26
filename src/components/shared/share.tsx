"use client";

import { Eye, Lock } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { usePsychologist } from "@/lib/data";
import { cn } from "@/lib/utils";

/**
 * Altijd dezelfde vorm voor wat gedeeld is: één icoon, één formulering, overal op dezelfde plek.
 */
export function ShareIcon({ shared, className }: { shared: boolean; className?: string }) {
  const Icon = shared ? Eye : Lock;
  return <Icon aria-hidden className={cn("size-3.5 shrink-0 stroke-[1.75] text-taupe", className)} />;
}

export function shareText(shared: boolean, psyFirstName: string) {
  return shared ? `Gedeeld met ${psyFirstName}` : "Enkel voor mij";
}

export function ShareBadge({ shared, className }: { shared: boolean; className?: string }) {
  const psy = usePsychologist();
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] text-muted", className)}>
      <ShareIcon shared={shared} />
      {shareText(shared, psy.firstName)}
    </span>
  );
}

/** Schakelaar met uitleg, voor in een sheet of bovenaan een entry. */
export function ShareSwitch({
  shared,
  onChange,
  className,
}: {
  shared: boolean;
  onChange: (shared: boolean) => void;
  className?: string;
}) {
  const psy = usePsychologist();
  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-4", className)}>
      <span className="flex min-w-0 items-center gap-2.5">
        <ShareIcon shared={shared} className="size-4" />
        <span className="min-w-0">
          <span className="block text-[14px] font-medium">{shareText(shared, psy.firstName)}</span>
          <span className="block text-[12px] text-muted">
            {shared ? `${psy.firstName} kan dit lezen.` : `${psy.firstName} ziet dit niet.`}
          </span>
        </span>
      </span>
      <Toggle aria-label={`Delen met ${psy.firstName}`} checked={shared} onCheckedChange={onChange} />
    </label>
  );
}
