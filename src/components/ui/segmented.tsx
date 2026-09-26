"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Option<T extends string> = { value: T; label: React.ReactNode };

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = "md",
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const id = useId();
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex items-center gap-0.5 rounded-full bg-oat-soft p-1", className)}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 whitespace-nowrap rounded-full font-medium outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-taupe",
              size === "sm" ? "h-7 px-3 text-[12px]" : "h-8 px-2 text-[13px] sm:px-4",
              active ? "text-text" : "text-muted hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-surface shadow-[0_0_0_1px_var(--edge),0_1px_2px_rgba(31,30,28,0.06)]"
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
