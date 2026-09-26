"use client";

import { useRouter } from "next/navigation";
import { PenLine } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { JournalTimeline, WeekStrip } from "@/components/shared/journal-list";
import { Panel } from "@/components/shared/panel";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { actions, CURRENT_CLIENT_ID, useJournal } from "@/lib/data";

export default function Logboek() {
  const router = useRouter();
  const entries = useJournal(CURRENT_CLIENT_ID).filter(
    (e) => e.kind !== "notitie" || e.blocks.length || e.title || e.mood
  );

  function write() {
    const id = actions.createJournal(CURRENT_CLIENT_ID);
    router.push(`/c/logboek/${id}`);
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <PageHeader
        title="Logboek"
        eyebrow="Alles wat je schrijft, op één plek"
        actions={
          <Button onClick={write}>
            <PenLine /> Schrijf iets
          </Button>
        }
      />

      <Panel className="mt-8" bodyClassName="px-2 py-2 md:px-3">
        <WeekStrip entries={entries} />
      </Panel>

      <div className="mt-8">
        <JournalTimeline
          entries={entries}
          viewer="client"
          hrefFor={(e) => `/c/logboek/${e.id}`}
          empty={
            <div className="rounded-card bg-surface shadow-soft ring-1 ring-surface-2/60">
              <EmptyState
                title="Hier is nog niets"
                description="Nog niets geschreven. Geen druk: een woord in je check-in is al een begin."
                action={
                  <Button variant="secondary" onClick={write}>
                    Schrijf iets
                  </Button>
                }
              />
            </div>
          }
        />
      </div>
    </div>
  );
}
