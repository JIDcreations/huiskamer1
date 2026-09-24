import { Extension, type Editor, type Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import { Heading2, Heading3, ListChecks, Minus, Quote, Type, type LucideIcon } from "lucide-react";

export type SlashCommand = {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  icon: LucideIcon;
  run: (editor: Editor, range: Range) => void;
};

export const slashCommands: SlashCommand[] = [
  {
    id: "tekst",
    label: "Tekst",
    hint: "Gewone alinea",
    keywords: "tekst alinea paragraaf paragraph",
    icon: Type,
    run: (e, r) => e.chain().focus().deleteRange(r).setParagraph().run(),
  },
  {
    id: "kop",
    label: "Kop",
    hint: "Titel van een deel",
    keywords: "kop titel heading h2",
    icon: Heading2,
    run: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 2 }).run(),
  },
  {
    id: "subkop",
    label: "Subkop",
    hint: "Kleinere titel",
    keywords: "subkop kop heading h3",
    icon: Heading3,
    run: (e, r) => e.chain().focus().deleteRange(r).setNode("heading", { level: 3 }).run(),
  },
  {
    id: "checklist",
    label: "Checklist",
    hint: "Iets om af te vinken",
    keywords: "checklist taak todo afvinken lijst",
    icon: ListChecks,
    run: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run(),
  },
  {
    id: "citaat",
    label: "Citaat",
    hint: "Iets om te onthouden",
    keywords: "citaat quote aanhaling",
    icon: Quote,
    run: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run(),
  },
  {
    id: "scheiding",
    label: "Scheiding",
    hint: "Een rustige lijn",
    keywords: "scheiding lijn divider",
    icon: Minus,
    run: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run(),
  },
];

export function filterCommands(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return slashCommands;
  return slashCommands.filter((c) => c.keywords.split(" ").some((word) => word.startsWith(q)));
}

export type SlashState = {
  items: SlashCommand[];
  rect: DOMRect | null;
  select: (item: SlashCommand) => void;
};

type SlashOptions = {
  onChange: (state: SlashState | null) => void;
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export const SlashMenuExtension = Extension.create<SlashOptions>({
  name: "slashMenu",

  addOptions() {
    return { onChange: () => {}, onKeyDown: () => false };
  },

  addProseMirrorPlugins() {
    const { onChange, onKeyDown } = this.options;

    return [
      Suggestion<SlashCommand>({
        editor: this.editor,
        pluginKey: new PluginKey("hk-slash"),
        char: "/",
        allowSpaces: false,
        items: ({ query }) => filterCommands(query),
        command: ({ editor, range, props }) => props.run(editor, range),
        render: () => {
          const publish = (props: {
            items: SlashCommand[];
            clientRect?: (() => DOMRect | null) | null;
            command: (item: SlashCommand) => void;
          }) => onChange({ items: props.items, rect: props.clientRect?.() ?? null, select: props.command });

          return {
            onStart: publish,
            onUpdate: publish,
            onKeyDown: ({ event }) => {
              if (event.key === "Escape") {
                onChange(null);
                return true;
              }
              return onKeyDown(event);
            },
            onExit: () => onChange(null),
          };
        },
      }),
    ];
  },
});
