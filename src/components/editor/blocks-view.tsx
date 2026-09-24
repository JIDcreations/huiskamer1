import type { Block } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Alleen-lezen weergave van blokken, in dezelfde typografie als de editor. */
export function BlocksView({ blocks, className }: { blocks: Block[]; className?: string }) {
  const out: React.ReactNode[] = [];
  let list: Block[] = [];

  const flush = () => {
    if (!list.length) return;
    const items = list;
    out.push(
      <ul key={`l-${items[0].id}`} data-type="taskList">
        {items.map((b) => (
          <li key={b.id} data-checked={b.checked ? "true" : "false"}>
            <label>
              <input type="checkbox" checked={Boolean(b.checked)} readOnly disabled aria-label={b.checked ? "Afgevinkt" : "Niet afgevinkt"} />
            </label>
            <div>
              <p dangerouslySetInnerHTML={{ __html: b.content }} />
            </div>
          </li>
        ))}
      </ul>
    );
    list = [];
  };

  for (const b of blocks) {
    if (b.type === "checklist") {
      list.push(b);
      continue;
    }
    flush();
    if (b.type === "heading") {
      const H = b.level === 3 ? "h3" : "h2";
      out.push(<H key={b.id} dangerouslySetInnerHTML={{ __html: b.content }} />);
    } else if (b.type === "quote") {
      out.push(
        <blockquote key={b.id}>
          <p dangerouslySetInnerHTML={{ __html: b.content }} />
        </blockquote>
      );
    } else if (b.type === "divider") {
      out.push(<hr key={b.id} />);
    } else {
      out.push(<p key={b.id} dangerouslySetInnerHTML={{ __html: b.content }} />);
    }
  }
  flush();

  return <div className={cn("hk-prose min-h-0", className)}>{out}</div>;
}
