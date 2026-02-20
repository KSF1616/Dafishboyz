import React, { useState, useEffect } from 'react';
import { X, Loader2, Shuffle, Check, AlertTriangle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { parseCardEffect, ParsedCardAction } from '@/data/shitzCreekSpaceEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCardEffect?: (effect: ParsedCardAction) => void;
}

/** Shape of a card row from the parsed_game_cards table */
interface DbCard {
  id: string;
  card_name: string;
  card_effect: string;
  card_number: number;
  metadata: Record<string, any>;
}

export default function ShitzCreekCards({ isOpen, onClose, onCardEffect }: Props) {
  const [dbCards, setDbCards] = useState<DbCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnCard, setDrawnCard] = useState<DbCard | null>(null);
  const [parsedAction, setParsedAction] = useState<ParsedCardAction | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [effectApplied, setEffectApplied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCardsFromDb();
      setDrawnCard(null);
      setParsedAction(null);
      setIsFlipped(false);
      setEffectApplied(false);
    }
  }, [isOpen]);

  const loadCardsFromDb = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('game-card-loader', {
        body: { action: 'get-cards', gameId: 'shitz-creek' },
      });
      if (fnError) throw fnError;
      const payload = data as any;
      const cards = payload?.cards || payload?.data?.cards;
      if (cards && Array.isArray(cards)) {
        setDbCards(cards as DbCard[]);
      } else {
        throw new Error('No cards in response');
      }
    } catch (err: any) {
      console.error('Failed to load cards:', err);
      setError(err?.message || 'Failed to load cards');
    }
    setLoading(false);
  };

  const drawCard = () => {
    if (dbCards.length === 0) return;
    setIsDrawing(true);
    setIsFlipped(false);
    setEffectApplied(false);

    setTimeout(() => {
      const card = dbCards[Math.floor(Math.random() * dbCards.length)];
      const action = parseCardEffect(card.card_effect);
      setDrawnCard(card);
      setParsedAction(action);

      setTimeout(() => {
        setIsFlipped(true);
        setIsDrawing(false);
      }, 300);
    }, 800);
  };

  const handleContinue = () => {
    if (parsedAction && onCardEffect && !effectApplied) {
      setEffectApplied(true);
      onCardEffect(parsedAction);
    }
    onClose();
  };

  const getCardIcon = (action: ParsedCardAction | null) => {
    if (!action) return '💩';
    switch (action.type) {
      case 'paddle_gain': case 'go_to_space_and_gain_paddle': return '🏆';
      case 'paddle_lose': return '😢';
      case 'paddle_steal': return '🦝';
      case 'paddle_gift_right': case 'paddle_gift_choose': return '🎁';
      case 'move_forward': return '🚀';
      case 'move_back': return '⬅️';
      case 'lose_turn': return '⏸️';
      case 'extra_turn': case 'draw_again': return '🎲';
      case 'go_to_space': return '📍';
      case 'take_lead': return '👑';
      case 'send_player_to': case 'move_player_behind_last': return '😈';
      case 'bring_player': case 'bring_all_players': return '🧲';
      case 'behind_leader': return '🏃';
      case 'skip_yellow': return '🛡️';
      default: return '💩';
    }
  };

  const getCardColor = (action: ParsedCardAction | null) => {
    if (!action) return 'from-amber-700 to-amber-900';
    switch (action.type) {
      case 'paddle_gain': case 'go_to_space_and_gain_paddle': case 'extra_turn': case 'take_lead':
        return 'from-green-600 to-emerald-800';
      case 'paddle_lose': case 'lose_turn': case 'move_back': case 'behind_leader':
        return 'from-red-600 to-red-900';
      case 'paddle_steal': case 'send_player_to': case 'move_player_behind_last':
        return 'from-purple-600 to-purple-900';
      case 'go_to_space': case 'move_both_to_space':
        return 'from-blue-600 to-blue-900';
      default:
        return 'from-amber-700 to-amber-900';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-amber-900 to-yellow-900 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl border-4 border-amber-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">💩</span> Shit Pile Cards
          </h2>
          {!drawnCard && (
            <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 text-amber-400 animate-spin mb-4" />
            <p className="text-amber-200">Loading real cards from database...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
            <p className="text-red-200 mb-4">{error}</p>
            <Button onClick={loadCardsFromDb} className="bg-amber-600 hover:bg-amber-500">Retry</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card display area */}
            <div className={`relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg transform transition-all duration-500 ${isDrawing ? 'animate-pulse scale-95' : ''}`}>
              {drawnCard && parsedAction && isFlipped ? (
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCardColor(parsedAction)} p-6 animate-fadeIn`}>
                  <div className="text-6xl mb-4">{getCardIcon(parsedAction)}</div>
                  <div className="bg-black/30 rounded-lg px-4 py-2 mb-3">
                    <p className="text-amber-300 text-xs font-mono">{drawnCard.card_name}</p>
                  </div>
                  <p className="text-white font-bold text-xl text-center leading-tight">
                    {drawnCard.card_effect}
                  </p>
                  {parsedAction.needsPlayerSelect && (
                    <div className="mt-3 flex items-center gap-1 text-yellow-300 text-sm">
                      <Users className="w-4 h-4" />
                      <span>Requires player selection</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
                  <div className="text-7xl mb-4 animate-bounce">💩</div>
                  <p className="text-amber-200 font-bold text-lg">Shit Pile</p>
                  <p className="text-amber-300/70 text-sm mt-1">Draw a card!</p>
                </div>
              )}
            </div>

            {/* Effect display */}
            {parsedAction && isFlipped && (
              <div className="bg-gradient-to-r from-yellow-600/80 to-amber-600/80 rounded-lg p-4 text-center animate-fadeIn border-2 border-yellow-400">
                <p className="text-white font-bold text-xl">{parsedAction.text}</p>
                <p className="text-amber-200 text-xs mt-1 capitalize">{parsedAction.type.replace(/_/g, ' ')}</p>
              </div>
            )}

            {/* Draw button */}
            {!drawnCard && (
              <Button onClick={drawCard} disabled={isDrawing || dbCards.length === 0} className="w-full bg-amber-600 hover:bg-amber-500 text-lg py-6 font-bold">
                {isDrawing ? (
                  <><Shuffle className="w-5 h-5 mr-2 animate-spin" /> Drawing...</>
                ) : (
                  <><Shuffle className="w-5 h-5 mr-2" /> Draw Card</>
                )}
              </Button>
            )}

            {/* Continue button */}
            {drawnCard && isFlipped && !isDrawing && (
              <Button onClick={handleContinue} className="w-full bg-green-600 hover:bg-green-500 text-lg py-6 font-bold animate-pulse">
                <Check className="w-5 h-5 mr-2" /> Continue
              </Button>
            )}

            <p className="text-amber-300 text-sm text-center">
              {dbCards.length} real cards in the pile
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Re-export for backward compatibility
export type { ParsedCardAction as CardEffect };
