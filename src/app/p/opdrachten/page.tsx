"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AssignTaskSheet } from "@/components/psy/assign-task";
import { FormActions, kindLabel, TaskFields, type TaskDraft } from "@/components/psy/task-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, rhythmLabel, useTasks, useTemplates } from "@/lib/data";
import { plural } from "@/lib/format";
import type { TaskTemplate } from "@/lib/types";

function TemplateSheet({ template, onClose }: { template: TaskTemplate | "nieuw"; onClose: () => void }) {
  const existing = template === "nieuw" ? null : template;
  const [draft, setDraft] = useState<TaskDraft>(
    existing
      ? { title: existing.title, description: existing.description, kind: existing.kind, rhythm: existing.defaultRhythm, minutes: existing.minutes, scaleLabel: existing.scaleLabel }
      : { title: "", description: "", kind: "afvinken" }
  );
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={existing ? "Sjabloon bewerken" : "Nieuw sjabloon"} className="md:max-w-xl">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          actions.saveTemplate({
            id: existing?.id,
            title: draft.title.trim(),
            description: draft.description.trim(),
            kind: draft.kind,
            defaultRhythm: draft.rhythm,
            minutes: draft.minutes,
            scaleLabel: draft.scaleLabel,
          });
          toast("Sjabloon bewaard");
          onClose();
        }}
      >
        <TaskFields value={draft} onChange={setDraft} />
        {existing && (
          <Button
            type="button"
            variant="quiet"
            size="sm"
            className="-ml-3 mt-4"
            onClick={() => {
              actions.deleteTemplate(existing.id);
              toast("Sjabloon verwijderd");
              onClose();
            }}
          >
            <Trash2 /> Sjabloon verwijderen
          </Button>
        )}
        <FormActions onCancel={onClose} submitLabel="Bewaren" disabled={!draft.title.trim()} />
      </form>
    </Sheet>
  );
}

export default function Bibliotheek() {
  const templates = useTemplates();
  const tasks = useTasks();
  const [editing, setEditing] = useState<TaskTemplate | "nieuw" | null>(null);
  const [assign, setAssign] = useState<string | null>(null);

  return (
    <>
      <PageHeader
        title="Opdrachtenbibliotheek"
        eyebrow="Herbruikbare sjablonen"
        actions={
          <Button onClick={() => setEditing("nieuw")}>
            <Plus /> Nieuw sjabloon
          </Button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((t) => {
          const inUse = new Set(tasks.filter((x) => x.templateId === t.id).map((x) => x.clientId)).size;
          return (
            <article key={t.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-[16px] font-semibold tracking-tight">{t.title}</h2>
                <Badge>{kindLabel[t.kind]}</Badge>
              </div>
              <p className="mt-2 flex-1 text-[14px] leading-relaxed text-muted">{t.description}</p>
              <p className="mt-4 text-[12px] text-faint">
                {t.defaultRhythm ? rhythmLabel(t.defaultRhythm) : "Ritme kies je bij het geven"}
                {t.minutes ? `, ${t.minutes} minuten` : ""}
                {inUse ? `, in gebruik bij ${plural(inUse, "cliënt", "cliënten")}` : ""}
              </p>
              <div className="mt-4 flex gap-2 border-t border-surface-2 pt-4">
                <Button size="sm" variant="secondary" onClick={() => setAssign(t.id)}>
                  Geef aan cliënt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                  Bewerken
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      {editing && <TemplateSheet key={editing === "nieuw" ? "nieuw" : editing.id} template={editing} onClose={() => setEditing(null)} />}
      {assign && <AssignTaskSheet open onOpenChange={(o) => !o && setAssign(null)} templateId={assign} />}
    </>
  );
}
