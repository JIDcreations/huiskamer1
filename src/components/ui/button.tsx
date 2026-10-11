import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium outline-none transition-[background-color,color,box-shadow,transform,opacity] duration-200 ease-out-soft active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-pine focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_6px_16px_-8px_rgba(29,69,53,0.6)] hover:bg-pine-deep active:bg-pine-deep",
        secondary: "bg-surface text-text shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:bg-moss/60 active:bg-moss",
        soft: "bg-moss/70 text-pine hover:bg-moss active:bg-moss",
        sun: "bg-sun text-ink hover:bg-[#e9b940] active:bg-[#e9b940]",
        outline: "text-muted shadow-[inset_0_0_0_1px_var(--edge-strong)] hover:bg-oat-soft hover:text-text",
        ghost: "text-text hover:bg-oat-soft active:bg-surface-2/60",
        quiet: "text-muted hover:bg-oat-soft hover:text-text active:bg-surface-2/60",
      },
      size: {
        sm: "h-8 px-3.5 text-[13px] [&_svg]:size-4",
        md: "h-10 px-5 text-[14px]",
        lg: "h-12 px-7 text-[15px]",
        icon: "size-10",
        "icon-sm": "size-8 [&_svg]:size-4",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export { Button, buttonVariants };
