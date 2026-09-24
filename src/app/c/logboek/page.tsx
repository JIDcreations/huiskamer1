"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { groupByWeek, JournalCard } from "@/components/shared/journal-list";
import { SectionLabel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { actions, CURRENT_CLIENT_ID, useJournal, usePsychologist } from "@/lib/data";

export default function Logboek() {
  const router = useRouter();
  const psy = usePsychologist();
  const entries = useJournal(CURRENT_CLIENT_ID).filter((e) => e.blocks.length || e.title || e.mood);
  const groups = groupByWeek(entries);
  const thisWeek = groups[0]?.label === "Deze week";

  function create() {
    const id = actions.createJournal(CURRENT_CLIENT_ID);
    router.push(`/c/logboek/${id}`);
  }

  return (
    <>
      <PageHeader
        title="Logboek"
        eyebrow={`Enkel voor jou, tenzij je een entry deelt met ${psy.firstName}`}
        actions={
          <Button onClick={create}>
            <Plus /> Nieuwe entry
          </Button>
        }
      />

      <div className="mt-8 max-w-[760px]">
        {!thisWeek && (
          <div className="mb-8 rounded-card bg-oat-soft px-5 py-5">
            <p className="text-[15px] font-medium">Nog niets geschreven deze week. Geen druk.</p>
            <p className="mt-1 text-[14px] text-muted">Een paar woorden over je dag is al genoeg.</p>
            <Button variant="secondary" size="sm" className="mt-4 bg-surface hover:bg-surface/70" onClick={create}>
              Begin met schrijven
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-8">
          {groups.map((g) => (
            <section key={g.label}>
              <SectionLabel>{g.label}</SectionLabel>
              <div className="flex flex-col gap-3">
                {g.items.map((e) => (
                  <JournalCard key={e.id} entry={e} href={`/c/logboek/${e.id}`} psyName={psy.firstName} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}

