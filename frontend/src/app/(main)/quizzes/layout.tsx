import { QuizProvider } from '@/contexts/QuizContext';
import React from 'react';

const QuizLayout = ({ children }: { children: React.ReactNode }) => {
  return <QuizProvider>{children}</QuizProvider>;
};

export default QuizLayout;
