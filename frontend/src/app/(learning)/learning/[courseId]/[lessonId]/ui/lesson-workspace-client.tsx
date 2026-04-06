"use client";

import { useCallback } from "react";
import { useProgress } from "@/hooks/useProgress";
import { useSocket } from "@/hooks/useSocket";

export function LessonWorkspaceClient({
  courseId,
  lessonId,
}: {
  courseId: string;
  lessonId: string;
}) {
  const socket = useSocket(false);
  void socket;

  const onSave = useCallback(
    (p: {
      courseId: string;
      lessonId: string;
      lastWatchedSecond: number;
      completed?: boolean;
    }) => {
      console.debug("[progress]", p);
    },
    [],
  );

  const { report } = useProgress(onSave, 8000);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <button
        type="button"
        className="glass rounded-lg border border-primary/12 px-3 py-2 text-left text-sm transition hover:border-primary/25"
        onClick={() =>
          report({
            courseId,
            lessonId,
            lastWatchedSecond: 150,
            completed: false,
          })
        }
      >
        <span className="font-medium text-foreground">Thảo luận</span>
        <span className="text-muted-foreground block text-xs">
          Socket.io chat (bật useSocket(true) khi có namespace).
        </span>
      </button>
      <button
        type="button"
        className="glass rounded-lg border border-primary/12 px-3 py-2 text-left text-sm transition hover:border-primary/25"
        onClick={() =>
          report({
            courseId,
            lessonId,
            lastWatchedSecond: 30,
          })
        }
      >
        <span className="font-medium text-foreground">Ghi chú</span>
        <span className="text-muted-foreground block text-xs">
          Lưu kèm <code className="text-primary/90">video_timestamp</code>.
        </span>
      </button>
      <div className="glass rounded-lg border border-primary/12 px-3 py-2 text-sm">
        <span className="font-medium text-foreground">Tài nguyên</span>
        <span className="text-muted-foreground block text-xs">
          PDF / Docx từ S3 hoặc Cloudinary.
        </span>
      </div>
    </div>
  );
}
