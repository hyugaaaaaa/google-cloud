-- Track last daily push reminder date to prevent duplicate notifications
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_push_reminder_at DATE;

COMMENT ON COLUMN public.profiles.last_push_reminder_at IS 'Last date (Asia/Tokyo) when daily push reminder was sent';
