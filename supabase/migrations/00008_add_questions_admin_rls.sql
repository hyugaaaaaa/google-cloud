-- questions テーブルに管理者用の INSERT / UPDATE / DELETE ポリシーを追加
-- アプリ側でもメール認証済みチェックを行っているが、DB側でも email ベースで制限

-- INSERT
DROP POLICY IF EXISTS "Admin can insert questions" ON public.questions;
CREATE POLICY "Admin can insert questions" ON public.questions
  FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'hyuga0510@icloud.com');

-- UPDATE
DROP POLICY IF EXISTS "Admin can update questions" ON public.questions;
CREATE POLICY "Admin can update questions" ON public.questions
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'hyuga0510@icloud.com');

-- DELETE
DROP POLICY IF EXISTS "Admin can delete questions" ON public.questions;
CREATE POLICY "Admin can delete questions" ON public.questions
  FOR DELETE
  USING (auth.jwt() ->> 'email' = 'hyuga0510@icloud.com');
