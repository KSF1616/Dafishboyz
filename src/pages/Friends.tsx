import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/contexts/FriendsContext';
import FriendsList from '@/components/friends/FriendsList';
import FriendRequests from '@/components/friends/FriendRequests';
import AddFriendModal from '@/components/friends/AddFriendModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, UserPlus, Users, Inbox, Send, RefreshCw, Gamepad2 } from 'lucide-react';
import { FriendWithPresence } from '@/types/friends';

const Friends: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { friends, pendingRequests, sentRequests, loading, acceptRequest, declineRequest, removeFriend, refreshFriends, updatePresence } = useFriends();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) updatePresence('online');
    return () => { if (user) updatePresence('offline'); };
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshFriends();
    setRefreshing(false);
  };

  const handleInvite = (friend: FriendWithPresence) => {
    navigate('/lobby', { state: { inviteFriend: friend } });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const onlineCount = friends.filter(f => f.presence?.status === 'online' || f.presence?.status === 'in_game').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/profile" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-4 h-4" /> Back to Profile
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Friend
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends</h1>
              <p className="text-gray-500">{friends.length} friends · {onlineCount} online</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="friends">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="friends" className="relative">
              <Users className="w-4 h-4 mr-2" /> Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="relative">
              <Inbox className="w-4 h-4 mr-2" /> Requests
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              <Send className="w-4 h-4 mr-2" /> Sent
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
              </div>
            ) : (
              <FriendsList friends={friends} onRemove={removeFriend} onInvite={handleInvite} />
            )}
          </TabsContent>

          <TabsContent value="requests">
            <FriendRequests requests={pendingRequests} type="received" onAccept={acceptRequest} onDecline={declineRequest} />
          </TabsContent>

          <TabsContent value="sent">
            <FriendRequests requests={sentRequests} type="sent" />
          </TabsContent>
        </Tabs>
      </div>

      <AddFriendModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

export default Friends;
