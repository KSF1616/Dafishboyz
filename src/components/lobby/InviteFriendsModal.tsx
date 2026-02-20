import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useFriends } from '@/contexts/FriendsContext';
import { supabase } from '@/lib/supabase';
import { Send, Check, Users, Gamepad2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
  gameName: string;
}

const statusColors = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  offline: 'bg-gray-400',
  in_game: 'bg-purple-500'
};

const InviteFriendsModal: React.FC<Props> = ({ isOpen, onClose, roomCode, gameName }) => {
  const { friends } = useFriends();
  const [invitedIds, setInvitedIds] = useState<string[]>([]);

  const onlineFriends = friends.filter(f => f.presence?.status === 'online' || f.presence?.status === 'away');
  const inGameFriends = friends.filter(f => f.presence?.status === 'in_game');
  const offlineFriends = friends.filter(f => !f.presence || f.presence.status === 'offline');

  const handleInvite = async (friendId: string, friendName: string) => {
    // Send game invite notification
    await supabase.from('notifications').insert({
      user_id: friendId,
      type: 'game_invite',
      title: 'Game Invite',
      message: `You've been invited to play ${gameName}!`,
      data: { room_code: roomCode, game_name: gameName }
    });
    setInvitedIds(prev => [...prev, friendId]);
    const inviteUrl = `${window.location.origin}/lobby?code=${roomCode}`;
    navigator.clipboard.writeText(inviteUrl);
  };

  const renderFriendsList = (friendsList: typeof friends, label: string) => {
    if (friendsList.length === 0) return null;
    return (
      <div className="mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{label}</p>
        <div className="space-y-2">
          {friendsList.map(friend => {
            const status = friend.presence?.status || 'offline';
            const isInvited = invitedIds.includes(friend.id);
            const name = friend.display_name || friend.username || '?';
            return (
              <div key={friend.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {friend.avatar_url ? (
                        <img src={friend.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : name[0].toUpperCase()}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${statusColors[status]}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{name}</p>
                    {status === 'in_game' && <p className="text-xs text-purple-400">Playing now</p>}
                  </div>
                </div>
                <Button size="sm" onClick={() => handleInvite(friend.id, name)} disabled={isInvited || status === 'offline'} className={isInvited ? 'bg-green-500' : ''}>
                  {isInvited ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Invite Friends
          </DialogTitle>
        </DialogHeader>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mb-4">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            <Gamepad2 className="w-4 h-4 inline mr-1" />
            Invite friends to play <span className="font-semibold">{gameName}</span>
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Room: {roomCode}</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No friends yet</p>
              <p className="text-sm">Add friends to invite them!</p>
            </div>
          ) : (
            <>
              {renderFriendsList(onlineFriends, 'Online')}
              {renderFriendsList(inGameFriends, 'In Game')}
              {renderFriendsList(offlineFriends, 'Offline')}
            </>
          )}
        </div>
        {invitedIds.length > 0 && <p className="text-xs text-green-600 text-center mt-2">Invite sent! Link copied to clipboard.</p>}
      </DialogContent>
    </Dialog>
  );
};

export default InviteFriendsModal;
