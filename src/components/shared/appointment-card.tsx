"use client";

import { MapPin, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePsychologist } from "@/lib/data";
import { capitalize, formatAppointment, formatLongDate, formatTime } from "@/lib/format";
import type { Appointment } from "@/lib/types";
import { cn } from "@/lib/utils";

export const typeLabel = { intake: "Intake", opvolging: "Opvolging" } as const;
export const statusLabel = { gepland: "Gepland", voltooid: "Voltooid", geannuleerd: "Geannuleerd", "no-show": "Niet gekomen" } as const;

export function minutesOf(a: Appointment) {
  return Math.round((new Date(a.end).getTime() - new Date(a.start).getTime()) / 60000);
}

export function ModeLine({ appointment, className }: { appointment: Appointment; className?: string }) {
  const psy = usePsychologist();
  const Icon = appointment.mode === "online" ? Video : MapPin;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[14px] text-muted", className)}>
      <Icon className="size-4 shrink-0 stroke-[1.5] text-faint" />
      {appointment.mode === "online" ? "Online, de link verschijnt hier 10 minuten op voorhand" : psy.address}
    </span>
  );
}

/** Grote kaart voor de volgende afspraak. */
export function NextAppointment({ appointment, children }: { appointment: Appointment; children?: React.ReactNode }) {
  const psy = usePsychologist();
  return (
    <div>
      <p className="text-[13px] text-muted">Volgende afspraak</p>
      <p className="mt-1 text-[24px] font-semibold leading-tight tracking-tight md:text-[28px]">{formatAppointment(appointment.start)}</p>
      <p className="mt-2 text-[14px] text-text">
        {typeLabel[appointment.type]} bij {psy.name}, {minutesOf(appointment)} minuten
      </p>
      <ModeLine appointment={appointment} className="mt-1" />
      {children && <div className="mt-5 flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function AppointmentRow({ appointment, action }: { appointment: Appointment; action?: React.ReactNode }) {
  const d = new Date(appointment.start);
  const dimmed = appointment.status === "geannuleerd" || appointment.status === "no-show";
  return (
    <div className="flex items-center gap-4 py-3.5">
      <div className="w-12 shrink-0 text-center">
        <p className="text-[11px] font-medium tracking-wide text-faint uppercase">{formatLongDate(d).slice(0, 2)}</p>
        <p className={cn("text-[20px] font-semibold leading-tight tabular-nums", dimmed && "text-faint")}>{d.getDate()}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-medium", dimmed && "text-faint line-through decoration-surface-2")}>
          {capitalize(formatLongDate(d))}, {formatTime(d)}
        </p>
        <p className="text-[13px] text-muted">
          {typeLabel[appointment.type]}, {appointment.mode}
        </p>
      </div>
      {appointment.status !== "gepland" && (
        <Badge tone={appointment.status === "voltooid" ? "calm" : "outline"}>{statusLabel[appointment.status]}</Badge>
      )}
      {action}
    </div>
  );
}
