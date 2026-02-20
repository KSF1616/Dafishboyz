import React from 'react';
import { FriendWithPresence } from '@/types/friends';
import { Button } from '@/components/ui/button';
import { UserMinus, Gamepad2, MessageCircle } from 'lucide-react';

interface Props {
  friends: FriendWithPresence[];
  onRemove: (id: string) => void;
  onInvite: (friend: FriendWithPresence) => void;
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
  in_game: 'bg-purple-500'
};

const statusLabels = {
  online: 'Online',
  away: 'Away',
  offline: 'Offline',
  in_game: 'In Game'
};

const FriendsList: React.FC<Props> = ({ friends, onRemove, onInvite }) => {
  if (friends.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No friends yet. Search for players to add!</p>
      </div>
    );
  }

  const sortedFriends = [...friends].sort((a, b) => {
    const order = { in_game: 0, online: 1, away: 2, offline: 3 };
    const statusA = a.presence?.status || 'offline';
    const statusB = b.presence?.status || 'offline';
    return order[statusA] - order[statusB];
  });

  return (
    <div className="space-y-2">
      {sortedFriends.map(friend => {
        const status = friend.presence?.status || 'offline';
        return (
          <div key={friend.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {friend.avatar_url ? (
                    <img src={friend.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (friend.display_name || friend.username || '?')[0].toUpperCase()
                  )}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[status]}`} />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {friend.display_name || friend.username || 'Player'}
                </p>
                <p className="text-xs text-gray-500">{statusLabels[status]}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(status === 'online' || status === 'in_game') && (
                <Button size="sm" variant="outline" onClick={() => onInvite(friend)} className="text-purple-600">
                  <Gamepad2 className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => onRemove(friend.friendship_id)} className="text-red-500 hover:text-red-600">
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FriendsList;
