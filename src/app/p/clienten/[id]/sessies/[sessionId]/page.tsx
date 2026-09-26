"use client";

import { use, useState } from "react";
import { Lock, Plus } from "lucide-react";
import { Editor } from "@/components/editor/editor";
import { AssignTaskSheet } from "@/components/psy/assign-task";
import { SessionView } from "@/components/sessions/session-view";
import { Button } from "@/components/ui/button";
import { actions, PSY_ID, useAppointment, useSessionNotes } from "@/lib/data";
import { useAutosave } from "@/lib/use-autosave";
import type { Block, ID } from "@/lib/types";

/** Privé sessienotities naast de gedeelde pagina. Visueel duidelijk anders: slotje en Oat-vlak. */
function PrivateNotes({ clientId, appointmentId }: { clientId: ID; appointmentId: ID }) {
  const notes = useSessionNotes(clientId);
  const note = notes.find((n) => n.appointmentId === appointmentId);
  const save = useAutosave<Block[]>((blocks) => {
    const id = note?.id ?? actions.createSessionNote(clientId, appointmentId);
    actions.updateSessionNote(id, blocks);
  });

  return (
    <aside aria-label="Privé sessienotities" className="h-fit rounded-card bg-surface-2/70 px-5 pb-6 pt-5 lg:sticky lg:top-24">
      <p className="flex items-center gap-2 text-[13px] font-medium text-muted">
        <Lock className="size-3.5 stroke-[1.75]" /> Sessienotities
      </p>
      <p className="mt-0.5 text-[12px] text-muted">Enkel voor jou. Nooit zichtbaar voor je cliënt.</p>
      <div className="mt-4">
        <Editor
          blocks={note?.blocks ?? []}
          authorId={PSY_ID}
          private
          placeholder="Wat viel op, wat wil je volgende keer oppakken?"
          onChange={save.schedule}
          className="max-w-none"
        />
      </div>
    </aside>
  );
}

export default function PsySessie({ params }: { params: Promise<{ id: string; sessionId: string }> }) {
  const { id, sessionId } = use(params);
  const appointment = useAppointment(sessionId);
  const [assigning, setAssigning] = useState(false);
  const valid = appointment && appointment.clientId === id;

  return (
    <>
      <SessionView
        appointmentId={valid ? sessionId : ""}
        viewer="psy"
        backHref={`/p/clienten/${id}?tab=sessies`}
        entryHref={(e) => `/p/clienten/${id}?tab=logboek&entry=${e}`}
        tasksAction={
          <Button variant="soft" size="sm" onClick={() => setAssigning(true)}>
            <Plus /> Opdracht toevoegen
          </Button>
        }
        aside={valid ? <PrivateNotes clientId={id} appointmentId={sessionId} /> : undefined}
      />
      {assigning && <AssignTaskSheet open={assigning} onOpenChange={setAssigning} clientId={id} appointmentId={sessionId} />}
    </>
  );
}
