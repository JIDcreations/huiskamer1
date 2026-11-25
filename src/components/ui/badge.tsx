import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "bg-surface-2 text-text",
        outline: "text-muted ring-1 ring-inset ring-edge-strong",
        calm: "bg-moss text-pine",
        strong: "bg-accent text-on-accent",
        clay: "bg-clay-soft text-clay-ink",
        sun: "bg-sun-soft text-sun-ink",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

function Badge({
  className,
  tone,
  children,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {children}
    </span>
  );
}

export { Badge };
