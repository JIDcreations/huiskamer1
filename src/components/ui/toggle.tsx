"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Toggle({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-[26px] w-[44px] shrink-0 cursor-pointer items-center rounded-full p-[3px] outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-taupe focus-visible:ring-offset-2 focus-visible:ring-offset-bg data-[state=checked]:bg-accent data-[state=checked]:hover:bg-accent/92 data-[state=unchecked]:bg-surface-2 data-[state=unchecked]:hover:bg-taupe/45 disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-surface shadow-[0_1px_2px_rgba(31,30,28,.12)] transition-transform duration-200 ease-out-soft data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  );
}

export { Toggle };
