# Beslissingen dagrun 26 september

Keuzes die ik zelf maakte bij twijfel. Telkens kort, zodat je ze snel kan nalezen.

- **Bottom tab bar voor de cliënt op mobiel.** CLAUDE.md zegt "geen bottom tab bar", maar UX-PROMPT.md en DAGRUN.md vragen er expliciet een. DAGRUN gaat voor. De psycholoog houdt de lade.
- **Routes cliënt:** `/c/vandaag`, `/c/logboek`, `/c/sessies`. Oude routes (`/c/home`, `/c/tafel`, `/c/afspraken`) sturen door, zodat oude links blijven werken.
- **Opdracht gedaan = logboekentry.** Er is geen apart `TaskEntry` meer. Een opdracht is gedaan op een dag als er een entry van soort "opdracht" voor die dag is. Ook een simpel afvinken maakt zo'n entry (zonder tekst). Eén bron van waarheid, en de privacyregel geldt vanzelf: een opdracht-entry die "Enkel voor mij" is, telt bij de psycholoog nergens mee, ook niet in de voortgang.
- **Neem mee naar de sessie met een privé-entry:** het punt verschijnt enkel bij de cliënt, met het slotje. De psycholoog ziet het niet, tot de cliënt de entry deelt.
- **Sessiepagina = twee delen:** een samenvatting (psycholoog schrijft, cliënt leest) en reacties (beiden schrijven, met auteur per blok). De oude Tafel-pagina's zijn omgezet naar sessiepagina's; losse pagina's zonder sessie (zoals een oefening) zijn weg.
