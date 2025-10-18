-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('student', 'mentor');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles during signup"
  ON public.user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Create mentor profiles table
CREATE TABLE public.mentor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  air_rank INTEGER NOT NULL,
  exam_year INTEGER NOT NULL,
  exam_type TEXT NOT NULL CHECK (exam_type IN ('JEE', 'NEET', 'CA')),
  specialization TEXT,
  current_institution TEXT NOT NULL,
  current_course TEXT,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  hourly_rate INTEGER,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'inactive')),
  total_sessions INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verification_documents JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on mentor_profiles
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for mentor_profiles
CREATE POLICY "Anyone can view verified mentors"
  ON public.mentor_profiles FOR SELECT
  USING (verification_status = 'verified');

CREATE POLICY "Mentors can view their own profile"
  ON public.mentor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Mentors can insert their own profile"
  ON public.mentor_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'mentor'));

CREATE POLICY "Mentors can update their own profile"
  ON public.mentor_profiles FOR UPDATE
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'mentor'));

-- Create student profiles table
CREATE TABLE public.student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  target_exam TEXT NOT NULL CHECK (target_exam IN ('JEE', 'NEET', 'CA')),
  target_year INTEGER NOT NULL,
  current_level TEXT NOT NULL CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
  study_hours_per_day INTEGER,
  preferred_subjects TEXT[],
  weak_subjects TEXT[],
  previous_attempts INTEGER DEFAULT 0,
  current_score INTEGER,
  target_rank INTEGER,
  preferred_mentor_id UUID REFERENCES public.mentor_profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on student_profiles
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for student_profiles
CREATE POLICY "Students can view their own profile"
  ON public.student_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'student'));

CREATE POLICY "Students can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'student'));

-- Create onboarding progress table
CREATE TABLE public.onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_step INTEGER DEFAULT 1 NOT NULL,
  total_steps INTEGER NOT NULL,
  completed_steps JSONB DEFAULT '[]'::jsonb,
  is_completed BOOLEAN DEFAULT false,
  role_selected TEXT CHECK (role_selected IN ('student', 'mentor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on onboarding_progress
ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding_progress
CREATE POLICY "Users can view their own onboarding progress"
  ON public.onboarding_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own onboarding progress"
  ON public.onboarding_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding progress"
  ON public.onboarding_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_mentor_profiles_updated_at
  BEFORE UPDATE ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_onboarding_progress_updated_at
  BEFORE UPDATE ON public.onboarding_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert basic profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();