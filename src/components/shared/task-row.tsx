"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { toast } from "@/components/ui/toast";
import { actions, dayOf, entryFor, recurrenceLabel, useTaskEntries, weekProgress } from "@/lib/data";
import { formatRelativeDay } from "@/lib/format";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

function MeditationTimer({ task, open, onOpenChange, onDone }: { task: Task; open: boolean; onOpenChange: (o: boolean) => void; onDone: () => void }) {
  const total = (task.minutes ?? 10) * 60;
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, [running]);

  const finished = left === 0;
  const progress = 1 - left / total;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setRunning(false);
        onOpenChange(o);
      }}
      title={task.title}
      description={task.description}
    >
      <div className="flex flex-col items-center py-4">
        <div className="relative flex size-52 items-center justify-center">
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
            className="absolute size-28 rounded-full bg-oat-soft"
            animate={running ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={running ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          />
          <span className="relative text-[36px] font-semibold tabular-nums tracking-tight">
            {mm}:{ss}
          </span>
        </div>
        <p className="mt-4 h-5 text-[14px] text-muted">
          {finished ? "Mooi. Neem even de tijd voor je verdergaat." : running ? "Adem in met de cirkel, adem uit als hij krimpt." : ""}
        </p>
        <div className="mt-6 flex gap-2">
          {finished ? (
            <Button onClick={onDone}>Klaar</Button>
          ) : (
            <>
              <Button onClick={() => setRunning((r) => !r)}>
                {running ? <Pause /> : <Play />}
                {running ? "Pauze" : left === total ? "Begin" : "Verder"}
              </Button>
              <Button variant="ghost" onClick={onDone}>
                Ik deed het al
              </Button>
            </>
          )}
        </div>
      </div>
    </Sheet>
  );
}

/** Eén opdracht voor één dag, met de juiste manier van invullen. */
export function TaskRow({ task, date = new Date(), showProgress = true }: { task: Task; date?: Date; showProgress?: boolean }) {
  const entries = useTaskEntries();
  const day = dayOf(date);
  const entry = entryFor(entries, task.id, day);
  const done = Boolean(entry?.completed);
  const progress = task.recurrence ? weekProgress(task, entries, date) : null;

  const [open, setOpen] = useState(false);
  const [answer, setAnswer] = useState(entry?.answer ?? "");
  const [timer, setTimer] = useState(false);

  const complete = (patch: { completed: boolean; answer?: string; scale?: number }) => actions.setTaskEntry(task.id, day, patch);

  const meta = [
    task.recurrence ? recurrenceLabel(task) : task.dueDate ? `Tegen ${formatRelativeDay(task.dueDate)}` : "Eenmalig",
    showProgress && progress && progress.total > 0 ? `${progress.done} van ${progress.total} deze week` : null,
  ].filter(Boolean);

  return (
    <div className="py-3.5">
      <div className="flex items-start gap-3.5">
        <div className="pt-0.5">
          {task.kind === "afvinken" || done ? (
            <Checkbox
              checked={done}
              label={task.title}
              onChange={(c) => {
                complete({ completed: c });
                if (c) toast("Afgevinkt");
              }}
            />
          ) : (
            <span aria-hidden className="block size-6 rounded-full ring-[1.5px] ring-inset ring-surface-2" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className={cn("text-[15px] font-medium transition-colors", done && "text-faint")}>{task.title}</p>
            <p className="text-[12px] text-muted">{meta.join(", ")}</p>
          </div>

          {!done && task.kind !== "afvinken" && <p className="mt-0.5 text-[14px] text-muted">{task.description}</p>}

          {/* Tekst */}
          {task.kind === "tekst" && !done && (
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <Textarea
                    autoFocus
                    className="mt-3"
                    value={answer}
                    placeholder="Schrijf je antwoord. Kort mag."
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                      Later
                    </Button>
                    <Button
                      size="sm"
                      disabled={!answer.trim()}
                      onClick={() => {
                        complete({ completed: true, answer: answer.trim() });
                        setOpen(false);
                        toast("Bewaard");
                      }}
                    >
                      Bewaren
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <Button variant="soft" size="sm" className="mt-2.5" onClick={() => setOpen(true)}>
                  Invullen
                </Button>
              )}
            </AnimatePresence>
          )}
          {task.kind === "tekst" && done && entry?.answer && (
            <p className="mt-1 text-[14px] text-muted">
              {entry.answer}{" "}
              <button className="text-faint underline decoration-surface-2 underline-offset-2 hover:text-muted" onClick={() => complete({ completed: false })}>
                Aanpassen
              </button>
            </p>
          )}

          {/* Schaal */}
          {task.kind === "schaal" && (
            <div className="mt-2.5">
              {task.scaleLabel && <p className="mb-1.5 text-[12px] text-faint">{task.scaleLabel}, van 1 tot 10</p>}
              <div role="radiogroup" aria-label={task.scaleLabel ?? task.title} className="flex flex-wrap gap-1">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => {
                  const active = entry?.scale === v;
                  return (
                    <button
                      key={v}
                      role="radio"
                      aria-checked={active}
                      onClick={() => {
                        complete({ completed: true, scale: v });
                        if (!done) toast("Bewaard");
                      }}
                      className={cn(
                        "size-8 rounded-full text-[13px] tabular-nums transition-colors",
                        active ? "bg-accent font-medium text-on-accent" : "bg-oat-soft text-muted hover:bg-surface-2 hover:text-text"
                      )}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Meditatie */}
          {task.kind === "meditatie" && !done && (
            <Button variant="soft" size="sm" className="mt-2.5" onClick={() => setTimer(true)}>
              <Play /> Start, {task.minutes ?? 10} min
            </Button>
          )}
        </div>
      </div>

      {task.kind === "meditatie" && (
        <MeditationTimer
          key={String(timer)}
          task={task}
          open={timer}
          onOpenChange={setTimer}
          onDone={() => {
            complete({ completed: true });
            setTimer(false);
            toast("Afgevinkt");
          }}
        />
      )}
    </div>
  );
}
