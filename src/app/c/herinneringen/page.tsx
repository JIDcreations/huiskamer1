"use client";

import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/shared/panel";
import { ReminderPicker } from "@/components/shared/reminder-picker";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "@/components/ui/toast";
import { actions, usePrefs } from "@/lib/data";

function Setting({ title, hint, checked, onChange }: { title: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
      <Toggle checked={checked} onCheckedChange={onChange} aria-label={title} />
    </label>
  );
}

export default function Herinneringen() {
  const prefs = usePrefs();
  const save = (patch: Parameters<typeof actions.updatePrefs>[0]) => {
    actions.updatePrefs(patch);
    toast("Bewaard");
  };

  return (
    <div className="mx-auto max-w-[680px]">
      <PageHeader title="Herinneringen" eyebrow="Rustig, en enkel wat je zelf wil" />

      <Panel className="mt-8">
        <ReminderPicker value={prefs.checkinReminder} onChange={(v) => save({ checkinReminder: v })} />
      </Panel>

      <Panel className="mt-5" bodyClassName="py-1">
        <div className="divide-y divide-surface-2/70">
          <Setting
            title="Opdrachten van vandaag"
            hint="Eén seintje als er iets klaarstaat. Nooit over wat je miste."
            checked={prefs.taskReminders}
            onChange={(v) => save({ taskReminders: v })}
          />
          <Setting
            title="Je sessie"
            hint="Een e-mail de dag ervoor"
            checked={prefs.appointmentReminder}
            onChange={(v) => save({ appointmentReminder: v })}
          />
        </div>
      </Panel>

      <p className="mt-4 px-1 text-[12px] text-faint">In deze demo wordt er niets verstuurd.</p>
    </div>
  );
}
