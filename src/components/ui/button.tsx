import * as React from "react";
import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[-0.005em] outline-none transition-[background-color,color,box-shadow,transform,opacity] duration-200 ease-out-soft active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40 [&_svg]:size-[18px] [&_svg]:shrink-0 [&_svg]:stroke-[1.5]",
  {
    variants: {
      variant: {
        primary: "bg-accent text-on-accent shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-accent/92 active:bg-accent",
        secondary: "bg-surface-2/75 text-text hover:bg-surface-2 active:bg-surface-2",
        soft: "bg-oat-soft text-muted hover:bg-surface-2/80 hover:text-text active:bg-surface-2",
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
