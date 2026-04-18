export type Category = {
  id: string; // UUID
  name: string;
  created_at: string;
};

export type Question = {
  id: string; // UUID
  category_id: string;
  content: string;
  options: string[]; // JSONB -> string[]
  answer: string;
  explanation: string;
  created_at: string;
};

export type Profile = {
  id: string; // UUID
  user_id: string; // Supabase Auth UID
  nickname: string | null;
  created_at: string;
};

export type History = {
  id: string; // UUID
  user_id: string; // Supabase Auth UID
  question_id: string; // 問題のUUID
  is_correct: boolean;
  created_at: string;
};
