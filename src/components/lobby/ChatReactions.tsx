import React, { useState } from 'react';
import { MessageReaction, CHAT_EMOJIS } from '@/types/chat';
import { SmilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  messageId: string;
  reactions: MessageReaction[];
  currentPlayerId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (reactionId: string) => void;
}

const ChatReactions: React.FC<Props> = ({
  messageId, reactions, currentPlayerId, onAddReaction, onRemoveReaction
}) => {
  const [open, setOpen] = useState(false);

  const groupedReactions = reactions.reduce((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = [];
    acc[r.emoji].push(r);
    return acc;
  }, {} as Record<string, MessageReaction[]>);

  const handleEmojiClick = (emoji: string) => {
    const existing = reactions.find(r => r.emoji === emoji && r.player_id === currentPlayerId);
    if (existing) {
      onRemoveReaction(existing.id);
    } else {
      onAddReaction(messageId, emoji);
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {Object.entries(groupedReactions).map(([emoji, reacts]) => {
        const hasMyReaction = reacts.some(r => r.player_id === currentPlayerId);
        return (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs transition-colors ${
              hasMyReaction ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={reacts.map(r => r.player_name).join(', ')}
          >
            <span>{emoji}</span>
            <span>{reacts.length}</span>
          </button>
        );
      })}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-500 hover:text-white">
            <SmilePlus className="w-3 h-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2 bg-gray-800 border-gray-700">
          <div className="grid grid-cols-6 gap-1">
            {CHAT_EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-lg hover:bg-gray-700 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ChatReactions;
