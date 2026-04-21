import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/types/app.types';

interface AnswerRecord {
  questionId: string;
  isCorrect: boolean;
  selectedOption: string;
}

interface UseMockExamProps<T extends Question> {
  questions: T[];
  timeLimitSec: number;
  onFinish?: (answers: AnswerRecord[]) => void;
}

export function useMockExam<T extends Question>({ questions, timeLimitSec, onFinish }: UseMockExamProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);

  const finishExam = useCallback((finalAnswers: AnswerRecord[]) => {
    setIsFinished(true);
    if (onFinish) {
      onFinish(finalAnswers);
    }
  }, [onFinish]);

  // Timer
  useEffect(() => {
    if (isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishExam(answers);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, answers, finishExam]);

  const nextQuestion = useCallback(() => {
    if (!selectedOption || !questions[currentIndex]) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.answer;
    
    const newAnswers = [
      ...answers,
      {
        questionId: currentQuestion.id,
        isCorrect,
        selectedOption
      }
    ];

    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      finishExam(newAnswers);
    }
  }, [currentIndex, questions, selectedOption, answers, finishExam]);

  return {
    currentIndex,
    selectedOption,
    setSelectedOption,
    answers,
    isFinished,
    timeLeft,
    currentQuestion: questions[currentIndex] as T,
    totalQuestions: questions.length,
    progress: (currentIndex / questions.length) * 100,
    nextQuestion,
    finishExam: () => finishExam(answers)
  };
}
