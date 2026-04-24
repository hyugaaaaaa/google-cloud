-- Security hardening migration
-- 1) Move admin authorization to JWT role claim
-- 2) Harden XP RPC against cross-user writes

-- Backfill existing admin user to role-based auth (one-time compatibility)
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin')
WHERE email = 'hyuga0510@icloud.com'
  AND COALESCE(raw_app_meta_data ->> 'role', '') <> 'admin';

-- Questions admin policies (role based)
DROP POLICY IF EXISTS "Admin can insert questions" ON public.questions;
DROP POLICY IF EXISTS "Admin can update questions" ON public.questions;
DROP POLICY IF EXISTS "Admin can delete questions" ON public.questions;

CREATE POLICY "Admin can insert questions"
  ON public.questions
  FOR INSERT
  WITH CHECK (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can update questions"
  ON public.questions
  FOR UPDATE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admin can delete questions"
  ON public.questions
  FOR DELETE
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- Histories admin policy (role based)
DROP POLICY IF EXISTS "Admin can view all histories" ON public.histories;
CREATE POLICY "Admin can view all histories"
  ON public.histories
  FOR SELECT
  USING (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

-- XP function hardening:
-- - SECURITY INVOKER so RLS is evaluated as caller
-- - explicit auth.uid() / target_user_id validation
CREATE OR REPLACE FUNCTION public.add_profile_xp(target_user_id UUID, xp_delta INTEGER)
RETURNS TABLE(new_xp INTEGER, new_level INTEGER)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  computed_xp INTEGER;
  computed_level INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF auth.uid() <> target_user_id THEN
    RAISE EXCEPTION 'Forbidden target user' USING ERRCODE = '42501';
  END IF;

  UPDATE public.profiles
  SET xp = GREATEST(0, COALESCE(xp, 0) + xp_delta)
  WHERE id = target_user_id
  RETURNING xp INTO computed_xp;

  IF computed_xp IS NULL THEN
    RETURN;
  END IF;

  computed_level := FLOOR(computed_xp / 120.0)::INTEGER + 1;

  UPDATE public.profiles
  SET level = GREATEST(1, computed_level)
  WHERE id = target_user_id;

  RETURN QUERY
  SELECT computed_xp, GREATEST(1, computed_level);
END;
$$;

REVOKE ALL ON FUNCTION public.add_profile_xp(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_profile_xp(UUID, INTEGER) TO authenticated;
