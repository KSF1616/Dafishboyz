import React, { useState, useEffect, useRef } from 'react';
import {
  Trophy, ShieldOff, Skull, Gift, Rocket, ArrowLeft,
  Pause, Dice6, MapPin, Crown, Zap, Magnet,
  PersonStanding, Users, Shield, Car, HelpCircle,
  Bot, Target, X,
} from 'lucide-react';
import type { ParsedCardAction, CardActionType } from '@/data/shitzCreekSpaceEffects';

// ─── Types ────────────────────────────────────────────────────────────

export interface BotCardRevealData {
  botName: string;
  botAvatar?: string;
  card: {
    card_name: string;
    card_effect: string;
    card_category?: string;
  };
  parsedAction: ParsedCardAction;
  targetPlayerName?: string;
}

interface Props {
  data: BotCardRevealData;
  onDismiss: () => void;
  /** Auto-dismiss delay in ms (default 2500) */
  duration?: number;
}

// ─── Action type → Lucide icon mapping ────────────────────────────────

function getActionIcon(type: CardActionType): React.ReactNode {
  const cls = 'w-10 h-10';
  switch (type) {
    case 'paddle_gain':
    case 'go_to_space_and_gain_paddle':
      return <Trophy className={`${cls} text-emerald-300`} />;
    case 'paddle_lose':
      return <ShieldOff className={`${cls} text-red-300`} />;
    case 'paddle_steal':
      return <Skull className={`${cls} text-purple-300`} />;
    case 'paddle_gift_right':
    case 'paddle_gift_choose':
      return <Gift className={`${cls} text-pink-300`} />;
    case 'move_forward':
      return <Rocket className={`${cls} text-cyan-300`} />;
    case 'move_back':
      return <ArrowLeft className={`${cls} text-orange-300`} />;
    case 'lose_turn':
      return <Pause className={`${cls} text-gray-300`} />;
    case 'extra_turn':
    case 'draw_again':
      return <Dice6 className={`${cls} text-yellow-300`} />;
    case 'go_to_space':
      return <MapPin className={`${cls} text-blue-300`} />;
    case 'take_lead':
      return <Crown className={`${cls} text-yellow-300`} />;
    case 'send_player_to':
    case 'move_player_behind_last':
      return <Zap className={`${cls} text-red-300`} />;
    case 'bring_player':
    case 'bring_all_players':
      return <Magnet className={`${cls} text-indigo-300`} />;
    case 'behind_leader':
      return <PersonStanding className={`${cls} text-orange-300`} />;
    case 'go_back_with_player':
    case 'move_both_to_space':
      return <Users className={`${cls} text-teal-300`} />;
    case 'skip_yellow':
      return <Shield className={`${cls} text-yellow-300`} />;
    case 'move_ahead_of_player':
      return <Car className={`${cls} text-cyan-300`} />;
    default:
      return <HelpCircle className={`${cls} text-amber-300`} />;
  }
}

// ─── Action type → gradient colour ────────────────────────────────────

function getActionGradient(type: CardActionType): string {
  switch (type) {
    case 'paddle_gain':
    case 'go_to_space_and_gain_paddle':
    case 'extra_turn':
    case 'take_lead':
      return 'from-emerald-600 via-green-700 to-emerald-900';
    case 'paddle_lose':
    case 'lose_turn':
    case 'move_back':
    case 'behind_leader':
      return 'from-red-600 via-red-700 to-red-900';
    case 'paddle_steal':
    case 'send_player_to':
    case 'move_player_behind_last':
      return 'from-purple-600 via-purple-700 to-purple-900';
    case 'go_to_space':
    case 'move_both_to_space':
    case 'move_forward':
      return 'from-blue-600 via-blue-700 to-blue-900';
    case 'skip_yellow':
      return 'from-yellow-500 via-amber-600 to-amber-800';
    case 'paddle_gift_right':
    case 'paddle_gift_choose':
      return 'from-pink-600 via-pink-700 to-pink-900';
    case 'bring_player':
    case 'bring_all_players':
      return 'from-indigo-600 via-indigo-700 to-indigo-900';
    case 'draw_again':
      return 'from-yellow-600 via-amber-700 to-amber-900';
    default:
      return 'from-amber-700 via-amber-800 to-amber-950';
  }
}

// ─── Sentiment label ──────────────────────────────────────────────────

function getActionSentiment(type: CardActionType): { label: string; color: string } {
  const positive = new Set<CardActionType>([
    'paddle_gain', 'go_to_space_and_gain_paddle', 'extra_turn', 'take_lead',
    'move_forward', 'draw_again', 'skip_yellow', 'move_ahead_of_player',
  ]);
  const negative = new Set<CardActionType>([
    'paddle_lose', 'lose_turn', 'move_back', 'behind_leader',
  ]);
  const aggressive = new Set<CardActionType>([
    'paddle_steal', 'send_player_to', 'move_player_behind_last',
    'bring_player', 'bring_all_players', 'go_back_with_player', 'move_both_to_space',
  ]);

  if (positive.has(type)) return { label: 'Beneficial', color: 'text-emerald-300 bg-emerald-500/20 border-emerald-500/30' };
  if (negative.has(type)) return { label: 'Setback', color: 'text-red-300 bg-red-500/20 border-red-500/30' };
  if (aggressive.has(type)) return { label: 'Targeting', color: 'text-purple-300 bg-purple-500/20 border-purple-500/30' };
  return { label: 'Neutral', color: 'text-amber-300 bg-amber-500/20 border-amber-500/30' };
}

// ─── Component ────────────────────────────────────────────────────────

export default function BotCardRevealOverlay({ data, onDismiss, duration = 2500 }: Props) {
  const [phase, setPhase] = useState<'enter' | 'flip' | 'reveal' | 'exit'>('enter');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef = useRef(Date.now());

  // Progress bar
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Phase timeline: enter(200ms) → flip(400ms) → reveal(duration) → exit(300ms)
    const t1 = setTimeout(() => setPhase('flip'), 100);
    const t2 = setTimeout(() => setPhase('reveal'), 500);
    const t3 = setTimeout(() => setPhase('exit'), 500 + duration);
    const t4 = setTimeout(() => onDismiss(), 500 + duration + 350);

    timerRef.current = t4;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [duration, onDismiss]);

  // Animate progress bar during reveal phase
  useEffect(() => {
    if (phase !== 'reveal') return;
    startRef.current = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, duration]);

  const sentiment = getActionSentiment(data.parsedAction.type);

  // Container animation classes
  const containerAnim =
    phase === 'enter'
      ? 'opacity-0 scale-90'
      : phase === 'exit'
        ? 'opacity-0 scale-90 translate-y-4'
        : 'opacity-100 scale-100';

  // Card flip animation
  const cardFlip =
    phase === 'enter'
      ? 'rotateY(180deg)'
      : 'rotateY(0deg)';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          phase === 'exit' ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 100%)' }}
      />

      {/* Card container */}
      <div
        className={`relative transition-all duration-500 ease-out ${containerAnim} pointer-events-auto`}
        style={{ perspective: '1200px' }}
      >
        {/* Bot name banner */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
            <Bot className="w-4 h-4 text-purple-400" />
            <span className="text-white font-semibold text-sm">{data.botName}</span>
            <span className="text-amber-300 text-xs">drew a card</span>
          </div>
        </div>

        {/* The card */}
        <div
          className="relative w-72 sm:w-80"
          style={{
            transformStyle: 'preserve-3d',
            transform: cardFlip,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Card back (visible when flipped 180deg) */}
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-800 via-amber-900 to-yellow-950 border-4 border-amber-600 shadow-2xl flex items-center justify-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              aspectRatio: '3/4',
            }}
          >
            <div className="text-center">
              <div className="text-6xl mb-2">
                <svg viewBox="0 0 64 64" className="w-16 h-16 mx-auto text-amber-500" fill="currentColor">
                  <ellipse cx="32" cy="20" rx="18" ry="14" />
                  <ellipse cx="32" cy="32" rx="14" ry="10" />
                  <ellipse cx="32" cy="42" rx="10" ry="8" />
                </svg>
              </div>
              <p className="text-amber-400 font-bold text-lg">Shit Pile</p>
            </div>
          </div>

          {/* Card front */}
          <div
            className={`rounded-2xl bg-gradient-to-br ${getActionGradient(data.parsedAction.type)} border-4 border-amber-500 shadow-2xl overflow-hidden`}
            style={{
              backfaceVisibility: 'hidden',
              aspectRatio: '3/4',
            }}
          >
            {/* Shimmer effect */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.3) 45%, transparent 50%)',
                animation: phase === 'reveal' ? 'shimmer 1.5s ease-in-out' : 'none',
              }}
            />

            <div className="relative h-full flex flex-col items-center justify-between p-5">
              {/* Top: card name + category */}
              <div className="w-full text-center">
                <div className="bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1.5 inline-block mb-1">
                  <p className="text-amber-300 text-xs font-mono tracking-wide">{data.card.card_name}</p>
                </div>
                {data.card.card_category && (
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">{data.card.card_category}</p>
                )}
              </div>

              {/* Center: icon + effect text */}
              <div className="flex-1 flex flex-col items-center justify-center gap-3 py-3">
                <div
                  className="p-4 rounded-full bg-black/20 border-2 border-white/10 shadow-lg"
                  style={{
                    animation: phase === 'reveal' ? 'iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s both' : 'none',
                  }}
                >
                  {getActionIcon(data.parsedAction.type)}
                </div>

                <p
                  className="text-white font-bold text-lg text-center leading-snug max-w-[90%]"
                  style={{
                    animation: phase === 'reveal' ? 'textSlideUp 0.4s ease-out 0.2s both' : 'none',
                  }}
                >
                  {data.card.card_effect}
                </p>
              </div>

              {/* Bottom: action type badge + target */}
              <div className="w-full space-y-2">
                {/* Sentiment + action type */}
                <div className="flex items-center justify-center gap-2">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${sentiment.color}`}>
                    {sentiment.label}
                  </span>
                  <span className="text-white/50 text-xs capitalize">
                    {data.parsedAction.type.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Target player */}
                {data.targetPlayerName && (
                  <div
                    className="flex items-center justify-center gap-2 bg-black/30 rounded-lg px-3 py-2 border border-white/10"
                    style={{
                      animation: phase === 'reveal' ? 'textSlideUp 0.4s ease-out 0.35s both' : 'none',
                    }}
                  >
                    <Target className="w-4 h-4 text-red-400" />
                    <span className="text-white text-sm font-medium">
                      Target: <span className="text-red-300">{data.targetPlayerName}</span>
                    </span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white/40 rounded-full transition-none"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tap to dismiss hint */}
        <div className="text-center mt-3">
          <button
            onClick={onDismiss}
            className="inline-flex items-center gap-1.5 px-3 py-1 text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            <X className="w-3 h-3" />
            tap to dismiss
          </button>
        </div>
      </div>

      {/* Keyframe animations injected via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes iconPop {
          0% { opacity: 0; transform: scale(0.3); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes textSlideUp {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
