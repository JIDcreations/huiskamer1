"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved";

/** Bewaart kort na de laatste wijziging. Bewaart ook meteen bij het verlaten. */
export function useAutosave<T>(save: (value: T) => void, delay = 500) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pending = useRef<{ value: T } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  const flush = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (pending.current) {
      saveRef.current(pending.current.value);
      pending.current = null;
      setStatus("saved");
    }
  }, []);

  const schedule = useCallback(
    (value: T) => {
      pending.current = { value };
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(flush, delay);
    },
    [delay, flush]
  );

  useEffect(() => flush, [flush]);

  return { schedule, flush, status };
}
