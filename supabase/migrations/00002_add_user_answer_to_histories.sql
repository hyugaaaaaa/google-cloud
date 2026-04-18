-- histories テーブルに user_answer カラムを追加
ALTER TABLE public.histories 
ADD COLUMN IF NOT EXISTS user_answer TEXT;

COMMENT ON COLUMN public.histories.user_answer IS 'ユーザーが選択した回答のテキスト';
