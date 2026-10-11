"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, PenLine } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { beelden } from "@/lib/beelden";
import { JournalTimeline, WeekStrip } from "@/components/shared/journal-list";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { actions, CURRENT_CLIENT_ID, useJournal, usePsychologist } from "@/lib/data";

export default function Logboek() {
  const router = useRouter();
  const psy = usePsychologist();
  const entries = useJournal(CURRENT_CLIENT_ID).filter((e) => e.kind !== "notitie" || e.blocks.length || e.title || e.mood);

  function write() {
    const id = actions.createJournal(CURRENT_CLIENT_ID);
    router.push(`/c/logboek/${id}`);
  }

  return (
    <>
      <PageHeader
        image={beelden.boek}
        title="Logboek"
        eyebrow="Alles wat je schrijft, op één plek"
        actions={
          <Button variant="sun" onClick={write}>
            <PenLine /> Schrijf iets
          </Button>
        }
      />

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:mt-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8">
        <aside className="flex flex-col gap-5 lg:sticky lg:top-24 lg:order-last">
          <section className="card p-6" aria-labelledby="deze-week">
            <h2 id="deze-week" className="type-subtitle mb-4">
              Deze week
            </h2>
            <WeekStrip entries={entries} compact />
            <p className="mt-4 text-[13px] text-muted">Een geel bolletje is een check-in. De stipjes zijn afgewerkte opdrachten.</p>
          </section>
          <Link
            href="/c/privacy"
            className="group block rounded-card bg-moss p-6 text-pine transition-transform duration-500 ease-out-soft hover:-translate-y-0.5"
          >
            <p className="eyebrow">Wat ziet {psy.firstName}?</p>
            <p className="mt-3 font-display text-[22px] leading-snug">Enkel wat je deelt. Wat je voor jezelf houdt, ziet niemand anders.</p>
            <span className="mt-4 inline-flex items-center gap-1 text-[13px] font-semibold">
              Privacy <ChevronRight className="size-4 stroke-[1.75] transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </aside>

        <JournalTimeline
          entries={entries}
          viewer="client"
          hrefFor={(e) => `/c/logboek/${e.id}`}
          empty={
            <div className="card">
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
    </>
  );
}
