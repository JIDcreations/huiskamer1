"use client";

/**
 * De potloodlaag: handgetekende lijnen in dezelfde hand als de iconen.
 * Ze verschijnen enkel waar iemand iets deed: vandaag omcirkeld, iets afgevinkt, een kanttekening van de psycholoog.
 * Potlood (dennengroen) is van de cliënt, de rode pen (klei) van de psycholoog, de markeerstift (zon) van een check-in.
 */
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const ease = [0.65, 0, 0.35, 1] as const;

/** Een lijn die zich tekent. Zonder beweging (reduced motion) staat hij er meteen. */
function Stroke({
  d,
  draw = true,
  delay = 0,
  duration = 0.5,
  width = 1.6,
}: {
  d: string;
  draw?: boolean;
  delay?: number;
  duration?: number;
  width?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      initial={draw && !reduce ? { pathLength: 0, opacity: 0 } : false}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ pathLength: { duration, delay, ease }, opacity: { duration: 0.01, delay } }}
    />
  );
}

/** Losse cirkel die net niet sluit, zoals je iets omcirkelt in een agenda. Legt zich over de ouder. */
export function PencilCircle({ className, draw = true, delay = 0, width = 1.6 }: { className?: string; draw?: boolean; delay?: number; width?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className={cn("pointer-events-none absolute -inset-1.5 overflow-visible", className)}>
      <Stroke d="M60 5C31 2 5 19 6 50c1 29 25 45 50 44 27-1 40-20 39-45C94 20 76 5 50 6 40 7 31 11 24 16" draw={draw} delay={delay} duration={0.6} width={width} />
    </svg>
  );
}

/** Een golvende streep onder een woord. */
export function PencilUnderline({ className, draw = true, delay = 0 }: { className?: string; draw?: boolean; delay?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 100 8" preserveAspectRatio="none" className={cn("pointer-events-none absolute inset-x-0 -bottom-1.5 h-2 overflow-visible", className)}>
      <Stroke d="M1 5.5C17 3.6 34 2.8 52 3.4c16 .5 31 1.6 47 .4" draw={draw} delay={delay} duration={0.45} />
    </svg>
  );
}

/** Een vinkje dat over de rand van het rondje schiet, zoals met de hand. */
export function PencilTick({ className, draw = true }: { className?: string; draw?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("pointer-events-none overflow-visible", className)}>
      <Stroke d="M5.2 12.6c1.5 1.2 3 2.9 4.2 4.8 2.9-5.5 7-10.3 12.4-14" draw={draw} duration={0.38} width={2.1} />
    </svg>
  );
}

/** Rondje om af te vinken: net niet perfect, zodat het getekend oogt. */
export function PencilRing({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("pointer-events-none overflow-visible", className)}>
      <path
        d="M12.4 2.7c5 .1 9 4 8.9 9.2-.1 5.2-4.2 9.3-9.3 9.2-5.1-.1-9-4.2-8.9-9.3.1-4.9 3.9-8.9 8.6-9.1"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Een krul die van de tekst naar de kanttekening wijst. */
export function PencilArrow({ className, draw = false }: { className?: string; draw?: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 34 28" className={cn("pointer-events-none overflow-visible", className)}>
      <Stroke d="M4 2.5c-1.6 8.4.6 16 8.8 19.4 5.2 2.1 11.2 2 17.4.3" draw={draw} duration={0.5} width={1.5} />
      <Stroke d="M24.6 17.6l6 4.4-5.6 4.3" draw={draw} delay={0.45} duration={0.2} width={1.5} />
    </svg>
  );
}

/**
 * Kanttekening van de psycholoog, in rode pen, met een krul vanuit de tekst erboven.
 * Geen kader: het hoort bij de entry, zoals een opmerking in de marge van een schrift.
 */
export function MarginNote({
  author,
  when,
  children,
  action,
  className,
}: {
  author: string;
  when?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex gap-2 text-clay-ink", className)}>
      <PencilArrow className="mt-[-6px] h-6 w-7 shrink-0 text-clay/70" />
      <div className="min-w-0">
        <p className="text-[15px] leading-relaxed text-clay-ink">{children}</p>
        <p className="mt-0.5 text-[12px] text-clay-ink/75">
          {author}
          {when && `, ${when}`}
          {action}
        </p>
      </div>
    </div>
  );
}
