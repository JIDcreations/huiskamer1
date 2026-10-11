"use client";

import { useEffect, useRef, useState } from "react";
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
  const input = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K zet de cursor in het zoekveld.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  const results = q.trim()
    ? clients.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6)
    : [];

  const go = (id: string) => {
    router.push(`/p/clienten/${id}`);
    setQ("");
    setOpen(false);
  };

  return (
    <div className="relative hidden max-w-md sm:block">
      <label className="island h-12 w-full gap-2.5 pl-4 pr-2 focus-within:ring-2 focus-within:ring-pine/30">
        <span className="sr-only">Zoek een cliënt</span>
        <Search className="pointer-events-none size-4 shrink-0 stroke-[1.75] text-faint" />
        <input
          ref={input}
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
          className="h-full min-w-0 flex-1 bg-transparent text-[14px] text-text outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:hidden"
        />
        <kbd aria-hidden className="hidden shrink-0 rounded-full bg-surface-2/80 px-2.5 py-1 font-sans text-[11px] font-semibold text-muted md:block">
          ⌘K
        </kbd>
      </label>
      {open && results.length > 0 && (
        <ul id="client-search-results" role="listbox" className="absolute left-0 right-0 top-14 z-50 animate-pop rounded-[20px] bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(21,33,27,0.35)] ring-1 ring-edge">
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
