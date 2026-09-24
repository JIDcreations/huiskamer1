import type { Block, ID } from "@/lib/types";
import { newBlockId } from "@/components/editor/authorship";

export type PageTemplate = {
  id: string;
  label: string;
  hint: string;
  /** Wie deze sjabloon het vaakst gebruikt. Beide rollen zien ze wel. */
  forRole?: "psy" | "client";
  title: (date: string) => string;
  blocks: Array<Pick<Block, "type" | "content" | "level" | "checked">>;
};

export const pageTemplates: PageTemplate[] = [
  {
    id: "sessie",
    label: "Samenvatting na een sessie",
    hint: "Wat jullie bespraken en afspraken",
    forRole: "psy",
    title: (date) => `Na de sessie van ${date}`,
    blocks: [
      { type: "heading", level: 2, content: "Waar we het over hadden" },
      { type: "paragraph", content: "" },
      { type: "heading", level: 3, content: "Wat we afspraken" },
      { type: "checklist", content: "", checked: false },
      { type: "heading", level: 3, content: "Voor volgende keer" },
      { type: "paragraph", content: "" },
    ],
  },
  {
    id: "vragen",
    label: "Vragen voor volgende keer",
    hint: "Wat je niet wil vergeten",
    forRole: "client",
    title: () => "Vragen voor volgende keer",
    blocks: [
      { type: "paragraph", content: "Wat ik niet wil vergeten tegen de volgende sessie:" },
      { type: "checklist", content: "", checked: false },
    ],
  },
  {
    id: "oefening",
    label: "Een oefening",
    hint: "Stappen om mee te oefenen",
    forRole: "psy",
    title: () => "Oefening: ",
    blocks: [
      { type: "paragraph", content: "" },
      { type: "heading", level: 3, content: "Zo ga je te werk" },
      { type: "checklist", content: "", checked: false },
      { type: "checklist", content: "", checked: false },
    ],
  },
];

export function templateBlocks(t: PageTemplate, authorId: ID): Block[] {
  const at = new Date().toISOString();
  return t.blocks.map((b) => ({ ...b, id: newBlockId(), authorId, updatedAt: at }));
}
