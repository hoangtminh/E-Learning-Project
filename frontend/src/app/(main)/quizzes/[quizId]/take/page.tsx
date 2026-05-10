"use client";

import { use, useEffect, useState } from "react";
import { QuizRunner } from "@/components/main/quizzes/QuizRunner";
import { useQuiz } from "@/contexts/QuizContext";
import { Quiz } from "@/api/quizzes";
import { Loader2 } from "lucide-react";

export default function TakeQuizPage({ params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = use(params);
  const { fetchQuiz } = useQuiz();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      try {
        const data = await fetchQuiz(quizId);
        setQuiz(data);
      } catch (err) {
        setError("Không thể tải bài thi. Vui lòng thử lại sau.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId, fetchQuiz]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang tải bài thi...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive font-medium">{error || "Không tìm thấy bài thi."}</p>
      </div>
    );
  }

  return <QuizRunner quiz={quiz} />;
}
