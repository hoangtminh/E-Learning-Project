"use client";

import { useCallback, useRef } from "react";

type ProgressPayload = {
  courseId: string;
  lessonId: string;
  lastWatchedSecond: number;
  completed?: boolean;
};

/**
 * Debounced progress callback (wire to API every 5–10s as per spec).
 */
export function useProgress(
  onSave: (p: ProgressPayload) => void,
  debounceMs = 8000,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const last = useRef<ProgressPayload | null>(null);

  const report = useCallback(
    (p: ProgressPayload) => {
      last.current = p;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        if (last.current) onSave(last.current);
      }, debounceMs);
    },
    [debounceMs, onSave],
  );

  return { report };
}
