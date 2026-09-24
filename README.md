# Huiskamer

Praktijkplatform voor psychologen en hun cliënten. Fase 1: klikbaar prototype met mockdata, zonder backend, betalingen of echte login. Zie [PLAN.md](PLAN.md) voor het volledige plan.

## Starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) en meld je aan als cliënt of psycholoog (de velden staan al ingevuld). Rechtsonder wissel je van rol; op een smal scherm zit die wissel in het menu.

## Demo

De demodata wordt elke dag opnieuw gegenereerd rond vandaag: 1 psycholoog, 8 cliënten, drie weken afspraken, Tafel-pagina's, logboekentries, opdrachten en facturen. Wat je in de demo doet, blijft bewaard in je browser. Terugzetten kan via **Instellingen, Demo opnieuw beginnen**.

Een goede demoflow:

1. Als **Lotte** (cliënt): kies een stemming op het overzicht en schrijf een logboekentry, vink een opdracht af, schrijf iets op de Tafel.
2. Wissel naar **Sarah** (psycholoog): alles staat in **Vandaag** en in de **tijdlijn** van Lotte. Nieuwe blokken op de Tafel zijn gemarkeerd.
3. Zet een logboekentry op "enkel voor jou": ze verschijnt nergens bij de psycholoog.

Deze flow is ook een test: start de dev-server en draai `npm run test:demo` (headless Chrome; `BASE_URL` en `CHROME_PATH` kan je overschrijven).

## Structuur

| Map | Wat |
|---|---|
| `src/app/c/*` | Cliëntomgeving |
| `src/app/p/*` | Psycholoog |
| `src/components/editor` | De gedeelde editor (Tafel, Logboek, Sessienotities): `/`-menu, opmaak bij selectie, checklist, auteur per blok |
| `src/components/tafel` | Tafel: paginalijst, pagina, opzetten |
| `src/components/shell` | Platform-shell: sidebar, topbalk, lade op smalle schermen |
| `src/lib/types.ts` | Datamodel |
| `src/lib/data` | De enige toegang tot data voor componenten (hooks, afgeleide logica, acties) |
| `src/lib/mock` | Seed en Zustand store. Later te vervangen door een echte API |

`/stijlgids` en `/stijlgids/editor` tonen de basiscomponenten en de editor los.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Radix UI, Tiptap 3, Framer Motion, date-fns (`nl-BE`), Zustand.
