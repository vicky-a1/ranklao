import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'reminder' | 'message' | 'payment' | 'session_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const notificationData = data || [];
      setNotifications(notificationData);
      setUnreadCount(notificationData.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Silently fail - no popup error
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;

    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true }))
      );
      setUnreadCount(0);

      // Success - no popup
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Silently fail - no popup error
    }
  }, [user]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev =>
        prev.filter(notif => notif.id !== notificationId)
      );
      
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Silently fail - no popup error
    }
  }, [notifications]);

  const createNotification = useCallback(async (
    type: string,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: Record<string, unknown>
  ) => {
    if (!user) return;

    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .insert({
          user_id: user.id,
          type,
          title,
          message,
          action_url: actionUrl,
          metadata: metadata || {}
        })
        .select()
        .single();

      if (error) throw error;

      setNotifications(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);

      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user, loadNotifications]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
  };
};

export default useNotifications;