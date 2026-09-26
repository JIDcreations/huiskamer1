"use client";

import { useState } from "react";
import { FormActions, kindLabel, TaskFields, type TaskDraft } from "@/components/psy/task-form";
import { Label } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, pastSessions, useAppointments, useClients, useTemplates } from "@/lib/data";
import { formatDayMonth } from "@/lib/format";
import type { ID, TaskTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

function fromTemplate(t: TaskTemplate): TaskDraft {
  return { title: t.title, description: t.description, kind: t.kind, rhythm: t.defaultRhythm, minutes: t.minutes, scaleLabel: t.scaleLabel };
}

/** Opdracht geven: vanuit een sjabloon of zelf, aan een vaste of te kiezen cliënt. */
export function AssignTaskSheet({
  open,
  onOpenChange,
  clientId,
  templateId,
  appointmentId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  clientId?: ID;
  templateId?: ID;
  /** De sessie waaruit de opdracht komt. Zonder: de laatste voorbije sessie. */
  appointmentId?: ID;
}) {
  const appointments = useAppointments();
  const templates = useTemplates();
  const clients = useClients().filter((c) => c.status === "actief");
  const initial = templates.find((t) => t.id === templateId);
  const [picked, setPicked] = useState<ID | "eigen" | null>(initial ? initial.id : null);
  const [draft, setDraft] = useState<TaskDraft>(initial ? fromTemplate(initial) : { title: "", description: "", kind: "afvinken" });
  const [client, setClient] = useState<ID>(clientId ?? clients[0]?.id ?? "");
  const session = appointmentId
    ? appointments.find((a) => a.id === appointmentId)
    : pastSessions(appointments.filter((a) => a.clientId === client))[0];

  const choose = (id: ID | "eigen") => {
    setPicked(id);
    const t = templates.find((x) => x.id === id);
    setDraft(t ? fromTemplate(t) : { title: "", description: "", kind: "afvinken" });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Opdracht geven" description={picked ? undefined : "Kies een sjabloon of begin zelf."} className="md:max-w-xl">
      {!picked ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {templates.map((t) => (
            <button key={t.id} onClick={() => choose(t.id)} className="rounded-xl bg-oat-soft px-4 py-3 text-left transition-colors hover:bg-surface-2">
              <span className="block text-[14px] font-medium">{t.title}</span>
              <span className="block text-[12px] text-muted">{kindLabel[t.kind]}</span>
            </button>
          ))}
          <button onClick={() => choose("eigen")} className="rounded-xl px-4 py-3 text-left ring-1 ring-inset ring-surface-2 transition-colors hover:bg-oat-soft">
            <span className="block text-[14px] font-medium">Zelf opstellen</span>
            <span className="block text-[12px] text-muted">Vanaf een leeg blad</span>
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.rhythm) return;
            actions.createTask({
              clientId: client,
              appointmentId: session?.id,
              templateId: picked === "eigen" ? undefined : picked,
              title: draft.title.trim(),
              description: draft.description.trim(),
              kind: draft.kind,
              rhythm: draft.rhythm,
              until: draft.rhythm.kind === "eenmalig" ? undefined : draft.until,
              minutes: draft.kind === "meditatie" ? draft.minutes ?? 10 : undefined,
              scaleLabel: draft.kind === "schaal" ? draft.scaleLabel : undefined,
            });
            toast("Opdracht gegeven");
            onOpenChange(false);
          }}
        >
          {!clientId && (
            <div className="mb-4">
              <Label htmlFor="t-client">Voor wie?</Label>
              <Select id="t-client" value={client} onChange={(e) => setClient(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <TaskFields value={draft} onChange={setDraft} withDates />
          {session && (
            <p className="mt-4 text-[12px] text-muted">Hoort bij de sessie van {formatDayMonth(session.start)}, onder &ldquo;Wat we afspraken&rdquo;.</p>
          )}
          <button type="button" onClick={() => setPicked(null)} className={cn("mt-4 text-[13px] text-muted underline decoration-surface-2 underline-offset-4 hover:text-text")}>
            Ander sjabloon kiezen
          </button>
          <FormActions onCancel={() => onOpenChange(false)} submitLabel="Geven" disabled={!draft.title.trim() || !client || !draft.rhythm} />
        </form>
      )}
    </Sheet>
  );
}
