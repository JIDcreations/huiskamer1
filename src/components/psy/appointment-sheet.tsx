"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addMinutes, areIntervalsOverlapping, format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Segmented } from "@/components/ui/segmented";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { minutesOf, statusLabel, typeLabel } from "@/components/shared/appointment-card";
import { actions, useAppointments, useClient, useClients, usePsychologist } from "@/lib/data";
import { capitalize, formatLongDate, formatTime } from "@/lib/format";
import type { Appointment, AppointmentMode, AppointmentType, ID } from "@/lib/types";

const toLocalDate = (d: Date) => format(d, "yyyy-MM-dd");
const toLocalTime = (d: Date) => format(d, "HH:mm");
const combine = (day: string, time: string) => new Date(`${day}T${time}:00`);

function useClash(start: Date | null, minutes: number, ignore?: ID) {
  const all = useAppointments();
  return useMemo(() => {
    if (!start || Number.isNaN(start.getTime())) return undefined;
    const slot = { start, end: addMinutes(start, minutes) };
    return all.find(
      (a) => a.id !== ignore && a.status === "gepland" && areIntervalsOverlapping(slot, { start: parseISO(a.start), end: parseISO(a.end) })
    );
  }, [all, start, minutes, ignore]);
}

/** Nieuwe afspraak door de psycholoog: vrije keuze van moment, met een zachte waarschuwing bij overlap. */
export function NewAppointmentSheet({
  open,
  onOpenChange,
  start,
  clientId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  start?: Date;
  clientId?: ID;
}) {
  const psy = usePsychologist();
  const clients = useClients().filter((c) => c.status !== "afgerond");
  const [client, setClient] = useState(clientId ?? clients[0]?.id ?? "");
  const [day, setDay] = useState(toLocalDate(start ?? new Date()));
  const [time, setTime] = useState(start ? toLocalTime(start) : "10:00");
  const [type, setType] = useState<AppointmentType>("opvolging");
  const [mode, setMode] = useState<AppointmentMode>("fysiek");
  const at = combine(day, time);
  const clash = useClash(at, psy.sessionMinutes);
  const clashClient = useClient(clash?.clientId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Nieuwe afspraak">
      <form
        className="grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          actions.createAppointment({ clientId: client, start: at.toISOString(), type, mode });
          toast("Afspraak gepland");
          onOpenChange(false);
        }}
      >
        {!clientId && (
          <div>
            <Label htmlFor="a-client">Cliënt</Label>
            <Select id="a-client" value={client} onChange={(e) => setClient(e.target.value)}>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="a-day">Dag</Label>
            <Input id="a-day" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="a-time">Uur</Label>
            <Input id="a-time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Segmented label="Type" value={type} onChange={setType} options={[{ value: "opvolging", label: "Opvolging" }, { value: "intake", label: "Intake" }]} />
          <Segmented label="Waar" value={mode} onChange={setMode} options={[{ value: "fysiek", label: "Fysiek" }, { value: "online", label: "Online" }]} />
        </div>
        {clash && (
          <p className="rounded-xl bg-oat-soft px-4 py-3 text-[13px] text-muted">
            Dit overlapt met {clashClient?.firstName} om {formatTime(clash.start)}.
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-surface-2 pt-5">
          <p className="text-[13px] text-muted">{psy.sessionMinutes} minuten</p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Annuleren
            </Button>
            <Button type="submit" disabled={!client || Number.isNaN(at.getTime())}>
              Plannen
            </Button>
          </div>
        </div>
      </form>
    </Sheet>
  );
}

/** Details van een afspraak, met verzetten, annuleren en status. */
export function AppointmentDetailSheet({ appointment, onClose }: { appointment: Appointment | null; onClose: () => void }) {
  const client = useClient(appointment?.clientId);
  const [moving, setMoving] = useState(false);
  const [day, setDay] = useState(appointment ? toLocalDate(parseISO(appointment.start)) : "");
  const [time, setTime] = useState(appointment ? toLocalTime(parseISO(appointment.start)) : "");
  const at = day && time ? combine(day, time) : null;
  const clash = useClash(at, appointment ? minutesOf(appointment) : 50, appointment?.id);
  const clashClient = useClient(clash?.clientId);
  if (!appointment) return null;

  const start = parseISO(appointment.start);
  const isPast = parseISO(appointment.end) < new Date();

  return (
    <Sheet
      open
      onOpenChange={(o) => !o && onClose()}
      title={client ? `${client.firstName} ${client.lastName}` : "Afspraak"}
      description={`${capitalize(formatLongDate(start))}, ${formatTime(start)} tot ${formatTime(appointment.end)}`}
    >
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[14px]">
        <dt className="text-muted">Type</dt>
        <dd>{typeLabel[appointment.type]}</dd>
        <dt className="text-muted">Waar</dt>
        <dd>{appointment.mode === "online" ? "Online" : "In de praktijk"}</dd>
        <dt className="text-muted">Status</dt>
        <dd>{statusLabel[appointment.status]}</dd>
      </dl>

      {moving ? (
        <form
          className="mt-6 grid gap-4 border-t border-surface-2 pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!at) return;
            actions.rescheduleAppointment(appointment.id, at.toISOString());
            toast("Afspraak verzet");
            onClose();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="m-day">Nieuwe dag</Label>
              <Input id="m-day" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="m-time">Uur</Label>
              <Input id="m-time" type="time" step={900} value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          {clash && <p className="rounded-xl bg-oat-soft px-4 py-3 text-[13px] text-muted">Dit overlapt met {clashClient?.firstName} om {formatTime(clash.start)}.</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setMoving(false)}>
              Terug
            </Button>
            <Button type="submit">Verzetten</Button>
          </div>
        </form>
      ) : (
        <div className="mt-6 flex flex-wrap gap-2 border-t border-surface-2 pt-5">
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/p/clienten/${appointment.clientId}`}>Dossier</Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link href={`/p/clienten/${appointment.clientId}?tab=sessienotities`}>Sessienotitie</Link>
          </Button>
          {appointment.status === "gepland" && !isPast && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setMoving(true)}>
                Verzetten
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  actions.setAppointmentStatus(appointment.id, "geannuleerd");
                  toast("Afspraak geannuleerd");
                  onClose();
                }}
              >
                Annuleren
              </Button>
            </>
          )}
          {(isPast || appointment.status !== "gepland") && appointment.status !== "geannuleerd" && (
            <>
              {appointment.status !== "voltooid" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    actions.setAppointmentStatus(appointment.id, "voltooid");
                    toast("Gemarkeerd als voltooid");
                    onClose();
                  }}
                >
                  Voltooid
                </Button>
              )}
              {appointment.status !== "no-show" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    actions.setAppointmentStatus(appointment.id, "no-show");
                    toast("Gemarkeerd als niet gekomen");
                    onClose();
                  }}
                >
                  Niet gekomen
                </Button>
              )}
            </>
          )}
        </div>
      )}
    </Sheet>
  );
}
