@AGENTS.md

# Huiskamer

Praktijkplatform voor psychologen en hun cliënten. Fase 1 (klikbaar prototype met mockdata) is af en staat op `main`.

- **Waar we staan en wat er nog moet gebeuren:** @VOORTGANG.md. Werk dit bestand bij na elke grotere stap.
- **Het plan en de designregels:** @PLAN.md (bron van waarheid; sectie 7 voor stijl).
- **Hoe de code in elkaar zit:** README.md.

## Afspraken die niet uit de code blijken

- **Online platform, geen app.** Beide rollen gebruiken dezelfde shell (sidebar + topbalk). Geen bottom tab bar.
- **Stijl:** een schrift dat je deelt: dennengroen, klei en zon op fris wit, met een potloodlaag (`src/components/shared/pencil.tsx`) waar iemand iets deed. Handgetekende iconen in `src/components/icons.tsx`, stemming als weer. Regels in PLAN.md sectie 7. Koppen in Fraunces, de rest in Plus Jakarta Sans. Geen labels boven koppen, geen hoofdletters als label, geen cijfertegels. Kleine tekst haalt AA: klei als tekst is `text-clay-ink`.
- **Copy:** Nederlands, Vlaams, je/jij, kort en warm. Geen emoji's, geen decoratieve iconen, geen em dashes.
- **Data:** componenten praten enkel met `src/lib/data`, nooit rechtstreeks met `src/lib/mock`. Zo kan later een echte backend inpluggen.
- **Privacy in de UI:** niet-gedeelde logboekentries en sessienotities mogen nergens bij de andere partij verschijnen, ook niet als aantal.
- **Git:** werk op een feature branch, commit per stap. Pushen naar branches mag zonder te vragen; mergen naar `main` enkel op vraag.

## Controleren

- `npx tsc --noEmit` en `npm run lint` moeten proper zijn, `npm run build` moet slagen.
- `npm run test:demo` (met de dev-server aan) draait de demoflow uit het plan in headless Chrome. Moet volledig slagen.
- Visueel nakijken kan met `playwright-core` en de geïnstalleerde Chrome (`/Applications/Google Chrome.app`), zie `scripts/e2e-demo.mjs` als voorbeeld.
