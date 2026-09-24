"use client";

import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { useEditorState } from "@tiptap/react";
import { Bold, Heading2, Italic, Quote, Strikethrough } from "lucide-react";
import { cn } from "@/lib/utils";

function Btn({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg transition-colors [&_svg]:size-4 [&_svg]:stroke-[1.75]",
        active ? "bg-surface-2 text-text" : "text-muted hover:bg-oat-soft hover:text-text"
      )}
    >
      {children}
    </button>
  );
}

export function FormatBubble({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      heading: e.isActive("heading", { level: 2 }),
      quote: e.isActive("blockquote"),
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 8 }}
      className="flex items-center gap-0.5 rounded-xl bg-surface p-1 shadow-soft ring-1 ring-surface-2"
    >
      <Btn label="Vet" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </Btn>
      <Btn label="Cursief" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </Btn>
      <Btn label="Doorhalen" active={s.strike} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough />
      </Btn>
      <span aria-hidden className="mx-1 h-5 w-px bg-surface-2" />
      <Btn
        label="Kop"
        active={s.heading}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 />
      </Btn>
      <Btn label="Citaat" active={s.quote} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote />
      </Btn>
    </BubbleMenu>
  );
}
