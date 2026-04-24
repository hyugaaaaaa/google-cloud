import { useState, useCallback, useEffect } from 'react';
import type { Question } from '@/types/app.types';

interface UseQuizProps {
  questions: Question[];
  onAnswer?: (questionId: string, isCorrect: boolean, option: string, currentIndex: number, totalQuestions: number) => void;
  persistenceKey?: string;
}

type SavedQuizSession = {
  questionIds: string[];
  currentIndex: number;
  selectedOption: string | null;
  correctCount: number;
};

function readSavedQuizSession(key?: string): SavedQuizSession | null {
  if (!key || typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SavedQuizSession;
    if (!Array.isArray(parsed.questionIds) || parsed.questionIds.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useQuiz({ questions, onAnswer, persistenceKey }: UseQuizProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [savedSessionMeta, setSavedSessionMeta] = useState<{
    current: number;
    total: number;
  } | null>(() => {
    const saved = readSavedQuizSession(persistenceKey);
    if (!saved) return null;
    return {
      current: Math.min(saved.currentIndex + 1, saved.questionIds.length),
      total: saved.questionIds.length,
    };
  });
  const hasSavedSession = savedSessionMeta !== null;

  const loadSavedSession = useCallback((): SavedQuizSession | null => {
    return readSavedQuizSession(persistenceKey);
  }, [persistenceKey]);

  const clearSavedSession = useCallback(() => {
    if (!persistenceKey || typeof window === 'undefined') return;
    window.localStorage.removeItem(persistenceKey);
    setSavedSessionMeta(null);
  }, [persistenceKey]);

  const startQuiz = useCallback((count: number, sourceQuestions?: Question[]) => {
    const questionPool = sourceQuestions && sourceQuestions.length > 0 ? sourceQuestions : questions;
    const shuffled = [...questionPool].sort(() => Math.random() - 0.5);
    const selected = count === -1 ? shuffled : shuffled.slice(0, count);
    
    setQuizQuestions(selected);
    setIsStarted(true);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsFinished(false);
    setCorrectCount(0);
    clearSavedSession();
  }, [questions, clearSavedSession]);

  const selectOption = useCallback((option: string) => {
    if (selectedOption !== null || !quizQuestions[currentIndex]) return;

    const currentQuestion = quizQuestions[currentIndex];
    const isCorrect = option === currentQuestion.answer;
    
    setSelectedOption(option);
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }

    if (onAnswer) {
      onAnswer(currentQuestion.id, isCorrect, option, currentIndex, quizQuestions.length);
    }
  }, [currentIndex, quizQuestions, selectedOption, onAnswer]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setIsFinished(true);
      clearSavedSession();
    }
  }, [clearSavedSession, currentIndex, quizQuestions.length]);

  const resetQuiz = useCallback(() => {
    setIsStarted(false);
    setQuizQuestions([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsFinished(false);
    setCorrectCount(0);
    clearSavedSession();
  }, [clearSavedSession]);

  const resumeQuiz = useCallback(() => {
    const saved = loadSavedSession();
    if (!saved) return false;

    const questionMap = new Map(questions.map((question) => [question.id, question]));
    const restoredQuestions = saved.questionIds
      .map((id) => questionMap.get(id))
      .filter((question): question is Question => Boolean(question));

    if (restoredQuestions.length === 0) {
      clearSavedSession();
      return false;
    }

    setQuizQuestions(restoredQuestions);
    setIsStarted(true);
    setCurrentIndex(Math.min(saved.currentIndex, restoredQuestions.length - 1));
    setSelectedOption(saved.selectedOption);
    setIsFinished(false);
    setCorrectCount(saved.correctCount);
    setSavedSessionMeta(null);
    return true;
  }, [clearSavedSession, loadSavedSession, questions]);

  const discardSavedSession = useCallback(() => {
    clearSavedSession();
  }, [clearSavedSession]);

  useEffect(() => {
    if (!persistenceKey || typeof window === 'undefined') return;

    if (!isStarted || isFinished || quizQuestions.length === 0) {
      return;
    }

    const payload: SavedQuizSession = {
      questionIds: quizQuestions.map((question) => question.id),
      currentIndex,
      selectedOption,
      correctCount,
    };

    window.localStorage.setItem(persistenceKey, JSON.stringify(payload));
  }, [
    correctCount,
    currentIndex,
    isFinished,
    isStarted,
    persistenceKey,
    quizQuestions,
    selectedOption,
  ]);

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
    resetQuiz,
    hasSavedSession,
    savedSessionMeta,
    resumeQuiz,
    discardSavedSession,
  };
}
