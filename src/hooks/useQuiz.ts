import { useState, useCallback } from 'react';
import type { Question } from '@/types/app.types';

interface UseQuizProps {
  questions: Question[];
  onAnswer?: (questionId: string, isCorrect: boolean, option: string) => void;
}

export function useQuiz({ questions, onAnswer }: UseQuizProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const startQuiz = useCallback((count: number) => {
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const selected = count === -1 ? shuffled : shuffled.slice(0, count);
    
    setQuizQuestions(selected);
    setIsStarted(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsFinished(false);
    setCorrectCount(0);
  }, [questions]);

  const selectOption = useCallback((option: string) => {
    if (selectedOption !== null || !quizQuestions[currentIndex]) return;

    const currentQuestion = quizQuestions[currentIndex];
    const isCorrect = option === currentQuestion.answer;
    
    setSelectedOption(option);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    if (onAnswer) {
      onAnswer(currentQuestion.id, isCorrect, option);
    }
  }, [currentIndex, quizQuestions, selectedOption, onAnswer]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
    }
  }, [currentIndex, quizQuestions.length]);

  const resetQuiz = useCallback(() => {
    setIsStarted(false);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsFinished(false);
    setCorrectCount(0);
  }, []);

  return {
    isStarted,
    quizQuestions,
    currentIndex,
    selectedOption,
    isFinished,
    correctCount,
    currentQuestion: quizQuestions[currentIndex],
    isAnswered: selectedOption !== null,
    progress: quizQuestions.length > 0 ? ((currentIndex + (selectedOption !== null ? 1 : 0)) / quizQuestions.length) * 100 : 0,
    startQuiz,
    selectOption,
    nextQuestion,
    resetQuiz
  };
}
