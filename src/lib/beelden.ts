import type { StaticImageData } from "next/image";
import blad from "@/assets/beelden/blad.jpg";
import boek from "@/assets/beelden/boek.jpg";
import groen from "@/assets/beelden/groen.jpg";
import heuvels from "@/assets/beelden/heuvels.jpg";
import kamer from "@/assets/beelden/kamer.jpg";
import lelie from "@/assets/beelden/lelie.jpg";
import login from "@/assets/beelden/login.jpg";
import thee from "@/assets/beelden/thee.jpg";

export type Beeld = { src: StaticImageData; alt: string };

/** Sfeerbeelden (Unsplash, via Picsum). Zelf gehost, zodat er geen verzoek naar derden gaat. */
export const beelden = {
  login: { src: login, alt: "Een groene mok op een nachtkastje naast een opgemaakt bed in zacht ochtendlicht" },
  thee: { src: thee, alt: "Handen in een wollen trui rond een warme kop thee" },
  heuvels: { src: heuvels, alt: "Groene heuvels en een kronkelende weg onder een zachte lucht" },
  groen: { src: groen, alt: "Twee handen die een bosje verse dennennaalden vasthouden" },
  kamer: { src: kamer, alt: "Een lichte kamer met een houten tafel en stoelen bij het raam" },
  boek: { src: boek, alt: "Een open boek op een houten tafel" },
  blad: { src: blad, alt: "Jonge groene bladeren tegen een donkere achtergrond" },
  lelie: { src: lelie, alt: "Een witte waterlelie tussen donkergroene bladeren" },
} satisfies Record<string, Beeld>;
