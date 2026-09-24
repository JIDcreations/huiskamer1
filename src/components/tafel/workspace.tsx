"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  FileText,
  Heading2,
  ListChecks,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Quote,
  Trash2,
  Type,
} from "lucide-react";
import { Editor, TitleField, type EditorApi } from "@/components/editor/editor";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { pageTemplates, templateBlocks } from "@/components/tafel/templates";
import {
  actions,
  lastEditor,
  newBlocks,
  useAuthors,
  usePersonName,
  useSeenLookup,
  useTablePages,
  useVisit,
} from "@/lib/data";
import { formatDayLong, formatWhen } from "@/lib/format";
import { useAutosave } from "@/lib/use-autosave";
import type { Block, ID, Role, TablePage } from "@/lib/types";
import { cn } from "@/lib/utils";

export type Viewer = { id: ID; role: Role };

type WorkspaceProps = {
  clientId: ID;
  viewer: Viewer;
  /** Andere deelnemer aan de Tafel. */
  otherId: ID;
  pageId?: ID;
  basePath: string;
};

// ------------------------------------------------------------------ Lijst

function PageListItem({ page, href, active, isNew, viewer }: { page: TablePage; href: string; active: boolean; isNew: boolean; viewer: Viewer }) {
  const name = usePersonName();
  const last = lastEditor(page);
  const who = last ? (last.authorId === viewer.id ? "Jij" : name(last.authorId)) : name(page.createdBy);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group block rounded-xl px-3.5 py-3 transition-colors duration-150",
        active ? "bg-surface shadow-soft ring-1 ring-surface-2" : "hover:bg-oat-soft"
      )}
    >
      <span className="flex items-center gap-2">
        <span className={cn("min-w-0 flex-1 truncate text-[14px]", isNew ? "font-semibold text-text" : "font-medium text-text")}>
          {page.title || "Zonder titel"}
        </span>
        {isNew && <span aria-label="Nieuw" className="size-2 shrink-0 rounded-full bg-accent" />}
      </span>
      <span className="mt-0.5 block truncate text-[12px] text-muted">
        {who}, {formatWhen(page.updatedAt)}
      </span>
    </Link>
  );
}

function PageList({ pages, activeId, viewer, basePath, onCreate }: { pages: TablePage[]; activeId?: ID; viewer: Viewer; basePath: string; onCreate: () => void }) {
  const seen = useSeenLookup(viewer.role);
  const pinned = pages.filter((p) => p.pinned);
  const rest = pages.filter((p) => !p.pinned);

  const group = (label: string, list: TablePage[]) =>
    list.length > 0 && (
      <div>
        <p className="mb-1.5 px-3.5 text-[11px] font-medium tracking-[0.08em] text-faint uppercase">{label}</p>
        <div className="flex flex-col gap-0.5">
          {list.map((p) => (
            <PageListItem
              key={p.id}
              page={p}
              href={`${basePath}/${p.id}`}
              active={p.id === activeId}
              isNew={p.id !== activeId && newBlocks(p, viewer.id, seen(p.id)).length > 0}
              viewer={viewer}
            />
          ))}
        </div>
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      <Button variant="secondary" className="w-full justify-start" onClick={onCreate}>
        <Plus /> Nieuwe pagina
      </Button>
      {group("Vastgepind", pinned)}
      {group(pinned.length ? "Alle pagina's" : "Pagina's", rest)}
    </div>
  );
}

// ------------------------------------------------------------------ Pagina

const addButtons = [
  { kind: "paragraph", label: "Tekst", icon: Type },
  { kind: "checklist", label: "Taak", icon: ListChecks },
  { kind: "heading", label: "Kop", icon: Heading2 },
  { kind: "quote", label: "Citaat", icon: Quote },
] as const;

function SaveState({ status }: { status: "idle" | "saving" | "saved" }) {
  return (
    <span aria-live="polite" className="inline-flex h-8 items-center gap-1.5 text-[12px] text-faint">
      {status === "saving" && "Bewaren..."}
      {status === "saved" && (
        <>
          <Check className="size-3.5 stroke-[2]" /> Bewaard
        </>
      )}
    </span>
  );
}

function PageView({ page, viewer, otherId, basePath }: { page: TablePage; viewer: Viewer; otherId: ID; basePath: string }) {
  const router = useRouter();
  const name = usePersonName();
  const authors = useAuthors(page.clientId);
  const since = useVisit(viewer.role, page.id);
  const highlight = useMemo(() => ({ viewerId: viewer.id, since }), [viewer.id, since]);
  const fresh = useMemo(() => newBlocks(page, viewer.id, since), [page, viewer.id, since]);

  const [title, setTitle] = useState(page.title);
  const [editorKey, setEditorKey] = useState(0);
  const [started, setStarted] = useState(page.blocks.length > 0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const api = useRef<EditorApi | null>(null);

  const blocksSave = useAutosave<Block[]>((blocks) => actions.updatePage(page.id, { blocks }));
  const titleSave = useAutosave<string>((t) => actions.updatePage(page.id, { title: t }));
  const status = blocksSave.status === "saving" || titleSave.status === "saving" ? "saving" : blocksSave.status === "saved" || titleSave.status === "saved" ? "saved" : "idle";

  const last = lastEditor(page);
  const canDelete = page.createdBy === viewer.id;

  function applyTemplate(id: string) {
    const t = pageTemplates.find((x) => x.id === id)!;
    const nextTitle = title.trim() ? title : t.title(formatDayLong(new Date()));
    actions.updatePage(page.id, { blocks: templateBlocks(t, viewer.id), title: nextTitle });
    setTitle(nextTitle);
    setStarted(true);
    setEditorKey((k) => k + 1);
  }

  return (
    <article>
      {/* Werkbalk */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <Link href={basePath} className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-text lg:invisible">
          <ArrowLeft className="size-4 stroke-[1.5]" /> Alle pagina&apos;s
        </Link>
        <div className="flex items-center gap-1">
          <SaveState status={status} />
          <Button
            variant="quiet"
            size="sm"
            onClick={() => {
              actions.togglePin(page.id);
              toast(page.pinned ? "Losgemaakt" : "Vastgepind");
            }}
            aria-pressed={page.pinned}
          >
            {page.pinned ? <PinOff /> : <Pin />}
            <span className="hidden sm:inline">{page.pinned ? "Losmaken" : "Vastpinnen"}</span>
          </Button>
          {canDelete && (
            <Menu>
              <MenuTrigger asChild>
                <Button variant="quiet" size="icon-sm" aria-label="Meer">
                  <MoreHorizontal />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <MenuItem onSelect={() => setConfirmDelete(true)}>
                  <Trash2 /> Pagina verwijderen
                </MenuItem>
              </MenuContent>
            </Menu>
          )}
        </div>
      </div>

      {/* Papier */}
      <div className="hk-tafel rounded-card bg-surface px-4 pb-6 pt-8 shadow-soft ring-1 ring-surface-2/60 sm:px-8 md:px-12 md:pb-8 md:pt-12">
        <header className="mx-auto max-w-[680px] pl-[var(--hk-gutter)]">
          <TitleField
            value={title}
            onChange={(t) => {
              setTitle(t);
              titleSave.schedule(t);
            }}
            placeholder="Geef deze pagina een titel"
            editable
            onEnter={() => api.current?.focusStart()}
          />
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted">
            <span>Samen met {name(otherId)}</span>
            {last && (
              <span className="text-faint">
                Bijgewerkt {formatWhen(last.updatedAt)}
                {last.authorId === viewer.id ? " door jou" : ` door ${name(last.authorId)}`}
              </span>
            )}
          </div>

          <AnimatePresence>
            {fresh.length > 0 && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-oat-soft px-3 py-1.5 text-[13px] text-muted"
              >
                <span className="size-1.5 rounded-full bg-accent" />
                {fresh.length === 1 ? "1 nieuw blok" : `${fresh.length} nieuwe blokken`} van {name(otherId)} sinds je laatste bezoek
              </motion.p>
            )}
          </AnimatePresence>
        </header>

        <div className="mt-8">
          {!started && (
            <div className="mx-auto mb-6 max-w-[680px] pl-[var(--hk-gutter)]">
              <p className="mb-3 text-[13px] text-muted">Begin met een opzet, of schrijf gewoon.</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[...pageTemplates]
                  .sort((a, b) => Number(b.forRole === viewer.role) - Number(a.forRole === viewer.role))
                  .map((t) => (
                    <button
                      key={t.id}
                      onClick={() => applyTemplate(t.id)}
                      className="rounded-xl bg-oat-soft px-4 py-3 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="block text-[14px] font-medium">{t.label}</span>
                      <span className="mt-0.5 block text-[12px] text-muted">{t.hint}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <Editor
            key={editorKey}
            blocks={page.blocks}
            authorId={viewer.id}
            authors={authors}
            showAuthors
            highlight={highlight}
            placeholder="Schrijf hier. Typ / voor een kop, taak of citaat."
            autoFocus={!page.blocks.length && Boolean(page.title)}
            onReady={(a) => (api.current = a)}
            onChange={(blocks) => {
              if (!started) setStarted(true);
              blocksSave.schedule(blocks);
            }}
          />

          {/* Klik in de lege ruimte onderaan: verder schrijven. */}
          <div
            aria-hidden
            className="mx-auto h-10 max-w-[680px] cursor-text"
            onMouseDown={(e) => {
              e.preventDefault();
              api.current?.focusEnd();
            }}
          />

          <div className="mx-auto flex max-w-[680px] flex-wrap items-center gap-1 border-t border-surface-2 pl-[var(--hk-gutter)] pt-4">
            <span className="mr-1 text-[13px] text-faint">Voeg toe</span>
            {addButtons.map((b) => (
              <Button
                key={b.kind}
                variant="quiet"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setStarted(true);
                  api.current?.append(b.kind);
                }}
              >
                <b.icon /> {b.label}
              </Button>
            ))}
            <span className="ml-auto hidden text-[12px] text-faint md:inline">Selecteer tekst voor opmaak</span>
          </div>
        </div>
      </div>

      <Sheet
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Pagina verwijderen?"
        description={`"${page.title || "Zonder titel"}" verdwijnt voor jullie allebei. Dit kan je niet ongedaan maken.`}
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Annuleren
          </Button>
          <Button
            onClick={() => {
              actions.deletePage(page.id);
              setConfirmDelete(false);
              toast("Pagina verwijderd");
              router.push(basePath);
            }}
          >
            Verwijderen
          </Button>
        </div>
      </Sheet>
    </article>
  );
}

// ------------------------------------------------------------------ Werkruimte

export function TafelWorkspace({ clientId, viewer, otherId, pageId, basePath }: WorkspaceProps) {
  const router = useRouter();
  const pages = useTablePages(clientId);
  const active = pageId ? pages.find((p) => p.id === pageId) : pages[0];

  function create() {
    const id = actions.createPage(clientId, viewer.id);
    router.push(`${basePath}/${id}`);
  }

  if (pages.length === 0) {
    return (
      <div className="rounded-card bg-surface shadow-soft ring-1 ring-surface-2/60">
        <EmptyState
          title="Nog niets op de Tafel"
          description="Hier schrijven jullie samen: een samenvatting, een vraag voor volgende keer, een oefening."
          action={
            <Button onClick={create}>
              <Plus /> Eerste pagina
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className={cn("lg:sticky lg:top-24 lg:self-start", pageId && "hidden lg:block")}>
        <PageList pages={pages} activeId={active?.id} viewer={viewer} basePath={basePath} onCreate={create} />
      </aside>
      <div className={cn(!pageId && "hidden lg:block")}>
        {active ? (
          <PageView key={active.id} page={active} viewer={viewer} otherId={otherId} basePath={basePath} />
        ) : (
          <div className="rounded-card bg-surface shadow-soft">
            <EmptyState title="Deze pagina bestaat niet meer" description="Misschien werd ze verwijderd." />
          </div>
        )}
      </div>
    </div>
  );
}

export function TafelIntro({ other }: { other: string }) {
  return (
    <p className="mt-2 flex items-center gap-2 text-[14px] text-muted">
      <FileText className="size-4 stroke-[1.5] text-faint" />
      Gedeelde pagina&apos;s met {other}. Jullie schrijven samen, niet in een gesprek.
    </p>
  );
}

