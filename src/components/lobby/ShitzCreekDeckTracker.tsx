/**
 * Visual deck tracker for Up Shitz Creek.
 *
 * Shows the draw pile / discard pile counts with a depleting visual indicator
 * and a shuffle animation when the discard pile is reshuffled back in.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Layers, RotateCcw, Shuffle } from 'lucide-react';
import type { DeckState } from '@/lib/shitzCreekDeck';

interface Props {
  deckState: DeckState | null;
  /** Whether cards are still loading from DB */
  loading?: boolean;
}

export default function ShitzCreekDeckTracker({ deckState, loading }: Props) {
  const [shuffleAnim, setShuffleAnim] = useState(false);
  const lastShuffledRef = useRef<number>(0);

  // Detect reshuffle events and trigger animation
  useEffect(() => {
    if (!deckState) return;
    if (
      deckState.lastShuffled > lastShuffledRef.current &&
      lastShuffledRef.current > 0 &&
      deckState.reshuffleCount > 0
    ) {
      setShuffleAnim(true);
      const timer = setTimeout(() => setShuffleAnim(false), 2000);
      return () => clearTimeout(timer);
    }
    lastShuffledRef.current = deckState.lastShuffled;
  }, [deckState?.lastShuffled, deckState?.reshuffleCount]);

  if (loading || !deckState) {
    return (
      <div className="flex items-center gap-2 bg-amber-800/60 rounded-lg px-3 py-2 border border-amber-600/40">
        <Layers className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-amber-300 text-xs font-medium">Loading deck...</span>
      </div>
    );
  }

  const remaining = deckState.drawPile.length;
  const discarded = deckState.discardPile.length;
  const total = deckState.totalCards;
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  // Color coding based on how many cards are left
  const barColor =
    pct > 50
      ? 'bg-green-500'
      : pct > 25
        ? 'bg-yellow-500'
        : pct > 0
          ? 'bg-red-500'
          : 'bg-gray-500';

  const glowColor =
    pct > 50
      ? 'shadow-green-500/30'
      : pct > 25
        ? 'shadow-yellow-500/30'
        : pct > 0
          ? 'shadow-red-500/30'
          : '';

  return (
    <div className={`relative ${shuffleAnim ? 'animate-pulse' : ''}`}>
      {/* Shuffle overlay animation */}
      {shuffleAnim && (
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-lg animate-ping" />
          <div className="relative flex items-center gap-1.5 bg-amber-900 border-2 border-amber-400 rounded-lg px-3 py-1.5 shadow-lg shadow-amber-500/40 z-20">
            <RotateCcw className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="text-amber-200 text-xs font-bold whitespace-nowrap">Reshuffling!</span>
          </div>
        </div>
      )}

      <div
        className={`flex items-center gap-3 bg-amber-800/60 rounded-lg px-3 py-2 border border-amber-600/40 transition-all duration-300 ${
          shuffleAnim ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
        } ${remaining <= 3 && remaining > 0 ? `shadow-md ${glowColor}` : ''}`}
      >
        {/* Card stack icon */}
        <div className="relative flex-shrink-0">
          <div className="relative w-8 h-10">
            {/* Stacked card layers */}
            {[...Array(Math.min(Math.ceil(remaining / Math.max(total / 5, 1)), 5))].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-sm border border-amber-500/60 bg-gradient-to-br from-amber-600 to-amber-800"
                style={{
                  width: '24px',
                  height: '32px',
                  bottom: `${i * 2}px`,
                  left: `${i * 1}px`,
                  zIndex: i,
                }}
              />
            ))}
            {remaining === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Shuffle className="w-5 h-5 text-amber-400/50" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-amber-200 text-xs font-bold">
              {remaining} left
            </span>
            <span className="text-amber-400/70 text-[10px]">
              {discarded} discarded
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>

          {/* Reshuffle count */}
          {deckState.reshuffleCount > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <RotateCcw className="w-2.5 h-2.5 text-amber-500/60" />
              <span className="text-amber-500/60 text-[9px]">
                Reshuffled {deckState.reshuffleCount}x
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
