import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Notification, NotificationPayload } from '@/types/notifications';
import { useToast } from '@/hooks/use-toast';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  sendNotification: (userId: string, payload: NotificationPayload) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider');
  return ctx;
};

// Demo notifications for demo mode
const DEMO_NOTIFICATIONS: Notification[] = [
  { id: '1', user_id: 'demo', type: 'system', title: 'Welcome to Demo Mode!', message: 'You are using the demo admin account.', read: false, created_at: new Date().toISOString(), data: {} },
  { id: '2', user_id: 'demo', type: 'friend_request', title: 'New Friend Request', message: 'Player One wants to be your friend!', read: true, created_at: new Date(Date.now() - 3600000).toISOString(), data: {} },
];

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemo } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<any>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!user) { setNotifications([]); setLoading(false); return; }
    
    // Use demo data for demo mode - skip database queries
    if (isDemo) {
      setNotifications(DEMO_NOTIFICATIONS);
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  }, [user, isDemo]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  useEffect(() => {
    if (!user || isDemo) return; // Skip realtime subscription for demo mode
    
    channelRef.current = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications(prev => [newNotif, ...prev]);
          toast({ title: newNotif.title, description: newNotif.message });
        }
      )
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [user, isDemo, toast]);

  const markAsRead = async (id: string) => {
    if (isDemo) { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); return; }
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = async () => {
    if (isDemo) { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); return; }
    if (!user) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    if (isDemo) { setNotifications(prev => prev.filter(n => n.id !== id)); return; }
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = async () => {
    if (isDemo) { setNotifications([]); return; }
    if (!user) return;
    await supabase.from('notifications').delete().eq('user_id', user.id);
    setNotifications([]);
  };

  const sendNotification = async (userId: string, payload: NotificationPayload) => {
    if (isDemo) return; // Skip for demo mode
    await supabase.from('notifications').insert({
      user_id: userId, type: payload.type, title: payload.title, message: payload.message, data: payload.data || {}
    });
  };

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification, clearAll, sendNotification }}>
      {children}
    </NotificationsContext.Provider>
  );
};
