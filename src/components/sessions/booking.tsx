"use client";

import { useState } from "react";
import { SlotPicker } from "@/components/shared/slot-picker";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, usePsychologist } from "@/lib/data";
import { formatAppointment } from "@/lib/format";
import type { Appointment, AppointmentMode, ID } from "@/lib/types";

export type BookingFlow = { kind: "book" } | { kind: "move"; appointment: Appointment } | { kind: "cancel"; appointment: Appointment } | null;

/** Nieuwe afspraak boeken of een bestaande verzetten, in vrije slots. */
function BookSheet({ clientId, flow, onClose }: { clientId: ID; flow: BookingFlow; onClose: () => void }) {
  const [slot, setSlot] = useState<Date | null>(null);
  const [mode, setMode] = useState<AppointmentMode>("fysiek");
  const moving = flow?.kind === "move" ? flow.appointment : null;
  const open = flow?.kind === "book" || flow?.kind === "move";

  function confirm() {
    if (!slot) return;
    if (moving) {
      actions.rescheduleAppointment(moving.id, slot.toISOString());
      toast("Sessie verzet");
    } else {
      actions.createAppointment({ clientId, start: slot.toISOString(), type: "opvolging", mode });
      toast("Sessie geboekt");
    }
    onClose();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={moving ? "Sessie verzetten" : "Nieuwe afspraak boeken"}
      description={moving ? `Nu gepland: ${formatAppointment(moving.start)}` : "Kies een moment dat jou past."}
    >
      <SlotPicker value={slot} onChange={setSlot} excludeId={moving?.id} />
      {!moving && (
        <div className="mt-6">
          <p className="mb-2 text-[13px] text-muted">Waar?</p>
          <Segmented
            label="Waar"
            value={mode}
            onChange={setMode}
            options={[
              { value: "fysiek", label: "In de praktijk" },
              { value: "online", label: "Online" },
            ]}
          />
        </div>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-surface-2 pt-5">
        <p className="text-[14px] text-muted tabular-nums">{slot ? formatAppointment(slot) : "Nog geen moment gekozen"}</p>
        <Button disabled={!slot} onClick={confirm}>
          {moving ? "Verzetten" : "Bevestigen"}
        </Button>
      </div>
    </Sheet>
  );
}

function CancelSheet({ flow, onClose }: { flow: BookingFlow; onClose: () => void }) {
  const psy = usePsychologist();
  return (
    <Sheet
      open={flow?.kind === "cancel"}
      onOpenChange={(o) => !o && onClose()}
      title="Sessie annuleren?"
      description={flow?.kind === "cancel" ? `${formatAppointment(flow.appointment.start)} bij ${psy.name}. Wat op "Voor volgende keer" staat, schuift mee naar je volgende sessie.` : undefined}
    >
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Behouden
        </Button>
        <Button
          onClick={() => {
            if (flow?.kind === "cancel") actions.setAppointmentStatus(flow.appointment.id, "geannuleerd");
            toast("Sessie geannuleerd");
            onClose();
          }}
        >
          Annuleren
        </Button>
      </div>
    </Sheet>
  );
}

export function BookingSheets({ clientId, flow, onClose }: { clientId: ID; flow: BookingFlow; onClose: () => void }) {
  return (
    <>
      <BookSheet key={flow ? (flow.kind === "book" ? "book" : flow.appointment.id + flow.kind) : "none"} clientId={clientId} flow={flow} onClose={onClose} />
      <CancelSheet flow={flow} onClose={onClose} />
    </>
  );
}
