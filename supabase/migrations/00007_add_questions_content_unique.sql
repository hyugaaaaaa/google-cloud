-- questions テーブルの content カラムに UNIQUE 制約を追加
-- 大文字小文字・前後空白を無視した関数インデックスを使用

CREATE UNIQUE INDEX IF NOT EXISTS questions_content_unique
  ON public.questions (lower(trim(content)));
