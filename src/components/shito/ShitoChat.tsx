import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Minimize2, Maximize2 } from 'lucide-react';
import { ShitoMessage } from '@/types/shitoMultiplayer';

interface ShitoChatProps {
  messages: ShitoMessage[];
  currentPlayerId: string;
  onSendMessage: (message: string) => void;
}

const ShitoChat: React.FC<ShitoChatProps> = ({
  messages,
  currentPlayerId,
  onSendMessage,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
      lastMessageCountRef.current = messages.length;
    } else if (messages.length > lastMessageCountRef.current) {
      setUnreadCount(prev => prev + (messages.length - lastMessageCountRef.current));
      lastMessageCountRef.current = messages.length;
    }
  }, [messages, isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (message: ShitoMessage) => {
    if (message.message_type === 'system') {
      return 'bg-white/10 text-pink-300 text-center italic';
    }
    if (message.message_type === 'game') {
      return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 text-center font-bold';
    }
    if (message.player_id === currentPlayerId) {
      return 'bg-gradient-to-r from-pink-600 to-purple-600 text-white ml-auto';
    }
    return 'bg-white/20 text-white';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full shadow-lg hover:scale-110 transition-all z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/10 z-50 transition-all ${
        isMinimized ? 'w-72 h-14' : 'w-80 sm:w-96 h-96'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 bg-gradient-to-r from-pink-600/50 to-purple-600/50 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-white" />
          <span className="font-bold text-white">Game Chat</span>
          {unreadCount > 0 && isMinimized && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsMinimized(!isMinimized);
              if (isMinimized) setUnreadCount(0);
            }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4 text-white" />
            ) : (
              <Minimize2 className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-all"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2">
            {messages.length === 0 ? (
              <p className="text-center text-white/50 text-sm py-8">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${getMessageStyle(message)}`}
                >
                  {message.message_type === 'chat' && (
                    <p className="text-xs text-white/60 mb-1">
                      {message.player_id === currentPlayerId ? 'You' : message.player_name}
                    </p>
                  )}
                  <p>{message.message}</p>
                  <p className="text-xs text-white/40 mt-1">
                    {formatTime(message.created_at)}
                  </p>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ShitoChat;
