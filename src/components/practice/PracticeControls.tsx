import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Pause, Play, RotateCcw, Lightbulb, SkipBack, SkipForward, Settings, Volume2, VolumeX } from 'lucide-react';

interface PracticeControlsProps {
  isPaused: boolean;
  canUndo: boolean;
  canRedo: boolean;
  hintsEnabled: boolean;
  soundEnabled: boolean;
  onPauseToggle: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onToggleHints: () => void;
  onToggleSound: () => void;
  onSettings: () => void;
  onRestart: () => void;
}

const PracticeControls: React.FC<PracticeControlsProps> = ({
  isPaused,
  canUndo,
  canRedo,
  hintsEnabled,
  soundEnabled,
  onPauseToggle,
  onUndo,
  onRedo,
  onHint,
  onToggleHints,
  onToggleSound,
  onSettings,
  onRestart
}) => {
  return (
    <div className="bg-gradient-to-r from-amber-900/90 to-yellow-900/90 backdrop-blur-sm rounded-xl p-4 border border-amber-500/30 shadow-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Game Flow Controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onPauseToggle}
                variant="outline"
                size="lg"
                className={`${
                  isPaused 
                    ? 'bg-green-600 hover:bg-green-700 border-green-500 text-white' 
                    : 'bg-amber-600 hover:bg-amber-700 border-amber-500 text-white'
                } transition-all duration-200`}
              >
                {isPaused ? (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isPaused ? 'Resume the game' : 'Pause the game'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRestart}
                variant="outline"
                size="icon"
                className="bg-red-600/80 hover:bg-red-700 border-red-500 text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Restart Game</TooltipContent>
          </Tooltip>
        </div>

        {/* Undo/Redo Controls */}
        <div className="flex items-center gap-2 bg-black/20 rounded-lg p-2">
          <span className="text-amber-200 text-sm font-medium px-2">History:</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onUndo}
                disabled={!canUndo}
                variant="ghost"
                size="icon"
                className="text-amber-200 hover:text-white hover:bg-amber-700/50 disabled:opacity-40"
              >
                <SkipBack className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo Last Move</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRedo}
                disabled={!canRedo}
                variant="ghost"
                size="icon"
                className="text-amber-200 hover:text-white hover:bg-amber-700/50 disabled:opacity-40"
              >
                <SkipForward className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo Move</TooltipContent>
          </Tooltip>
        </div>

        {/* Hint Controls */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onHint}
                variant="outline"
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 border-purple-400 text-white shadow-lg shadow-purple-500/25"
              >
                <Lightbulb className="w-5 h-5 mr-2" />
                Get Hint
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ask Coach Bot for a hint</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleHints}
                variant="ghost"
                size="icon"
                className={`${
                  hintsEnabled 
                    ? 'text-yellow-400 bg-yellow-500/20' 
                    : 'text-gray-400'
                } hover:bg-amber-700/50`}
              >
                <Lightbulb className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {hintsEnabled ? 'Auto-hints ON' : 'Auto-hints OFF'}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onToggleSound}
                variant="ghost"
                size="icon"
                className="text-amber-200 hover:text-white hover:bg-amber-700/50"
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {soundEnabled ? 'Sound ON' : 'Sound OFF'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onSettings}
                variant="ghost"
                size="icon"
                className="text-amber-200 hover:text-white hover:bg-amber-700/50"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Practice Settings</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Pause Overlay Indicator */}
      {isPaused && (
        <div className="mt-3 text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full text-amber-200 text-sm animate-pulse">
            <Pause className="w-4 h-4" />
            Game Paused - Take your time to think!
          </span>
        </div>
      )}
    </div>
  );
};

export default PracticeControls;
