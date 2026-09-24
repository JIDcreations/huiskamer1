"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Editor } from "@/components/editor/editor";
import type { EditorAuthor } from "@/components/editor/authorship";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Block } from "@/lib/types";

const authors: Record<string, EditorAuthor> = {
  sarah: { name: "Sarah Peeters", role: "psy" },
  lotte: { name: "Lotte Janssens", role: "client" },
};

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

const tafel: Block[] = [
  { id: "t1", type: "heading", level: 2, content: "Na de sessie van dinsdag", authorId: "sarah", updatedAt: hoursAgo(50) },
  {
    id: "t2",
    type: "paragraph",
    content: "We spraken over de avonden, als het huis stil wordt en de gedachten luider. Je merkte dat <strong>even naar buiten gaan</strong> soms helpt.",
    authorId: "sarah",
    updatedAt: hoursAgo(50),
  },
  { id: "t3", type: "quote", content: "Ik hoef niet alles vandaag op te lossen.", authorId: "sarah", updatedAt: hoursAgo(50) },
  { id: "t4", type: "heading", level: 3, content: "Afspraken voor deze week", authorId: "sarah", updatedAt: hoursAgo(50) },
  { id: "t5", type: "checklist", content: "Drie avonden een korte wandeling", checked: true, authorId: "lotte", updatedAt: hoursAgo(20) },
  { id: "t6", type: "checklist", content: "Noteren wanneer het piekeren begint", checked: false, authorId: "sarah", updatedAt: hoursAgo(50) },
  { id: "t7", type: "divider", content: "", authorId: "sarah", updatedAt: hoursAgo(50) },
  {
    id: "t8",
    type: "paragraph",
    content: "Woensdag lukte het wandelen niet, het regende. Wel <em>tien minuten</em> op het balkon gezeten. Telt dat ook?",
    authorId: "lotte",
    updatedAt: hoursAgo(3),
  },
  { id: "t9", type: "paragraph", content: "Een vraag voor volgende keer: hoe hou ik dit vol als het drukker wordt op het werk?", authorId: "lotte", updatedAt: hoursAgo(3) },
];

const logboek: Block[] = [
  {
    id: "l1",
    type: "paragraph",
    content: "Rustige ochtend. Koffie op het balkon voor iedereen wakker was. Merk dat ik minder snel mijn telefoon pak.",
    authorId: "lotte",
    updatedAt: hoursAgo(5),
  },
];

const notities: Block[] = [
  { id: "n1", type: "heading", level: 3, content: "Observaties", authorId: "sarah", updatedAt: hoursAgo(50) },
  {
    id: "n2",
    type: "paragraph",
    content: "Meer ruimte in het verhaal dan vorige keer. Piekeren vooral rond 22u. Slaap licht verbeterd.",
    authorId: "sarah",
    updatedAt: hoursAgo(50),
  },
  { id: "n3", type: "checklist", content: "Volgende keer: werkdruk bespreken", checked: false, authorId: "sarah", updatedAt: hoursAgo(50) },
];

function WriterSwitch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label="Schrijf als" className="inline-flex items-center gap-1 rounded-full bg-oat-soft p-1">
      <span className="px-2.5 text-[12px] text-muted">Schrijf als</span>
      {Object.entries(authors).map(([id, a]) => (
        <button
          key={id}
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "h-7 rounded-full px-3 text-[13px] transition-colors",
            value === id ? "bg-surface font-medium text-text shadow-soft" : "text-muted hover:text-text"
          )}
        >
          {a.name.split(" ")[0]}
        </button>
      ))}
    </div>
  );
}

export default function EditorDemo() {
  const [writer, setWriter] = useState("lotte");
  const [title, setTitle] = useState("Samen na 12 september");
  const [journalTitle, setJournalTitle] = useState("");
  const [saved, setSaved] = useState<Block[]>(tafel);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
      <Link href="/stijlgids" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-text">
        <ArrowLeft className="size-4 stroke-[1.5]" /> Stijlgids
      </Link>
      <p className="mt-6 text-[13px] text-muted">Huiskamer, stap 3</p>
      <h1 className="font-display mt-1 text-[32px] leading-tight md:text-[40px]">Editor</h1>
      <p className="mt-3 max-w-lg text-muted">
        Eén editor voor Tafel, Logboek en Sessienotities. Typ <kbd className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[13px] text-text">/</kbd> voor
        bloktypes, selecteer tekst voor opmaak.
      </p>

      <Tabs defaultValue="tafel" className="mt-10">
        <TabsList>
          <TabsTrigger value="tafel">Tafel</TabsTrigger>
          <TabsTrigger value="logboek">Logboek</TabsTrigger>
          <TabsTrigger value="notities">Sessienotities</TabsTrigger>
        </TabsList>

        <TabsContent value="tafel">
          <div className="rounded-card bg-surface px-5 py-8 shadow-soft md:px-10 md:py-12">
            <div className="mx-auto mb-8 flex max-w-[680px] flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-muted">Wijzig een blok en het krijgt de initialen van wie schrijft.</p>
              <WriterSwitch value={writer} onChange={setWriter} />
            </div>
            <Editor
              blocks={tafel}
              authorId={writer}
              authors={authors}
              showAuthors
              title={title}
              onTitleChange={setTitle}
              onChange={setSaved}
            />
          </div>
          <details className="mt-4 rounded-card bg-oat-soft px-5 py-3 text-[13px] text-muted">
            <summary className="cursor-pointer">Opgeslagen blokken ({saved.length})</summary>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed">
              {JSON.stringify(saved, null, 2)}
            </pre>
          </details>
        </TabsContent>

        <TabsContent value="logboek">
          <div className="rounded-card bg-surface px-5 py-8 shadow-soft md:px-10 md:py-12">
            <Editor
              blocks={logboek}
              authorId="lotte"
              title={journalTitle}
              onTitleChange={setJournalTitle}
              titlePlaceholder="Titel, als je wil"
              placeholder="Wat houdt je bezig vandaag?"
            />
          </div>
        </TabsContent>

        <TabsContent value="notities">
          <Editor blocks={notities} authorId="sarah" private placeholder="Notities bij deze sessie." />
        </TabsContent>
      </Tabs>
    </main>
  );
}
