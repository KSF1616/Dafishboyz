export interface MessageReaction {
  id: string;
  message_id: string;
  player_id: string;
  player_name: string;
  emoji: string;
  created_at: string;
}

export interface TypingUser {
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface GameSticker {
  id: string;
  name: string;
  url: string;
  category: 'poop' | 'toilet' | 'dice' | 'victory' | 'reaction';
}

export const CHAT_EMOJIS = ['😂', '💩', '🎲', '🏆', '👏', '🔥', '😱', '🤣', '👍', '❤️', '😭', '🙈'];

export const GAME_STICKERS: GameSticker[] = [
  { id: 'poop1', name: 'Happy Poop', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=poop1', category: 'poop' },
  { id: 'poop2', name: 'Sad Poop', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=poop2', category: 'poop' },
  { id: 'dice1', name: 'Lucky Dice', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=dice1', category: 'dice' },
  { id: 'dice2', name: 'Snake Eyes', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=dice2', category: 'dice' },
  { id: 'toilet1', name: 'Toilet', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=toilet1', category: 'toilet' },
  { id: 'victory1', name: 'Winner', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=winner', category: 'victory' },
  { id: 'victory2', name: 'Trophy', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=trophy', category: 'victory' },
  { id: 'react1', name: 'Shocked', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=shocked', category: 'reaction' },
  { id: 'react2', name: 'Laughing', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=laugh', category: 'reaction' },
  { id: 'react3', name: 'Angry', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=angry', category: 'reaction' },
  { id: 'react4', name: 'Cool', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=cool', category: 'reaction' },
  { id: 'react5', name: 'Crying', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=crying', category: 'reaction' },
];
