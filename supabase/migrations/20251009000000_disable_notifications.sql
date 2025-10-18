-- Disable notification system by dropping triggers and functions
-- This migration disables all notification-related database operations

-- Drop triggers first
DROP TRIGGER IF EXISTS notify_new_booking_trigger ON sessions;
DROP TRIGGER IF EXISTS notify_payment_completion_trigger ON payments;
DROP TRIGGER IF EXISTS notify_new_message_trigger ON messages;
DROP TRIGGER IF EXISTS update_notifications_updated_at_trigger ON notifications;

-- Drop functions
DROP FUNCTION IF EXISTS notify_new_booking();
DROP FUNCTION IF EXISTS notify_payment_completion();
DROP FUNCTION IF EXISTS notify_new_message();
DROP FUNCTION IF EXISTS send_session_reminders();
DROP FUNCTION IF EXISTS create_notification(UUID, VARCHAR(50), VARCHAR(255), TEXT, VARCHAR(500), JSONB);
DROP FUNCTION IF EXISTS update_notifications_updated_at();

-- Optionally, you can also drop the notifications table entirely
-- Uncomment the line below if you want to completely remove the table
-- DROP TABLE IF EXISTS notifications;

-- Or keep the table but disable RLS policies if you prefer to keep the data
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
-- DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
-- DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
-- DROP POLICY IF EXISTS "System can insert notifications" ON notifications;