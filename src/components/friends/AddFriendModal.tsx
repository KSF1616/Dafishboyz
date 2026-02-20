import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Loader2, Check } from 'lucide-react';
import { useFriends } from '@/contexts/FriendsContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

const AddFriendModal: React.FC<Props> = ({ open, onClose }) => {
  const { searchUsers, sendFriendRequest, friends, sentRequests } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    const users = await searchUsers(query);
    setResults(users);
    setSearching(false);
  };

  const handleSendRequest = async (userId: string) => {
    setSending(userId);
    const success = await sendFriendRequest(userId);
    if (success) {
      setSent(prev => [...prev, userId]);
    }
    setSending(null);
  };

  const isAlreadyFriend = (userId: string) => friends.some(f => f.id === userId);
  const hasPendingRequest = (userId: string) => sentRequests.some(r => r.receiver_id === userId) || sent.includes(userId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Friend</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2 mt-4">
          <Input
            placeholder="Search by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
          {results.length === 0 && query && !searching && (
            <p className="text-center text-gray-500 py-4">No users found</p>
          )}
          {results.map(user => (
            <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    (user.display_name || user.username || '?')[0].toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium">{user.display_name || user.username}</p>
                  {user.username && <p className="text-xs text-gray-500">@{user.username}</p>}
                </div>
              </div>
              {isAlreadyFriend(user.id) ? (
                <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Friends</span>
              ) : hasPendingRequest(user.id) ? (
                <span className="text-xs text-gray-500 flex items-center gap-1"><Check className="w-3 h-3" /> Sent</span>
              ) : (
                <Button size="sm" onClick={() => handleSendRequest(user.id)} disabled={sending === user.id}>
                  {sending === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
