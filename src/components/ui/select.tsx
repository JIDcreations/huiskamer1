import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className={cn("relative", className)}>
      <select
        className="h-11 w-full appearance-none rounded-xl bg-oat-soft pl-4 pr-10 text-[15px] text-text outline-none transition-[background-color,box-shadow] duration-200 focus:bg-surface focus:ring-1 focus:ring-taupe disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 stroke-[1.5] text-taupe" />
    </div>
  );
}

export { Select };
