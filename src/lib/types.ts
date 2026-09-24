// Datamodel (sectie 6 van het plan). Wordt in stap 4 aangevuld.

export type Role = "psy" | "client";

export type BlockType = "paragraph" | "heading" | "checklist" | "quote" | "divider";

export type Block = {
  id: string;
  type: BlockType;
  /** Inline HTML: tekst met <strong>, <em>, <s>. */
  content: string;
  authorId: string;
  updatedAt: string;
  checked?: boolean;
  level?: 2 | 3;
};
