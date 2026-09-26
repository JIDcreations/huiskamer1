# Beslissingen dagrun 26 september

Keuzes die ik zelf maakte bij twijfel. Telkens kort, zodat je ze snel kan nalezen.

- **Bottom tab bar voor de cliënt op mobiel.** CLAUDE.md zegt "geen bottom tab bar", maar UX-PROMPT.md en DAGRUN.md vragen er expliciet een. DAGRUN gaat voor. De psycholoog houdt de lade.
- **Routes cliënt:** `/c/vandaag`, `/c/logboek`, `/c/sessies`. Oude routes (`/c/home`, `/c/tafel`, `/c/afspraken`) sturen door, zodat oude links blijven werken.
- **Opdracht gedaan = logboekentry.** Er is geen apart `TaskEntry` meer. Een opdracht is gedaan op een dag als er een entry van soort "opdracht" voor die dag is. Ook een simpel afvinken maakt zo'n entry (zonder tekst). Eén bron van waarheid, en de privacyregel geldt vanzelf: een opdracht-entry die "Enkel voor mij" is, telt bij de psycholoog nergens mee, ook niet in de voortgang.
- **Neem mee naar de sessie met een privé-entry:** het punt verschijnt enkel bij de cliënt, met het slotje. De psycholoog ziet het niet, tot de cliënt de entry deelt.
- **Sessiepagina = twee delen:** een samenvatting (psycholoog schrijft, cliënt leest) en reacties (beiden schrijven, met auteur per blok). De oude Tafel-pagina's zijn omgezet naar sessiepagina's; losse pagina's zonder sessie (zoals een oefening) zijn weg.
- **Fonts zelf gehost** via `@fontsource-variable/inter` (en later `@fontsource/instrument-serif`) met `next/font/local`. Google Fonts was niet bereikbaar bij de build, en zelf hosten stuurt geen bezoekersgegevens naar Google (beter voor GDPR). Enkel fontbestanden, geen code.
- **Demo-afspraken liggen relatief aan vandaag**, niet op weekdagen. Zo heeft de psycholoog altijd sessies "vandaag", ook als je de demo in het weekend opent.
- **Sessies van vandaag hebben nog geen samenvatting** in de mockdata: die schrijft de psycholoog na de sessie.
- **Tijdlijn-tab en losse sessienotities zijn weg** uit het dossier. De tijdlijn zit nu in het Logboek (zelfde tijdlijn als de cliënt) en de privénotities staan naast elke sessiepagina. Losse notities zonder sessie leken me overbodig; minder plekken.
- **Check-ins in "Tussen de sessies"** worden per cliënt gebundeld tot één regel ("3 check-ins, laatste: rustig"), zodat de lijst rustig blijft.
- **Opdracht zonder sessie**: toewijzen vanuit het dossier (niet vanuit een sessie) koppelt de opdracht automatisch aan de laatste voorbije sessie. Dat staat onderaan het formulier.
- **"Stoppen met deze opdracht"** in plaats van "Archiveren": warmer woord, zelfde actie.
- **Instrument Serif enkel voor paginatitels, sheet-titels en grote datums.** Al de rest (knoppen, lijsten, sectiekoppen) blijft Inter. Zo blijft het rustig en leesbaar. Dit draait de eerdere keuze "enkel sans-serif" terug, op vraag van DAGRUN.md.
- **Kaarten krijgen een fijne Taupe-rand (22% dekking) in plaats van een schaduw.** Geen nieuwe kleur, wel meer precisie.
- **Nieuw merkteken**: een huisje met een warm raam in Mocha, Oat en Milk, in plaats van de letter H.
- **"Tussen de sessies" bij de psycholoog** toont per cliënt tot vijf regels. Punten op "Voor volgende keer" die naar een entry wijzen, laat ik daar weg: de entry zelf staat er al.
- **Demo-randgeval**: Lotte heeft één factuur waarvan de betaaltermijn voorbij is. De tekst blijft neutraal: "De termijn is voorbij, je kan gewoon nog betalen."
- **Demotest** zoekt Chrome eerst op de Mac-locatie en valt terug op Chromium (`/opt/pw-browsers/chromium`), zodat hij ook in de cloud draait.
- **Copy-pass:** "op de agenda" heet nu "mee naar de sessie", want "Agenda" is bij de psycholoog de kalender. "Inloggen" werd "aanmelden". AGENTS.md bevat nog em dashes, maar dat bestand schrijft Next zelf; ik laat het staan.
- **Netlify-badge:** nergens in de code te vinden. Wat je ziet op een deploy preview is de Netlify Drawer; die zet je uit in Netlify zelf (Site configuration, Deploys, Deploy Previews). De Next-indicator stond al uit.
- **PWA:** manifest start op `/c/vandaag` in standalone, iconen gemaakt uit het huisje (192, 512, maskable, Apple 180). Geen service worker: offline werken hoort niet bij een prototype en kan verwarren bij demo's.
- **Responsive:** grids die pas vanaf een breakpoint kolommen krijgen, hebben nu `grid-cols-1`. Zonder dat duwden afgekapte teksten de pagina breder dan 375px.
- **Reset demo** staat op drie plekken, telkens stil: onder het aanmeldformulier, als rond knopje naast de zwevende rolwissel (desktop), en in de lade op mobiel. Plus de bestaande knop in Instellingen. Na de reset ga je naar de aanmeldpagina en start de kennismaking van de cliënt opnieuw.
- **Opruimen:** dode code weg (`placeholder.tsx`, ongebruikte afspraakkaarten, `formatDayLong`, `useTaskDraft`). Afspraaklabels staan nu in `src/lib/appointments.ts`, `initials` en de korte dagnamen enkel nog in `src/lib/format.ts`. Geen imports uit `lib/mock` buiten `lib/data`.
- **CLAUDE.md** zegt nog "geen bottom tab bar" en "enkel sans-serif". Dat klopt niet meer na deze dagrun, maar het is jouw instructiebestand: ik heb het niet aangepast. README en VOORTGANG zijn wel bijgewerkt.
