"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Sheet: schuift van onder op mobiel, gecentreerd paneel vanaf md.
 */
type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

function Sheet({ open, onOpenChange, title, description, children, className }: SheetProps) {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-surface-2/50 backdrop-blur-[3px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.div
                className={cn(
                  "fixed z-50 flex max-h-[88dvh] flex-col bg-bg shadow-soft outline-none",
                  "inset-x-0 bottom-0 rounded-t-sheet pb-[max(env(safe-area-inset-bottom),16px)]",
                  "md:inset-0 md:m-auto md:h-fit md:w-[calc(100%-2rem)] md:max-w-lg md:rounded-sheet md:pb-0",
                  className
                )}
                initial={isDesktop ? { opacity: 0, scale: 0.98 } : { y: "100%" }}
                animate={isDesktop ? { opacity: 1, scale: 1 } : { y: 0 }}
                exit={isDesktop ? { opacity: 0, scale: 0.98 } : { y: "100%" }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <div aria-hidden className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-surface-2 md:hidden" />
                <div className="flex items-start justify-between gap-4 px-6 pt-4 md:pt-6">
                  <div>
                    <DialogPrimitive.Title className="font-display text-[25px] leading-tight">
                      {title}
                    </DialogPrimitive.Title>
                    {description ? (
                      <DialogPrimitive.Description className="mt-1 text-[14px] text-muted">
                        {description}
                      </DialogPrimitive.Description>
                    ) : (
                      <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
                    )}
                  </div>
                  <DialogPrimitive.Close
                    className="-mr-2 inline-flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-oat-soft hover:text-text"
                    aria-label="Sluiten"
                  >
                    <X className="size-[18px] stroke-[1.5]" />
                  </DialogPrimitive.Close>
                </div>
                <div className="overflow-y-auto px-6 pb-6 pt-5">{children}</div>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

export { Sheet };
