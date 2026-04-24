export type Category = {
  id: string; // UUID
  name: string;
  created_at: string;
};

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type Question = {
  id: string; // UUID
  category_id: string;
  content: string;
  options: string[]; // JSONB -> string[]
  answer: string;
  explanation: string;
  explanation_why_correct?: string | null;
  explanation_why_others_wrong?: string | null;
  related_concepts?: string[] | null;
  difficulty?: QuestionDifficulty;
  is_active?: boolean;
  created_at: string;
};

export type Profile = {
  id: string; // UUID
  user_id: string; // Supabase Auth UID
  nickname: string | null;
  xp?: number;
  level?: number;
  onboarding_completed?: boolean;
  onboarding_goal?: string | null;
  onboarding_daily_goal?: number | null;
  onboarding_exam_date?: string | null;
  push_opt_in?: boolean;
  created_at: string;
};

export type History = {
  id: string; // UUID
  user_id: string; // Supabase Auth UID
  question_id: string; // 問題のUUID
  is_correct: boolean;
  user_answer?: string | null;
  created_at: string;
};
