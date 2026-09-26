"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function TagInput({ value, onChange, suggestions = [] }: { value: string[]; onChange: (tags: string[]) => void; suggestions?: string[] }) {
  const [draft, setDraft] = useState("");
  const add = (t: string) => {
    const tag = t.trim().toLowerCase().replace(/^#/, "");
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  };
  const open = suggestions.filter((s) => !value.includes(s)).slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex h-8 items-center gap-1 rounded-full bg-surface-2 pl-3 pr-1.5 text-[13px] text-text">
            {t}
            <button
              type="button"
              aria-label={`Verwijder ${t}`}
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="inline-flex size-5 items-center justify-center rounded-full text-muted hover:bg-oat-soft hover:text-text"
            >
              <X className="size-3 stroke-[2]" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === ",") && draft.trim()) {
              e.preventDefault();
              add(draft);
            }
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={value.length ? "Nog een" : "Voeg een tag toe"}
          aria-label="Tag toevoegen"
          className="h-8 min-w-28 flex-1 rounded-full bg-transparent px-2.5 text-[13px] outline-none transition-colors placeholder:text-faint focus:bg-oat-soft"
        />
      </div>
      {open.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {open.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="h-7 rounded-full px-2.5 text-[12px] text-muted ring-1 ring-inset ring-surface-2 transition-colors hover:bg-oat-soft hover:text-text"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
