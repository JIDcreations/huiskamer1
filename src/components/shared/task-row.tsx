"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Pause, Play } from "lucide-react";
import { RhythmLabel } from "@/components/shared/rhythm";
import { ShareSwitch } from "@/components/shared/share";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, dayOf, excerpt, usePrefs, type TaskToday } from "@/lib/data";
import { plainText } from "@/lib/format";
import type { JournalEntry, Task } from "@/lib/types";
import { cn } from "@/lib/utils";

// ------------------------------------------------------------------ Meditatie

function Timer({ minutes, onFinished }: { minutes: number; onFinished: () => void }) {
  const total = minutes * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const finished = left === 0;
  useEffect(() => {
    if (finished) onFinished();
  }, [finished, onFinished]);

  const progress = 1 - left / total;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div className="flex flex-col items-center py-2">
      <div className="relative flex size-48 items-center justify-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--oat)" strokeWidth="2" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="var(--mocha)"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength={1}
            animate={{ pathLength: progress }}
            transition={{ duration: 0.8, ease: "linear" }}
          />
        </svg>
        <motion.span
          className="absolute size-24 rounded-full bg-oat-soft"
          animate={running ? { scale: [1, 1.12, 1] } : { scale: 1 }}
          transition={running ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
        />
        <span role="timer" aria-label="Resterende tijd" className="relative text-[34px] font-semibold tabular-nums tracking-tight">
          {mm}:{ss}
        </span>
      </div>
      <p className="mt-3 h-5 text-[14px] text-muted">
        {finished ? "Mooi. Neem even de tijd voor je verdergaat." : running ? "Adem in met de cirkel, adem uit als hij krimpt." : ""}
      </p>
      {!finished && (
        <Button className="mt-4" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause /> : <Play />}
          {running ? "Pauze" : left === total ? "Begin" : "Verder"}
        </Button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------ Schaal

export function ScalePicker({ value, onChange, label }: { value?: number; onChange: (v: number) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="grid grid-cols-10 gap-1">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              "h-10 rounded-full text-[14px] tabular-nums transition-colors duration-200",
              active ? "bg-accent font-medium text-on-accent" : "bg-oat-soft text-muted hover:bg-surface-2 hover:text-text"
            )}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

// ------------------------------------------------------------------ Sheet

/**
 * Invullen gebeurt altijd hier: titel, uitleg van de psycholoog, het invulveld, de deel-toggle, opslaan.
 * Na opslaan staat het resultaat in het Logboek.
 */
export function TaskSheet({
  task,
  entry,
  day = dayOf(new Date()),
  open,
  onOpenChange,
}: {
  task: Task;
  entry?: JournalEntry;
  day?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const prefs = usePrefs();
  const [text, setText] = useState(() => (entry ? entry.blocks.map((b) => plainText(b.content)).join("\n") : ""));
  const [scale, setScale] = useState<number | undefined>(entry?.scale);
  const [shared, setShared] = useState(entry?.sharedWithPsychologist ?? prefs.defaultShare);
  const [timerDone, setTimerDone] = useState(Boolean(entry));

  const canSave =
    task.kind === "tekst" ? Boolean(text.trim()) : task.kind === "schaal" ? scale !== undefined : task.kind === "meditatie" ? timerDone : true;

  function save() {
    actions.completeTask(task.id, { day, text, scale, shared });
    toast(entry ? "Aangepast" : "Bewaard in je logboek");
    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={task.title} description={task.description}>
      <div className="flex flex-col gap-5">
        {task.kind === "meditatie" && (
          <>
            <Timer minutes={task.minutes ?? 10} onFinished={() => setTimerDone(true)} />
            {!timerDone && (
              <button type="button" className="self-center text-[13px] text-muted underline decoration-surface-2 underline-offset-4 hover:text-text" onClick={() => setTimerDone(true)}>
                Ik deed het al
              </button>
            )}
          </>
        )}

        {task.kind === "schaal" && (
          <div>
            <p className="mb-2 text-[13px] text-muted">{task.scaleLabel ?? "Score"}, van 1 tot 10</p>
            <ScalePicker value={scale} onChange={setScale} label={task.scaleLabel ?? task.title} />
          </div>
        )}

        {(task.kind !== "meditatie" || timerDone) && (
          <div>
            {task.kind !== "tekst" && (
              <p className="mb-2 text-[13px] text-muted">{task.kind === "meditatie" ? "Hoe was het? Als je wil." : "Iets erbij schrijven? Als je wil."}</p>
            )}
            <Textarea
              aria-label={task.kind === "tekst" ? "Je antwoord" : "Notitie"}
              autoFocus={task.kind === "tekst"}
              value={text}
              rows={task.kind === "tekst" ? 5 : 2}
              placeholder={task.kind === "tekst" ? "Schrijf zoals het komt. Kort mag." : "Een zin is genoeg."}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
        )}

        <div className="rounded-xl bg-oat-soft/70 px-4 py-3">
          <ShareSwitch shared={shared} onChange={setShared} />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Later
          </Button>
          <Button disabled={!canSave} onClick={save}>
            {task.kind === "afvinken" ? "Gedaan" : "Bewaren"}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}

// ------------------------------------------------------------------ Rij

const actionLabel: Record<Task["kind"], string> = {
  afvinken: "Afvinken",
  tekst: "Invullen",
  schaal: "Invullen",
  meditatie: "Start",
};

/** Eén rij: titel, ritme-label, één actie. Uitleg zit in de sheet. */
export function TaskRow({ item }: { item: TaskToday }) {
  const { task, done, entry, progress } = item;
  const [open, setOpen] = useState(false);
  const summary = entry ? (task.kind === "schaal" && entry.scale ? `${entry.scale} op 10` : excerpt(entry.blocks, 60)) : "";

  return (
    <motion.li
      layout
      initial={false}
      animate={{ opacity: done ? 0.62 : 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3.5 py-3"
    >
      {task.kind === "afvinken" || done ? (
        <Checkbox
          checked={done}
          label={task.title}
          onChange={(c) => {
            if (c) {
              actions.completeTask(task.id);
              toast("Afgevinkt");
            } else actions.uncompleteTask(task.id);
          }}
        />
      ) : (
        <span aria-hidden className="block size-6 shrink-0 rounded-full ring-[1.5px] ring-inset ring-taupe/70" />
      )}

      <button type="button" onClick={() => setOpen(true)} className="group min-w-0 flex-1 text-left">
        <span className={cn("block truncate text-[15px] font-medium transition-colors", done && "text-muted")}>{task.title}</span>
        <span className="block truncate">
          {done && summary ? <span className="text-[12px] text-muted">{summary}</span> : <RhythmLabel rhythm={task.rhythm} progress={progress} />}
        </span>
      </button>

      <AnimatePresence initial={false} mode="wait">
        {!done && task.kind !== "afvinken" ? (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <Button variant="soft" size="sm" onClick={() => setOpen(true)}>
              {task.kind === "meditatie" && <Play />}
              {actionLabel[task.kind]}
            </Button>
          </motion.div>
        ) : (
          <motion.button
            key="open"
            type="button"
            aria-label={`${task.title} openen`}
            onClick={() => setOpen(true)}
            className="inline-flex size-8 items-center justify-center rounded-full text-taupe transition-colors hover:bg-oat-soft hover:text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ChevronRight className="size-4 stroke-[1.5]" />
          </motion.button>
        )}
      </AnimatePresence>

      <TaskSheet key={`${open}-${entry?.id ?? "new"}`} task={task} entry={entry} open={open} onOpenChange={setOpen} />
    </motion.li>
  );
}
