-- =================================================================================
-- 1. categories (分野)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =================================================================================
-- 2. questions (問題)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =================================================================================
-- 3. profiles (ユーザープロフィール)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =================================================================================
-- 4. histories (解答履歴)
-- =================================================================================
CREATE TABLE IF NOT EXISTS public.histories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =================================================================================
-- 5. Row Level Security (RLS) 設定
-- =================================================================================

-- Categories: 全ユーザーが閲覧可能
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Categories are accessible by everyone" ON public.categories;
CREATE POLICY "Categories are accessible by everyone" ON public.categories FOR SELECT USING (true);

-- Questions: 全ユーザーが閲覧可能
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Questions are accessible by everyone" ON public.questions;
CREATE POLICY "Questions are accessible by everyone" ON public.questions FOR SELECT USING (true);

-- Profiles: 自分のプロフィールのみ管理可能
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Histories: 自分の履歴のみ管理可能
ALTER TABLE public.histories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own histories" ON public.histories;
CREATE POLICY "Users can view own histories" ON public.histories FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert own histories" ON public.histories;
CREATE POLICY "Users can insert own histories" ON public.histories FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =================================================================================
-- 6. Functions & Triggers (自動プロフィール作成)
-- =================================================================================

-- 新規ユーザー作成時にプロフィールを自動作成する関数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname)
  VALUES (new.id, split_part(new.email, '@', 1));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

