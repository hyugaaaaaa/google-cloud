-- histories テーブルの検索パフォーマンスを向上させるためのインデックス
-- 1. ユーザーごとの履歴取得（ダッシュボード、マイページ用）
CREATE INDEX IF NOT EXISTS idx_histories_user_id_created_at 
ON public.histories (user_id, created_at DESC);

-- 2. デイリーチャレンジの判定用（ユーザーID、学習モード、作成日時）
CREATE INDEX IF NOT EXISTS idx_histories_daily_challenge 
ON public.histories (user_id, study_mode, created_at DESC);

-- 3. カテゴリごとの問題取得パフォーマンス（questionsテーブル）
CREATE INDEX IF NOT EXISTS idx_questions_category_id 
ON public.questions (category_id);

COMMENT ON INDEX public.idx_histories_user_id_created_at IS 'ユーザーごとの学習履歴取得を高速化';
COMMENT ON INDEX public.idx_histories_daily_challenge IS 'デイリーチャレンジの完了判定を高速化';
COMMENT ON INDEX public.idx_questions_category_id IS 'カテゴリごとの問題取得を高速化';
