import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { Node as PMNode } from "@tiptap/pm/model";
import { format, isToday, isYesterday } from "date-fns";
import { nlBE } from "date-fns/locale";
import type { Role } from "@/lib/types";

export type EditorAuthor = { name: string; role: Role };

type AuthorshipOptions = {
  getAuthor: () => string;
  getAuthors: () => Record<string, EditorAuthor>;
  showAuthors: boolean;
};

export const SKIP_AUTHORSHIP = "hk-skip-authorship";
const key = new PluginKey("hk-authorship");
const MARKED = ["paragraph", "heading", "blockquote", "horizontalRule", "taskItem"];
/** Binnen dit venster blijft een aanpassing door dezelfde auteur één moment. */
const REFRESH_MS = 60_000;

let counter = 0;
export function newBlockId() {
  counter += 1;
  return `b-${Date.now().toString(36)}-${counter.toString(36)}`;
}

/** Blokken met een eigen auteur: alles op het hoogste niveau, en elk checklist-item. */
function eachBlock(doc: PMNode, cb: (node: PMNode, pos: number) => void) {
  doc.forEach((node, offset) => {
    if (node.type.name === "taskList") node.forEach((item, o) => cb(item, offset + 1 + o));
    else cb(node, offset);
  });
}

function sameBlock(a: PMNode, b: PMNode) {
  return (
    a.type === b.type &&
    a.content.eq(b.content) &&
    a.attrs.checked === b.attrs.checked &&
    a.attrs.level === b.attrs.level
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function formatWhen(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const time = format(d, "HH:mm");
  if (isToday(d)) return `vandaag, ${time}`;
  if (isYesterday(d)) return `gisteren, ${time}`;
  return `${format(d, "d MMM", { locale: nlBE })}, ${time}`;
}

function authorWidget(author: EditorAuthor, when: string) {
  return () => {
    const el = document.createElement("span");
    el.className = "hk-author";
    el.contentEditable = "false";
    el.dataset.role = author.role;
    el.setAttribute("aria-label", `${author.name}, ${when}`);
    el.textContent = initials(author.name);
    const tip = document.createElement("span");
    tip.className = "hk-author-tip";
    tip.textContent = `${author.name}, ${when}`;
    el.appendChild(tip);
    return el;
  };
}

export const Authorship = Extension.create<AuthorshipOptions>({
  name: "authorship",

  addOptions() {
    return { getAuthor: () => "", getAuthors: () => ({}), showAuthors: false };
  },

  addGlobalAttributes() {
    return [
      {
        types: MARKED,
        attributes: {
          blockId: {
            default: null,
            keepOnSplit: false,
            parseHTML: (el) => el.getAttribute("data-id"),
            renderHTML: (a) => (a.blockId ? { "data-id": a.blockId } : {}),
          },
          author: {
            default: null,
            keepOnSplit: false,
            parseHTML: (el) => el.getAttribute("data-author"),
            renderHTML: (a) => (a.author ? { "data-author": a.author } : {}),
          },
          updatedAt: {
            default: null,
            keepOnSplit: false,
            parseHTML: (el) => el.getAttribute("data-updated"),
            renderHTML: (a) => (a.updatedAt ? { "data-updated": a.updatedAt } : {}),
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    const { getAuthor, getAuthors, showAuthors } = this.options;

    return [
      new Plugin({
        key,

        // Markeer elk gewijzigd blok met de huidige auteur en het tijdstip.
        appendTransaction(transactions, oldState, newState) {
          if (!transactions.some((t) => t.docChanged)) return null;
          // Ongedaan maken en herhalen herstellen ook de auteur: niet opnieuw markeren.
          if (transactions.some((t) => t.getMeta(SKIP_AUTHORSHIP) || t.getMeta("history$"))) return null;

          const before = new Map<string, PMNode>();
          eachBlock(oldState.doc, (node) => {
            if (node.attrs.blockId) before.set(node.attrs.blockId, node);
          });

          const blocks: { node: PMNode; pos: number }[] = [];
          const byId = new Map<string, number[]>();
          eachBlock(newState.doc, (node, pos) => {
            const i = blocks.push({ node, pos }) - 1;
            const id = node.attrs.blockId as string | null;
            if (id) byId.set(id, [...(byId.get(id) ?? []), i]);
          });

          // Bij een splitsing kan een id dubbel voorkomen: het ongewijzigde deel houdt het.
          const keepers = new Set<number>();
          for (const [id, indexes] of byId) {
            const old = before.get(id);
            const keeper = indexes.find((i) => old && sameBlock(blocks[i].node, old)) ?? indexes[0];
            keepers.add(keeper);
          }

          const me = getAuthor();
          const now = new Date();
          const tr = newState.tr;
          let changed = false;

          blocks.forEach(({ node, pos }, i) => {
            const a = node.attrs;
            const old = a.blockId ? before.get(a.blockId) : undefined;
            let next: Record<string, unknown> | null = null;

            if (!a.blockId || !keepers.has(i)) {
              next = { ...a, blockId: newBlockId(), author: me, updatedAt: now.toISOString() };
            } else if (!old || !sameBlock(node, old)) {
              const fresh = a.author === me && a.updatedAt && now.getTime() - Date.parse(a.updatedAt) < REFRESH_MS;
              if (!fresh) next = { ...a, author: me, updatedAt: now.toISOString() };
            }

            if (next) {
              tr.setNodeMarkup(pos, undefined, next);
              changed = true;
            }
          });

          return changed ? tr : null;
        },

        props: {
          decorations(state) {
            if (!showAuthors) return null;
            const authors = getAuthors();
            const decos: Decoration[] = [];
            let prev: string | null = null;

            eachBlock(state.doc, (node, pos) => {
              if (node.type.name === "horizontalRule") return;
              const id = node.attrs.author as string | null;
              const author = id ? authors[id] : undefined;
              if (!id || !author) {
                prev = null;
                return;
              }

              decos.push(
                Decoration.node(pos, pos + node.nodeSize, { class: "hk-block", "data-role": author.role })
              );

              if (id !== prev) {
                // Widget in de eerste tekstregel van het blok.
                const inner = node.isTextblock ? pos + 1 : pos + 2;
                const when = formatWhen(node.attrs.updatedAt);
                decos.push(
                  Decoration.widget(inner, authorWidget(author, when), {
                    side: -1,
                    ignoreSelection: true,
                    key: `${node.attrs.blockId}-${id}-${when}`,
                  })
                );
              }
              prev = id;
            });

            return DecorationSet.create(state.doc, decos);
          },
        },
      }),
    ];
  },
});
