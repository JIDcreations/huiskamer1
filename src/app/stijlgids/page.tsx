"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Lock, Phone, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Toggle } from "@/components/ui/toggle";

const palette = [
  { name: "Milk", hex: "#FBF7F4", role: "Achtergrond, kaarten", ink: "text-text", ring: true },
  { name: "Oat", hex: "#E5DED2", role: "Vlakken, geselecteerd, privé", ink: "text-text" },
  { name: "Taupe", hex: "#A39382", role: "Accenten, iconen, voltooid", ink: "text-bg" },
  { name: "Mocha", hex: "#685D54", role: "Knoppen, secundaire tekst", ink: "text-bg" },
  { name: "Charcoal", hex: "#232323", role: "Enkel tekst", ink: "text-bg" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <h2 className="mb-6 text-[12px] font-medium tracking-[0.08em] text-faint uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function Stijlgids() {
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(true);

  return (
    <main className="mx-auto max-w-4xl px-5 pb-24 pt-12 md:px-8 md:pt-20">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] text-muted">Huiskamer, stap 1</p>
          <h1 className="font-display mt-1 text-[32px] leading-tight md:text-[40px]">Fundament</h1>
          <Link href="/stijlgids/editor" className="mt-4 inline-block text-[14px] font-medium text-muted underline decoration-surface-2 underline-offset-4 hover:text-text">
            Naar de editor (stap 3)
          </Link>
          <p className="mt-4 max-w-md text-muted">
            Milk, Oat, Taupe en één sans-serif. Rustig, zacht en licht.
          </p>
        </div>
      </header>

      <Section title="Palet">
        <div className="grid gap-3 sm:grid-cols-5">
          {palette.map((c) => (
            <div key={c.name}>
              <div
                className={`flex h-20 items-end rounded-card px-4 pb-3 sm:h-28 ${c.ink} ${c.ring ? "ring-1 ring-inset ring-surface-2" : ""}`}
                style={{ background: c.hex }}
              >
                <span className="font-display text-[17px] leading-none">{c.name}</span>
              </div>
              <p className="mt-2 text-[12px] tracking-wide text-faint">{c.hex}</p>
              <p className="text-[13px] text-muted">{c.role}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typografie">
        <div className="space-y-4">
          <p className="font-display text-[30px] leading-tight">Goeiemorgen, Lotte</p>
          <p className="text-[20px] font-medium leading-snug text-muted">Hoe gaat het vandaag?</p>
          <p className="max-w-[680px] leading-[1.6]">
            Schrijven moet voelen als in een mooi notitieboek. Veel witruimte, weinig lijnen, zachte
            diepte. Een huiskamer met goed licht, niet een ziekenhuis en niet een dashboard.
          </p>
          <p className="text-[14px] text-muted">Secundaire tekst in Mocha, voor details en tijdstippen.</p>
          <p className="text-[12px] font-medium tracking-wide text-faint uppercase">Label in Taupe</p>
        </div>
      </Section>

      <Section title="Knoppen">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Afspraak maken</Button>
          <Button variant="secondary">Bekijk agenda</Button>
          <Button variant="soft">
            <Plus /> Nieuwe pagina
          </Button>
          <Button variant="outline">Verzetten</Button>
          <Button variant="ghost">Annuleren</Button>
          <Button variant="quiet" size="sm">
            Later
          </Button>
          <Button size="icon" variant="secondary" aria-label="Agenda">
            <CalendarDays />
          </Button>
        </div>
      </Section>

      <Section title="Kaarten en badges">
        <div className="grid gap-4 md:grid-cols-2">
          <Card interactive>
            <CardHeader>
              <CardDescription>Volgende afspraak</CardDescription>
              <CardTitle className="font-display text-[22px]">Donderdag 14:00</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-3">
              <Avatar name="Sarah Peeters" tone="psy" />
              <div className="flex-1">
                <p className="text-[14px] font-medium">Sarah Peeters</p>
                <p className="text-[13px] text-muted">Opvolging, 50 min</p>
              </div>
              <Badge tone="calm" dot>
                Fysiek
              </Badge>
            </CardContent>
          </Card>
          <Card className="bg-surface-2 shadow-none">
            <CardHeader>
              <CardDescription className="flex items-center gap-1.5">
                <Lock className="size-3.5 stroke-[1.5]" /> Enkel voor jou
              </CardDescription>
              <CardTitle>Sessienotities</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge>Gepland</Badge>
              <Badge tone="outline">Nieuw in je sessie</Badge>
              <Badge tone="calm">Betaald</Badge>
              <Badge tone="strong">Open</Badge>
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Invoer">
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <Label htmlFor="titel">Titel</Label>
            <Input id="titel" placeholder="Waar denk je aan?" />
          </div>
          <div>
            <Label htmlFor="zoek">Zoeken</Label>
            <Input id="zoek" placeholder="Zoek een cliënt" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="notitie">Notitie</Label>
            <Textarea id="notitie" placeholder="Schrijf wat er in je opkomt." />
          </div>
          <label className="flex items-center justify-between gap-4 rounded-card bg-surface px-5 py-4 shadow-soft md:col-span-2">
            <span>
              <span className="block text-[15px]">Delen met Sarah</span>
              <span className="block text-[13px] text-muted">
                {shared ? "Sarah kan deze entry lezen." : "Enkel jij ziet deze entry."}
              </span>
            </span>
            <Toggle checked={shared} onCheckedChange={setShared} aria-label="Delen met Sarah" />
          </label>
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs defaultValue="overzicht">
          <TabsList>
            <TabsTrigger value="overzicht">Overzicht</TabsTrigger>
            <TabsTrigger value="tijdlijn">Logboek</TabsTrigger>
            <TabsTrigger value="tafel">Sessies</TabsTrigger>
            <TabsTrigger value="notities">
              <Lock /> Sessienotities
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overzicht">
            <p className="text-muted">Volgende afspraak, laatste activiteit, open opdrachten.</p>
          </TabsContent>
          <TabsContent value="tijdlijn">
            <p className="text-muted">Alles wat er tussen twee sessies gebeurde.</p>
          </TabsContent>
          <TabsContent value="tafel">
            <p className="text-muted">De gedeelde pagina&apos;s.</p>
          </TabsContent>
          <TabsContent value="notities">
            <p className="text-muted">Privé, nooit zichtbaar voor de cliënt.</p>
          </TabsContent>
        </Tabs>
      </Section>

      <Section title="Sheet en leeg-state">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex items-center justify-center p-8">
            <Button variant="secondary" onClick={() => setOpen(true)}>
              Open sheet
            </Button>
          </Card>
          <Card>
            <EmptyState title="Nog niets geschreven" description="Nog niets geschreven deze week. Geen druk." />
          </Card>
        </div>
      </Section>

      <Section title="Nood-link">
        <a
          href="tel:1813"
          className="inline-flex items-center gap-2 rounded-full bg-urgent/20 px-4 py-2 text-[14px] text-text transition-colors hover:bg-urgent/30"
        >
          <Phone className="size-4 stroke-[1.5] text-urgent" />
          Nu dringend hulp nodig?
        </a>
      </Section>

      <Sheet open={open} onOpenChange={setOpen} title="Nieuwe afspraak" description="Kies een vrij moment.">
        <div className="space-y-4">
          <div>
            <Label htmlFor="dag">Dag</Label>
            <Input id="dag" defaultValue="Donderdag 3 oktober" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Annuleren
            </Button>
            <Button onClick={() => setOpen(false)}>Bevestigen</Button>
          </div>
        </div>
      </Sheet>
    </main>
  );
}
