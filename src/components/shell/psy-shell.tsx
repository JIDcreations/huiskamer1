"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useClients, usePsychologist } from "@/lib/data";
import { cn } from "@/lib/utils";
import { PlatformShell } from "@/components/shell/platform-shell";
import { psyNav, psyNavFooter } from "@/lib/nav";

function ClientSearch() {
  const router = useRouter();
  const clients = useClients();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const results = q.trim()
    ? clients.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6)
    : [];

  const go = (id: string) => {
    router.push(`/p/clienten/${id}`);
    setQ("");
    setOpen(false);
  };

  return (
    <div className="relative hidden max-w-sm sm:block">
      <label>
        <span className="sr-only">Zoek een cliënt</span>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 stroke-[1.5] text-faint" />
        <input
          type="search"
          value={q}
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls="client-search-results"
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, results.length - 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
            if (e.key === "Enter" && results[active]) go(results[active].id);
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder="Zoek een cliënt"
          className="h-9 w-full rounded-lg bg-oat-soft pl-10 pr-3 text-[14px] text-text outline-none transition-[background-color,box-shadow] placeholder:text-faint focus:bg-surface focus:ring-1 focus:ring-faint"
        />
      </label>
      {open && results.length > 0 && (
        <ul id="client-search-results" role="listbox" className="absolute left-0 right-0 top-11 z-50 animate-pop rounded-xl bg-surface p-1.5 shadow-soft ring-1 ring-surface-2">
          {results.map((c, i) => (
            <li key={c.id} role="option" aria-selected={i === active}>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(c.id)}
                onMouseEnter={() => setActive(i)}
                className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left", i === active && "bg-oat-soft")}
              >
                <Avatar name={`${c.firstName} ${c.lastName}`} tone="client" size="sm" />
                <span className="text-[14px]">
                  {c.firstName} {c.lastName}
                </span>
                <span className="ml-auto text-[12px] text-faint">{c.status}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function PsyShell({ children }: { children: React.ReactNode }) {
  const psy = usePsychologist();
  return (
    <PlatformShell
      homeHref="/p/vandaag"
      context={psy.practiceName}
      nav={psyNav}
      footerNav={psyNavFooter}
      user={{ name: psy.name, subtitle: "Psycholoog", tone: "psy", menu: psyNavFooter }}
      topbarStart={<ClientSearch />}
    >
      {children}
    </PlatformShell>
  );
}
