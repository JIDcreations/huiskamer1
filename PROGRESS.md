# Dagrun 26 september: voortgang

Laatste update: 2026-09-26 14:18

## Fases
- [x] 1. UX-herwerking cliëntkant
- [x] 2. UX-herwerking psycholoogkant (samen met fase 1 gecommit: het datamodel raakt beide kanten)
- [x] 3. UI naar professioneel niveau (eerste ronde; tweede ronde na fase 10)
- [x] 4. Elk detail uitwerken
- [x] 5. Mockdata rijker
- [x] 6. Copy-pass
- [x] 7. Toegankelijkheid, responsive, PWA
- [x] 8. Demo-klaar
- [ ] 9. Code opruimen
- [ ] 10. Eindrapport (SUMMARY.md)

## Nu bezig
Fase 9: code opruimen.

## Volgende stap
Dubbele code zoeken, imports uit `@/lib/mock` buiten `lib/data` weghalen, ongebruikte exports en bestanden opruimen, README en VOORTGANG bijwerken.

## Open punten voor later
- Demotest `npm run test:demo` is herschreven naar de nieuwe flow en slaagt volledig (27 checks, nu ook de reset).
- VOORTGANG.md en README.md beschrijven nog de oude structuur. Bijwerken in fase 9/10.
- Nieuw: `npm run test:layout` loopt alle routes af op 375, 768 en 1440px (horizontale scroll, knoppen zonder naam, beelden zonder alt). Slaagt volledig.
