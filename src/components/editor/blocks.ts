import { getHTMLFromFragment, type Editor } from "@tiptap/core";
import type { Node as PMNode } from "@tiptap/pm/model";
import type { Block } from "@/lib/types";

function esc(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

function meta(b: Block) {
  return `data-id="${esc(b.id)}" data-author="${esc(b.authorId)}" data-updated="${esc(b.updatedAt)}"`;
}

/** Block[] naar HTML die de editor inleest. */
export function blocksToHTML(blocks: Block[]): string {
  let html = "";
  let inList = false;

  for (const b of blocks) {
    if (b.type !== "checklist" && inList) {
      html += "</ul>";
      inList = false;
    }
    switch (b.type) {
      case "heading":
        html += `<h${b.level ?? 2} ${meta(b)}>${b.content}</h${b.level ?? 2}>`;
        break;
      case "quote":
        html += `<blockquote ${meta(b)}><p>${b.content}</p></blockquote>`;
        break;
      case "divider":
        html += `<hr ${meta(b)}>`;
        break;
      case "checklist":
        if (!inList) {
          html += `<ul data-type="taskList">`;
          inList = true;
        }
        html += `<li data-type="taskItem" data-checked="${b.checked ? "true" : "false"}" ${meta(b)}><p>${b.content}</p></li>`;
        break;
      default:
        html += `<p ${meta(b)}>${b.content}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

function inline(editor: Editor, node: PMNode) {
  return getHTMLFromFragment(node.content, editor.schema);
}

function base(node: PMNode) {
  return {
    id: node.attrs.blockId as string,
    authorId: node.attrs.author as string,
    updatedAt: node.attrs.updatedAt as string,
  };
}

/** Editor-inhoud terug naar Block[]. */
export function editorToBlocks(editor: Editor): Block[] {
  const blocks: Block[] = [];

  editor.state.doc.forEach((node) => {
    switch (node.type.name) {
      case "heading":
        blocks.push({ ...base(node), type: "heading", level: node.attrs.level, content: inline(editor, node) });
        break;
      case "blockquote": {
        const parts: string[] = [];
        node.forEach((child) => parts.push(inline(editor, child)));
        blocks.push({ ...base(node), type: "quote", content: parts.join("<br>") });
        break;
      }
      case "horizontalRule":
        blocks.push({ ...base(node), type: "divider", content: "" });
        break;
      case "taskList":
        node.forEach((item) => {
          const para = item.firstChild;
          blocks.push({
            ...base(item),
            type: "checklist",
            checked: Boolean(item.attrs.checked),
            content: para ? inline(editor, para) : "",
          });
        });
        break;
      default:
        blocks.push({ ...base(node), type: "paragraph", content: inline(editor, node) });
    }
  });

  // De editor houdt altijd een lege alinea achteraan: die hoort niet in de data.
  while (blocks.length && blocks[blocks.length - 1].type === "paragraph" && !blocks[blocks.length - 1].content) {
    blocks.pop();
  }

  return blocks;
}
