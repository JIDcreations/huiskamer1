# Huiskamer: interface-plan

> Praktijkplatform voor psychologen en hun cliënten.
> Fase 1: **enkel de interface**. Klikbaar prototype met mockdata, geen echte backend, geen echte betalingen, geen echte login.

---

## 1. Het idee in één zin

Eén warme, rustige plek waar psycholoog en cliënt **afspraken, betalingen, opdrachten, een logboek en een gedeelde schrijfruimte** samen hebben, zodat de psycholoog ook **tussen de sessies door** kan meevolgen. Denk: Rosa (afspraken) + Notion (schrijven) + een takenlijst, maar dan voor één praktijk.

## 2. Rollen

| Rol | Device-focus | Kern |
|---|---|---|
| **Psycholoog** | Desktop first, werkt ook op tablet | Overzicht over alle cliënten, planning, opdrachten geven, meelezen, notities, facturen |
| **Cliënt** | Webplatform, desktop first, volledig responsive (geen app-gevoel) | Check-in en opdrachten van vandaag, logboek bijhouden, sessies voorbereiden en nalezen, betalen |

Voor het prototype: een **rolwissel** (kleine toggle op de loginpagina en rechtsonder) zodat je beide kanten kan demonstreren.

## 3. Denk in tijd, niet in features

Er is **geen chat**. Geen bubbels, geen typindicator, geen leesbevestigingen, geen druk om snel te antwoorden.

Een cliënt denkt in drie lagen. Dat zijn ook de drie plekken, niet meer:

| Laag | Vraag in het hoofd van de cliënt | Plek |
|---|---|---|
| **Vandaag** | Wat doe ik vandaag? | Vandaag: check-in en de opdrachten die vandaag tellen |
| **Tussen de sessies** | Hoe ging mijn week, wat heb ik geschreven? | Logboek: alles wat de cliënt schrijft, in één tijdlijn |
| **De sessie** | Wat bespraken we, wat nemen we mee? | Sessies: volgende sessie, "Voor volgende keer", voorbije sessies met hun gedeelde pagina |

- **Logboek** bevat drie soorten entries met een klein label: **Check-in** (uit Vandaag), **Notitie** (vrij schrijven) en **Opdracht** (het resultaat van een opdracht). Elke entry is **Gedeeld met Sarah** (standaard) of **Enkel voor mij**, altijd met hetzelfde icoon op dezelfde plek. Elke entry kan je **meenemen naar de sessie**.
- **Sessies** vervangt de losse Tafel en Afspraken. Elke voorbije sessie heeft een gedeelde pagina: **Wat we bespraken** (samenvatting, meestal door de psycholoog), **Wat we afspraken** (de opdrachten uit die sessie) en **Reacties** (beiden schrijven bij, met auteur per blok).
- **Voor volgende keer**: een lijstje per komende sessie. De cliënt zet er entries of korte vragen op, de psycholoog kan er ook iets op zetten.
- **Opdrachten** hebben geen eigen tab. Ze staan in Vandaag (wat nu moet), in Sessies (waar ze vandaan komen) en hun resultaten in het Logboek. Een eenvoudig overzicht "Alle opdrachten" zit onder de avatar.
- **Sessienotities** blijven enkel voor de psycholoog, nooit zichtbaar voor de cliënt, en staan in het dossier naast de gedeelde sessiepagina.

### Ritme van een opdracht
Elke opdracht heeft precies één ritme, altijd in dezelfde vorm:

| Ritme | Label | Verschijnt in Vandaag |
|---|---|---|
| Dagelijks | **Elke dag** | Elke dag |
| Vaste dagen | **Ma, wo, vr** | Enkel op die dagen |
| Flexibel per week | **3x deze week** (met "1 van 3") | Elke dag tot het aantal gehaald is |
| Eenmalig | **Eenmalig, voor zo 27 sep** | Tot het gedaan is of de datum voorbij is |

Invullen gebeurt altijd in een sheet (van onder op mobiel). Gemiste opdrachten verdwijnen stil: geen rood, geen achterstand, geen teller. Een eenmalige opdracht na de deadline staat enkel nog in het overzicht als "Niet gedaan", neutraal.

### Editor (sessiepagina, notities in het Logboek, sessienotities)
- Notion-achtig: blokken, `/`-menu voor kop, tekst, checklist, citaat, scheiding.
- Geen toolbar vol knoppen. Opmaak verschijnt bij selectie (bubble menu).
- Op een sessiepagina toont elk blok subtiel **wie** het schreef (initialen in de marge, tint per persoon) en wanneer.

## 4. Features per rol

### Cliënt
- **Vandaag**: begroeting en datum, check-in "Hoe gaat het vandaag?" (Zwaar, Onrustig, Gaat wel, Rustig, Licht, plus optioneel een zin; wordt een logboekentry), "Voor vandaag" met enkel de opdrachten die vandaag tellen, en hooguit één contextregel (afspraak binnen 2 dagen of een openstaande factuur).
- **Logboek**: weekstrookje (ma t/m zo, check-in en afgewerkte opdrachten), entries per dag, filter Alles, Check-ins, Notities, Opdrachten, knop "Schrijf iets".
- **Sessies**: volgende sessie (verzetten, annuleren met de annulatieregel zichtbaar), "Voor volgende keer", voorbije sessies, "Nieuwe afspraak boeken" in vrije slots.
- **Onder de avatar**: Alle opdrachten, Betalingen (facturen, betalen als demo, attesten), Herinneringen (check-in tijdstip, herinnering voor opdrachten), Privacy (wat gedeeld is, standaard deelinstelling, "Exporteer mijn logboek" als placeholder), Profiel.
- **Onboarding** bij de eerste keer: drie korte schermen (wat is Huiskamer, wat ziet Sarah, herinneringen), overslaan kan.
- **Nood-link**: "Hulp nodig?" altijd in de header, met Zelfmoordlijn **1813** en Tele-Onthaal **106**, plus de melding dat Huiskamer niet voor crisissituaties bedoeld is.

### Psycholoog
- **Vandaag**: afspraken van vandaag, met per cliënt een snelle link naar zijn "Voor volgende keer". Daaronder "Tussen de sessies": wat cliënten deelden.
- **Agenda**: week- en dagweergave, afspraak aanmaken/verzetten/annuleren, type (intake, opvolging, online/fysiek).
- **Cliënten**: lijst met zoeken en filter (actief, gepauzeerd, afgerond).
- **Cliëntdossier** (tabs):
  - *Overzicht*: volgende sessie, "Voor volgende keer", open opdrachten, stemming van de laatste 2 weken als strookje.
  - *Logboek*: enkel gedeelde entries, zelfde tijdlijn en filters als bij de cliënt, optioneel een kanttekening.
  - *Sessies*: per sessie de gedeelde pagina en daarnaast de privé sessienotities (slotje, Oat-vlak). Opdrachten toewijzen gebeurt hier, bij "Wat we afspraken".
  - *Opdrachten*: toewijzen met verplicht ritme, voortgang per opdracht.
  - *Betalingen*: facturen per sessie, status, attest.
- **Opdrachtenbibliotheek**, **Facturatie**, **Instellingen** zoals voorheen.

## 5. Schermen / routes

```
/                           Login + rolwissel (mock)
/p/vandaag                  Psycholoog: dagoverzicht
/p/agenda                   Week/dag
/p/clienten                 Lijst
/p/clienten/[id]            Dossier (tabs: overzicht, logboek, sessies, opdrachten, betalingen)
/p/clienten/[id]/sessies/[sessionId]   Sessiepagina met privénotities
/p/opdrachten               Bibliotheek + sjablonen
/p/facturatie               Overzicht
/p/instellingen

/c/vandaag                  Cliënt: check-in en opdrachten van vandaag
/c/logboek                  Tijdlijn + filters + weekstrookje
/c/logboek/[id]             Entry lezen of schrijven
/c/sessies                  Volgende sessie, Voor volgende keer, voorbije sessies, boeken
/c/sessies/[sessionId]      Sessiepagina: bespraken, afspraken, reacties
/c/opdrachten               Alle opdrachten (onder de avatar)
/c/betalingen               Facturen (onder de avatar)
/c/herinneringen            (onder de avatar)
/c/privacy                  (onder de avatar)
/c/profiel                  (onder de avatar)
/c/welkom                   Onboarding
```

Navigatie: **online platform**. De psycholoog krijgt een vaste sidebar en een witte topbalk met zoeken. De cliënt heeft drie items: **Vandaag, Logboek, Sessies**. Op desktop in de sidebar, op mobiel in een verfijnde **bottom tab bar** (Milk met blur). Rechtsboven de avatar met het menu, en altijd "Hulp nodig?" in de header.

## 6. Datamodel (TypeScript types, voor mockdata en later de backend)

```ts
type Psychologist = { id; name; practiceName; avatarUrl; hourlyRate; sessionMinutes; availability: WeeklySlot[] }
type Client       = { id; firstName; lastName; email; phone; status: 'actief'|'gepauzeerd'|'afgerond'; startedAt; psychologistId }
type Appointment  = { id; clientId; start; end; type: 'intake'|'opvolging'; mode: 'fysiek'|'online'; status: 'gepland'|'voltooid'|'geannuleerd'|'no-show' }

type Block        = { id; type: 'paragraph'|'heading'|'checklist'|'quote'|'divider'; content; authorId; updatedAt; checked?: boolean }

// Sessie = afspraak + gedeelde pagina. De pagina ontstaat bij de eerste keer schrijven.
type SessionPage  = { id; clientId; appointmentId; summary: Block[]; reactions: Block[]; updatedAt }
type SessionNote  = { id; clientId; appointmentId?; createdAt; blocks: Block[] }                          // enkel psycholoog
type AgendaItem   = { id; clientId; appointmentId; text?; journalEntryId?; addedBy; createdAt }          // Voor volgende keer

// Alles wat de cliënt schrijft: check-in, vrije notitie of het resultaat van een opdracht.
type JournalEntry = { id; clientId; kind: 'checkin'|'notitie'|'opdracht'; day; createdAt; title?; blocks: Block[];
                      mood?: 1|2|3|4|5; tags: string[]; taskId?; scale?; sharedWithPsychologist: boolean; psychologistNote? }

type Rhythm       = { kind: 'dagelijks' } | { kind: 'dagen'; days: number[] } | { kind: 'perWeek'; times: number } | { kind: 'eenmalig'; due: Day }
type TaskTemplate = { id; title; description; kind: 'afvinken'|'tekst'|'schaal'|'meditatie'; defaultRhythm?: Rhythm }
type Task         = { id; clientId; appointmentId?; templateId?; title; description; kind; rhythm: Rhythm; until?; createdAt }
// Een opdracht is gedaan op een dag als er een logboekentry van soort 'opdracht' voor die dag bestaat.

type Invoice      = { id; clientId; appointmentId; amount; issuedAt; dueAt; status: 'open'|'betaald'|'vervallen'; attestUrl? }
```

Mockdata: 1 psycholoog, **8 cliënten** met fictieve Vlaamse namen, 3 weken aan afspraken, sessiepagina's met blokken van beide auteurs en gelinkte opdrachten, logboekentries (check-ins, notities, opdracht-antwoorden, mix gedeeld en niet gedeeld), een gevulde "Voor volgende keer". Alles in `/lib/mock/` met een in-memory store (Zustand) zodat acties (afvinken, schrijven, delen) tijdens een demo meteen overal zichtbaar zijn.

## 7. Design direction: Milk, Oat, Taupe

**Referentie**: een neutraal Pinterest-moodboard. Linnen zetel, laptop, daglicht, alles in melk, haver en taupe. Plus een lichte wachtkamer overdag: gebroken witte muren, linnen gordijnen, een plant.

**Gevoel**: rustig, zacht, licht, huiselijk, modern. Monochroom en warm-neutraal. **Het platform is licht**: grote vlakken zijn altijd Milk of Oat. Er is **één** uitstraling: geen light mode, geen dark mode, geen toggle, geen systeeminstelling volgen.

### Palet
| Naam | Hex | Rol |
|---|---|---|
| **Milk** | `#FBF7F4` | Achtergrond, kaarten |
| **Oat** | `#E5DED2` | Vlakken, sidebar, geselecteerd, privénotities, secundaire knoppen |
| **Taupe** | `#A39382` | Accenten, iconen, randen bij focus, badges, voortgang, voltooid |
| **Mocha** | `#685D54` | Primaire knoppen, secundaire tekst, actieve navigatie |
| **Charcoal** | `#232323` | Enkel tekst (koppen en body). Nooit als vlak. |

### Tokens (CSS variables)
| Token | Waarde |
|---|---|
| `--bg` | `#FBF7F4` (Milk) |
| `--surface` | `#FFFFFF` bij kaarten op Milk, of Milk op een Oat-vlak |
| `--surface-2` | `#E5DED2` (Oat) |
| `--oat-soft` | `#F1ECE4` (tussen Milk en Oat, voor hover) |
| `--text` | `#232323` (Charcoal) |
| `--text-muted` | `#685D54` (Mocha) |
| `--text-faint` | `#A39382` (Taupe) |
| `--line` | `#E5DED2` (Oat) |
| `--accent` | `#685D54` (Mocha), Milk-tekst erop |
| `--accent-soft` | `#E5DED2` (Oat) |
| `--calm` | `#A39382` (Taupe) voor voltooid |
| `--author-psy` | `#685D54` (Mocha) |
| `--author-client` | `#A39382` (Taupe) |

Regels:
- **Geen donkere vlakken.** Charcoal en Mocha zijn voor tekst, knoppen en kleine elementen. Achtergronden, kaarten, sidebar, tab bar en sheets zijn altijd Milk, wit of Oat.
- Geen extra kleuren buiten dit palet. Status toon je met vorm en gewicht (gevuld vs outline, Taupe vs Mocha), niet met groen of rood.
- Enige uitzondering: de nood-link mag een heel zachte terracotta tint (`#C9A08E`) krijgen zodat die vindbaar is.
- Leesbaarheid: body in Charcoal, secundair in Mocha. Taupe enkel voor labels, iconen en grote tekst.

### Typografie
- **Enkel sans-serif.** Koppen in **Inter** semibold met iets strakkere letterafstand, sober en zakelijk-warm. Geen serif.
- UI en tekst: **Inter** (of `-apple-system`), 15-16px basis, ruime regelhoogte (1.6 in de editor).
- Editor-leesbreedte max ~680px, gecentreerd.

### Vorm en diepte
- Radius: 14px kaarten, 999px pills en knoppen, 20px sheets/modals.
- Schaduwen: nauwelijks zichtbaar, als daglicht (`0 1px 2px rgba(31,30,28,.03), 0 6px 20px rgba(31,30,28,.04)`). Kaarten onderscheiden zich vooral door wit op gebroken wit.
- Sidebar en topbalk wit met een dunne Oat-lijn, inhoud op Milk. Blur enkel op de topbalk bij scrollen.
- Iconen: functioneel en dun (Lucide, stroke 1.5). **Geen decoratieve iconen, geen emoji's.**

### Beweging
- Framer Motion, kort en zacht (200-300ms, ease-out). Sheets schuiven van onder op mobiel. Afvinken krijgt één subtiele animatie, geen confetti.

### Copy
- Nederlands, Vlaams, **je/jij**, kort en warm: "Goeiemorgen, Lotte", "Hoe gaat het vandaag?", "Voor volgende keer", "Gedeeld met Sarah".
- Leeg-states rustig en zonder schuldgevoel: "Nog niets geschreven deze week. Geen druk."

## 8. Tech stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** met de tokens hierboven als theme
- **shadcn/ui** als basis, volledig herstyled (de default look mag nergens overblijven)
- **Tiptap** voor de Notion-achtige editor (slash-menu, bubble menu, checklist), één gedeelde `<Editor />` component voor sessiepagina's, Logboek en Sessienotities, met een prop voor auteur-markering
- **Framer Motion**, **date-fns** (locale `nl-BE`), **Zustand** voor de mock store
- Kalender: eigen lichte week/dagview in plaats van een zware library
- Geen backend in fase 1. Alle data via `/lib/data/` functies, componenten praten nooit rechtstreeks met mockbestanden, zodat een echte API later makkelijk inplugt.

Later (niet nu bouwen, wel rekening mee houden): EU-hosting (bv. Supabase EU), Mollie voor betalingen (Bancontact), GDPR-proof opzet want dit zijn gezondheidsgegevens, en eventueel realtime samen schrijven op een sessiepagina.

## 9. Bouwvolgorde

1. **Fundament**: project opzetten, tokens, fonts, basiscomponenten (Button, Card, Input, Tabs, Sheet, Avatar, Badge, EmptyState, Toggle).
2. **Layouts**: gedeelde platform-shell (sidebar + topbalk) voor psycholoog en cliënt, rolwissel.
3. **Editor**: de gedeelde Tiptap-component met slash-menu, bubble menu, checklist en auteur-markering. Eerst goed krijgen, want drie plekken hangen ervan af.
4. **Mockdata + store**.
5. **Cliëntomgeving**: Vandaag, Logboek, Sessies, sheets voor opdrachten, onboarding, avatar-menu, nood-link.
6. **Psycholoog**: Vandaag, Cliëntenlijst, **Cliëntdossier met tijdlijn**, Agenda, Opdrachtenbibliotheek, Facturatie, Instellingen.
7. **Polish**: animaties, leeg-states, responsive check (375px, 768px, 1440px), toegankelijkheid (focus states, contrast AA, toetsenbord).

## 10. Klaar wanneer

- Alle routes uit sectie 5 bestaan en zijn klikbaar met mockdata.
- Nergens een chat-interface: geen bubbels, geen typindicator, geen leesbevestigingen.
- De cliënt heeft drie plekken: Vandaag, Logboek en Sessies. Geen enkele opdracht staat twee keer op dezelfde pagina.
- Demo werkt end-to-end: cliënt schrijft een logboekentry, vinkt een opdracht af en neemt iets mee naar de sessie. De psycholoog ziet het meteen in "Vandaag" en in het dossier.
- Niet-gedeelde logboekentries verschijnen nergens bij de psycholoog.
- Sessienotities zijn visueel anders en nergens zichtbaar in de cliëntomgeving.
- Beide kanten voelen als één rustig online platform, op desktop en op smalle schermen.
- Geen emoji's, geen decoratieve iconen, geen em dashes in de copy.

## 11. Instructie voor Claude Code

Lees dit hele plan eerst. Werk de bouwvolgorde stap voor stap af en toon na stap 1, 2 en 3 het resultaat voor je verdergaat. Kies bij twijfel altijd voor minder: minder elementen, meer witruimte, kortere tekst.
