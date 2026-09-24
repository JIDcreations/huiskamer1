"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AppointmentRow, NextAppointment } from "@/components/shared/appointment-card";
import { Panel, SectionLabel } from "@/components/shared/panel";
import { SlotPicker } from "@/components/shared/slot-picker";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, canChange, CURRENT_CLIENT_ID, past, upcoming, useAppointments, usePsychologist } from "@/lib/data";
import { formatAppointment } from "@/lib/format";
import type { Appointment, AppointmentMode } from "@/lib/types";

type Flow = { kind: "book" } | { kind: "move"; appointment: Appointment } | { kind: "cancel"; appointment: Appointment } | null;

function BookSheet({ flow, onClose }: { flow: Flow; onClose: () => void }) {
  const [slot, setSlot] = useState<Date | null>(null);
  const [mode, setMode] = useState<AppointmentMode>("fysiek");
  const moving = flow?.kind === "move" ? flow.appointment : null;
  const open = flow?.kind === "book" || flow?.kind === "move";

  function confirm() {
    if (!slot) return;
    if (moving) {
      actions.rescheduleAppointment(moving.id, slot.toISOString());
      toast("Afspraak verzet");
    } else {
      actions.createAppointment({ clientId: CURRENT_CLIENT_ID, start: slot.toISOString(), type: "opvolging", mode });
      toast("Afspraak gemaakt");
    }
    onClose();
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={moving ? "Afspraak verzetten" : "Nieuwe afspraak"}
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
      <div className="mt-6 flex items-center justify-between gap-3 border-t border-surface-2 pt-5">
        <p className="text-[14px] text-muted">{slot ? formatAppointment(slot) : "Nog geen moment gekozen"}</p>
        <Button disabled={!slot} onClick={confirm}>
          {moving ? "Verzetten" : "Bevestigen"}
        </Button>
      </div>
    </Sheet>
  );
}

export default function Afspraken() {
  const psy = usePsychologist();
  const all = useAppointments(CURRENT_CLIENT_ID);
  const next = upcoming(all);
  const history = past(all);
  const [flow, setFlow] = useState<Flow>(null);
  const [first, ...rest] = next;

  const changeActions = (a: Appointment) =>
    canChange(a, psy) ? (
      <>
        <Button variant="secondary" size="sm" onClick={() => setFlow({ kind: "move", appointment: a })}>
          Verzetten
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setFlow({ kind: "cancel", appointment: a })}>
          Annuleren
        </Button>
      </>
    ) : (
      <p className="text-[13px] text-muted">
        Minder dan {psy.cancellationHours} uur op voorhand. Wil je iets veranderen? Bel {psy.firstName} op {psy.phone}.
      </p>
    );

  return (
    <>
      <PageHeader
        title="Afspraken"
        eyebrow={`Bij ${psy.name}`}
        actions={
          <Button onClick={() => setFlow({ kind: "book" })}>
            <Plus /> Nieuwe afspraak
          </Button>
        }
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Panel>
            {first ? (
              <NextAppointment appointment={first}>{changeActions(first)}</NextAppointment>
            ) : (
              <EmptyState
                title="Geen afspraak gepland"
                description="Kies een moment dat past. Je ziet meteen wat er vrij is."
                action={<Button onClick={() => setFlow({ kind: "book" })}>Afspraak maken</Button>}
              />
            )}
          </Panel>

          {rest.length > 0 && (
            <Panel title="Later gepland" bodyClassName="pt-1">
              <div className="divide-y divide-surface-2/70">
                {rest.map((a) => (
                  <AppointmentRow
                    key={a.id}
                    appointment={a}
                    action={
                      canChange(a, psy) && (
                        <Button variant="quiet" size="sm" onClick={() => setFlow({ kind: "move", appointment: a })}>
                          Verzetten
                        </Button>
                      )
                    }
                  />
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Voorbij" bodyClassName="pt-1">
            {history.length ? (
              <div className="divide-y divide-surface-2/70">
                {history.map((a) => (
                  <AppointmentRow key={a.id} appointment={a} />
                ))}
              </div>
            ) : (
              <p className="py-3 text-[14px] text-muted">Nog geen voorbije afspraken.</p>
            )}
          </Panel>
          <div className="px-1">
            <SectionLabel>Goed om te weten</SectionLabel>
            <p className="text-[13px] leading-relaxed text-muted">
              Verzetten of annuleren kan tot {psy.cancellationHours} uur op voorhand. Een sessie duurt {psy.sessionMinutes} minuten.
            </p>
          </div>
        </div>
      </div>

      <BookSheet key={flow ? (flow.kind === "book" ? "book" : flow.appointment.id + flow.kind) : "none"} flow={flow} onClose={() => setFlow(null)} />

      <Sheet
        open={flow?.kind === "cancel"}
        onOpenChange={(o) => !o && setFlow(null)}
        title="Afspraak annuleren?"
        description={flow?.kind === "cancel" ? `${formatAppointment(flow.appointment.start)} bij ${psy.name}.` : undefined}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFlow(null)}>
            Behouden
          </Button>
          <Button
            onClick={() => {
              if (flow?.kind === "cancel") actions.setAppointmentStatus(flow.appointment.id, "geannuleerd");
              toast("Afspraak geannuleerd");
              setFlow(null);
            }}
          >
            Annuleren
          </Button>
        </div>
      </Sheet>
    </>
  );
}
