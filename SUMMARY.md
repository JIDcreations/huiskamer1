# Dagrun 26 september: eindrapport

Alles staat op de branch `dagrun-26sep`, in kleine commits. `main` is niet aangeraakt en er is niets gedeployed. Build, lint, typecheck, `npm run test:demo` (27 checks) en `npm run test:layout` (alle routes op 375, 768 en 1440px) zijn groen.

Keuzes die ik zelf maakte, staan kort in **DECISIONS.md**. De voortgang per fase staat in **PROGRESS.md**.

## Wat er gedaan is, per fase

1. **UX-herwerking cliënt.** Drie plekken in tijd: Vandaag, Logboek, Sessies. Check-in van één woord op Vandaag, opdrachten van vandaag met sheets om in te vullen, onboarding bij de eerste keer, avatar-menu met Opdrachten, Betalingen, Herinneringen, Privacy en Profiel. Een opdracht-antwoord is gewoon een logboekentry, zodat delen overal op dezelfde manier werkt. PLAN.md is mee herschreven.
2. **UX-herwerking psycholoog.** Vandaag met "Tussen de sessies" en een link naar "Voor volgende keer". Dossier met Overzicht, Logboek, Sessies, Opdrachten, Betalingen. Sessiepagina met samenvatting, reacties en privénotities; opdrachten geef je vanuit de sessie, met verplicht ritme.
3. **UI.** Vaste typeschaal met Instrument Serif voor paginatitels en Inter voor al de rest, tabular numbers, kaarten met een fijne rand in plaats van schaduw, afgewerkte states op elke knop, tab, pill en sheet. Nieuw merkteken (huisje). Tab bar met blur voor de cliënt op mobiel.
4. **Details.** Randgevallen (annuleren binnen de termijn, geen vrije slots, vervallen factuur, "Niet gedaan" na een deadline), lege en laadstaten met skeletons, overgangen met Framer Motion, nood-link ook in de onboarding.
5. **Mockdata.** Acht cliënten met elk een eigen verhaal over drie weken: sessies met samenvattingen, gelinkte opdrachten, check-ins, notities, antwoorden (gedeeld en privé), kanttekeningen en een gevulde "Voor volgende keer". Alles rond vandaag, tussen 9u en 18u.
6. **Copy.** Geen em dashes of emoji's in de code (enkel in AGENTS.md, dat Next zelf schrijft). "Op de agenda" heet nu "Mee naar de sessie", want "Agenda" is bij de psycholoog de kalender. "Inloggen" werd "aanmelden". Stijlgids bijgewerkt naar de nieuwe structuur.
7. **Toegankelijkheid, responsive, PWA.** Nieuwe layouttest over alle routes. Die vond vijf plekken met horizontale scroll op 375 of 768px (grids zonder kolom op mobiel, de filter op Cliënten); allemaal opgelost. Focus states nagelopen met het toetsenbord (statusmenu en tag-invoer hadden er geen). Manifest en iconen, zodat de cliënt Huiskamer op het beginscherm kan zetten.
8. **Demo-klaar.** "Demo opnieuw beginnen" onder het aanmeldformulier, naast de zwevende rolwissel en in Instellingen. Zet ook de onboarding terug. De demotest doorloopt nu ook de reset.
9. **Opruimen.** Dode componenten en helpers weg, dubbele helpers samengebracht in `src/lib/format.ts` en `src/lib/appointments.ts`. Geen enkele component praat met `lib/mock`. README en VOORTGANG beschrijven de nieuwe structuur.

## Wat niet gedaan is

- **Netlify-badge**: die zit niet in de code. Wat je op een deploy preview ziet, is de Netlify Drawer. Die zet je uit in Netlify (Site configuration, Deploys, Deploy Previews).
- **Service worker / offline**: bewust niet, voor een prototype geeft dat vooral verwarring.
- **CLAUDE.md** zegt nog "geen bottom tab bar" en "enkel sans-serif". Dat is jouw instructiebestand, dus niet aangepast. Werk het bij als je deze richting houdt.
- **Exporteren van het logboek** (Privacy) en **attesten** blijven een melding "komt in een volgende versie".

## Twijfels

- **Tab bar voor de cliënt op mobiel** gaat in tegen CLAUDE.md, maar DAGRUN en UX-PROMPT vroegen erom. Kijk of het voor jou nog "platform, geen app" voelt.
- **Instrument Serif** draait je eerdere keuze voor enkel sans-serif terug. Ik gebruik het enkel voor paginatitels, sheet-titels en grote datums.
- **Opdracht gedaan = logboekentry.** Eén bron van waarheid en de privacyregel geldt vanzelf, maar een privé-afgevinkte opdracht telt dan ook niet mee in de voortgang bij de psycholoog. Dat is consequent, maar kan verrassen.
- **"Tussen de sessies"** bij de psycholoog was lang met acht actieve cliënten. In de polish-ronde ingekort (zie onderaan); kijk of drie regels per cliënt de juiste maat is.
- **De tijdlijn-tab en losse sessienotities** zijn weg uit het dossier. Minder plekken, maar wie de oude tijdlijn gewoon was, moet even zoeken.

## Vijf dingen om eerst te bekijken

1. **Psycholoog, Vandaag** (`/p/vandaag`): is "Tussen de sessies" wat een psycholoog 's ochtends wil zien, en hoe lang mag die lijst zijn?
2. **Cliënt op je gsm** (`/c/vandaag`, smal scherm): tab bar, check-in en een opdracht invullen in de sheet. Zet het ook eens op je beginscherm.
3. **Een sessiepagina, beide kanten** (`/c/sessies` en het dossier, tab Sessies): samenvatting, reacties, privénotities en "Voor volgende keer". Dit is de nieuwe kern en vervangt de Tafel.
4. **Delen en "Enkel voor mij"** in het logboek: doe een entry privé en kijk bij de psycholoog. De test zegt dat het klopt, maar voel of de uitleg duidelijk genoeg is voor een cliënt.
5. **DECISIONS.md**: vooral de punten over de tab bar, opdracht = entry en de weggevallen tijdlijn. Daar maakte ik de grootste keuzes zonder jou.

## Tweede polish-ronde

Scherm per scherm, wat ik verbeterde:

- **Psycholoog, Vandaag:** "Tussen de sessies" toont per cliënt alles wat nieuw is sinds je laatste bezoek, aangevuld tot drie regels. De rest zit achter "Nog 3 in het logboek van Elise". De lijst werd zo ongeveer een derde korter, zonder dat er iets nieuws verdwijnt.
- **Sessiepagina, reacties:** zodra er reacties staan, verdween de plek om te schrijven (de placeholder toont enkel in een lege editor). Nu staat er een stille knop "Reactie schrijven" die een nieuwe regel onderaan opent.
- **Logboek, beide kanten:** de tijdlijn toont een week aan dagen, met "Oudere dagen tonen" eronder. Drie weken in één scroll was te veel voor een rustige pagina. Een andere filter kiezen begint weer bij de laatste week.
- **Dossier, Overzicht:** twee eigen kolommen (links de volgende sessie en "Voor volgende keer", rechts opdrachten en stemming) in plaats van een raster. Korte kaarten rekten eerst mee en lieten een groot leeg vlak.
- **Cliënt, Sessies:** de volgende sessie heet nu "Maandag 28 september" zoals overal, in plaats van "Maandag, 28 sep". Enkel vandaag en morgen krijgen nog de korte vorm ("Morgen, 27 sep").
- **Agenda:** bovenaan stond "1 gepland" op een dag met drie afspraken (twee al voorbij). Nu "3 afspraken": alles wat doorgaat of doorging, zonder de geannuleerde.
- **Nagekeken zonder wijziging:** Facturatie, Agenda (week en dag, ook op 375px), logboekentry op mobiel, Cliëntenlijst. Die ogen af.
- **Cliënt, Betalingen op mobiel:** in de historiek werd "Sessie van 14 sep" op 375px één woord per regel. De rij loopt nu door naar een tweede regel en het label "Betaald" valt weg op smalle schermen ("betaald op 17 sep" staat er al).
- **Ook nagekeken:** Opdrachtenbibliotheek, alle opdrachten bij de cliënt, onboarding op mobiel. Geen wijzigingen nodig.

Wat ik nog zou doen met meer tijd: de stemmingsgrafiek in het dossier een duidelijker label geven (nu "Zwaar tot licht" in het midden), en de rijen bij "Openstaand" in Betalingen op mobiel iets ruimer zetten.
