"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PencilRing, PencilTick } from "@/components/shared/pencil";
import { cn } from "@/lib/utils";

/** Getekend rondje; afvinken tekent een vinkje dat net over de rand schiet. */
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
  // Wat al afgevinkt was bij het laden, staat er gewoon. Enkel jouw eigen vinkje tekent zich.
  const [wasChecked] = useState(checked);
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "group relative inline-flex shrink-0 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-40",
        s,
        className
      )}
    >
      <PencilRing className={cn("absolute inset-0 size-full transition-colors duration-200", checked ? "text-pine/45" : "text-taupe group-hover:text-pine")} />
      {checked && <PencilTick draw={!wasChecked} className="absolute -right-1 -top-1.5 size-[125%] text-pine" />}
    </motion.button>
  );
}
