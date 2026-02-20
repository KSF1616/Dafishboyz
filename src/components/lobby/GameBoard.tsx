import React, { Component, ErrorInfo, ReactNode } from 'react';
import OCrapsBoard from './OCrapsBoard';
import OCrapsInstructions from './OCrapsInstructions';
import ShitoBoard from './ShitoBoard';
import SlangingShitBoard from './SlangingShitBoard';
import ShitzCreekBoard from './ShitzCreekBoard';
import LetThatShitGoBoard from './LetThatShitGoBoard';
import DrinkingGamePanel from '@/components/DrinkingGamePanel';
import { useDrinkingGame } from '@/contexts/DrinkingGameContext';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { normalizeGameId, isShitzCreek, isSlangingShit } from '@/lib/gameAssets';

interface Props {
  gameType: string;
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string }[];
  currentPlayerId: string;
  isSpectator?: boolean;
  roomId?: string;
}


// Check if game is for children (should not have drinking mode)
const isChildGame = (gameType: string): boolean => {
  return gameType === 'drop-deuce';
};

// Error Boundary to catch rendering errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GameBoardErrorBoundary extends Component<{ children: ReactNode; onReset: () => void }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode; onReset: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GameBoard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Game Board Error</h3>
          <p className="text-gray-400 mb-4">
            Something went wrong loading the game board. Please try refreshing.
          </p>
          <p className="text-red-400 text-sm mb-4 font-mono">
            {this.state.error?.message || 'Unknown error'}
          </p>
          <Button 
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset();
            }}
            className="bg-red-600 hover:bg-red-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

function GameBoardContent(props: Props) {
  const { gameType, isSpectator } = props;
  
  // Normalize the game type to handle aliases (up-shitz-creek -> shitz-creek, etc.)
  const normalizedGameType = normalizeGameId(gameType);
  
  // Safely try to use drinking game context
  let drinkingSettings = { enabled: false };
  try {
    const drinkingGame = useDrinkingGame();
    drinkingSettings = drinkingGame.settings;
  } catch (e) {
    // DrinkingGameContext not available, use defaults
    console.log('DrinkingGameContext not available, using defaults');
  }
  
  // Pass isSpectator to disable controls
  const boardProps = { ...props, disabled: isSpectator };
  
  const renderGameBoard = () => {
    try {
      // Use normalized game type for matching, handles aliases like:
      // - up-shitz-creek -> shitz-creek
      // - slanging-cards -> slanging-shit
      if (isShitzCreek(gameType)) {
        return <ShitzCreekBoard {...boardProps} />;
      }
      
      if (normalizedGameType === 'shito') {
        return <ShitoBoard {...boardProps} />;
      }
      
      if (isSlangingShit(gameType)) {
        return <SlangingShitBoard {...boardProps} />;
      }
      
      if (normalizedGameType === 'let-that-shit-go') {
        return <LetThatShitGoBoard {...boardProps} />;
      }
      
      // O'Craps game (default)
      return (
        <div className="space-y-4">
          <OCrapsBoard {...boardProps} />
          <OCrapsInstructions />
        </div>
      );
    } catch (error) {
      console.error('Error rendering game board:', error);
      return (
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Game</h3>
          <p className="text-gray-400">Unable to render the game board for: {gameType}</p>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Main Game Board */}
      {renderGameBoard()}
      
      {/* Drinking Game Panel - Only show for adult games */}
      {!isChildGame(gameType) && (
        <DrinkingGamePanel 
          gameType={gameType} 
          isChildGame={isChildGame(gameType)}
        />
      )}
    </div>
  );
}

export default function GameBoard(props: Props) {
  return (
    <GameBoardErrorBoundary onReset={() => window.location.reload()}>
      <GameBoardContent {...props} />
    </GameBoardErrorBoundary>
  );
}

