import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { OCrapsDice } from './OCrapsDice';
import { useAudio } from '@/contexts/AudioContext';

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string }[];
  currentPlayerId: string;
}

type ChipColor = 'white' | 'blue' | 'purple' | 'black';
const CHIP_COLORS: ChipColor[] = ['white', 'blue', 'purple', 'black'];
const CHIP_STYLES: Record<ChipColor, string> = {
  white: 'bg-white border-gray-300',
  blue: 'bg-blue-500 border-blue-700',
  purple: 'bg-purple-500 border-purple-700',
  black: 'bg-gray-900 border-gray-700',
};
const DICE_FACES = ['💩', 'C', 'R', 'A', 'P', 'S'];

export default function OCrapsBoard({ gameData, isMyTurn, onAction, players, currentPlayerId }: Props) {
  const { playDiceRoll, playVictory } = useAudio();
  const playerChips = gameData.playerChips || {};
  const centerPot = gameData.centerPot || [];
  const currentTurn = gameData.currentTurn || 0;
  const phase = gameData.phase || 'waiting';
  const diceResults = gameData.diceResults || [];
  const rerollIndices = gameData.rerollIndices || [];
  const winner = gameData.winner || null;

  const [rolling, setRolling] = useState(false);
  const [localDice, setLocalDice] = useState<number[]>([]);
  // Track which specific dice indices are currently rolling (for reroll animation)
  const [rollingDiceIndices, setRollingDiceIndices] = useState<number[]>([]);

  const myChips = playerChips[currentPlayerId] || [];
  const isCurrentPlayer = players[currentTurn]?.player_id === currentPlayerId;

  useEffect(() => {
    if (!playerChips[currentPlayerId] && players.length > 0) {
      const initChips: Record<string, ChipColor[]> = {};
      players.forEach(p => { initChips[p.player_id] = [...CHIP_COLORS]; });
      onAction('init', { playerChips: initChips, centerPot: [], currentTurn: 0, phase: 'waiting' });
    }
  }, [players]);

  useEffect(() => { if (winner) playVictory(); }, [winner]);

  const getDiceCount = (chips: ChipColor[]) => Math.min(3, Math.max(0, chips.length));

  const rollDice = () => {
    const count = getDiceCount(myChips);
    if (count === 0) return;
    playDiceRoll();
    setRolling(true);
    // All dice are rolling on initial roll
    setRollingDiceIndices(Array.from({ length: count }, (_, i) => i));
    const results = Array(count).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    setLocalDice(results);
    setTimeout(() => {
      setRolling(false);
      setRollingDiceIndices([]);
      const pooIndices = results.map((r, i) => r === 1 ? i : -1).filter(i => i >= 0);
      onAction('rolled', { diceResults: results, phase: pooIndices.length > 0 ? 'reroll' : 'resolve', rerollIndices: pooIndices });
    }, 800);
  };

  const rerollPoo = () => {
    playDiceRoll();
    setRolling(true);
    // Only the shit dice (rerollIndices) are rolling
    setRollingDiceIndices([...rerollIndices]);
    
    // Start with current dice results - non-shit dice keep their values
    const newResults = [...diceResults];
    // Only reroll the shit dice
    rerollIndices.forEach((i: number) => { 
      newResults[i] = Math.floor(Math.random() * 6) + 1; 
    });
    setLocalDice(newResults);
    
    setTimeout(() => {
      setRolling(false);
      setRollingDiceIndices([]);
      const pooIndices = newResults.map((r, i) => r === 1 ? i : -1).filter(i => i >= 0);
      onAction('rerolled', { diceResults: newResults, phase: pooIndices.length > 0 ? 'reroll' : 'resolve', rerollIndices: pooIndices });
    }, 800);
  };

  // Determine which dice values to display
  const displayDice = rolling ? localDice : diceResults;

  return (
    <div className="bg-gradient-to-br from-amber-900 to-yellow-900 rounded-xl p-4">
      <h3 className="text-2xl font-bold text-white text-center mb-3">O'CRAPS</h3>
      {winner ? (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-3xl font-bold text-yellow-400">SHIT POT WINNER!</p>
          <p className="text-xl text-white mt-2">{players.find(p => p.player_id === winner)?.player_name}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <ToiletShitPot centerPot={centerPot} />
          <div className="space-y-4">
            <PlayerChipsDisplay players={players} playerChips={playerChips} currentTurn={currentTurn} currentPlayerId={currentPlayerId} />
            {isCurrentPlayer && myChips.length > 0 && (
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex justify-center gap-3 mb-4">
                  {displayDice.map((v, i) => (
                    <div key={i} className="relative">
                      <OCrapsDice 
                        rolling={rolling && rollingDiceIndices.includes(i)} 
                        value={v || 1} 
                        size={60} 
                      />
                      {/* Show indicator for shit dice that will be rerolled */}
                      {phase === 'reroll' && rerollIndices.includes(i) && !rolling && (
                        <div className="absolute -top-2 -right-2 bg-yellow-500 text-xs px-1 rounded-full animate-pulse">
                          💩
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {phase === 'waiting' && <Button onClick={rollDice} className="w-full bg-green-600 hover:bg-green-700">Roll {getDiceCount(myChips)} Dice</Button>}
                {phase === 'reroll' && (
                  <div className="space-y-2">
                    <p className="text-yellow-300 text-sm text-center">
                      {rerollIndices.length} shit {rerollIndices.length === 1 ? 'die' : 'dice'} must be rerolled!
                    </p>
                    <Button onClick={rerollPoo} className="w-full bg-yellow-600 hover:bg-yellow-700">
                      Re-roll {rerollIndices.length} 💩 {rerollIndices.length === 1 ? 'Die' : 'Dice'}
                    </Button>
                  </div>
                )}
                {phase === 'resolve' && <ResolvePanel diceResults={diceResults} onResolve={(moves) => onAction('resolve', moves)} players={players} currentPlayerId={currentPlayerId} playerChips={playerChips} centerPot={centerPot} currentTurn={currentTurn} />}
              </div>
            )}
            {isCurrentPlayer && myChips.length === 0 && <Button onClick={() => onAction('skip', { currentTurn: (currentTurn + 1) % players.length })} className="w-full bg-gray-600">Skip Turn</Button>}
          </div>
        </div>
      )}
    </div>
  );
}

const ToiletShitPot = ({ centerPot }: { centerPot: ChipColor[] }) => (
  <div className="relative bg-amber-800/50 rounded-lg p-4 flex flex-col items-center">
    <div className="absolute inset-4 bg-gradient-to-br from-amber-700 to-amber-900 rounded-lg border-4 border-amber-600" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)' }} />
    <div className="relative z-10 flex flex-col items-center">
      <svg viewBox="0 0 100 120" className="w-32 h-40">
        <ellipse cx="50" cy="90" rx="40" ry="25" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="3" />
        <ellipse cx="50" cy="50" rx="35" ry="40" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="3" />
        <ellipse cx="50" cy="50" rx="25" ry="30" fill="#60a5fa" />
        <ellipse cx="50" cy="45" rx="20" ry="20" fill="#93c5fd" opacity="0.5" />
        <rect x="42" y="5" width="16" height="25" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="2" />
      </svg>
      <div className="flex flex-wrap justify-center gap-1 mt-2 max-w-24">
        {centerPot.map((c: ChipColor, i: number) => <div key={i} className={`w-4 h-4 rounded-full border-2 ${CHIP_STYLES[c]}`} />)}
      </div>
      <p className="text-amber-200 font-bold mt-2">SHIT POT</p>
    </div>
  </div>
);

const PlayerChipsDisplay = ({ players, playerChips, currentTurn, currentPlayerId }: any) => (
  <div className="bg-black/30 rounded-lg p-3 space-y-2">
    {players.map((p: any, i: number) => (
      <div key={p.player_id} className={`flex items-center justify-between p-2 rounded ${i === currentTurn ? 'bg-green-600/30 ring-2 ring-green-400' : ''}`}>
        <span className={`font-semibold ${p.player_id === currentPlayerId ? 'text-yellow-400' : 'text-white'}`}>{p.player_name}</span>
        <div className="flex gap-1">{(playerChips[p.player_id] || []).map((c: ChipColor, j: number) => <div key={j} className={`w-5 h-5 rounded-full border-2 ${CHIP_STYLES[c]}`} />)}</div>
      </div>
    ))}
  </div>
);

const ResolvePanel = ({ diceResults, onResolve, players, currentPlayerId, playerChips, centerPot, currentTurn }: any) => {
  const [moves, setMoves] = useState<any[]>([]);
  const myChips = playerChips[currentPlayerId] || [];

  const addMove = (type: string, targetId?: string) => {
    if (moves.length >= myChips.length) return;
    setMoves([...moves, { type, targetId, chipIndex: moves.length }]);
  };

  const confirm = () => {
    const newPlayerChips = { ...playerChips };
    const newCenterPot = [...centerPot];
    let chipsToRemove = 0;
    moves.forEach(m => {
      if (m.type === 'C') { newCenterPot.push(myChips[chipsToRemove]); chipsToRemove++; }
      else if (m.type === 'R' || m.type === 'P') {
        const dir = m.type === 'R' ? 1 : -1;
        const targetIdx = (players.findIndex((p: any) => p.player_id === currentPlayerId) + dir + players.length) % players.length;
        newPlayerChips[players[targetIdx].player_id] = [...(newPlayerChips[players[targetIdx].player_id] || []), myChips[chipsToRemove]];
        chipsToRemove++;
      } else if (m.type === 'A' && m.targetId) {
        newPlayerChips[m.targetId] = [...(newPlayerChips[m.targetId] || []), myChips[chipsToRemove]];
        chipsToRemove++;
      }
    });
    newPlayerChips[currentPlayerId] = myChips.slice(chipsToRemove);
    const activePlayers = players.filter((p: any) => (newPlayerChips[p.player_id] || []).length > 0);
    const winner = activePlayers.length === 1 ? activePlayers[0].player_id : null;
    onResolve({ playerChips: newPlayerChips, centerPot: newCenterPot, currentTurn: (currentTurn + 1) % players.length, phase: 'waiting', diceResults: [], winner });
  };

  return (
    <div className="space-y-2">
      <p className="text-amber-200 text-sm">Results: {diceResults.map((r: number) => DICE_FACES[r - 1]).join(' ')}</p>
      <div className="flex flex-wrap gap-2">
        {diceResults.filter((r: number) => r === 2).map((_: any, i: number) => <Button key={`c${i}`} size="sm" onClick={() => addMove('C')} className="bg-red-600">C</Button>)}
        {diceResults.filter((r: number) => r === 3).map((_: any, i: number) => <Button key={`r${i}`} size="sm" onClick={() => addMove('R')} className="bg-blue-600">R</Button>)}
        {diceResults.filter((r: number) => r === 5).map((_: any, i: number) => <Button key={`p${i}`} size="sm" onClick={() => addMove('P')} className="bg-orange-600">P</Button>)}
        {diceResults.filter((r: number) => r === 4).map((_: any, i: number) => (
          <select key={`a${i}`} onChange={e => addMove('A', e.target.value)} className="bg-purple-600 text-white rounded px-2 py-1 text-sm">
            <option value="">A - Pick</option>
            {players.filter((p: any) => p.player_id !== currentPlayerId).map((p: any) => <option key={p.player_id} value={p.player_id}>{p.player_name}</option>)}
          </select>
        ))}
      </div>
      <Button onClick={confirm} className="w-full bg-green-600 mt-2">Confirm</Button>
    </div>
  );
};
