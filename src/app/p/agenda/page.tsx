"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { addDays, addMinutes, format, isSameDay, parseISO, startOfDay, startOfWeek } from "date-fns";
import { nlBE } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { AppointmentDetailSheet, NewAppointmentSheet } from "@/components/psy/appointment-sheet";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { useAppointments, useClientsRaw, usePsychologist, weekdayOf } from "@/lib/data";
import { capitalize, formatLongDate, formatTime, plural } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

const START = 8;
const END = 20;
const HOUR = 60; // px per uur

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const y = (minutes: number) => ((minutes - START * 60) / 60) * HOUR;

function useIsDesktop() {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return desktop;
}

function AppointmentBlock({ a, name, onOpen }: { a: Appointment; name: string; onOpen: () => void }) {
  const s = parseISO(a.start);
  const e = parseISO(a.end);
  const top = y(s.getHours() * 60 + s.getMinutes());
  const height = Math.max(24, ((e.getTime() - s.getTime()) / 3_600_000) * HOUR - 3);
  const cancelled = a.status === "geannuleerd" || a.status === "no-show";
  const past = e < new Date();

  return (
    <button
      onClick={(ev) => {
        ev.stopPropagation();
        onOpen();
      }}
      style={{ top, height }}
      className={cn(
        "absolute inset-x-1 z-[2] overflow-hidden rounded-lg px-2.5 py-1.5 text-left text-[12px] leading-tight transition-shadow hover:shadow-soft",
        cancelled
          ? "bg-transparent text-faint ring-1 ring-inset ring-dashed ring-taupe/60"
          : past
            ? "bg-oat-soft text-muted ring-1 ring-inset ring-surface-2"
            : a.mode === "online"
              ? "bg-surface text-text ring-1 ring-inset ring-taupe/70"
              : "bg-surface-2 text-text"
      )}
    >
      <span className={cn("block truncate font-medium", cancelled && "line-through")}>{name}</span>
      <span className="block truncate text-muted">
        {formatTime(s)}
        {a.type === "intake" ? ", intake" : ""}
        {a.mode === "online" ? ", online" : ""}
      </span>
    </button>
  );
}

export default function Agenda() {
  const psy = usePsychologist();
  const all = useAppointments();
  const clients = useClientsRaw();
  const desktop = useIsDesktop();
  const [view, setView] = useState<"week" | "dag" | null>(null);
  const [anchor, setAnchor] = useState(() => startOfDay(new Date()));
  const [open, setOpen] = useState<Appointment | null>(null);
  const [creating, setCreating] = useState<Date | null | undefined>(undefined);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  const mode = view ?? (desktop === false ? "dag" : "week");
  const weekStart = startOfWeek(anchor, { weekStartsOn: 1 });

  const days = useMemo(() => {
    if (mode === "dag") return [anchor];
    const week = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    // Weekend enkel tonen als er iets gepland staat of je dan beschikbaar bent.
    return week.filter((d, i) => {
      if (i < 5) return true;
      return psy.availability.some((w) => w.weekday === i + 1) || all.some((a) => isSameDay(parseISO(a.start), d));
    });
  }, [mode, anchor, weekStart, psy.availability, all]);

  const name = (id: string) => {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Onbekend";
  };

  const step = mode === "dag" ? 1 : 7;
  const title =
    mode === "dag"
      ? capitalize(formatLongDate(anchor))
      : `${format(weekStart, "d MMM", { locale: nlBE })} tot ${format(addDays(weekStart, 6), "d MMM yyyy", { locale: nlBE })}`.replace(/\./g, "");

  const hours = Array.from({ length: END - START }, (_, i) => START + i);
  // Alles wat doorgaat of doorging, zodat het aantal klopt met wat je ziet.
  const count = all.filter((a) => a.status !== "geannuleerd" && days.some((d) => isSameDay(parseISO(a.start), d))).length;

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-[13px] text-muted">{count ? plural(count, "afspraak", "afspraken") : "Niets gepland"}</p>
          <h1 className="type-title">{title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="Weergave"
            size="sm"
            value={mode}
            onChange={setView}
            options={[
              { value: "dag", label: "Dag" },
              { value: "week", label: "Week" },
            ]}
          />
          <div className="flex items-center">
            <Button variant="quiet" size="icon-sm" aria-label="Vorige" onClick={() => setAnchor((d) => addDays(d, -step))}>
              <ChevronLeft />
            </Button>
            <Button variant="quiet" size="sm" onClick={() => setAnchor(startOfDay(new Date()))}>
              Vandaag
            </Button>
            <Button variant="quiet" size="icon-sm" aria-label="Volgende" onClick={() => setAnchor((d) => addDays(d, step))}>
              <ChevronRight />
            </Button>
          </div>
          <Button size="sm" onClick={() => setCreating(null)}>
            <Plus /> Afspraak
          </Button>
        </div>
      </header>

      <div className="mt-6 overflow-hidden card">
        {/* Dagen */}
        <div className="grid border-b border-surface-2" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
          <div />
          {days.map((d) => {
            const today = isSameDay(d, now);
            return (
              <button
                key={d.toISOString()}
                onClick={() => {
                  setAnchor(d);
                  setView("dag");
                }}
                className="flex flex-col items-center gap-0.5 py-3 transition-colors hover:bg-oat-soft/50"
              >
                <span className="text-[11px] font-medium tracking-wide text-faint uppercase">{format(d, "EEEEEE", { locale: nlBE }).replace(".", "")}</span>
                <span
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full text-[15px] font-semibold tabular-nums",
                    today ? "bg-accent text-on-accent" : "text-text"
                  )}
                >
                  {d.getDate()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Raster */}
        <div className="max-h-[calc(100dvh-240px)] min-h-[420px] overflow-y-auto">
          <div className="relative grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, minmax(0, 1fr))` }}>
            <div className="relative" style={{ height: (END - START) * HOUR }}>
              {hours.map((h) => (
                <span key={h} className="absolute right-2 -translate-y-1/2 text-[11px] tabular-nums text-faint" style={{ top: y(h * 60) }}>
                  {h > START ? `${h}:00` : ""}
                </span>
              ))}
            </div>

            {days.map((d) => {
              const windows = psy.availability.filter((w) => w.weekday === weekdayOf(d));
              const own = all.filter((a) => isSameDay(parseISO(a.start), d));
              const today = isSameDay(d, now);
              const nowMin = now.getHours() * 60 + now.getMinutes();
              return (
                <div
                  key={d.toISOString()}
                  className="relative cursor-copy border-l border-surface-2/80 bg-bg"
                  style={{
                    height: (END - START) * HOUR,
                    backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR - 1}px, var(--oat-soft) ${HOUR - 1}px, var(--oat-soft) ${HOUR}px)`,
                  }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const minutes = START * 60 + Math.floor(((e.clientY - rect.top) / HOUR) * 4) * 15;
                    setCreating(addMinutes(startOfDay(d), minutes));
                  }}
                >
                  {windows.map((w) => (
                    <div
                      key={w.start}
                      aria-hidden
                      className="absolute inset-x-0 bg-surface"
                      style={{
                        top: y(toMin(w.start)),
                        height: y(toMin(w.end)) - y(toMin(w.start)),
                        backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${HOUR - 1}px, var(--oat-soft) ${HOUR - 1}px, var(--oat-soft) ${HOUR}px)`,
                        backgroundPositionY: `${-(y(toMin(w.start)) % HOUR)}px`,
                      }}
                    />
                  ))}
                  {today && nowMin > START * 60 && nowMin < END * 60 && (
                    <div aria-hidden className="absolute inset-x-0 z-[3] flex items-center" style={{ top: y(nowMin) }}>
                      <span className="-ml-1 size-2 rounded-full bg-accent" />
                      <span className="h-px flex-1 bg-accent" />
                    </div>
                  )}
                  {own.map((a) => (
                    <AppointmentBlock key={a.id} a={a} name={name(a.clientId)} onOpen={() => setOpen(a)} />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12px] text-muted">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-surface-2" /> In de praktijk
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-surface ring-1 ring-inset ring-taupe/70" /> Online
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-surface ring-1 ring-inset ring-surface-2" /> Beschikbaar
        </span>
        <Link href="/p/instellingen#beschikbaarheid" className="ml-auto underline decoration-surface-2 underline-offset-4 hover:text-text">
          Beschikbaarheid aanpassen
        </Link>
      </div>

      <AppointmentDetailSheet key={open?.id ?? "geen"} appointment={open} onClose={() => setOpen(null)} />
      {creating !== undefined && (
        <NewAppointmentSheet open onOpenChange={(o) => !o && setCreating(undefined)} start={creating ?? undefined} />
      )}
    </>
  );
}
