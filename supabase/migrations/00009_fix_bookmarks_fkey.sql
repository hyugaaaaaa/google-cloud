-- Fix bookmarks foreign key to reference auth.users instead of public.profiles
-- This ensures that users without a profile row can still save bookmarks

ALTER TABLE public.bookmarks 
  DROP CONSTRAINT IF EXISTS bookmarks_user_id_fkey,
  ADD CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
