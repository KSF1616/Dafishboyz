export type NotificationType = 
  | 'friend_request' 
  | 'friend_accepted' 
  | 'game_invite' 
  | 'friend_online'
  | 'achievement'
  | 'system';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  data: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, any>;
}
