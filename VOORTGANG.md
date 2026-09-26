# Huiskamer: voortgang en volgende stappen

_Stand van 26 september 2026. Fase 1 staat op `main`; de dagrun van 26 september (UX-herwerking, verfijnde UI, rijkere demo) staat op de branch `dagrun-26sep`. Zie SUMMARY.md en DECISIONS.md op die branch._

## Kort

Een klikbaar prototype van het volledige platform, voor cliënt en psycholoog, met mockdata. Sinds de dagrun denkt het platform in tijd: **Vandaag**, **Logboek** en **Sessies**. Wat een cliënt invult, afvinkt of meeneemt naar de sessie, ziet de psycholoog meteen in **Vandaag** en in het dossier. Niet-gedeelde entries en privénotities lekken nergens. Beide zijn automatisch getest.

## Klaar-wanneer (sectie 10 van het plan)

| Criterium | Stand |
|---|---|
| Alle routes bestaan en zijn klikbaar met mockdata | Klaar, `npm run test:layout` loopt ze allemaal af |
| Nergens een chat-interface | Klaar (ook getest) |
| Logboek, Sessies en Opdrachten zijn duidelijk aparte plekken | Klaar: opdrachten leven in Vandaag en in sheets, antwoorden landen in het logboek |
| Demo end-to-end: cliënt schrijft, vinkt af, neemt iets mee naar de sessie, psycholoog ziet het meteen | Klaar, `npm run test:demo` |
| Niet-gedeelde entries nergens bij de psycholoog | Klaar, getest in Vandaag, dossier en logboek-tab |
| Privénotities visueel anders en nooit bij de cliënt | Klaar, getest op alle cliëntpagina's |
| Voelt als één rustig platform, desktop en smal scherm | Klaar, gecontroleerd op 375, 768 en 1440px |
| Geen emoji's, geen decoratieve iconen, geen em dashes | Klaar, gezocht in de hele codebase |

## Wat er gebouwd is

1. **Fundament.** Next.js 16, Tailwind 4, tokens uit het palet (Milk, Oat, Taupe, Mocha, Charcoal), Inter voor UI en Instrument Serif voor paginatitels, basiscomponenten met afgewerkte states.
2. **Shell.** Sidebar en topbalk voor de psycholoog, tab bar met Vandaag, Logboek en Sessies voor de cliënt op mobiel. Nood-link altijd bereikbaar. Rolwissel en "Demo opnieuw beginnen" voor de demo.
3. **Editor.** Eén Tiptap-editor voor sessiepagina's, logboek en privénotities: `/`-menu, opmaak bij selectie, checklist, auteur en tijdstip per blok, autosave.
4. **Data.** Volledig datamodel, gegenereerde demo rond vandaag met een eigen verhaal per cliënt, Zustand store met localStorage. Componenten lezen en schrijven enkel via `src/lib/data`.
5. **Cliënt.** Vandaag (check-in, opdrachten van vandaag, volgende sessie), Logboek (één tijdlijn voor check-ins, notities en opdracht-antwoorden, delen per entry), Sessies (sessiepagina's, "Voor volgende keer", boeken en verzetten), Betalingen, Herinneringen, Privacy, Profiel, kennismaking.
6. **Psycholoog.** Vandaag met "Tussen de sessies", cliëntenlijst, dossier (Overzicht, Logboek, Sessies, Opdrachten, Betalingen), sessiepagina met privénotities, agenda, opdrachtenbibliotheek, facturatie, instellingen.
7. **Afwerking.** Copy-pass, focus states, responsive check, PWA-basis (manifest en iconen), demotest en layouttest.

## Afwijkingen van het oorspronkelijke plan

- **Tafel en tijdlijn zijn opgegaan in Sessies en Logboek.** Elke sessie heeft een eigen pagina met samenvatting en reacties; de tijdlijn is het logboek.
- **Tab bar voor de cliënt op mobiel**, op vraag van de dagrun. De psycholoog houdt de sidebar en de lade.
- **Instrument Serif voor paginatitels**, al de rest blijft Inter.
- **Kleine tekst iets donkerder dan Taupe.** Taupe op wit haalt geen AA-contrast (2,98:1). Kleine labels gebruiken `#75695D` (5:1). Iconen, randen en bolletjes blijven Taupe.
- **Nood-sheet** vermeldt naast 1813 en 106 ook "Bij direct gevaar: bel 112".

## Bekende beperkingen van het prototype

- **Data leeft per browser.** Een cliënt op zijn gsm en een psycholoog op haar laptop zien elkaars wijzigingen niet. Dat vraagt een backend.
- **Geen echte login, betalingen of attesten.** Aanmelden is een formaliteit, "Betalen" is een demo, de attestknop legt uit dat het later komt.
- **Herinneringen** zijn enkel voorkeuren, er wordt niets verstuurd.
- **Samen schrijven** op een sessiepagina is niet realtime. Wie het laatst bewaart, wint.
- **Agenda**: geen slepen om te verzetten, geen reeksen (bv. elke maandag).
- **Één praktijk, één psycholoog**, enkel Nederlandstalig.

## Volgende stappen

### 1. Tonen en laten testen (nu)
- Deployen (Netlify of Vercel, zie hieronder) zodat de demo een link heeft.
- Twee of drie psychologen en een paar cliënten de demo laten doorlopen. Vooral nagaan: is de indeling in Vandaag, Logboek en Sessies meteen duidelijk, en helpt "Tussen de sessies" de psycholoog echt?
- Copy laten nalezen door een psycholoog, zeker de nood-informatie.

### 2. Backend (fase 2)
- **Supabase in de EU** (Postgres, auth, opslag). Het schema volgt `src/lib/types.ts`.
- `src/lib/data` omzetten van de mock store naar API-calls. Componenten hoeven niet te veranderen.
- **Row-level security** vanaf de eerste dag: een cliënt ziet enkel eigen data, de psycholoog ziet enkel gedeelde logboekentries, sessienotities zijn enkel voor de psycholoog. Dezelfde regels als de demotest, maar dan in de database.
- **Login**: uitnodiging per e-mail voor cliënten, tweestapsverificatie voor psychologen.

### 3. Privacy en regelgeving (samen met fase 2)
- Dit zijn gezondheidsgegevens: verwerkersovereenkomsten, EU-hosting, versleuteling, een auditlog van wie wat bekeek.
- Laten nagaan welke bewaartermijnen en rechten gelden voor het patiëntendossier (onder meer de kwaliteitswet) en wat dat betekent voor verwijderen en exporteren.
- Privacyverklaring en toestemming bij het aanmelden van een cliënt.

### 4. Betalen en facturen
- **Mollie** met Bancontact en Payconiq.
- Echte factuurnummering en PDF, attest voor de mutualiteit (vorm laten nagaan).

### 5. Daarna
- E-mailherinneringen (afspraak, check-in, opdrachten), met de voorkeuren uit Herinneringen.
- Realtime samen schrijven op een sessiepagina.
- Agenda: verslepen, reeksen, online link voor videosessies.
- Meerdere psychologen per praktijk.
- Franstalige versie.
- De demotest en een toegankelijkheidscheck in GitHub Actions laten draaien bij elke push.

## Deployen

Netlify zou moeten werken zonder instellingen: repo importeren, branch `main`, standaard build. Next.js 16 is erg nieuw; faalt de build op een Next-fout, gebruik dan Vercel (zelfde stappen). Er zijn geen omgevingsvariabelen nodig.

## Handig om te weten

- `npm run dev` start het platform. `npm run test:demo` en `npm run test:layout` draaien de tests (server moet draaien).
- **Demo opnieuw beginnen** (onder het aanmeldformulier of naast de rolwissel) zet alle data terug.
- `/stijlgids` en `/stijlgids/editor` tonen de bouwstenen los.
