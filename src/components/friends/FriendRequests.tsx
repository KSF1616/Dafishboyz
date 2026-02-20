import React, { useState, useEffect } from 'react';
import { FriendRequest } from '@/types/friends';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  requests: FriendRequest[];
  type: 'received' | 'sent';
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}

const FriendRequests: React.FC<Props> = ({ requests, type, onAccept, onDecline }) => {
  const { isDemo } = useAuth();
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    // Skip database call in demo mode
    if (isDemo || requests.length === 0) return;
    
    const fetchProfiles = async () => {
      try {
        const ids = requests.map(r => type === 'received' ? r.sender_id : r.receiver_id);
        if (ids.length === 0) return;
        const { data } = await supabase.from('user_profiles').select('*').in('id', ids);
        const map: Record<string, any> = {};
        data?.forEach(p => { map[p.id] = p; });
        setProfiles(map);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };
    fetchProfiles();
  }, [requests, type, isDemo]);

  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>{type === 'received' ? 'No pending requests' : 'No sent requests'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map(request => {
        const userId = type === 'received' ? request.sender_id : request.receiver_id;
        const profile = profiles[userId];
        const name = profile?.display_name || profile?.username || 'Player';
        const timeAgo = getTimeAgo(new Date(request.created_at));

        return (
          <div key={request.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  name[0]?.toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{name}</p>
                <p className="text-xs text-gray-500">{timeAgo}</p>
                {request.message && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">"{request.message}"</p>
                )}
              </div>
            </div>
            {type === 'received' ? (
              <div className="flex gap-2">
                <Button size="sm" onClick={() => onAccept?.(request.id)} className="bg-green-500 hover:bg-green-600">
                  <Check className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDecline?.(request.id)} className="text-red-500 border-red-300">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Pending</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default FriendRequests;

