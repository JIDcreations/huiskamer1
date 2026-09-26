import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl bg-oat-soft px-4 text-[15px] text-text placeholder:text-faint outline-none shadow-[inset_0_0_0_1px_transparent] transition-[background-color,box-shadow] duration-200 hover:bg-surface-2/60 focus:bg-surface focus:shadow-[inset_0_0_0_1px_var(--taupe),0_0_0_3px_rgba(163,147,130,0.18)] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:shadow-[inset_0_0_0_1px_var(--urgent)]";

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "min-h-24 py-3 leading-relaxed", className)} {...props} />;
}

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return <label className={cn("mb-1.5 block text-[13px] font-medium text-muted", className)} {...props} />;
}

export { Input, Textarea, Label };
