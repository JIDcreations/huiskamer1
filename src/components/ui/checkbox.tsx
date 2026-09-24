"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/** Rond afvinkvak met één zachte animatie. */
export function Checkbox({
  checked,
  onChange,
  label,
  size = "md",
  className,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const s = size === "sm" ? "size-5" : "size-6";
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.88 }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-200",
        s,
        checked ? "bg-accent text-on-accent" : "bg-surface ring-[1.5px] ring-inset ring-taupe hover:ring-muted",
        className
      )}
    >
      {checked && (
        <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.22 }}>
          <Check className={cn("stroke-[2.5]", size === "sm" ? "size-3" : "size-3.5")} />
        </motion.span>
      )}
    </motion.button>
  );
}
