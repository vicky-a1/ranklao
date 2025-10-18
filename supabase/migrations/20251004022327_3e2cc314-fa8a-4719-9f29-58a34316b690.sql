-- Create sessions table
CREATE TABLE public.sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mentor_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'trial', 'single', 'monthly', 'premium'
  duration_minutes INTEGER NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'in_progress'
  meeting_link TEXT,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL, -- 'demo', 'razorpay', 'card'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create mentor_availability table
CREATE TABLE public.mentor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, day_of_week, start_time)
);

-- Create student_trial_status table to track free trials
CREATE TABLE public.student_trial_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  has_used_trial BOOLEAN NOT NULL DEFAULT false,
  trial_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(student_id)
);

-- Enable Row Level Security
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_trial_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Students can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Mentors can view their sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = mentor_id);

CREATE POLICY "Students can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = student_id AND has_role(auth.uid(), 'student'::app_role));

CREATE POLICY "Students can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = student_id);

CREATE POLICY "Mentors can update their sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = mentor_id);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for mentor_availability
CREATE POLICY "Everyone can view mentor availability"
  ON public.mentor_availability FOR SELECT
  USING (true);

CREATE POLICY "Mentors can manage their availability"
  ON public.mentor_availability FOR ALL
  USING (auth.uid() = mentor_id);

-- RLS Policies for student_trial_status
CREATE POLICY "Students can view their own trial status"
  ON public.student_trial_status FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their trial status"
  ON public.student_trial_status FOR INSERT
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their trial status"
  ON public.student_trial_status FOR UPDATE
  USING (auth.uid() = student_id);

-- Create triggers for updated_at
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON public.sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_availability_updated_at
  BEFORE UPDATE ON public.mentor_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_trial_status_updated_at
  BEFORE UPDATE ON public.student_trial_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();