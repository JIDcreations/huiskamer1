"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { Toggle } from "@/components/ui/toggle";
import { EmergencyLink } from "@/components/emergency";
import { actions, useCurrentClient, usePsychologist } from "@/lib/data";

function Setting({ title, hint, defaultOn }: { title: string; hint: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-[14px] font-medium">{title}</span>
        <span className="block text-[13px] text-muted">{hint}</span>
      </span>
      <Toggle checked={on} onCheckedChange={setOn} />
    </label>
  );
}

export default function Profiel() {
  const client = useCurrentClient();
  const psy = usePsychologist();
  const [form, setForm] = useState({ firstName: client.firstName, lastName: client.lastName, email: client.email, phone: client.phone });
  const dirty = (Object.keys(form) as (keyof typeof form)[]).some((k) => form[k] !== client[k]);
  const field = (k: keyof typeof form, label: string, type = "text") => (
    <div>
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type={type} value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
    </div>
  );

  return (
    <>
      <PageHeader title="Profiel" />
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <Panel title="Je gegevens">
            <form
              className="grid gap-4 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                actions.updateClient(client.id, form);
                toast("Gegevens bewaard");
              }}
            >
              {field("firstName", "Voornaam")}
              {field("lastName", "Naam")}
              {field("email", "E-mail", "email")}
              {field("phone", "Telefoon", "tel")}
              <div className="flex justify-end sm:col-span-2">
                <Button type="submit" disabled={!dirty}>
                  Bewaren
                </Button>
              </div>
            </form>
          </Panel>

          <Panel title="Meldingen" description="Rustig, en enkel wat je zelf wil." bodyClassName="pt-1">
            <div className="divide-y divide-surface-2/70">
              <Setting title="Herinnering voor je afspraak" hint="Een e-mail de dag ervoor" defaultOn />
              <Setting title={`Nieuw van ${psy.firstName} op de Tafel`} hint="Hoogstens één e-mail per dag" defaultOn />
              <Setting title="Opdrachten van vandaag" hint="Een korte herinnering om 19u" defaultOn={false} />
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-5">
          <Panel title="Je psycholoog">
            <p className="text-[15px] font-medium">{psy.name}</p>
            <p className="text-[14px] text-muted">{psy.practiceName}</p>
            <p className="mt-3 text-[14px] text-muted">{psy.address}</p>
            <p className="text-[14px] text-muted">{psy.phone}</p>
          </Panel>
          <Panel title="Privacy">
            <p className="text-[14px] leading-relaxed text-muted">
              Je logboek is van jou. {psy.firstName} leest enkel de entries die je deelt. Sessienotities van {psy.firstName} zijn haar
              eigen werknotities.
            </p>
          </Panel>
          <Panel title="Dringend hulp nodig?">
            <p className="mb-3 text-[14px] leading-relaxed text-muted">Huiskamer is niet bedoeld voor crisissituaties.</p>
            <EmergencyLink />
          </Panel>
        </div>
      </div>
    </>
  );
}
