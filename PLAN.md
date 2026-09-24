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
| **Cliënt** | Webplatform, desktop first, volledig responsive (geen app-gevoel) | Afspraak zien/boeken, opdrachten doen, logboek bijhouden, samen schrijven op de Tafel, betalen |

Voor het prototype: een **rolwissel** (kleine toggle op de loginpagina en rechtsonder) zodat je beide kanten kan demonstreren.

## 3. De drie schrijfplekken (belangrijk: apart houden)

Er is **geen chat**. Geen bubbels, geen typindicator, geen leesbevestigingen, geen druk om snel te antwoorden. In de plaats komen drie duidelijk gescheiden plekken, allemaal met hetzelfde rustige, Notion-achtige schrijfgevoel:

| Plek | Wie schrijft | Wie leest | Wat |
|---|---|---|---|
| **Tafel** | Psycholoog + cliënt | Beiden | Gedeelde pagina's per cliënt. Samenvatting na een sessie, afspraken, een vraag voor volgende keer, een link naar een oefening. Je schrijft aan dezelfde pagina, niet in een gesprek. |
| **Logboek** | Cliënt | Cliënt, en psycholoog **enkel als gedeeld** | Notities doorheen de week. Per entry een toggle "Delen met Huiskamer-psycholoog" (standaard aan, altijd zichtbaar). |
| **Opdrachten** | Psycholoog maakt, cliënt voert uit | Beiden | Concrete taken met deadline of herhaling. Afvinken, kort antwoord, schaal. Blijft een takenlijst, geen vrije tekst. |

En los daarvan: **Sessienotities**, enkel voor de psycholoog, nooit zichtbaar voor de cliënt.

### Editor (Tafel, Logboek, Sessienotities)
- Notion-achtig: blokken, `/`-menu voor kop, tekst, checklist, citaat, scheiding.
- Geen toolbar vol knoppen. Opmaak verschijnt bij selectie (bubble menu).
- Elke Tafel-pagina toont per blok subtiel **wie** het schreef (kleine initialen in de marge, kleurtint per persoon) en wanneer.
- Pagina's in een eenvoudige lijst links (desktop) of als lijst boven de pagina (smal scherm), nieuwste bovenaan, vastpinnen mogelijk.
- Een kleine melding "Nieuw op de Tafel" in het overzicht, geen pushgevoel.

## 4. Features per rol

### Psycholoog
- **Vandaag**: afspraken van vandaag, nieuwe gedeelde logboekentries, wijzigingen op de Tafel, afgeronde opdrachten. Rustige lijst, geen dashboard vol grafieken.
- **Agenda**: week- en dagweergave, beschikbaarheid instellen, afspraak aanmaken/verzetten/annuleren, type (intake, opvolging, online/fysiek).
- **Cliënten**: lijst met zoeken en filter (actief, gepauzeerd, afgerond).
- **Cliëntdossier** (tabs):
  - *Overzicht*: volgende afspraak, laatste activiteit, open opdrachten.
  - *Tijdlijn*: alles chronologisch (sessies, logboek, Tafel, opdrachten). Het hart van het dossier: hier zie je wat er tussen twee sessies gebeurde.
  - *Tafel*: de gedeelde pagina's met deze cliënt.
  - *Logboek*: gedeelde entries lezen, optioneel een korte kanttekening plaatsen.
  - *Opdrachten*: toewijzen, deadline, herhaling (bv. dagelijks mediteren), voortgang.
  - *Sessienotities*: privé, visueel duidelijk anders (slotje + `--surface-2` achtergrond).
  - *Betalingen*: facturen per sessie, status, attest.
- **Opdrachtenbibliotheek**: herbruikbare sjablonen (ademhalingsoefening, gedachtenschema, dankbaarheidslijst, slaaplogboek, meditatie 10 min). Types: afvinken, tekstantwoord, schaal 1-10, herhalend.
- **Facturatie**: overzicht open/betaald, factuur bekijken, attest voor mutualiteit downloaden (placeholder).
- **Instellingen**: praktijkgegevens, tarieven, sessieduur, beschikbaarheid, sjablonen.

### Cliënt
- **Home**: begroeting, volgende afspraak (grote kaart), opdrachten van vandaag, wat nieuw is op de Tafel, snelle knop "Schrijf in je logboek".
- **Afspraken**: komende en voorbije, nieuwe boeken in vrije slots, verzetten binnen de annulatieregels.
- **Opdrachten**: per dag/week, afvinken of invullen, zachte voortgang ("3 van 7 dagen"), geen gamification.
- **Logboek**: vrije tekst + optionele stemming (5 zachte niveaus als woorden of kleurbolletjes, geen emoji's) + tags + deel-toggle.
- **Tafel**: gedeelde pagina's met de psycholoog, lezen en bijschrijven.
- **Betalingen**: openstaande facturen, "Betalen" (fake flow in fase 1), historiek, attesten.
- **Nood-link**: discreet maar altijd bereikbaar ("Nu dringend hulp nodig?") met Zelfmoordlijn **1813** en Tele-Onthaal **106**, plus de melding dat Huiskamer niet voor crisissituaties bedoeld is.

## 5. Schermen / routes

```
/                           Login + rolwissel (mock)
/p/vandaag                  Psycholoog: dagoverzicht
/p/agenda                   Week/dag
/p/clienten                 Lijst
/p/clienten/[id]            Dossier (tabs: overzicht, tijdlijn, tafel, logboek, opdrachten, sessienotities, betalingen)
/p/clienten/[id]/tafel/[pageId]
/p/opdrachten               Bibliotheek + sjablonen
/p/facturatie               Overzicht
/p/instellingen

/c/home                     Cliënt: home
/c/afspraken                Lijst + boeken
/c/opdrachten               Lijst + detail/invullen
/c/logboek                  Lijst + nieuwe entry
/c/logboek/[id]
/c/tafel                    Gedeelde pagina's
/c/tafel/[pageId]
/c/betalingen               Facturen
/c/profiel
```

Navigatie: **online platform, geen app** (denk Smartschool of een CRM). Beide rollen krijgen dezelfde shell: vaste sidebar links met gegroepeerde navigatie, witte topbalk met zoeken (psycholoog) of nood-link (cliënt) en een gebruikersmenu rechtsboven. Cliënt-sidebar: Overzicht, Afspraken; *Tussen de sessies*: Tafel, Logboek, Opdrachten; *Administratie*: Betalingen; onderaan Profiel. Op smalle schermen klapt de sidebar in tot een lade van links. Geen bottom tab bar.

## 6. Datamodel (TypeScript types, voor mockdata en later de backend)

```ts
type Psychologist = { id; name; practiceName; avatarUrl; hourlyRate; sessionMinutes; availability: WeeklySlot[] }
type Client       = { id; firstName; lastName; email; phone; status: 'actief'|'gepauzeerd'|'afgerond'; startedAt; psychologistId }
type Appointment  = { id; clientId; start; end; type: 'intake'|'opvolging'; mode: 'fysiek'|'online'; status: 'gepland'|'voltooid'|'geannuleerd'|'no-show' }

type Block        = { id; type: 'paragraph'|'heading'|'checklist'|'quote'|'divider'; content; authorId; updatedAt; checked?: boolean }
type TablePage    = { id; clientId; title; blocks: Block[]; pinned: boolean; createdAt; updatedAt }          // Tafel
type JournalEntry = { id; clientId; createdAt; title?; blocks: Block[]; mood?: 1|2|3|4|5; tags: string[]; sharedWithPsychologist: boolean; psychologistNote?: string }
type SessionNote  = { id; clientId; appointmentId?; createdAt; blocks: Block[] }                          // enkel psycholoog

type TaskTemplate = { id; title; description; kind: 'afvinken'|'tekst'|'schaal'|'meditatie'; defaultRecurrence?: Recurrence }
type Task         = { id; clientId; templateId?; title; description; kind; dueDate?; recurrence?: Recurrence; createdAt }
type TaskEntry    = { id; taskId; date; completed: boolean; answer?: string; scale?: number }
type Recurrence   = { every: 'dag'|'week'; days?: number[]; until? }

type Invoice      = { id; clientId; appointmentId; amount; issuedAt; dueAt; status: 'open'|'betaald'|'vervallen'; attestUrl? }
```

Mockdata: 1 psycholoog, **8 cliënten** met fictieve Vlaamse namen, 3 weken aan afspraken, Tafel-pagina's met blokken van beide auteurs, logboekentries (mix gedeeld en niet gedeeld), opdrachten met voortgang. Alles in `/lib/mock/` met een in-memory store (Zustand) zodat acties (afvinken, schrijven, delen) tijdens een demo meteen overal zichtbaar zijn.

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
- Nederlands, Vlaams, **je/jij**, kort en warm: "Goeiemorgen, Lotte", "Hoe gaat het vandaag?", "Nieuw op de Tafel", "Deel met Sarah".
- Leeg-states rustig en zonder schuldgevoel: "Nog niets geschreven deze week. Geen druk."

## 8. Tech stack

- **Next.js (App Router) + TypeScript**
- **Tailwind CSS** met de tokens hierboven als theme
- **shadcn/ui** als basis, volledig herstyled (de default look mag nergens overblijven)
- **Tiptap** voor de Notion-achtige editor (slash-menu, bubble menu, checklist), één gedeelde `<Editor />` component voor Tafel, Logboek en Sessienotities, met een prop voor auteur-markering
- **Framer Motion**, **date-fns** (locale `nl-BE`), **Zustand** voor de mock store
- Kalender: eigen lichte week/dagview in plaats van een zware library
- Geen backend in fase 1. Alle data via `/lib/data/` functies, componenten praten nooit rechtstreeks met mockbestanden, zodat een echte API later makkelijk inplugt.

Later (niet nu bouwen, wel rekening mee houden): EU-hosting (bv. Supabase EU), Mollie voor betalingen (Bancontact), GDPR-proof opzet want dit zijn gezondheidsgegevens, en eventueel realtime samen schrijven op de Tafel.

## 9. Bouwvolgorde

1. **Fundament**: project opzetten, tokens, fonts, basiscomponenten (Button, Card, Input, Tabs, Sheet, Avatar, Badge, EmptyState, Toggle).
2. **Layouts**: gedeelde platform-shell (sidebar + topbalk) voor psycholoog en cliënt, rolwissel.
3. **Editor**: de gedeelde Tiptap-component met slash-menu, bubble menu, checklist en auteur-markering. Eerst goed krijgen, want drie plekken hangen ervan af.
4. **Mockdata + store**.
5. **Cliëntomgeving**: Home, Tafel, Logboek, Opdrachten, Afspraken, Betalingen, nood-link.
6. **Psycholoog**: Vandaag, Cliëntenlijst, **Cliëntdossier met tijdlijn**, Agenda, Opdrachtenbibliotheek, Facturatie, Instellingen.
7. **Polish**: animaties, leeg-states, responsive check (375px, 768px, 1440px), toegankelijkheid (focus states, contrast AA, toetsenbord).

## 10. Klaar wanneer

- Alle routes uit sectie 5 bestaan en zijn klikbaar met mockdata.
- Nergens een chat-interface: geen bubbels, geen typindicator, geen leesbevestigingen.
- Tafel, Logboek en Opdrachten zijn duidelijk drie aparte plekken, zowel in navigatie als visueel.
- Demo werkt end-to-end: cliënt schrijft een logboekentry, vinkt een opdracht af en schrijft iets op de Tafel. De psycholoog ziet het meteen in "Vandaag" en in de tijdlijn.
- Niet-gedeelde logboekentries verschijnen nergens bij de psycholoog.
- Sessienotities zijn visueel anders en nergens zichtbaar in de cliëntomgeving.
- Beide kanten voelen als één rustig online platform, op desktop en op smalle schermen.
- Geen emoji's, geen decoratieve iconen, geen em dashes in de copy.

## 11. Instructie voor Claude Code

Lees dit hele plan eerst. Werk de bouwvolgorde stap voor stap af en toon na stap 1, 2 en 3 het resultaat voor je verdergaat. Kies bij twijfel altijd voor minder: minder elementen, meer witruimte, kortere tekst.
