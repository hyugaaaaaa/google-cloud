-- Add study_mode to histories table
ALTER TABLE public.histories ADD COLUMN study_mode TEXT DEFAULT 'study';
