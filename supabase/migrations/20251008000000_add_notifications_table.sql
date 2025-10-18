-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('booking', 'reminder', 'message', 'payment', 'session_update', 'system')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications for any user
CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on notifications
CREATE TRIGGER update_notifications_updated_at_trigger
    BEFORE UPDATE ON notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_notifications_updated_at();

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_title VARCHAR(255),
    p_message TEXT,
    p_action_url VARCHAR(500) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (user_id, type, title, message, action_url, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_action_url, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send session reminder notifications
CREATE OR REPLACE FUNCTION send_session_reminders()
RETURNS void AS $$
DECLARE
    session_record RECORD;
BEGIN
    -- Send reminders for sessions starting in 1 hour
    FOR session_record IN
        SELECT s.id, s.student_id, s.mentor_id, s.scheduled_at, 
               sp.full_name as student_name, mp.full_name as mentor_name
        FROM sessions s
        JOIN profiles sp ON s.student_id = sp.id
        JOIN profiles mp ON s.mentor_id = mp.id
        WHERE s.status = 'scheduled'
        AND s.scheduled_at BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
        AND NOT EXISTS (
            SELECT 1 FROM notifications n 
            WHERE n.user_id IN (s.student_id, s.mentor_id)
            AND n.type = 'reminder'
            AND n.metadata->>'session_id' = s.id::text
            AND n.created_at > NOW() - INTERVAL '2 hours'
        )
    LOOP
        -- Notify student
        PERFORM create_notification(
            session_record.student_id,
            'reminder',
            'Session Starting Soon',
            'Your mentoring session with ' || session_record.mentor_name || ' starts in 1 hour.',
            '/session/' || session_record.id,
            jsonb_build_object('session_id', session_record.id, 'reminder_type', '1_hour')
        );
        
        -- Notify mentor
        PERFORM create_notification(
            session_record.mentor_id,
            'reminder',
            'Session Starting Soon',
            'Your mentoring session with ' || session_record.student_name || ' starts in 1 hour.',
            '/session/' || session_record.id,
            jsonb_build_object('session_id', session_record.id, 'reminder_type', '1_hour')
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on new booking
CREATE OR REPLACE FUNCTION notify_new_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify mentor about new booking
    PERFORM create_notification(
        NEW.mentor_id,
        'booking',
        'New Session Booked',
        'A student has booked a session with you for ' || to_char(NEW.scheduled_at, 'Mon DD, YYYY at HH12:MI AM'),
        '/session/' || NEW.id,
        jsonb_build_object('session_id', NEW.id, 'student_id', NEW.student_id)
    );
    
    -- Notify student about booking confirmation
    PERFORM create_notification(
        NEW.student_id,
        'booking',
        'Session Booking Confirmed',
        'Your session has been confirmed for ' || to_char(NEW.scheduled_at, 'Mon DD, YYYY at HH12:MI AM'),
        '/session/' || NEW.id,
        jsonb_build_object('session_id', NEW.id, 'mentor_id', NEW.mentor_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new session bookings
CREATE TRIGGER notify_new_booking_trigger
    AFTER INSERT ON sessions
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_booking();

-- Function to notify on payment completion
CREATE OR REPLACE FUNCTION notify_payment_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        PERFORM create_notification(
            NEW.user_id,
            'payment',
            'Payment Successful',
            'Your payment of ₹' || NEW.amount || ' has been processed successfully.',
            '/dashboard',
            jsonb_build_object('payment_id', NEW.id, 'amount', NEW.amount)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for payment status updates
CREATE TRIGGER notify_payment_completion_trigger
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION notify_payment_completion();

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    sender_name TEXT;
BEGIN
    -- Determine recipient (the other person in the conversation)
    SELECT CASE 
        WHEN NEW.sender_id = s.student_id THEN s.mentor_id
        ELSE s.student_id
    END INTO recipient_id
    FROM sessions s
    WHERE s.id = NEW.session_id;
    
    -- Get sender name
    SELECT full_name INTO sender_name
    FROM profiles
    WHERE id = NEW.sender_id;
    
    -- Create notification for recipient
    PERFORM create_notification(
        recipient_id,
        'message',
        'New Message',
        sender_name || ' sent you a message: ' || LEFT(NEW.content, 50) || CASE WHEN LENGTH(NEW.content) > 50 THEN '...' ELSE '' END,
        '/messages',
        jsonb_build_object('message_id', NEW.id, 'sender_id', NEW.sender_id, 'session_id', NEW.session_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new messages
CREATE TRIGGER notify_new_message_trigger
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();