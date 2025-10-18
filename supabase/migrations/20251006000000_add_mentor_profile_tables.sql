-- Create mentor_reviews table
CREATE TABLE IF NOT EXISTS mentor_reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID, -- Reference to session when implemented
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, student_id, session_id)
);

-- Create user_favorites table
CREATE TABLE IF NOT EXISTS user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, mentor_id)
);

-- Create mentor_availability table
CREATE TABLE IF NOT EXISTS mentor_availability (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentor_time_slots table for specific bookable slots
CREATE TABLE IF NOT EXISTS mentor_time_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_booked BOOLEAN DEFAULT false,
    booked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_type VARCHAR(50) DEFAULT 'consultation', -- consultation, mentoring, mock_test
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(mentor_id, date, start_time)
);

-- Create sessions table for tracking mentor-student sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mentor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    time_slot_id UUID REFERENCES mentor_time_slots(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) DEFAULT 'consultation',
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, in_progress, completed, cancelled
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    meeting_link TEXT,
    notes TEXT,
    price DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, refunded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create session_notes table for storing session notes
CREATE TABLE IF NOT EXISTS session_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_private BOOLEAN DEFAULT false, -- true if only visible to author
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_mentor_id ON mentor_reviews(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_student_id ON mentor_reviews(student_id);
CREATE INDEX IF NOT EXISTS idx_mentor_reviews_created_at ON mentor_reviews(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_mentor_id ON user_favorites(mentor_id);

CREATE INDEX IF NOT EXISTS idx_mentor_availability_mentor_id ON mentor_availability(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_availability_day ON mentor_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_mentor_time_slots_mentor_id ON mentor_time_slots(mentor_id);
CREATE INDEX IF NOT EXISTS idx_mentor_time_slots_date ON mentor_time_slots(date);
CREATE INDEX IF NOT EXISTS idx_mentor_time_slots_available ON mentor_time_slots(mentor_id, date) WHERE NOT is_booked;

CREATE INDEX IF NOT EXISTS idx_sessions_mentor_id ON sessions(mentor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);

CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON session_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_author_id ON session_notes(author_id);

-- Enable Row Level Security (RLS)
ALTER TABLE mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentor_time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mentor_reviews
CREATE POLICY "Users can view all reviews" ON mentor_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for their sessions" ON mentor_reviews FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Users can update their own reviews" ON mentor_reviews FOR UPDATE USING (auth.uid() = student_id);
CREATE POLICY "Users can delete their own reviews" ON mentor_reviews FOR DELETE USING (auth.uid() = student_id);

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites" ON user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own favorites" ON user_favorites FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for mentor_availability
CREATE POLICY "Anyone can view mentor availability" ON mentor_availability FOR SELECT USING (true);
CREATE POLICY "Mentors can manage their availability" ON mentor_availability FOR ALL USING (auth.uid() = mentor_id);

-- RLS Policies for mentor_time_slots
CREATE POLICY "Anyone can view available time slots" ON mentor_time_slots FOR SELECT USING (true);
CREATE POLICY "Mentors can manage their time slots" ON mentor_time_slots FOR ALL USING (auth.uid() = mentor_id);

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions" ON sessions FOR SELECT USING (auth.uid() = mentor_id OR auth.uid() = student_id);
CREATE POLICY "Students can create sessions" ON sessions FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Participants can update sessions" ON sessions FOR UPDATE USING (auth.uid() = mentor_id OR auth.uid() = student_id);

-- RLS Policies for session_notes
CREATE POLICY "Session participants can view notes" ON session_notes FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM sessions 
        WHERE sessions.id = session_notes.session_id 
        AND (sessions.mentor_id = auth.uid() OR sessions.student_id = auth.uid())
    )
    AND (NOT is_private OR author_id = auth.uid())
);
CREATE POLICY "Session participants can create notes" ON session_notes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM sessions 
        WHERE sessions.id = session_notes.session_id 
        AND (sessions.mentor_id = auth.uid() OR sessions.student_id = auth.uid())
    )
    AND auth.uid() = author_id
);
CREATE POLICY "Authors can update their notes" ON session_notes FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Authors can delete their notes" ON session_notes FOR DELETE USING (auth.uid() = author_id);

-- Function to update average rating for mentors
CREATE OR REPLACE FUNCTION update_mentor_average_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the mentor_profiles table with new average rating
    UPDATE mentor_profiles 
    SET 
        average_rating = (
            SELECT COALESCE(AVG(rating::DECIMAL), 0) 
            FROM mentor_reviews 
            WHERE mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id)
        ),
        total_sessions = (
            SELECT COUNT(*) 
            FROM sessions 
            WHERE mentor_id = COALESCE(NEW.mentor_id, OLD.mentor_id) 
            AND status = 'completed'
        )
    WHERE user_id = COALESCE(NEW.mentor_id, OLD.mentor_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update mentor ratings
DROP TRIGGER IF EXISTS trigger_update_mentor_rating ON mentor_reviews;
CREATE TRIGGER trigger_update_mentor_rating
    AFTER INSERT OR UPDATE OR DELETE ON mentor_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_average_rating();

-- Function to update session count when sessions are completed
CREATE OR REPLACE FUNCTION update_mentor_session_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update when status changes to completed
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE mentor_profiles 
        SET total_sessions = (
            SELECT COUNT(*) 
            FROM sessions 
            WHERE mentor_id = NEW.mentor_id 
            AND status = 'completed'
        )
        WHERE user_id = NEW.mentor_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update session count
DROP TRIGGER IF EXISTS trigger_update_session_count ON sessions;
CREATE TRIGGER trigger_update_session_count
    AFTER UPDATE ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_session_count();

-- Insert some sample data for testing
INSERT INTO mentor_reviews (mentor_id, student_id, rating, comment) VALUES
    ((SELECT user_id FROM mentor_profiles LIMIT 1), (SELECT id FROM auth.users WHERE email LIKE '%student%' LIMIT 1), 5, 'Excellent mentor! Very helpful and knowledgeable.'),
    ((SELECT user_id FROM mentor_profiles LIMIT 1), (SELECT id FROM auth.users WHERE email LIKE '%test%' LIMIT 1), 4, 'Great session, learned a lot about exam strategy.')
ON CONFLICT DO NOTHING;