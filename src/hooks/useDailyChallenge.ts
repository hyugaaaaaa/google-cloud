import { useState, useCallback } from 'react';
import type { Question } from '@/types/app.types';

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
}

interface UseDailyChallengeProps {
  questions: Question[];
  initialCompleted: boolean;
  onFinish?: (answers: AnswerRecord[]) => Promise<void>;
}

export function useDailyChallenge({ questions, initialCompleted, onFinish }: UseDailyChallengeProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(initialCompleted);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectOption = useCallback((option: string) => {
    if (showExplanation || !questions[currentIndex]) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = option === currentQuestion.answer;
    
    setSelectedOption(option);
    setShowExplanation(true);
    
    setAnswers(prev => [
      ...prev,
      {
        questionId: currentQuestion.id,
        isCorrect,
        userAnswer: option
      }
    ]);
  }, [currentIndex, questions, showExplanation]);

  const nextQuestion = useCallback(async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Finish
      setIsSaving(true);
      if (onFinish) {
        await onFinish(answers);
      }
      setIsFinished(true);
      setIsSaving(false);
    }
  }, [currentIndex, questions.length, answers, onFinish]);

  return {
    currentIndex,
    selectedOption,
    showExplanation,
    isFinished,
    isSaving,
    answers,
    currentQuestion: questions[currentIndex],
    totalQuestions: questions.length,
    isCorrect: selectedOption === questions[currentIndex]?.answer,
    selectOption,
    nextQuestion
  };
}
