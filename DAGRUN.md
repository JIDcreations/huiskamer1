# Huiskamer: dagrun (onbewaakt)

Jasper is vandaag de hele dag weg. Je werkt zelfstandig, zonder te stoppen voor feedback. Lees eerst **PLAN.md**, **UX-PROMPT.md** en de huidige code. Dit document gaat voor op de stopmomenten in die twee bestanden: vandaag stop je nergens om iets te tonen.

---

## Werkwijze

**Git**
- Werk op een nieuwe branch `dagrun-26sep`. Raak `main` niet aan, deploy niets.
- Commit na elke afgeronde stap, met een korte, duidelijke boodschap. Kleine commits, zodat Jasper vanavond stappen kan terugdraaien.

**Controle na elke stap**
- Draai `npm run build` en de linter. Fix tot alles groen is voor je commit.
- Commit nooit een kapotte build.

**PROGRESS.md (verplicht)**
- Maak bij de start `PROGRESS.md` aan met de checklist van de fases hieronder.
- Vink af en werk bij na elke commit: wat is klaar, waar zit je nu, wat is de volgende stap.
- **Als je opnieuw start** (nieuwe sessie, na een pauze of limiet): lees eerst PROGRESS.md en ga verder bij het eerste open item. Begin nooit opnieuw.
- Houd bovenaan PROGRESS.md een regel `Laatste update: <datum en uur>` bij, en werk die minstens elke 20 minuten bij (commit + push). Zo weet een volgende run of jij nog bezig bent.
- **Push na elke commit** naar `origin dagrun-26sep`. Wat niet gepusht is, gaat verloren.
- Respecteer ook de werkafspraken in CLAUDE.md, tenzij ze botsen met dit document. VOORTGANG.md mag je mee bijwerken.

**DECISIONS.md**
- Bij twijfel beslis je zelf, kies voor minder, en noteer de keuze in één of twee regels in `DECISIONS.md`. Jasper leest dit vanavond.

**Zuinig met tokens**
- Lees enkel de bestanden die je voor de stap nodig hebt, en enkel het relevante deel van grote bestanden.
- Geen subagents, tenzij echt nodig.
- Geen lange uitleg in je antwoorden. Doen, controleren, committen, PROGRESS.md bijwerken, verder.
- Laat geen dev server logs streamen. Gebruik `build` om te controleren.
- Geen grote refactors "voor de zekerheid". Enkel wat de stap vraagt.

---

## Fases, in deze volgorde

### 1. UX-herwerking cliëntkant
Volledig volgens UX-PROMPT.md: datamodellen en mockdata, navigatie met drie tabs (Vandaag, Logboek, Sessies), Vandaag, Logboek, Sessies, sheets voor opdrachten, onboarding, avatar-menu (Betalingen, Herinneringen, Privacy, Profiel). Werk eerst PLAN.md bij (secties 3, 4, 5).

### 2. UX-herwerking psycholoogkant
Volgens UX-PROMPT.md: Vandaag met link naar "Voor volgende keer", dossier met tabs Overzicht, Logboek, Sessies, Opdrachten, Betalingen. Opdrachten toewijzen vanuit een sessiepagina, met verplicht ritme.

### 3. UI naar professioneel niveau
De UI is nog te basic en voelt niet af. Maak er een product van dat een psycholoog zou vertrouwen. Het palet, de fonts en de regels uit PLAN.md sectie 7 blijven, maar de uitvoering mag veel verfijnder.

Referentieniveau: de rust en precisie van Linear, Things 3 en Notion, in de warme Milk/Oat/Taupe-sfeer.

- **Typografie**: een vaste typeschaal. Instrument Serif voor koppen en paginatitels, Inter voor UI. Duidelijke hiërarchie, goede regelhoogtes, tabular numbers voor tijden en bedragen.
- **Spacing**: één consistente schaal (4/8). Meer witruimte, strakkere uitlijning, alles op een grid.
- **Componenten**: elke knop, input, tab, pill, kaart en sheet heeft een afgewerkte default, hover, active, focus en disabled state. Niets mag nog naar default shadcn ogen.
- **Kaarten en vlakken**: subtiele randen in plaats van zware schaduwen, Oat-vlakken waar het structuur geeft, wit op Milk voor kaarten.
- **Navigatie**: cliënt mobiel met een verfijnde bottom tab bar (Milk met blur), psycholoog met een rustige, strakke sidebar.
- **Details**: avatars met initialen in de auteurstinten, nette datum- en tijdnotatie (nl-BE), badges en ritme-labels in één vaste vorm, skeletons in plaats van spinners.
- Nog steeds: geen nieuwe kleuren, geen donkere vlakken, geen emoji's, geen decoratieve iconen.

### 4. Elk detail uitwerken
- Alle routes volledig klikbaar, inclusief randgevallen: annuleren binnen de annulatietermijn, geen vrije slots, vervallen factuur, opdracht na deadline ("Niet gedaan", neutraal).
- Lege staten en laadstaten op elke pagina, rustige copy met één volgende stap.
- Microinteracties met Framer Motion (200 tot 300ms, ease-out): afvinken, sheets van onder, opslaan-feedback, tabovergangen.
- Editor: slash-menu, bubble menu, checklist, auteur-markering, toetsenbordbediening, allemaal afgewerkt.
- Nood-link: altijd bereikbaar, zachte terracotta, 1813 en 106.

### 5. Mockdata rijker
8 cliënten met een geloofwaardig verloop over 3 weken: sessies met samenvattingen, gelinkte opdrachten, check-ins, notities, opdracht-antwoorden (mix gedeeld en enkel voor mij), een gevulde "Voor volgende keer". Tijdstippen tussen 9u en 18u.

### 6. Copy-pass
Alle teksten nalezen: Vlaams, je/jij, kort en warm, geen schuldgevoel. **Geen em dashes en geen emoji's**, zoek ze actief op in de hele codebase en verwijder ze.

### 7. Toegankelijkheid, responsive, PWA
- Focus states overal, contrast AA, alles bedienbaar met toetsenbord, aria-labels op iconknoppen.
- Check op 375, 768 en 1440px. Geen horizontale scroll, niets dat breekt.
- PWA-basis voor de cliënt: manifest, icoon, standalone gevoel op mobiel.
- Netlify-badge verwijderen.

### 8. Demo-klaar
- Een "Reset demo" (discreet, bv. onder de rolwissel) die de store terugzet naar de beginstaat.
- Controleer de demo-flow uit PLAN.md sectie 10: cliënt schrijft een logboekentry, vinkt een opdracht af, neemt iets mee naar de sessie. De psycholoog ziet het meteen in Vandaag en in het dossier. Niet-gedeelde entries verschijnen nergens bij de psycholoog.

### 9. Code opruimen
Componenten consistent, dubbele code weg, alle data enkel via `/lib/data/`, types kloppen. Klaar om later een backend in te pluggen.

### 10. Eindrapport
Schrijf `SUMMARY.md`: wat is gedaan per fase, wat niet, wat je twijfelachtig vond, en de 5 dingen die Jasper eerst zou moeten bekijken.

---

## Grenzen
- Enkel fase 1: interface met mockdata. Geen echte backend, login, betalingen of externe diensten.
- Geen nieuwe zware dependencies zonder goede reden (noteer in DECISIONS.md).
- Als je klaar bent met fase 10 en er is nog tijd: ga een tweede polish-ronde door fase 3 en 4, scherm per scherm, en noteer wat je verbeterde in SUMMARY.md.
