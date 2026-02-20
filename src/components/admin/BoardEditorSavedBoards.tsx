import React from 'react';
import { Check, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BoardConfiguration } from '@/types/boardEditor';
import { games } from '@/data/gamesData';

interface Props {
  boards: BoardConfiguration[];
  onLoad: (board: BoardConfiguration) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
}

export const BoardEditorSavedBoards: React.FC<Props> = ({ boards, onLoad, onDelete, onSetActive }) => {
  if (boards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No saved boards yet</p>
        <p className="text-sm mt-1">Create and save your first board!</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 max-h-[400px] overflow-y-auto">
      {boards.map((board) => {
        const game = games.find(g => g.id === board.game_id);
        return (
          <div
            key={board.id}
            className={`p-3 rounded-lg border-2 transition-all ${board.is_active ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">{board.name}</h4>
                  {board.is_active && (
                    <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{game?.name || board.game_id}</p>
                <p className="text-xs text-gray-400">{board.board_data.elements?.length || 0} elements</p>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onLoad(board)} className="h-7 w-7 p-0">
                  <Edit2 className="w-3 h-3" />
                </Button>
                {!board.is_active && (
                  <Button size="sm" variant="ghost" onClick={() => onSetActive(board.id!)} className="h-7 w-7 p-0 text-green-600">
                    <Check className="w-3 h-3" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => onDelete(board.id!)} className="h-7 w-7 p-0 text-red-500">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
