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
  persistenceKey?: string;
}

type SavedMockExamSession = {
  currentIndex: number;
  selectedOption: string | null;
  answers: AnswerRecord[];
  timeLeft: number;
};

function readSavedMockExamSession(key?: string): SavedMockExamSession | null {
  if (!key || typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(key);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SavedMockExamSession;
    if (!Array.isArray(parsed.answers)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useMockExam<T extends Question>({
  questions,
  timeLimitSec,
  onFinish,
  persistenceKey,
}: UseMockExamProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [savedSessionMeta, setSavedSessionMeta] = useState<{
    current: number;
    total: number;
    remainingSec: number;
  } | null>(() => {
    const saved = readSavedMockExamSession(persistenceKey);
    if (!saved) return null;
    return {
      current: Math.min(saved.currentIndex + 1, questions.length),
      total: questions.length,
      remainingSec: saved.timeLeft,
    };
  });
  const hasSavedSession = savedSessionMeta !== null;
  const [isRunning, setIsRunning] = useState(() => !readSavedMockExamSession(persistenceKey));
  const isInitialized = true;

  const loadSavedSession = useCallback((): SavedMockExamSession | null => {
    return readSavedMockExamSession(persistenceKey);
  }, [persistenceKey]);

  const clearSavedSession = useCallback(() => {
    if (!persistenceKey || typeof window === 'undefined') return;
    window.localStorage.removeItem(persistenceKey);
    setSavedSessionMeta(null);
  }, [persistenceKey]);

  const finishExam = useCallback((finalAnswers: AnswerRecord[]) => {
    setIsFinished(true);
    setIsRunning(false);
    clearSavedSession();
    if (onFinish) {
      onFinish(finalAnswers);
    }
  }, [clearSavedSession, onFinish]);

  // Timer
  useEffect(() => {
    if (isFinished || !isRunning) return;

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
  }, [isFinished, answers, finishExam, isRunning]);

  useEffect(() => {
    if (!persistenceKey || typeof window === 'undefined') return;
    if (!isRunning || isFinished) return;

    const payload: SavedMockExamSession = {
      currentIndex,
      selectedOption,
      answers,
      timeLeft,
    };

    window.localStorage.setItem(persistenceKey, JSON.stringify(payload));
  }, [answers, currentIndex, isFinished, isRunning, persistenceKey, selectedOption, timeLeft]);

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

  const resumeExam = useCallback(() => {
    const saved = loadSavedSession();
    if (!saved) return false;

    setCurrentIndex(Math.min(saved.currentIndex, Math.max(questions.length - 1, 0)));
    setSelectedOption(saved.selectedOption);
    setAnswers(saved.answers);
    setTimeLeft(Math.min(Math.max(saved.timeLeft, 0), timeLimitSec));
    setIsFinished(false);
    setSavedSessionMeta(null);
    setIsRunning(true);
    return true;
  }, [loadSavedSession, questions.length, timeLimitSec]);

  const startFreshExam = useCallback(() => {
    clearSavedSession();
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    setIsFinished(false);
    setTimeLeft(timeLimitSec);
    setSavedSessionMeta(null);
    setIsRunning(true);
  }, [clearSavedSession, timeLimitSec]);

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
    finishExam: () => finishExam(answers),
    hasSavedSession,
    savedSessionMeta,
    resumeExam,
    discardSavedSession: clearSavedSession,
    startFreshExam,
    isInitialized,
  };
}
