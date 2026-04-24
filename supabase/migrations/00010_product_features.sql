-- Product/monetization/admin feature extensions

-- =========================
-- Profiles: product state
-- =========================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS onboarding_goal TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_daily_goal INTEGER,
  ADD COLUMN IF NOT EXISTS onboarding_exam_date DATE,
  ADD COLUMN IF NOT EXISTS last_streak_reward_at DATE,
  ADD COLUMN IF NOT EXISTS push_opt_in BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'profiles_plan_tier_check'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_plan_tier_check
      CHECK (plan_tier IN ('free', 'pro'));
  END IF;
END
$$;

-- ======================================
-- Questions: quality control and metadata
-- ======================================
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS difficulty TEXT NOT NULL DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS explanation_why_correct TEXT,
  ADD COLUMN IF NOT EXISTS explanation_why_others_wrong TEXT,
  ADD COLUMN IF NOT EXISTS related_concepts TEXT[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'questions_difficulty_check'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_difficulty_check
      CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END
$$;

-- =========================
-- Performance indexes
-- =========================
CREATE INDEX IF NOT EXISTS idx_questions_active_category_created
  ON public.questions (is_active, category_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_histories_question_id_created_at
  ON public.histories (question_id, created_at DESC);

-- =========================
-- Admin analytics view
-- =========================
CREATE OR REPLACE VIEW public.question_performance_stats AS
SELECT
  q.id AS question_id,
  COUNT(h.id)::BIGINT AS attempt_count,
  COUNT(h.id) FILTER (WHERE h.is_correct)::BIGINT AS correct_count,
  CASE
    WHEN COUNT(h.id) = 0 THEN 0
    ELSE ROUND((COUNT(h.id) FILTER (WHERE h.is_correct)::NUMERIC / COUNT(h.id)::NUMERIC) * 100, 2)
  END AS accuracy_rate
FROM public.questions q
LEFT JOIN public.histories h ON h.question_id = q.id
GROUP BY q.id;

-- =========================
-- Admin access for histories
-- =========================
DROP POLICY IF EXISTS "Admin can view all histories" ON public.histories;
CREATE POLICY "Admin can view all histories"
  ON public.histories
  FOR SELECT
  USING (auth.jwt() ->> 'email' = 'hyuga0510@icloud.com');

-- =========================
-- XP/Level utility function
-- =========================
CREATE OR REPLACE FUNCTION public.add_profile_xp(target_user_id UUID, xp_delta INTEGER)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  computed_xp INTEGER;
  computed_level INTEGER;
BEGIN
  UPDATE public.profiles
  SET xp = GREATEST(0, COALESCE(xp, 0) + xp_delta)
  WHERE id = target_user_id
  RETURNING xp INTO computed_xp;

  IF computed_xp IS NULL THEN
    RETURN;
  END IF;

  -- Linear curve: each 120 XP advances one level.
  computed_level := FLOOR(computed_xp / 120.0)::INTEGER + 1;

  UPDATE public.profiles
  SET level = GREATEST(1, computed_level)
  WHERE id = target_user_id;

  RETURN QUERY
  SELECT computed_xp, GREATEST(1, computed_level);
END;
$$;

GRANT EXECUTE ON FUNCTION public.add_profile_xp(UUID, INTEGER) TO authenticated;

COMMENT ON COLUMN public.profiles.plan_tier IS 'free or pro tier for feature gating';
COMMENT ON COLUMN public.profiles.xp IS 'total earned XP';
COMMENT ON COLUMN public.profiles.level IS 'derived user level from XP';
COMMENT ON COLUMN public.questions.difficulty IS 'admin-tagged difficulty: easy/medium/hard';
COMMENT ON COLUMN public.questions.is_active IS 'false means hidden from learners';

-- =========================
-- Push subscriptions
-- =========================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can insert own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own push subscriptions" ON public.push_subscriptions;
CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON public.push_subscriptions (user_id);
