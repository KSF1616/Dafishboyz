import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { FriendRequest, FriendWithPresence, UserPresence } from '@/types/friends';

interface FriendsContextType {
  friends: FriendWithPresence[];
  pendingRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  loading: boolean;
  sendFriendRequest: (userId: string, message?: string) => Promise<boolean>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  declineRequest: (requestId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  updatePresence: (status: UserPresence['status'], lobbyId?: string) => Promise<void>;
  searchUsers: (query: string) => Promise<any[]>;
  refreshFriends: () => Promise<void>;
}

const FriendsContext = createContext<FriendsContextType | null>(null);

export const useFriends = () => {
  const ctx = useContext(FriendsContext);
  if (!ctx) throw new Error('useFriends must be used within FriendsProvider');
  return ctx;
};

// Demo data for demo mode
const DEMO_FRIENDS: FriendWithPresence[] = [
  { id: '1', username: 'player_one', display_name: 'Player One', avatar_url: null, presence: { user_id: '1', status: 'online', last_seen: new Date().toISOString() }, friendship_id: 'f1' },
  { id: '2', username: 'gamer_pro', display_name: 'Gamer Pro', avatar_url: null, presence: { user_id: '2', status: 'in_game', last_seen: new Date().toISOString(), current_lobby_id: 'lobby1' }, friendship_id: 'f2' },
];

export const FriendsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, isDemo } = useAuth();
  const [friends, setFriends] = useState<FriendWithPresence[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const sendNotification = async (userId: string, type: string, title: string, message?: string, data?: any) => {
    if (isDemo) return; // Skip for demo mode
    await supabase.from('notifications').insert({ user_id: userId, type, title, message, data: data || {} });
  };

  const refreshFriends = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    
    // Use demo data for demo mode - skip all database queries
    if (isDemo) {
      setFriends(DEMO_FRIENDS);
      setPendingRequests([]);
      setSentRequests([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data: friendships } = await supabase.from('friendships').select('id, friend_id, created_at').eq('user_id', user.id);

      if (friendships?.length) {
        const friendIds = friendships.map(f => f.friend_id);
        const { data: profiles } = await supabase.from('user_profiles').select('*').in('id', friendIds);
        const { data: presences } = await supabase.from('user_presence').select('*').in('user_id', friendIds);
        
        const friendsWithPresence: FriendWithPresence[] = friendships.map(f => {
          const p = profiles?.find(p => p.id === f.friend_id);
          const pr = presences?.find(p => p.user_id === f.friend_id);
          return { id: f.friend_id, username: p?.username, display_name: p?.display_name, avatar_url: p?.avatar_url, presence: pr, friendship_id: f.id };
        });
        setFriends(friendsWithPresence);
      } else { setFriends([]); }

      const { data: pending } = await supabase.from('friend_requests').select('*').eq('receiver_id', user.id).eq('status', 'pending');
      const { data: sent } = await supabase.from('friend_requests').select('*').eq('sender_id', user.id).eq('status', 'pending');
      
      setPendingRequests(pending || []);
      setSentRequests(sent || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
    setLoading(false);
  }, [user, isDemo]);

  useEffect(() => { refreshFriends(); }, [user, refreshFriends]);

  const value: FriendsContextType = {
    friends, pendingRequests, sentRequests, loading, refreshFriends,
    sendFriendRequest: async (userId, message) => {
      if (!user || isDemo) return false;
      const { error } = await supabase.from('friend_requests').insert({ sender_id: user.id, receiver_id: userId, message });
      if (!error) {
        await sendNotification(userId, 'friend_request', 'New Friend Request', `${profile?.display_name || 'Someone'} wants to be your friend!`, { sender_id: user.id });
        await refreshFriends();
      }
      return !error;
    },
    acceptRequest: async (requestId) => {
      if (isDemo) return true;
      const req = pendingRequests.find(r => r.id === requestId);
      const { error } = await supabase.from('friend_requests').update({ status: 'accepted' }).eq('id', requestId);
      if (!error && req) {
        await sendNotification(req.sender_id, 'friend_accepted', 'Friend Request Accepted', `${profile?.display_name || 'Someone'} accepted your friend request!`);
        await refreshFriends();
      }
      return !error;
    },
    declineRequest: async (requestId) => {
      if (isDemo) return true;
      const { error } = await supabase.from('friend_requests').update({ status: 'declined' }).eq('id', requestId);
      if (!error) await refreshFriends();
      return !error;
    },
    removeFriend: async (friendshipId) => {
      if (isDemo) { setFriends(prev => prev.filter(f => f.friendship_id !== friendshipId)); return true; }
      const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
      if (!error) await refreshFriends();
      return !error;
    },
    updatePresence: async (status, lobbyId) => {
      if (!user || isDemo) return;
      await supabase.from('user_presence').upsert({ user_id: user.id, status, current_lobby_id: lobbyId, last_seen: new Date().toISOString() });
    },
    searchUsers: async (query) => {
      if (isDemo) return [{ id: '3', username: 'test_user', display_name: 'Test User', avatar_url: null }];
      const { data } = await supabase.from('user_profiles').select('id, username, display_name, avatar_url').or(`username.ilike.%${query}%,display_name.ilike.%${query}%`).limit(10);
      return data?.filter(u => u.id !== user?.id) || [];
    }
  };

  return <FriendsContext.Provider value={value}>{children}</FriendsContext.Provider>;
};
