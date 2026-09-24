"use client";

import { Search } from "lucide-react";
import { PlatformShell } from "@/components/shell/platform-shell";
import { psyNav, psyNavFooter } from "@/lib/nav";

function ClientSearch() {
  return (
    <label className="relative hidden max-w-sm sm:block">
      <span className="sr-only">Zoek een cliënt</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 stroke-[1.5] text-faint" />
      <input
        type="search"
        placeholder="Zoek een cliënt"
        className="h-9 w-full rounded-lg bg-oat-soft pl-10 pr-3 text-[14px] text-text outline-none transition-[background-color,box-shadow] placeholder:text-faint focus:bg-surface focus:ring-1 focus:ring-faint"
      />
    </label>
  );
}

export function PsyShell({ children }: { children: React.ReactNode }) {
  return (
    <PlatformShell
      homeHref="/p/vandaag"
      context="Praktijk De Linde"
      nav={psyNav}
      footerNav={psyNavFooter}
      user={{ name: "Sarah Peeters", subtitle: "Psycholoog", tone: "psy", menu: psyNavFooter }}
      topbarStart={<ClientSearch />}
    >
      {children}
    </PlatformShell>
  );
}
