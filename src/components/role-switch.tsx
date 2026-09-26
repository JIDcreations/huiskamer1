"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

export type { Role };

const roles: { value: Role; label: string; home: string }[] = [
  { value: "client", label: "Cliënt", home: "/c/vandaag" },
  { value: "psy", label: "Psycholoog", home: "/p/vandaag" },
];

/**
 * Demo-rolwissel. Gecontroleerd (login) of navigerend (in de app).
 */
export function RoleSwitch({
  value,
  onChange,
  floating,
  className,
}: {
  value?: Role;
  onChange?: (role: Role) => void;
  floating?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const current: Role = value ?? (pathname.startsWith("/p") ? "psy" : "client");
  const id = floating ? "role-floating" : "role-inline";

  return (
    <div
      role="radiogroup"
      aria-label="Bekijk als"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full p-1",
        floating ? "glass shadow-soft ring-1 ring-surface-2" : "bg-oat-soft",
        className
      )}
    >
      {floating && <span className="pl-2.5 pr-1.5 text-[11px] tracking-wide text-faint uppercase">Demo</span>}
      {roles.map((r) => {
        const active = r.value === current;
        return (
          <button
            key={r.value}
            role="radio"
            aria-checked={active}
            onClick={() => (onChange ? onChange(r.value) : !active && router.push(r.home))}
            className={cn(
              "relative rounded-full font-medium transition-colors duration-200",
              floating ? "h-7 px-3 text-[12px]" : "h-9 flex-1 px-4 text-[14px]",
              active ? "text-text" : "text-muted hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={id}
                className={cn("absolute inset-0 rounded-full", floating ? "bg-surface-2" : "bg-surface shadow-soft")}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
