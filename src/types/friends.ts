export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  updated_at: string;
  sender_profile?: FriendProfile;
  receiver_profile?: FriendProfile;
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
  friend_profile?: FriendProfile;
}

export interface FriendProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'away' | 'offline' | 'in_game';
  last_seen: string;
  current_lobby_id?: string;
}

export interface FriendWithPresence extends FriendProfile {
  presence?: UserPresence;
  friendship_id: string;
}
