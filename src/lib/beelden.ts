import type { StaticImageData } from "next/image";
import boek from "@/assets/beelden/boek.jpg";
import boeken from "@/assets/beelden/boeken.jpg";
import fauteuil from "@/assets/beelden/fauteuil.jpg";
import kamer from "@/assets/beelden/kamer.jpg";
import latte from "@/assets/beelden/latte.jpg";
import linnen from "@/assets/beelden/linnen.jpg";
import login from "@/assets/beelden/login.jpg";
import ochtend from "@/assets/beelden/ochtend.jpg";
import pampas from "@/assets/beelden/pampas.jpg";
import schaduw from "@/assets/beelden/schaduw.jpg";
import thee from "@/assets/beelden/thee.jpg";
import vaas from "@/assets/beelden/vaas.jpg";

export type Beeld = { src: StaticImageData; alt: string };

/**
 * Sfeerbeelden, zelf gehost zodat er geen verzoek naar derden gaat.
 * Bron: Unsplash (Unsplash-licentie). Oorsprong per bestand in src/assets/beelden/BRONNEN.md.
 */
export const beelden = {
  login: { src: login, alt: "Een mok op een nachtkastje naast een opgemaakt bed in zacht ochtendlicht" },
  thee: { src: thee, alt: "Handen in een wollen trui rond een warme kop koffie" },
  kamer: { src: kamer, alt: "Een lichte kamer met een houten tafel en stoelen bij het raam" },
  boek: { src: boek, alt: "Een open boek op een houten tafel" },
  latte: { src: latte, alt: "Een kop latte met een blad in het schuim, op een schoteltje in het zonlicht" },
  vaas: { src: vaas, alt: "Droogbloemen in een aarden vaas, met hun schaduw op een lichte muur" },
  pampas: { src: pampas, alt: "Pluimen pampasgras in een witte, geribde vaas" },
  linnen: { src: linnen, alt: "Een plooi in crèmekleurig linnen" },
  ochtend: { src: ochtend, alt: "Een opgemaakt bed met een kaars, een kop koffie en ontbijt op een dienblad" },
  schaduw: { src: schaduw, alt: "De schaduw van bladeren op een zonnige, beige muur" },
  boeken: { src: boeken, alt: "Een stenen vaas op een stapel witte boeken" },
  fauteuil: { src: fauteuil, alt: "Een bruine fauteuil bij een raam met uitzicht op groen" },
} satisfies Record<string, Beeld>;
