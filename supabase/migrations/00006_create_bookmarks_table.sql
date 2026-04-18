-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own bookmarks" 
    ON public.bookmarks FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" 
    ON public.bookmarks FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
    ON public.bookmarks FOR DELETE 
    USING (auth.uid() = user_id);

-- Create Indexes
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS bookmarks_question_id_idx ON public.bookmarks(question_id);
