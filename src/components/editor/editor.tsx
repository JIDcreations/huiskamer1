"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { Lock } from "lucide-react";
import { Authorship, type EditorAuthor } from "@/components/editor/authorship";
import { blocksToHTML, editorToBlocks } from "@/components/editor/blocks";
import { FormatBubble } from "@/components/editor/bubble";
import { SlashMenuExtension, type SlashState } from "@/components/editor/slash";
import { SlashMenu } from "@/components/editor/slash-menu";
import type { Block } from "@/lib/types";
import { cn } from "@/lib/utils";

export type EditorProps = {
  /** Beginwaarde. De editor is daarna ongecontroleerd: geef een `key` mee om te herladen. */
  blocks: Block[];
  onChange?: (blocks: Block[]) => void;
  /** Wie er nu schrijft. Elk gewijzigd blok krijgt deze auteur. */
  authorId: string;
  /** Opzoektabel voor namen en rollen van auteurs. */
  authors?: Record<string, EditorAuthor>;
  /** Toon per blok wie het schreef (Tafel). */
  showAuthors?: boolean;
  editable?: boolean;
  placeholder?: string;
  title?: string;
  onTitleChange?: (title: string) => void;
  titlePlaceholder?: string;
  /** Sessienotities: enkel voor de psycholoog, visueel anders. */
  private?: boolean;
  className?: string;
};

function TitleField({
  value,
  onChange,
  placeholder,
  editable,
  onEnter,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder: string;
  editable: boolean;
  onEnter: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      readOnly={!editable}
      placeholder={placeholder}
      aria-label="Titel"
      onChange={(e) => onChange?.(e.target.value.replace(/\n/g, ""))}
      onKeyDown={(e) => {
        if (e.key === "Enter" || (e.key === "ArrowDown" && e.currentTarget.selectionStart === value.length)) {
          e.preventDefault();
          onEnter();
        }
      }}
      className="font-display block w-full resize-none overflow-hidden bg-transparent text-[28px] leading-tight text-text outline-none placeholder:text-faint/70 md:text-[32px]"
    />
  );
}

export function Editor({
  blocks,
  onChange,
  authorId,
  authors = {},
  showAuthors = false,
  editable = true,
  placeholder = "Schrijf iets, of typ / voor opties.",
  title,
  onTitleChange,
  titlePlaceholder = "Zonder titel",
  private: isPrivate = false,
  className,
}: EditorProps) {
  // Refs zodat de extensies altijd de laatste waarden zien zonder de editor te herbouwen.
  const authorRef = useRef(authorId);
  const authorsRef = useRef(authors);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    authorRef.current = authorId;
    authorsRef.current = authors;
    onChangeRef.current = onChange;
  });

  const [slash, setSlash] = useState<SlashState | null>(null);
  const [active, setActive] = useState(0);
  const slashRef = useRef<{ slash: SlashState | null; active: number }>({ slash: null, active: 0 });
  useEffect(() => {
    slashRef.current = { slash, active };
  });

  const editor = useEditor({
    immediatelyRender: false,
    editable,
    content: blocksToHTML(blocks),
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: false,
        orderedList: false,
        listItem: false,
        listKeymap: false,
        code: false,
        codeBlock: false,
        link: false,
        underline: false,
      }),
      TaskList,
      TaskItem.configure({ nested: false }),
      Placeholder.configure({
        showOnlyCurrent: true,
        placeholder: ({ editor: e, node }) => {
          if (e.isEmpty) return placeholder;
          return node.type.name === "paragraph" ? "Typ / voor opties" : "";
        },
      }),
      // Refs worden enkel in editor-callbacks gelezen, nooit tijdens render.
      // eslint-disable-next-line react-hooks/refs
      Authorship.configure({
        getAuthor: () => authorRef.current,
        getAuthors: () => authorsRef.current,
        showAuthors,
      }),
      // Refs worden enkel in editor-callbacks gelezen, nooit tijdens render.
      // eslint-disable-next-line react-hooks/refs
      SlashMenuExtension.configure({
        onChange: (s) => {
          setSlash(s);
          setActive(0);
        },
        onKeyDown: (event) => {
          const { slash: s, active: i } = slashRef.current;
          if (!s || s.items.length === 0) return false;
          if (event.key === "ArrowDown") {
            setActive((i + 1) % s.items.length);
            return true;
          }
          if (event.key === "ArrowUp") {
            setActive((i - 1 + s.items.length) % s.items.length);
            return true;
          }
          if (event.key === "Enter" || event.key === "Tab") {
            s.select(s.items[i]);
            return true;
          }
          return false;
        },
      }),
    ],
    editorProps: {
      attributes: {
        class: cn("hk-prose outline-none", showAuthors && "hk-with-authors"),
        "aria-label": title ?? "Tekst",
      },
    },
    onUpdate: ({ editor: e }) => onChangeRef.current?.(editorToBlocks(e)),
  });

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editor, editable]);

  return (
    <div
      className={cn(
        "hk-editor mx-auto w-full max-w-[680px]",
        isPrivate && "max-w-[760px] rounded-card bg-surface-2/70 px-5 py-6 md:px-10 md:py-9",
        className
      )}
    >
      {isPrivate && (
        <p className="mb-5 flex items-center gap-2 text-[13px] text-muted">
          <Lock className="size-3.5 stroke-[1.75]" />
          Enkel voor jou. Nooit zichtbaar voor de cliënt.
        </p>
      )}
      {title !== undefined && (
        <div className={cn("mb-4", showAuthors && "pl-[var(--hk-gutter)]")}>
          <TitleField
            value={title}
            onChange={onTitleChange}
            placeholder={titlePlaceholder}
            editable={editable && Boolean(onTitleChange)}
            onEnter={() => editor?.commands.focus("start")}
          />
        </div>
      )}
      <EditorContent editor={editor} />
      {editor && editable && <FormatBubble editor={editor} />}
      {slash && <SlashMenu state={slash} active={active} />}
    </div>
  );
}
