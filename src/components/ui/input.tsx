import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl bg-oat-soft px-4 text-[15px] text-text placeholder:text-faint outline-none transition-[background-color,box-shadow] duration-200 focus:bg-surface focus:ring-1 focus:ring-taupe disabled:opacity-50";

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
