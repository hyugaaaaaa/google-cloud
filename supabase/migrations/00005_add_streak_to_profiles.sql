-- profiles テーブルに連続ログインカウント用カラムを追加
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS streak_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.profiles.streak_count IS '連続ログイン日数';
COMMENT ON COLUMN public.profiles.last_login_at IS '最終ログイン（アクセス）日時';
