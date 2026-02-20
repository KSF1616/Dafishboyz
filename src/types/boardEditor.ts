export type ElementType = 
  | 'player-position' 
  | 'game-zone' 
  | 'card-deck' 
  | 'dice-area' 
  | 'score-track' 
  | 'path-tile' 
  | 'obstacle' 
  | 'bonus-zone'
  | 'start-zone'
  | 'end-zone'
  | 'text-label'
  | 'image';

export interface BoardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  label: string;
  color: string;
  zIndex: number;
  properties: Record<string, any>;
}

export interface BoardConfiguration {
  id?: string;
  game_id: string;
  name: string;
  description?: string;
  board_data: {
    elements: BoardElement[];
    gridSize: number;
    boardWidth: number;
    boardHeight: number;
    backgroundColor: string;
    backgroundImage?: string;
  };
  thumbnail_url?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export interface DragItem {
  type: ElementType;
  label: string;
  icon: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultColor: string;
}

export const ELEMENT_PALETTE: DragItem[] = [
  { type: 'player-position', label: 'Player Spot', icon: 'User', defaultWidth: 60, defaultHeight: 60, defaultColor: '#3B82F6' },
  { type: 'game-zone', label: 'Game Zone', icon: 'Square', defaultWidth: 120, defaultHeight: 120, defaultColor: '#10B981' },
  { type: 'card-deck', label: 'Card Deck', icon: 'Layers', defaultWidth: 80, defaultHeight: 100, defaultColor: '#8B5CF6' },
  { type: 'dice-area', label: 'Dice Area', icon: 'Dice5', defaultWidth: 100, defaultHeight: 100, defaultColor: '#F59E0B' },
  { type: 'score-track', label: 'Score Track', icon: 'BarChart', defaultWidth: 200, defaultHeight: 40, defaultColor: '#EF4444' },
  { type: 'path-tile', label: 'Path Tile', icon: 'Circle', defaultWidth: 50, defaultHeight: 50, defaultColor: '#6366F1' },
  { type: 'start-zone', label: 'Start Zone', icon: 'Play', defaultWidth: 80, defaultHeight: 80, defaultColor: '#22C55E' },
  { type: 'end-zone', label: 'End Zone', icon: 'Flag', defaultWidth: 80, defaultHeight: 80, defaultColor: '#EF4444' },
  { type: 'text-label', label: 'Text Label', icon: 'Type', defaultWidth: 100, defaultHeight: 30, defaultColor: '#1F2937' },
];
