# Huiskamer: voortgang en volgende stappen

_Stand van 24 september 2026. Fase 1 (de interface) is af en staat op `main`._

## Kort

Een klikbaar prototype van het volledige platform, voor cliënt en psycholoog, met mockdata. Alle routes uit het plan bestaan en werken. De demoflow uit sectie 10 is automatisch getest: wat een cliënt schrijft, afvinkt of deelt, ziet de psycholoog meteen in **Vandaag** en in de **tijdlijn**. Niet-gedeelde logboekentries en sessienotities lekken nergens.

## Klaar-wanneer (sectie 10 van het plan)

| Criterium | Stand |
|---|---|
| Alle routes bestaan en zijn klikbaar met mockdata | Klaar |
| Nergens een chat-interface | Klaar (ook getest) |
| Tafel, Logboek en Opdrachten zijn drie aparte plekken | Klaar: aparte navigatie, eigen vorm |
| Demo end-to-end: cliënt schrijft, vinkt af, schrijft op de Tafel, psycholoog ziet het meteen | Klaar, `npm run test:demo` |
| Niet-gedeelde entries nergens bij de psycholoog | Klaar, getest in Vandaag, tijdlijn en logboek-tab |
| Sessienotities visueel anders en nooit bij de cliënt | Klaar, getest op alle cliëntpagina's |
| Voelt als één rustig platform, desktop en smal scherm | Klaar, gecontroleerd op 390px en 1440px |
| Geen emoji's, geen decoratieve iconen, geen em dashes | Klaar, gecontroleerd in de code |

## Wat er gebouwd is

1. **Fundament.** Next.js 16, Tailwind 4, tokens uit het palet (Milk, Oat, Taupe, Mocha, Charcoal), Inter, basiscomponenten (knop, kaart, invoer, tabs, sheet, avatar, badge, schakelaar, lege staat, menu, toast).
2. **Platform-shell.** Eén opbouw voor beide rollen: sidebar met gegroepeerde navigatie, topbalk, lade op smalle schermen. Zoekbalk voor cliënten bij de psycholoog, nood-link bij de cliënt. Rolwissel voor de demo.
3. **Editor.** Eén Tiptap-editor voor Tafel, Logboek en Sessienotities: `/`-menu, opmaak bij selectie, checklist, auteur en tijdstip per blok, markering van nieuwe blokken, autosave.
4. **Data.** Volledig datamodel, gegenereerde demo rond vandaag (1 psycholoog, 8 cliënten, drie weken afspraken), Zustand store met localStorage. Componenten lezen en schrijven enkel via `src/lib/data`.
5. **Cliëntomgeving.** Overzicht, Afspraken (boeken, verzetten, annuleren binnen de regels), Opdrachten (afvinken, tekst, schaal, meditatie met timer), Logboek (stemming, tags, deel-toggle), Tafel, Betalingen (demo-betaling), Profiel, nood-link met 1813 en 106.
6. **Psycholoog.** Vandaag, cliëntenlijst, dossier (overzicht, tijdlijn per periode tussen sessies, Tafel, gedeeld logboek met kanttekening, opdrachten, privé sessienotities, betalingen), agenda (week en dag), opdrachtenbibliotheek, facturatie, instellingen.
7. **Afwerking.** Toegankelijkheid (audit zonder meldingen op de gecontroleerde pagina's), mobiel, lege staten, demotest, README.

## Afwijkingen van het oorspronkelijke plan

- **Platform in plaats van app.** Geen bottom tab bar meer; beide rollen krijgen een sidebar en topbalk (op vraag, PLAN.md is aangepast).
- **Enkel sans-serif.** Instrument Serif is weg; koppen in Inter semibold.
- **Kleine tekst iets donkerder dan Taupe.** Taupe op wit haalt geen AA-contrast (2,98:1). Kleine labels gebruiken `#75695D` (5:1). Iconen, randen en bolletjes blijven Taupe.
- **Nood-sheet** vermeldt naast 1813 en 106 ook "Bij direct gevaar: bel 112".
- **Lege Tafel-pagina's en logboekentries** verdwijnen vanzelf als je ze verlaat zonder iets te schrijven.
- **Sessienotities in de tijdlijn** staan bij hun sessie, niet als los item.

## Bekende beperkingen van het prototype

- **Data leeft per browser.** Een cliënt op zijn gsm en een psycholoog op haar laptop zien elkaars wijzigingen niet. Dat vraagt een backend.
- **Geen echte login, betalingen of attesten.** Aanmelden is een formaliteit, "Betalen" is een demo, de attestknop legt uit dat het later komt.
- **Meldingen** in Profiel zijn enkel schakelaars, er wordt niets verstuurd en ze worden niet bewaard.
- **Samen schrijven** op de Tafel is niet realtime. Wie het laatst bewaart, wint.
- **Agenda**: geen slepen om te verzetten, geen reeksen (bv. elke maandag).
- **Één praktijk, één psycholoog**, enkel Nederlandstalig.

## Volgende stappen

### 1. Tonen en laten testen (nu)
- Deployen (Netlify of Vercel, zie hieronder) zodat de demo een link heeft.
- Twee of drie psychologen en een paar cliënten de demo laten doorlopen. Vooral nagaan: is het verschil tussen Tafel, Logboek en Opdrachten meteen duidelijk, en voelt de tijdlijn nuttig tussen twee sessies?
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
- E-mailherinneringen (afspraak, nieuw op de Tafel), met de voorkeuren uit Profiel.
- Realtime samen schrijven op de Tafel.
- Agenda: verslepen, reeksen, online link voor videosessies.
- Meerdere psychologen per praktijk.
- Franstalige versie.
- De demotest en een toegankelijkheidscheck in GitHub Actions laten draaien bij elke push.

## Deployen

Netlify zou moeten werken zonder instellingen: repo importeren, branch `main`, standaard build. Next.js 16 is erg nieuw; faalt de build op een Next-fout, gebruik dan Vercel (zelfde stappen). Er zijn geen omgevingsvariabelen nodig.

## Handig om te weten

- `npm run dev` start het platform, `npm run test:demo` draait de demoflow als test (dev-server moet draaien).
- **Instellingen, Demo opnieuw beginnen** zet alle data terug.
- `/stijlgids` en `/stijlgids/editor` tonen de bouwstenen los.
