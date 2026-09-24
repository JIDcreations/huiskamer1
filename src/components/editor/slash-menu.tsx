"use client";

import { createPortal } from "react-dom";
import type { SlashState } from "@/components/editor/slash";
import { cn } from "@/lib/utils";

const WIDTH = 260;
const MAX_HEIGHT = 320;

export function SlashMenu({ state, active }: { state: SlashState; active: number }) {
  const { rect, items } = state;
  if (!rect) return null;

  const below = rect.bottom + MAX_HEIGHT + 16 < window.innerHeight;
  const left = Math.min(rect.left, window.innerWidth - WIDTH - 12);
  const style: React.CSSProperties = below
    ? { top: rect.bottom + 8, left }
    : { bottom: window.innerHeight - rect.top + 8, left };

  return createPortal(
    <div
      role="listbox"
      aria-label="Bloktypes"
      style={{ ...style, width: WIDTH, maxHeight: MAX_HEIGHT }}
      className="fixed z-50 animate-pop overflow-y-auto rounded-xl bg-surface p-1.5 shadow-soft ring-1 ring-surface-2"
      onMouseDown={(e) => e.preventDefault()}
    >
      {items.length === 0 ? (
        <p className="px-3 py-2 text-[13px] text-muted">Niets gevonden</p>
      ) : (
        items.map((item, i) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              role="option"
              aria-selected={i === active}
              onClick={() => state.select(item)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors",
                i === active ? "bg-oat-soft" : "hover:bg-oat-soft"
              )}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-surface ring-1 ring-surface-2">
                <Icon className="size-4 stroke-[1.5] text-muted" />
              </span>
              <span>
                <span className="block text-[14px] font-medium text-text">{item.label}</span>
                <span className="block text-[12px] text-muted">{item.hint}</span>
              </span>
            </button>
          );
        })
      )}
    </div>,
    document.body
  );
}
