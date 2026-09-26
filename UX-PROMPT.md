# Huiskamer: UX-herwerking

Lees eerst PLAN.md en bekijk de huidige code, zodat je weet wat er staat. Deze ronde gaat **enkel over UX en structuur**, niet over stijl. Kleuren, fonts en componenten blijven zoals ze zijn, tenzij een structuurwijziging iets anders vraagt.

Werk PLAN.md bij met de nieuwe structuur (secties 3, 4 en 5) voor je begint te bouwen, zodat het plan en de code weer overeenkomen.

---

## Het probleem

De cliëntkant voelt chaotisch. Drie oorzaken:

1. **Te veel plekken om te schrijven.** Er zijn er eigenlijk vier: Tafel, Logboek, de check-in "Hoe gaat het vandaag?" op Home, en opdrachten zoals Dankbaarheidslijst en Slaaplogboek, die zelf ook een soort logboek zijn. Een cliënt weet niet waar iets thuishoort.
2. **Opdrachten zijn onduidelijk.** Drie ritmes (elke dag, ma/wo/vr, eenmalig tegen zondag) staan door elkaar in één lijst. Dezelfde opdracht staat twee keer op de pagina (onder Vandaag en onder Deze week). Het is niet duidelijk of iets per dag of per week telt.
3. **Home herhaalt alles.** Afspraak, opdrachten, check-in, Tafel, betalingen. Er is geen rustig startpunt.

De cliënt is iemand die in therapie zit. Die moet in twee seconden weten wat er van hem verwacht wordt, en het mag nooit voelen als een to-do app vol achterstand.

## Het nieuwe mentale model: denk in tijd, niet in features

Een cliënt denkt in drie lagen:

| Laag | Vraag in het hoofd van de cliënt | Tab |
|---|---|---|
| **Vandaag** | Wat doe ik vandaag? | Vandaag |
| **Tussen de sessies** | Hoe ging mijn week, wat heb ik geschreven? | Logboek |
| **De sessie** | Wat bespraken we, wat nemen we mee naar de volgende keer? | Sessies |

Dat worden de **drie tabs** van de cliënt-app. Niet meer.

---

## Cliënt: nieuwe structuur

### Navigatie
- Mobiel: **bottom tab bar** met drie tabs: **Vandaag, Logboek, Sessies**. Geen hamburger.
- Desktop: dezelfde drie items in de sidebar.
- Rechtsboven: avatar. Daaronder zitten **Betalingen**, **Profiel**, **Herinneringen** en **Privacy**. Betalingen is geen tab meer.
- De knop "Hulp nodig?" blijft altijd zichtbaar in de header.

### Tab 1: Vandaag
Eén rustig dagritueel, van boven naar onder:

1. **Begroeting** + datum.
2. **Check-in**: "Hoe gaat het vandaag?" met de vijf woorden (Zwaar, Onrustig, Gaat wel, Rustig, Licht) en een optioneel tekstveld. Opslaan maakt een **logboekentry** aan. Als de check-in vandaag al gedaan is, toon je een compacte samenvatting ("Vandaag: Rustig") met een link om aan te vullen.
3. **Voor vandaag**: enkel de opdrachten die vandaag tellen (zie regels hieronder). Elk item is één rij met titel, ritme-label en één actie. Afgewerkt schuift zacht naar onder of vervaagt.
4. **Eén contextregel** onderaan, enkel als relevant: de volgende afspraak als die binnen 2 dagen valt, of een openstaande factuur. Maximaal één regel, geen grote kaarten.

Verwijder van deze pagina: het grote "Nieuw op de Tafel"-blok, het weekoverzicht, de schaal 1 tot 10 inline (die opent in een sheet), en de grote afspraakkaart.

Als alles gedaan is: rustige lege staat, bv. "Klaar voor vandaag. Goed gedaan." Geen confetti.

### Tab 2: Logboek
**Alles wat de cliënt schrijft komt hier terecht.** Eén tijdlijn, nieuwste bovenaan.

- Bovenaan: **weekstrookje** (ma t/m zo) met per dag een bolletje voor de check-in en kleine stipjes voor afgewerkte opdrachten. Dit is de enige plek waar weekvoortgang staat.
- Daaronder: de entries, gegroepeerd per dag.
- Soorten entries, allemaal in dezelfde lijst met een klein label:
  - **Check-in** (uit Vandaag)
  - **Vrije notitie** (knop "Schrijf iets")
  - **Opdracht-antwoord**: het invullen van Dankbaarheidslijst, Slaaplogboek, Gedachtenschema enz. wordt een entry met het label van die opdracht. Er is dus geen apart antwoordenscherm meer.
- Filter bovenaan (klein, pills): Alles, Check-ins, Notities, Opdrachten.
- Elke entry toont duidelijk **Gedeeld met Sarah** of **Enkel voor mij**, altijd met hetzelfde icoon en dezelfde plek. Wisselen kan in de entry zelf.
- Elke entry heeft een actie **"Neem mee naar de sessie"**. Die voegt de entry toe aan het lijstje "Voor volgende keer" van de eerstvolgende sessie (zie Sessies). Toon daarna een klein label "Op de agenda voor 28 sep".

### Tab 3: Sessies (vervangt Tafel en Afspraken)
De Tafel verdwijnt als losse plek. Gedeelde pagina's hangen voortaan **aan een sessie**.

Bovenaan:
- **Volgende sessie**: datum, uur, locatie of online-link, knoppen Verzetten en Annuleren (met de annulatieregel zichtbaar).
- Daaronder **"Voor volgende keer"**: de lijst van dingen die de cliënt wil bespreken. Bevat entries die via "Neem mee naar de sessie" zijn toegevoegd, plus een veld om snel een vraag te typen. De psycholoog kan hier ook iets zetten.

Daaronder:
- **Voorbije sessies**, nieuwste bovenaan. Elke sessie opent een pagina met:
  - **Wat we bespraken** (samenvatting, meestal door de psycholoog)
  - **Wat we afspraken**: de opdrachten die uit deze sessie komen, gelinkt naar de echte opdrachten
  - **Reacties**: de cliënt kan eronder bijschrijven (dit is wat de Tafel deed)
- Een knop **"Nieuwe afspraak boeken"** die vrije slots toont.

De Notion-achtige editor blijft, maar wordt nu gebruikt binnen een sessiepagina en voor vrije notities in het Logboek.

### Opdrachten: regels
Opdrachten hebben geen eigen tab meer. Ze leven in **Vandaag** (wat nu moet), in **Sessies** (waar ze vandaan komen) en hun resultaten in **Logboek**. Voeg wel onder de avatar of via een link in Vandaag "Alle opdrachten" een eenvoudig overzicht toe.

Elke opdracht heeft **precies één ritme**, altijd zichtbaar als label in dezelfde vorm:

| Ritme | Label | Verschijnt in Vandaag |
|---|---|---|
| Dagelijks | **Elke dag** | Elke dag |
| Vaste dagen | **Ma, wo, vr** | Enkel op die dagen |
| Flexibel per week | **3x deze week** (met voortgang "1 van 3") | Elke dag tot het aantal gehaald is |
| Eenmalig | **Eenmalig, voor zo 27 sep** | Tot het gedaan is of de datum voorbij is |

Verder:
- Geen enkele opdracht staat twee keer op dezelfde pagina.
- Invullen gebeurt altijd in een **sheet** (van onder op mobiel): titel, uitleg van de psycholoog, het invulveld of de schaal, de deel-toggle, opslaan. Na opslaan staat het resultaat in het Logboek.
- Meditatie: sheet met een simpele timer, na afloop optioneel een regel "Hoe was het?".
- **Gemiste opdrachten verdwijnen stil.** Geen rode kleur, geen "achterstand", geen teller van gemiste dagen. Een eenmalige opdracht na de deadline verdwijnt uit Vandaag en blijft enkel zichtbaar in het overzicht als "Niet gedaan", neutraal.

### Nieuw: onboarding (eerste keer)
Drie korte schermen bij de eerste login, overslaan kan:
1. **Wat is Huiskamer**: "Een rustige plek voor jou en Sarah, tussen de sessies door."
2. **Wat ziet Sarah**: uitleg van Gedeeld en Enkel voor mij, met hetzelfde icoon als in de app. Standaard gedeeld, altijd per entry aan te passen.
3. **Herinneringen**: wil je een seintje voor je check-in, en hoe laat? (Kan ook later.)

### Nieuw onder de avatar
- **Betalingen**: facturen, betalen, attesten.
- **Herinneringen**: check-in tijdstip, herinnering voor opdrachten aan/uit.
- **Privacy**: overzicht van wat gedeeld is, standaard deelinstelling, en "Exporteer mijn logboek" (placeholder).
- **Profiel**.

---

## Psycholoog: meetrekken in dezelfde logica

De psycholoogkant is al sterker, maar moet dezelfde drie lagen volgen zodat beide kanten dezelfde taal spreken.

- **Vandaag** blijft. "Tussen de sessies" (wat cliënten deelden) is het sterkste blok, behoud dat. Voeg per cliënt die vandaag komt een snelle link toe naar zijn **"Voor volgende keer"-lijst**, zodat de psycholoog zich kan voorbereiden.
- **Cliëntdossier**: herschik de tabs naar
  - **Overzicht**: volgende sessie, "Voor volgende keer", open opdrachten, stemming van de laatste 2 weken als simpel strookje.
  - **Logboek**: enkel gedeelde entries, zelfde tijdlijn en filters als bij de cliënt.
  - **Sessies**: per sessie de gedeelde pagina (wat we bespraken, wat we afspraken, reacties) plus daarnaast de **privé sessienotities**, visueel duidelijk anders.
  - **Opdrachten**: toewijzen met verplicht een ritme uit de tabel hierboven, en voortgang per opdracht.
  - **Betalingen**.
- Opdrachten toewijzen gebeurt bij voorkeur **vanuit een sessiepagina** ("Wat we afspraken" + "Opdracht toevoegen"), zodat elke opdracht aan een sessie hangt.
- Verwijder de losse Tafel-tab uit het dossier; die zit nu in Sessies.

---

## Algemene UX-regels

- **Eén ding per scherm.** Elke pagina heeft één duidelijke hoofdactie.
- **Nooit dezelfde info twee keer** op één pagina.
- **Altijd duidelijk wat gedeeld is.** Eén icoon, één formulering ("Gedeeld met Sarah" / "Enkel voor mij"), overal op dezelfde plek.
- **Geen schuld.** Geen rode achterstanden, geen streaks die breken, geen "je hebt 3 dagen gemist".
- **Weinig tekst per rij.** Titel + één label. Uitleg zit in de sheet, niet in de lijst.
- **Consistente labels** voor ritmes en datums, zoals in de tabel hierboven.
- **Lege staten** zijn rustig en geven één volgende stap.
- Mockdata aanpassen aan de nieuwe structuur: sessiepagina's met opdrachten eraan gelinkt, opdracht-antwoorden als logboekentries, een gevulde "Voor volgende keer"-lijst. Tijdstippen van de psycholoog tussen 9u en 18u.

## Werkwijze

1. Werk **PLAN.md** bij met deze structuur.
2. Pas de **datamodellen** en mockdata aan (Session met gedeelde pagina en gelinkte opdrachten, opdracht-antwoord als JournalEntry, AgendaItem voor "Voor volgende keer", verplicht ritme op Task).
3. Bouw de **cliëntkant** om: navigatie, Vandaag, Logboek, Sessies, sheets voor opdrachten, onboarding, avatar-menu.
4. **Stop en toon het resultaat** voor je aan de psycholoogkant begint.
5. Daarna de **psycholoogkant**.

Kies bij twijfel altijd voor minder: minder plekken, minder tekst, minder keuzes.
