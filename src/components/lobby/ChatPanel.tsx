import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/types/lobby';
import { MessageReaction, TypingUser, GameSticker } from '@/types/chat';
import { Send, Sticker, Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import ChatReactions from './ChatReactions';
import ChatStickerPicker from './ChatStickerPicker';

interface Props {
  messages?: ChatMessage[] | null;
  onSendMessage: (message: string, type?: 'chat' | 'sticker') => void;
  currentPlayerId?: string;
  roomId?: string;
  isLoading?: boolean;
}

const ChatPanel: React.FC<Props> = ({ 
  messages, 
  onSendMessage, 
  currentPlayerId = '', 
  roomId,
  isLoading = false
}) => {
  // Safety check for messages array - handle undefined, null, and non-array values
  const safeMessages = Array.isArray(messages) ? messages : [];

  const [newMessage, setNewMessage] = useState('');
  const [reactions, setReactions] = useState<Record<string, MessageReaction[]>>({});
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [showStickers, setShowStickers] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [safeMessages]);

  useEffect(() => {
    if (!roomId) return;
    fetchReactions();
    
    channelRef.current = supabase.channel(`chat:${roomId}`)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload && payload.playerId !== currentPlayerId) {
          setTypingUsers(prev => {
            const filtered = prev.filter(u => u.playerId !== payload.playerId);
            if (payload.isTyping) {
              return [...filtered, { ...payload, timestamp: Date.now() }];
            }
            return filtered;
          });
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'message_reactions' },
        () => fetchReactions())
      .subscribe();

    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [roomId, currentPlayerId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => prev.filter(u => Date.now() - u.timestamp < 3000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchReactions = async () => {
    if (safeMessages.length === 0) return;
    const msgIds = safeMessages.map(m => m?.id).filter(Boolean);
    if (msgIds.length === 0) return;
    
    try {
      const { data } = await supabase.from('message_reactions').select('*').in('message_id', msgIds);
      if (data) {
        const grouped = data.reduce((acc, r) => {
          if (!acc[r.message_id]) acc[r.message_id] = [];
          acc[r.message_id].push(r);
          return acc;
        }, {} as Record<string, MessageReaction[]>);
        setReactions(grouped);
      }
    } catch (error) {
      console.error('Error fetching reactions:', error);
    }
  };

  useEffect(() => { if (safeMessages.length > 0) fetchReactions(); }, [safeMessages.length]);


  const broadcastTyping = useCallback((typing: boolean) => {
    if (channelRef.current && roomId) {
      channelRef.current.send({ type: 'broadcast', event: 'typing', payload: { playerId: currentPlayerId, playerName: 'You', isTyping: typing } });
    }
  }, [roomId, currentPlayerId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!isTyping) { setIsTyping(true); broadcastTyping(true); }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { setIsTyping(false); broadcastTyping(false); }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
      setIsTyping(false);
      broadcastTyping(false);
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      await supabase.from('message_reactions').insert({ message_id: messageId, player_id: currentPlayerId, player_name: 'You', emoji });
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleRemoveReaction = async (reactionId: string) => {
    try {
      await supabase.from('message_reactions').delete().eq('id', reactionId);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const handleStickerSelect = (sticker: GameSticker) => {
    onSendMessage(`[sticker:${sticker.id}:${sticker.url}]`, 'sticker');
    setShowStickers(false);
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const renderMessage = (msg: ChatMessage) => {
    if (!msg?.message) return null;
    
    if (msg.message.startsWith('[sticker:')) {
      const match = msg.message.match(/\[sticker:([^:]+):([^\]]+)\]/);
      if (match) return <img src={match[2]} alt="sticker" className="w-16 h-16" />;
    }
    return <p className="text-sm">{msg.message}</p>;
  };

  const getMessageStyle = (msg: ChatMessage) => {
    if (!msg) return 'bg-gray-700 text-white';
    if (msg.player_id === currentPlayerId) return 'bg-purple-600 text-white';
    if (msg.message_type === 'system') return 'bg-gray-600 text-gray-300 italic';
    if (msg.message_type === 'drink') return 'bg-gradient-to-r from-amber-600 to-orange-600 text-white';
    return 'bg-gray-700 text-white';
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4 flex flex-col h-80">
        <h3 className="text-lg font-bold text-white mb-3">Chat</h3>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex flex-col h-80 relative">
      <h3 className="text-lg font-bold text-white mb-3">Chat</h3>
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2">
        {safeMessages.length === 0 ? (
          <p className="text-gray-500 text-center text-sm">No messages yet. Say hello!</p>
        ) : safeMessages.map((msg, index) => {
          // Skip null/undefined messages
          if (!msg) return null;
          
          return (
            <div 
              key={msg.id || `msg-${index}`} 
              className={`flex flex-col ${msg.player_id === currentPlayerId ? 'items-end' : 'items-start'}`}
            >
              <div className={`max-w-[80%] rounded-lg px-3 py-2 ${getMessageStyle(msg)}`}>
                {msg.player_id !== currentPlayerId && msg.message_type !== 'system' && msg.message_type !== 'drink' && (
                  <p className="text-xs text-purple-300 font-medium mb-1">{msg.player_name || 'Unknown'}</p>
                )}
                {msg.message_type === 'drink' && (
                  <p className="text-xs font-bold mb-1 flex items-center gap-1">
                    <span className="text-lg">🍺</span> Drinking Game
                  </p>
                )}
                {renderMessage(msg)}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 mt-1">{formatTime(msg.created_at)}</span>
              </div>
              {msg.message_type !== 'system' && msg.id && (
                <ChatReactions 
                  messageId={msg.id} 
                  reactions={reactions[msg.id] || []} 
                  currentPlayerId={currentPlayerId} 
                  onAddReaction={handleAddReaction} 
                  onRemoveReaction={handleRemoveReaction} 
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
          <span className="flex gap-0.5"><span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay:'0.1s'}}>.</span><span className="animate-bounce" style={{animationDelay:'0.2s'}}>.</span></span>
          {typingUsers.map(u => u.playerName).join(', ')} typing
        </div>
      )}
      {showStickers && <ChatStickerPicker onSelectSticker={handleStickerSelect} onClose={() => setShowStickers(false)} />}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={() => setShowStickers(!showStickers)} className="text-gray-400 hover:text-white">
          <Sticker className="w-5 h-5" />
        </Button>
        <Input value={newMessage} onChange={handleInputChange} placeholder="Type a message..." className="flex-1 bg-gray-700 border-gray-600 text-white" />
        <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatPanel;
