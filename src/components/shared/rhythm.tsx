import { rhythmLabel } from "@/lib/data/derive";
import type { Rhythm } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Ritme van een opdracht, altijd in dezelfde vorm. */
export function RhythmLabel({ rhythm, progress, className }: { rhythm: Rhythm; progress?: { done: number; total: number }; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[12px] text-muted tabular-nums", className)}>
      {rhythmLabel(rhythm)}
      {progress && (
        <>
          <span aria-hidden className="size-[3px] rounded-full bg-taupe" />
          {progress.done} van {progress.total}
        </>
      )}
    </span>
  );
}
