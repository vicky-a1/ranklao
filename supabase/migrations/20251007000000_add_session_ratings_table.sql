-- Create session_ratings table
CREATE TABLE IF NOT EXISTS session_ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_session_ratings_session_id ON session_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_session_ratings_created_by ON session_ratings(created_by);
CREATE INDEX IF NOT EXISTS idx_session_ratings_rating ON session_ratings(rating);

-- Enable RLS
ALTER TABLE session_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view ratings for their sessions" ON session_ratings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sessions s 
            WHERE s.id = session_ratings.session_id 
            AND (s.mentor_id = auth.uid() OR s.student_id = auth.uid())
        )
    );

CREATE POLICY "Users can create ratings for their sessions" ON session_ratings
    FOR INSERT WITH CHECK (
        created_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM sessions s 
            WHERE s.id = session_ratings.session_id 
            AND (s.mentor_id = auth.uid() OR s.student_id = auth.uid())
            AND s.status = 'completed'
        )
    );

CREATE POLICY "Users can update their own ratings" ON session_ratings
    FOR UPDATE USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Function to update mentor rating when session is rated
CREATE OR REPLACE FUNCTION update_mentor_rating_on_session_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update mentor's average rating
    UPDATE mentor_profiles 
    SET rating = (
        SELECT COALESCE(AVG(sr.rating), 0)
        FROM session_ratings sr
        JOIN sessions s ON s.id = sr.session_id
        WHERE s.mentor_id = (
            SELECT mentor_id FROM sessions WHERE id = NEW.session_id
        )
    )
    WHERE user_id = (
        SELECT mentor_id FROM sessions WHERE id = NEW.session_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER trigger_update_mentor_rating_on_session_rating
    AFTER INSERT OR UPDATE ON session_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_mentor_rating_on_session_rating();

-- Add updated_at trigger
CREATE TRIGGER trigger_session_ratings_updated_at
    BEFORE UPDATE ON session_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();