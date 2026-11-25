"use client";

import { useState } from "react";
import { Plus, Trash2 } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { AssignTaskSheet } from "@/components/psy/assign-task";
import { FormActions, kindLabel, TaskFields, type TaskDraft } from "@/components/psy/task-form";
import { taskKindInk } from "@/components/shared/kind";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, rhythmLabel, useTasks, useTemplates } from "@/lib/data";
import { plural } from "@/lib/format";
import type { TaskTemplate } from "@/lib/types";
import { cn } from "@/lib/utils";

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
        actions={
          <Button onClick={() => setEditing("nieuw")}>
            <Plus /> Nieuw sjabloon
          </Button>
        }
      />

      <ul className="mt-8 card divide-y divide-edge overflow-hidden">
        {templates.map((t) => {
          const inUse = new Set(tasks.filter((x) => x.templateId === t.id).map((x) => x.clientId)).size;
          return (
            <li key={t.id} className="grid grid-cols-1 gap-x-8 gap-y-3 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)_auto] md:items-center md:px-6">
              <div className="min-w-0">
                <h2 className="text-[16px] font-semibold">{t.title}</h2>
                <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-muted">{t.description}</p>
              </div>
              <p className="text-[13px] leading-relaxed text-muted">
                <span className={cn("font-medium", taskKindInk[t.kind])}>{kindLabel[t.kind]}</span>
                <br />
                {t.defaultRhythm ? rhythmLabel(t.defaultRhythm) : "Ritme kies je bij het geven"}
                {t.minutes ? `, ${t.minutes} minuten` : ""}
                {inUse ? (
                  <>
                    <br />
                    In gebruik bij {plural(inUse, "cliënt", "cliënten")}
                  </>
                ) : null}
              </p>
              <div className="flex gap-1 md:justify-end">
                <Button size="sm" variant="secondary" onClick={() => setAssign(t.id)}>
                  Geef aan cliënt
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>
                  Bewerken
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {editing && <TemplateSheet key={editing === "nieuw" ? "nieuw" : editing.id} template={editing} onClose={() => setEditing(null)} />}
      {assign && <AssignTaskSheet open onOpenChange={(o) => !o && setAssign(null)} templateId={assign} />}
    </>
  );
}
