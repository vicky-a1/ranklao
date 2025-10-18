-- Create messages table for mentor-student chat
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  student_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_mentor_student ON public.messages (mentor_id, student_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages (created_at);