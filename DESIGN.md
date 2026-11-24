---
name: Huiskamer
description: Een moodboard waarin je woont. Latte, linnen en espresso voor psycholoog en cliënt.
colors:
  paper: "#f5f0e8"
  cream: "#fbf8f3"
  sand: "#e9e0d3"
  oat-soft: "#efe8de"
  side: "#efe8dd"
  ink: "#2e2520"
  text-muted: "#67584c"
  text-faint: "#766658"
  taupe: "#ae9c88"
  edge: "rgba(46, 37, 32, 0.09)"
  edge-strong: "rgba(46, 37, 32, 0.2)"
  pine: "#3b2f28"
  pine-deep: "#2b221d"
  on-accent: "#f8f3ec"
  sun: "#d9bc8c"
  sun-soft: "#f1e6d2"
  sun-ink: "#6a4e2c"
  moss: "#e2e3d5"
  clay: "#b07355"
  clay-soft: "#f0e0d6"
  clay-ink: "#8a4a30"
  sky-soft: "#e2e4e3"
  sky-ink: "#4a5560"
  plum-soft: "#ece0de"
  plum-ink: "#6e4e52"
  mood-1: "#7b8692"
  mood-2: "#a48795"
  mood-3: "#c39a7c"
  mood-4: "#a2a88c"
  mood-5: "#d9b77a"
typography:
  hero:
    fontFamily: "Bodoni Moda, Iowan Old Style, Georgia, serif"
    fontSize: "46px (76px vanaf 768px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "\"opsz\" 72"
  title:
    fontFamily: "Bodoni Moda, Iowan Old Style, Georgia, serif"
    fontSize: "34px (50px vanaf 768px)"
    fontWeight: 420
    lineHeight: 1.04
    letterSpacing: "-0.015em"
    fontVariation: "\"opsz\" 40"
  subtitle:
    fontFamily: "Bodoni Moda, Iowan Old Style, Georgia, serif"
    fontSize: "25px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-0.005em"
    fontVariation: "\"opsz\" 14"
  display-inline:
    fontFamily: "Bodoni Moda, Iowan Old Style, Georgia, serif"
    fontSize: "18px-24px"
    fontWeight: 450
    lineHeight: 1.1
    letterSpacing: "-0.005em"
    fontFeature: "lnum"
    fontVariation: "\"opsz\" 18"
  body:
    fontFamily: "Jost, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "15.5px (16.5px vanaf 768px)"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0.005em"
  ui:
    fontFamily: "Jost, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    letterSpacing: "0.01em"
  label:
    fontFamily: "Jost, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.01em"
  caption:
    fontFamily: "Jost, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  caps:
    fontFamily: "Jost, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "10.5px"
    fontWeight: 500
    letterSpacing: "0.24em"
rounded:
  field: "12px"
  photo: "20px"
  card: "22px"
  sheet: "24px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  card-x: "28px"
  page-x: "40px"
  section: "56px"
components:
  button-primary:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
    typography: "{typography.ui}"
  button-primary-hover:
    backgroundColor: "{colors.pine-deep}"
  button-sun:
    backgroundColor: "{colors.sun}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  button-soft:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.pine}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "32px"
  button-quiet:
    textColor: "{colors.text-muted}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "40px"
  input:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "44px"
  card:
    backgroundColor: "{colors.cream}"
    rounded: "{rounded.card}"
    padding: "24px 28px"
  pin-compact:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.card}"
    padding: "16px 20px"
  segmented-active:
    backgroundColor: "{colors.pine}"
    textColor: "{colors.on-accent}"
    rounded: "{rounded.pill}"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
  badge-kind:
    backgroundColor: "{colors.sun-soft}"
    textColor: "{colors.sun-ink}"
    rounded: "{rounded.pill}"
    padding: "2px 10px"
    typography: "{typography.caption}"
---

# Design System: Huiskamer

## Overview

**Creative North Star: "Het moodboard waarin je woont"**

Huiskamer ziet eruit als een prikbord in een goede Gentse koffiebar: één tonale familie van papier, linnen, latte en espresso, met echte sfeerfoto's in boog- en pinvormen en een modetijdschrift-serif voor alles wat gelezen wordt. Er is geen enkele verzadigde kleur. Betekenis zit in gedempte tinten (honing, salie, poeder-terracotta, mist, mauve) en altijd ook in vorm of woord.

De dichtheid is laag en redactioneel. Koppen zijn groot en zacht (Bodoni Moda, namen cursief), bediening is klein en rustig (Jost, navigatie in kleine letters). Vlakken zijn plat: een haarlijn rond crème op papier, geen gloed. De enige donkere vlakken zijn espresso: de primaire knop, de actieve tab, de kaart van de volgende sessie en vandaag in het weekstrookje.

Het logboek en "Tussen de sessies" zijn prikborden (kolommen, masonry vanaf 768px), en "Bewaar" op een pin betekent: mee naar de sessie.

**Key Characteristics:**
- Eén latte-familie; kleur betekent soort, nooit alarm.
- Bodoni Moda voor koppen, namen, tijden en getallen; Jost voor alles wat je bedient.
- Boogvormen als terugkerend motief: merkteken, kopfoto, dagen in het weekstrookje, lege staat.
- Platte kaarten met een haarlijn; schaduw enkel op wat zweeft.
- Foto's altijd warm gegradeerd en gedempt, nooit mensen in therapie.

## Colors

Een tonale, warme familie zonder felle kleur: papier als grond, crème als kaart, espresso als enige diepe toon, latte als het lichte accent.

Let op: de tokennamen zijn historisch (`pine`, `moss`, `clay`, `sun`) en beschrijven de oude palet. De waarden zijn de nieuwe. Gebruik de namen zoals ze in `src/app/globals.css` staan.

### Primary
- **Espresso** (`pine`): primaire knoppen, actieve segmenten en tabs, avatar van de psycholoog, de kaart "Volgende sessie", vandaag in het weekstrookje, focusring. **Diepe espresso** (`pine-deep`) is enkel de hover- en drukstaat daarvan. Tekst erop is **Melkschuim** (`on-accent`).

### Secondary
- **Latte** (`sun`): het lichte accent. De knop "Schrijf iets", het stipje naast het actieve navigatie-item, een gevulde check-in in het weekstrookje, tekstselectie, het boograam in het merkteken. **Lattevlak** (`sun-soft`) met **Koffiebruin** (`sun-ink`) als tekst: check-ins, "Bewaard", de actieve tab op mobiel, de afspraak die nu bezig is.

### Tertiary
Vaste tint per soort (`src/components/shared/kind.ts`), altijd als zacht vlak met donkere inkt:
- **Salie** (`moss` met `pine` als tekst): opdrachten, rustige badges.
- **Poeder-terracotta** (`clay-soft` met `clay-ink`): notities. `clay` zelf is enkel een bolletje of de auteurskleur van de cliënt, nooit kleine tekst.
- **Mist** (`sky-soft` met `sky-ink`): reacties bij een sessie, schaal-opdrachten.
- **Mauve** (`plum-soft` met `plum-ink`): "Voor volgende keer", meditatie.
- Dezelfde vijf zachte paren zijn de vaste avatartint per cliënt (hash op naam).
- **Stemmingen** (`mood-1` tot `mood-5`): mist, lavendel, latte, salie, honing, van zwaar naar licht. Enkel als bolletjes naast het woord.

### Neutral
- **Papier** (`paper`): de grond van elke pagina, en de kleine pin van een afgevinkte opdracht.
- **Crème** (`cream`): kaarten, panelen, invoervelden, eilanden in de topbalk.
- **Zand** (`sand`): lege bolletjes, scheidingen in menu's, fotoplaceholders, zachte knop.
- **Haver** (`oat-soft`): hover-vlak van rijen, menu-items en stille knoppen.
- **Linnen** (`side`): de zijbalk en het moodboard bij het aanmelden.
- **Espresso-inkt** (`ink`): tekst. **Mokka** (`text-muted`) voor secundaire tekst, **Grijsbruin** (`text-faint`) voor tijden en hints.
- **Taupe** (`taupe`): iconen, onderstreping van links, randen van selectievakjes. Geen tekst.
- **Haarlijn** (`edge`, `edge-strong`): de rand van elke kaart en elk eiland; de sterke variant voor velden, secundaire knoppen en kaart-hover.

### Named Rules
**De Eén-Familie-Regel.** Geen verzadigde kleur, nergens. Een nieuwe tint is een gedempt vlak met een eigen donkere inkt, of ze komt er niet in.

**De Soort-Is-Tint-Regel.** Check-in is latte, opdracht is salie, notitie is terracotta, reactie is mist, "Voor volgende keer" is mauve. Overal dezelfde, altijd samen met een label of icoon.

**De Espresso-Schaarste-Regel.** Donkere vlakken zijn enkel actie of "nu": de primaire knop, het actieve segment, de volgende sessie, vandaag. Geen donkere zijbalk, geen donkere banden.

## Typography

**Display Font:** Bodoni Moda (variabel, optische maat; fallback Iowan Old Style, Georgia)
**Body Font:** Jost (variabel; fallback systeem-sans)

Beide zelf gehost via `next/font/local`, zonder verzoek naar derden.

**Character:** Een modetijdschrift-serif met hoog contrast voor wat je leest, naast een geometrische, lichte sans voor wat je bedient. Cursief is de stem van het persoonlijke: namen, de tweede helft van een kop, korte pins.

### Hierarchy
- **Hero** (400, 46px / 76px vanaf 768px, lh 1, opsz 72): de begroeting en de paginatitel met kopcollage. Naam in cursief.
- **Title** (420, 34px / 50px, lh 1.04, opsz 40): paginatitels zonder beeld, sectiekoppen zoals "Tussen de *sessies*".
- **Subtitle** (500, 25px, lh 1.15): paneeltitels, titel van een notitie-pin.
- **Display inline** (450, 18-24px, lining nums): dagkoppen in het logboek (24px), cliëntnamen op het prikbord (21px), tijden in de dagagenda (21px), de regel onder een titel (18-22px, `text-muted`), korte pins in cursief (19px), stemmingswoorden (18-19px).
- **Body** (400, 15.5px / 16.5px, lh 1.6): lopende tekst; de editor op 16px, lh 1.6. Begeleidende alinea's tot `max-w-xl`.
- **UI** (400, 14px, 0.01em): knoppen, menu-items, namen in lijsten (500).
- **Label** (400-500, 13px): veldlabels, metaregel van een pin (soort, tijd, deelicoon), segmenten klein.
- **Caption** (400-500, 12px): badges, subregels in de agenda, weekdagletters.
- **Caps** (500, 10.5px, 0.24em, hoofdletters): enkel de praktijknaam of context onder het woordmerk in de zijbalk.

### Named Rules
**De Lezen-Of-Bedienen-Regel.** Wat je leest of herkent (koppen, namen, tijden, getallen, woorden van een stemming) staat in Bodoni Moda. Wat je aanklikt of invult staat in Jost.

**De Onder-De-Kop-Regel.** De contextregel (datum, "Bij Sarah Peeters") staat onder de titel, in de serif en gedempt. Nooit een klein label boven een kop.

**De Kleine-Letter-Navigatie-Regel.** Navigatie-items in zijbalk en tab bar staan in kleine letters.

## Layout

- **Shell:** vaste zijbalk van 264px vanaf 1024px, in linnen met een haarlijn rechts. Daaronder: cliënt krijgt een tab bar onderaan (66px hoog, drie items), psycholoog een lade (280px).
- **Topbalk:** 72px, sticky, doorzichtig bovenaan. Zodra je scrolt wordt hij papier met een haarlijn onderaan. Rechts één eiland (48px) met de acties en het accountmenu.
- **Inhoud:** maximaal 1280px, zijmarge 16px en 40px vanaf 768px, onderaan 96px (128px boven de tab bar).
- **Kop:** links de hero-titel, rechts vanaf 1024px een collage van 400 x 318px (hoge boog van 226px plus een kleiner beeld van 166 x 208px dat ertegen leunt). Onder 1024px één fotoband van 176-224px hoog boven de titel.
- **Ritme:** gaps van 8, 12, 16 en 20px; secties 40-56px uit elkaar; panelen 20px / 28px binnenmarge, pins 20-24px.
- **Prikbord:** CSS-kolommen, 2 vanaf 768px, 3 vanaf 1280px bij het overzicht van de psycholoog. Pins breken niet over kolommen en staan 16px onder elkaar.
- **Twee kolommen:** dagagenda "Vandaag" en "Morgen" naast elkaar vanaf 1024px; cliëntpagina's hebben werk links en context (deze week, wat ziet Sarah) rechts.
- **Breakpoints:** 768px (typeschaal, kolommen), 1024px (zijbalk, collage), 1280px (derde kolom).

## Elevation & Depth

Plat. Diepte komt van tonale lagen (papier, crème, linnen) en een haarlijn van 1px (`edge`). Een kaart die je kan aanklikken krijgt bij hover de sterkere haarlijn, geen schaduw en geen verplaatsing.

### Shadow Vocabulary
- **Haarlijn** (`box-shadow: 0 0 0 1px var(--edge)`): elke kaart, pin, eiland, segmentbalk en het actieve navigatie-item.
- **Zwevend** (`box-shadow: 0 1px 2px rgba(46,37,32,0.04), 0 14px 34px -20px rgba(46,37,32,0.22)`): enkel wat boven de pagina zweeft: menu's, slash- en bubble-menu, sheets, lade, toasts, de demowissel, en een agendablok bij hover.

### Named Rules
**De Plat-Op-Papier-Regel.** Wat op de pagina ligt heeft een haarlijn en geen schaduw. Schaduw betekent: dit zweeft en gaat weer weg.

## Shapes

- **Rond en zacht:** kaarten en pins 22px, sheets 24px, fotopins 20-22px, velden en menu's 12px.
- **Pil:** alle knoppen, segmenten, navigatie-items, eilanden, badges en avatars zijn volledig rond.
- **De boog:** bovenkant volledig rond, onderkant 16-22px. Het merkteken is een boograam met latte vulling en een dun espresso binnenraam. De boog keert terug in de grote kopfoto, de dagen van het weekstrookje, enkele fotopins bij het aanmelden en in de kennismaking, de datumtegel van een sessie en de kleine boog in een lege staat.
- **Foto's:** altijd `object-cover` in een afgerond kader op een zandkleurige placeholder, met de warme grade (`sepia 0.14, saturate 0.82, contrast 0.96, brightness 1.02`). Het leunende beeld in de collage krijgt een rand van 7px in papierkleur.
- **Iconen:** Lucide, dunne lijn (1.25 in navigatie en knoppen, 1.5-1.75 in kleine statusiconen), taupe in rust.

### Named Rules
**De Boog-Regel.** Eén signatuurvorm: de boog. Een nieuw herkenbaar element mag een boog zijn; geen nieuwe decoratieve vormen ernaast.

## Components

### Buttons
Rustig en tactiel: een pil die bij indrukken 2% krimpt.
- **Shape:** volledig rond (999px). Groottes 32px (13px tekst), 40px (14px), 48px (15px). Iconen 18px, lijn 1.25.
- **Primary:** espresso met melkschuimtekst; hover en druk worden diepe espresso.
- **Sun:** latte met inkt; de lichte schrijfactie ("Schrijf iets").
- **Secondary / Outline:** crème of transparant met een sterke haarlijn binnenin; hover haver.
- **Soft:** zand op 70% met espressotekst ("Oudere dagen tonen").
- **Ghost / Quiet:** geen vlak; hover haver.
- **Focus:** ring van 1px espresso met 2px afstand. Disabled op 40% dekking.
- **Overgang:** 200ms, `cubic-bezier(0.22, 1, 0.36, 1)`.

### Chips / Badges
- **Style:** pil, 12px, 500, zacht vlak met donkere inkt uit de soort-tinten; `outline` is een sterke haarlijn zonder vlak.
- **Link-chip:** "Voor volgende keer (n)" in mauve; hover keert om naar mauve-inkt met melkschuimtekst.

### Cards / Containers
- **Corner Style:** 22px.
- **Background:** crème; een compacte pin (afgevinkte opdracht zonder tekst) staat op papier.
- **Shadow Strategy:** haarlijn; zie Elevation.
- **Internal Padding:** paneel 20px / 28px vanaf 768px met de titel in subtitle; pin 20px / 24px.
- **Volgende sessie:** de enige espresso kaart, met de dag in cursieve Bodoni (44px).

### Inputs / Fields
- **Style:** crème, 12px radius, 44px hoog, 15px tekst, sterke haarlijn binnenin; hover taupe-haarlijn.
- **Focus:** espresso-lijn van 1.5px binnenin plus een zachte halo van 4px.
- **Error:** de lijn wordt `clay-ink`. Disabled op 50%.
- **Label:** 13px, 500, mokka, 6px boven het veld.

### Navigation
- **Zijbalk:** linnen, woordmerk (Bodoni Moda cursief, 30px) boven de praktijknaam in caps. Items 44px, pil, 15px, kleine letters, taupe icoon. Actief: crème pil met haarlijn en een latte stipje rechts. Hover: 5% inkt.
- **Tab bar (cliënt, mobiel):** papier met haarlijn bovenaan, drie items van 66px, 12px kleine letters. Actief: een latte-pil achter het icoon die meeschuift (250ms).
- **Topbalk-eilanden:** crème pillen met haarlijn; accountmenu met avatar, naam en rol.
- **Segmented control:** crème pil met haarlijn, actieve keuze is een schuivende espresso pil (220ms).

### Prikbord-pin met Bewaar (signatuur)
Een logboekentry als pin. Metaregel bovenaan: soortbolletje, label, tijd, deelicoon (enkel bij de cliënt). Titel in subtitle, tekst tot vijf regels; een korte entry zonder tekst wordt een kleine pin met één cursieve regel. Rechtsboven verschijnt bij hover "Bewaar" als espresso pil; eenmaal bewaard blijft "Bewaard" in latte staan en wisselt het woord met een korte verticale overgang (280ms). Onderaan, achter een haarlijn, "Mee naar de sessie van ..." en een eventuele kanttekening.

### Weekstrookje
Zeven bogen naast elkaar; vandaag is espresso. Een gevulde lattecirkel is een check-in, kleine taupe stipjes zijn afgewerkte opdrachten (maximaal vier).

### Stemming
Vijf woorden in Bodoni Moda met elk een bolletje in hun stemmingskleur. Gekozen: cursief op een vlak van 22% van die kleur in crème. In lijsten: vijf bolletjes van 7px, gevuld tot de stemming, plus het woord.

### Editor
Tiptap op 16px, lh 1.6. Koppen in de editor zijn Jost 600 (21px en 17px). Auteursinitialen in een cirkel van 22px in de marge: psycholoog op zand, cliënt op crème met taupe rand. Selectievakjes 18px, radius 6px, afgevinkt espresso met één kleine krimpanimatie (260ms).

## Do's and Don'ts

### Do:
- **Do** zet elke pagina op papier en elke kaart op crème met een haarlijn van 1px.
- **Do** gebruik espresso enkel voor de primaire actie, het actieve segment, de volgende sessie en vandaag.
- **Do** geef elke soort zijn vaste zachte tint en zet er altijd een woord of icoon bij.
- **Do** zet namen, tijden en getallen in Bodoni Moda, de naam in een begroeting cursief.
- **Do** zet de contextregel onder de titel, in de serif en gedempt.
- **Do** kader foto's afgerond of als boog, met de warme grade en een beschrijvende alt-tekst.
- **Do** houd beweging tussen 180 en 300ms met `cubic-bezier(0.22, 1, 0.36, 1)`.

### Don't:
- **Don't** gebruik verzadigde kleur, ook niet voor fouten of urgentie; urgent is `clay-ink`.
- **Don't** maak een donkere zijbalk, donkere banden of gekleurde statistiektegels.
- **Don't** leg schaduw onder iets dat op de pagina ligt; schaduw is voor wat zweeft.
- **Don't** maak de topbalk of eilanden doorschijnend glas; bij scrollen wordt de balk effen papier.
- **Don't** zet een klein label in hoofdletters boven een kop; caps zijn enkel voor de praktijknaam onder het woordmerk.
- **Don't** gebruik `clay` of `taupe` als kleine tekst; gebruik `clay-ink` of `text-muted`.
- **Don't** leg een groene of gekleurde waas over foto's.
