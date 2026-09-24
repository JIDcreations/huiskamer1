"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

type Toast = { id: number; text: string };
const useToasts = create<{ toasts: Toast[] }>(() => ({ toasts: [] }));

let next = 0;
/** Korte, rustige bevestiging onderaan. */
export function toast(text: string) {
  const id = ++next;
  useToasts.setState((s) => ({ toasts: [...s.toasts, { id, text }] }));
  setTimeout(() => useToasts.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600);
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-16 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.22 }}
            className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-[14px] text-text shadow-soft ring-1 ring-surface-2"
          >
            <Check className="size-4 stroke-[2] text-taupe" />
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
