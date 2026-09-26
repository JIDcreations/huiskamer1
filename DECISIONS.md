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
