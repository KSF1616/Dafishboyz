import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, UserPlus, Gamepad2, Users, Award, Info } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Notification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';

const getIcon = (type: string) => {
  switch (type) {
    case 'friend_request': return <UserPlus className="w-4 h-4 text-blue-400" />;
    case 'friend_accepted': return <Users className="w-4 h-4 text-green-400" />;
    case 'game_invite': return <Gamepad2 className="w-4 h-4 text-purple-400" />;
    case 'friend_online': return <Users className="w-4 h-4 text-lime-400" />;
    case 'achievement': return <Award className="w-4 h-4 text-amber-400" />;
    default: return <Info className="w-4 h-4 text-gray-400" />;
  }
};

const NotificationItem: React.FC<{ n: Notification; onRead: () => void; onDelete: () => void }> = ({ n, onRead, onDelete }) => (
  <div className={`p-3 border-b border-gray-700 hover:bg-gray-700/50 ${!n.read ? 'bg-amber-500/10' : ''}`}>
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{getIcon(n.type)}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!n.read ? 'text-white font-medium' : 'text-gray-300'}`}>{n.title}</p>
        {n.message && <p className="text-xs text-gray-400 mt-0.5 truncate">{n.message}</p>}
        <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</p>
      </div>
      <div className="flex gap-1">
        {!n.read && (
          <button onClick={onRead} className="p-1 text-gray-400 hover:text-green-400" title="Mark as read">
            <Check className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={onDelete} className="p-1 text-gray-400 hover:text-red-400" title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  </div>
);

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 text-gray-400 hover:text-amber-400 transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-amber-400 hover:text-amber-300">Mark all read</button>
              )}
              {notifications.length > 0 && (
                <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300">Clear all</button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 10).map(n => (
                <NotificationItem key={n.id} n={n} onRead={() => markAsRead(n.id)} onDelete={() => deleteNotification(n.id)} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
