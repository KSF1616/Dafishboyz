// Default Shito calling card icons - used as fallback when bucket is empty
// These are poop-themed icons for the game

export interface ShitoIcon {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export const SHITO_ICONS: ShitoIcon[] = [
  // Row 1 - Basic Poops
  { id: 'classic-poop', name: 'Classic Poop', emoji: '💩', color: '#8B4513' },
  { id: 'golden-poop', name: 'Golden Poop', emoji: '💩', color: '#FFD700' },
  { id: 'rainbow-poop', name: 'Rainbow Poop', emoji: '💩', color: '#FF69B4' },
  { id: 'ghost-poop', name: 'Ghost Poop', emoji: '👻', color: '#E8E8E8' },
  { id: 'fire-poop', name: 'Fire Poop', emoji: '🔥', color: '#FF4500' },
  
  // Row 2 - Bathroom Items
  { id: 'toilet-paper', name: 'Toilet Paper', emoji: '🧻', color: '#FFFFFF' },
  { id: 'plunger', name: 'Plunger', emoji: '🪠', color: '#8B0000' },
  { id: 'toilet', name: 'Toilet', emoji: '🚽', color: '#F5F5F5' },
  { id: 'soap', name: 'Soap', emoji: '🧼', color: '#87CEEB' },
  { id: 'shower', name: 'Shower', emoji: '🚿', color: '#4169E1' },
  
  // Row 3 - Food Related
  { id: 'corn', name: 'Corn', emoji: '🌽', color: '#FFD700' },
  { id: 'burrito', name: 'Burrito', emoji: '🌯', color: '#DEB887' },
  { id: 'taco', name: 'Taco', emoji: '🌮', color: '#FFA500' },
  { id: 'hot-pepper', name: 'Hot Pepper', emoji: '🌶️', color: '#FF0000' },
  { id: 'beans', name: 'Beans', emoji: '🫘', color: '#8B4513' },
  
  // Row 4 - Expressions
  { id: 'laughing', name: 'Laughing', emoji: '😂', color: '#FFD700' },
  { id: 'shocked', name: 'Shocked', emoji: '😱', color: '#FFD700' },
  { id: 'sick', name: 'Sick', emoji: '🤢', color: '#90EE90' },
  { id: 'relieved', name: 'Relieved', emoji: '😌', color: '#FFD700' },
  { id: 'sweating', name: 'Sweating', emoji: '😰', color: '#FFD700' },
  
  // Row 5 - Animals
  { id: 'fly', name: 'Fly', emoji: '🪰', color: '#2F4F4F' },
  { id: 'skunk', name: 'Skunk', emoji: '🦨', color: '#000000' },
  { id: 'pig', name: 'Pig', emoji: '🐷', color: '#FFB6C1' },
  { id: 'dog', name: 'Dog', emoji: '🐕', color: '#D2691E' },
  { id: 'cat', name: 'Cat', emoji: '🐱', color: '#FFA500' },
  
  // Row 6 - Misc
  { id: 'bomb', name: 'Bomb', emoji: '💣', color: '#000000' },
  { id: 'explosion', name: 'Explosion', emoji: '💥', color: '#FF4500' },
  { id: 'cloud', name: 'Stink Cloud', emoji: '☁️', color: '#90EE90' },
  { id: 'nose', name: 'Nose', emoji: '👃', color: '#FFE4C4' },
  { id: 'warning', name: 'Warning', emoji: '⚠️', color: '#FFD700' },
  
  // Row 7 - More Items
  { id: 'newspaper', name: 'Newspaper', emoji: '📰', color: '#F5F5F5' },
  { id: 'phone', name: 'Phone', emoji: '📱', color: '#1E90FF' },
  { id: 'clock', name: 'Clock', emoji: '⏰', color: '#FF6347' },
  { id: 'candle', name: 'Candle', emoji: '🕯️', color: '#FFD700' },
  { id: 'spray', name: 'Air Freshener', emoji: '🧴', color: '#87CEEB' },
  
  // Row 8 - Actions
  { id: 'running', name: 'Running', emoji: '🏃', color: '#4169E1' },
  { id: 'sitting', name: 'Sitting', emoji: '🧘', color: '#9370DB' },
  { id: 'praying', name: 'Praying', emoji: '🙏', color: '#FFD700' },
  { id: 'thumbs-up', name: 'Thumbs Up', emoji: '👍', color: '#FFD700' },
  { id: 'thumbs-down', name: 'Thumbs Down', emoji: '👎', color: '#FFD700' },
  
  // Row 9 - Nature
  { id: 'leaf', name: 'Leaf', emoji: '🍃', color: '#228B22' },
  { id: 'flower', name: 'Flower', emoji: '🌸', color: '#FFB6C1' },
  { id: 'sun', name: 'Sun', emoji: '☀️', color: '#FFD700' },
  { id: 'moon', name: 'Moon', emoji: '🌙', color: '#F0E68C' },
  { id: 'star', name: 'Star', emoji: '⭐', color: '#FFD700' },
  
  // Row 10 - Special
  { id: 'crown', name: 'Crown', emoji: '👑', color: '#FFD700' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', color: '#FFD700' },
  { id: 'medal', name: 'Medal', emoji: '🥇', color: '#FFD700' },
  { id: 'gem', name: 'Gem', emoji: '💎', color: '#00CED1' },
  { id: 'magic', name: 'Magic', emoji: '✨', color: '#FFD700' },
];

export const SHITO_COLUMNS = ['S', 'H', 'I', 'T', 'O'] as const;
export type ShitoColumn = typeof SHITO_COLUMNS[number];

// Get icons for a specific column (5 icons per column, 25 total for a bingo card)
export const getIconsForColumn = (column: ShitoColumn): ShitoIcon[] => {
  const columnIndex = SHITO_COLUMNS.indexOf(column);
  const startIndex = columnIndex * 10;
  return SHITO_ICONS.slice(startIndex, startIndex + 10);
};

// Generate a random player card with unique icons in each column
export const generatePlayerCard = (): { [key in ShitoColumn]: ShitoIcon[] } => {
  const card: { [key in ShitoColumn]: ShitoIcon[] } = {
    S: [],
    H: [],
    I: [],
    T: [],
    O: [],
  };
  
  SHITO_COLUMNS.forEach((column, colIndex) => {
    // Get 10 possible icons for this column
    const columnIcons = getIconsForColumn(column);
    // Shuffle and pick 5
    const shuffled = [...columnIcons].sort(() => Math.random() - 0.5);
    card[column] = shuffled.slice(0, 5);
  });
  
  return card;
};

// Roll dice to get a random column
export const rollColumnDice = (): ShitoColumn => {
  return SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
};
