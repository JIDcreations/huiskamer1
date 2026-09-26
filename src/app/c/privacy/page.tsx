"use client";

import { Download } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/shared/panel";
import { ShareIcon, ShareSwitch } from "@/components/shared/share";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { actions, CURRENT_CLIENT_ID, useJournal, usePrefs, usePsychologist } from "@/lib/data";
import { plural } from "@/lib/format";

export default function Privacy() {
  const psy = usePsychologist();
  const prefs = usePrefs();
  const journal = useJournal(CURRENT_CLIENT_ID);
  const shared = journal.filter((j) => j.sharedWithPsychologist).length;
  const own = journal.length - shared;

  return (
    <div className="mx-auto max-w-[680px]">
      <PageHeader title="Privacy" eyebrow="Wat je schrijft, is van jou" />

      <Panel className="mt-8" title={`Wat ${psy.firstName} ziet`}>
        <ul className="flex flex-col gap-3 text-[14px] leading-relaxed">
          <li className="flex gap-3">
            <ShareIcon shared className="mt-1" />
            <span>
              <span className="font-medium">{plural(shared, "entry", "entries")} gedeeld.</span>{" "}
              <span className="text-muted">{psy.firstName} kan die lezen en er een korte kanttekening bij zetten.</span>
            </span>
          </li>
          <li className="flex gap-3">
            <ShareIcon shared={false} className="mt-1" />
            <span>
              <span className="font-medium">{plural(own, "entry", "entries")} enkel voor jou.</span>{" "}
              <span className="text-muted">{psy.firstName} ziet ze nergens, ook niet hoeveel het er zijn.</span>
            </span>
          </li>
          <li className="flex gap-3 text-muted">
            <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-taupe" />
            Wat je op een sessiepagina schrijft, lezen jullie allebei. De werknotities van {psy.firstName} zijn van haar alleen.
          </li>
        </ul>
      </Panel>

      <Panel className="mt-5" title="Standaard bij iets nieuws" description="Je kan het altijd per entry aanpassen.">
        <ShareSwitch
          shared={prefs.defaultShare}
          onChange={(v) => {
            actions.updatePrefs({ defaultShare: v });
            toast(v ? `Nieuwe entries zijn gedeeld met ${psy.firstName}` : "Nieuwe entries zijn enkel voor jou");
          }}
        />
      </Panel>

      <Panel className="mt-5" title="Je logboek meenemen" description="Een kopie van alles wat je schreef, als bestand.">
        <Button variant="secondary" onClick={() => toast("Exporteren komt in een volgende versie")}>
          <Download /> Exporteer mijn logboek
        </Button>
      </Panel>
    </div>
  );
}
