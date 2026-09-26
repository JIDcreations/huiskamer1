# Huiskamer

Praktijkplatform voor psychologen en hun cliënten. Fase 1: klikbaar prototype met mockdata, zonder backend, betalingen of echte login. Zie [PLAN.md](PLAN.md) voor het volledige plan.

## Starten

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) en meld je aan als cliënt of psycholoog (de velden staan al ingevuld). Op desktop wissel je rechtsonder van rol; op een smal scherm zit die wissel in het menu.

## Demo

De demodata wordt elke dag opnieuw gegenereerd rond vandaag: 1 psycholoog, 8 cliënten met elk een eigen verloop over drie weken, sessies met samenvattingen en reacties, check-ins, notities, opdrachten met antwoorden en facturen. Wat je in de demo doet, blijft bewaard in je browser.

**Demo opnieuw beginnen** zet alles terug, ook de kennismaking van de cliënt. Je vindt het onder het aanmeldformulier, naast de zwevende rolwissel en in Instellingen.

Een goede demoflow:

1. Als **Lotte** (cliënt): doe de check-in op Vandaag, vul een opdracht in, schrijf een notitie in je logboek en neem die mee naar de sessie.
2. Wissel naar **Sarah** (psycholoog): alles staat in **Vandaag** onder "Tussen de sessies" en in het dossier van Lotte, bij "Voor volgende keer".
3. Zet een entry op "Enkel voor mij": ze verschijnt nergens bij de psycholoog, ook niet als aantal.

## Testen

Start eerst een server (`npm run dev`, of `npm run build && npm start`).

- `npm run test:demo` draait de demoflow hierboven in headless Chrome, inclusief de privacyregels en de reset.
- `npm run test:layout` loopt elke route af op 375, 768 en 1440px: geen horizontale scroll, elke knop en link heeft een naam, elk beeld een alt. Met `SHOTS=<map>` bewaart hij ook screenshots.

`BASE_URL` en `CHROME_PATH` kan je bij beide overschrijven.

## Structuur

| Map | Wat |
|---|---|
| `src/app/c/*` | Cliënt: Vandaag, Logboek, Sessies, plus Opdrachten, Betalingen, Herinneringen, Privacy, Profiel en de kennismaking (`/c/welkom`) |
| `src/app/p/*` | Psycholoog: Vandaag, Agenda, Cliënten en dossier, Opdrachtenbibliotheek, Facturatie, Instellingen |
| `src/components/editor` | De gedeelde editor (sessiepagina's, logboek, privénotities): `/`-menu, opmaak bij selectie, checklist, auteur per blok |
| `src/components/sessions` | Sessiepagina, "Voor volgende keer" en afspraken boeken |
| `src/components/shared` | Bouwstenen voor beide rollen: check-in, logboeklijst, opdrachtrij, stemming, delen |
| `src/components/psy` | Enkel voor de psycholoog: dossier, activiteit, afspraak- en opdrachtformulieren |
| `src/components/shell` | Platform-shell: sidebar, topbalk, lade op smalle schermen, tab bar voor de cliënt op mobiel |
| `src/components/ui` | Basiscomponenten (knop, kaart, invoer, tabs, sheet, menu, toast) |
| `src/lib/types.ts` | Datamodel |
| `src/lib/data` | De enige toegang tot data voor componenten (hooks, afgeleide logica, acties) |
| `src/lib/mock` | Seed, verhalen per cliënt en de Zustand store. Later te vervangen door een echte API |

`/stijlgids` en `/stijlgids/editor` tonen de basiscomponenten en de editor los.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Radix UI, Tiptap 3, Framer Motion, date-fns (`nl-BE`), Zustand. Fonts (Inter en Instrument Serif) zijn zelf gehost. Een webmanifest maakt de cliëntkant installeerbaar op het beginscherm.
