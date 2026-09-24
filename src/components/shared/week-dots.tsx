import type { WeekDay } from "@/lib/data";
import { cn } from "@/lib/utils";

const letters = ["M", "D", "W", "D", "V", "Z", "Z"];
const names = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag"];

/** Een week in zeven bolletjes: gevuld = gedaan, rand = gepland, leeg = geen dag. */
export function WeekDots({ days, className }: { days: WeekDay[]; className?: string }) {
  return (
    <ol className={cn("flex items-end gap-1.5", className)} aria-label="Deze week">
      {days.map((d, i) => (
        <li key={d.day} className="flex flex-col items-center gap-1">
          <span
            aria-label={`${names[i]}: ${d.done ? "gedaan" : d.due ? (d.future ? "nog te doen" : "niet gedaan") : "geen opdracht"}`}
            className={cn(
              "size-3 rounded-full transition-colors",
              d.done ? "bg-accent" : d.due ? "ring-[1.5px] ring-inset ring-faint" : "bg-surface-2/70",
              d.isToday && !d.done && d.due && "ring-muted"
            )}
          />
          <span className={cn("text-[10px] leading-none", d.isToday ? "font-semibold text-text" : "text-faint")}>{letters[i]}</span>
        </li>
      ))}
    </ol>
  );
}
