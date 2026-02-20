import React, { useState } from 'react';
import { X, Trophy, Users, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tournament } from '@/types/tournament';

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Tournament>) => Promise<void>;
}

const CreateTournamentModal: React.FC<CreateTournamentModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [gameType, setGameType] = useState('up-shitz-creek');
  const [format, setFormat] = useState<'single_elimination' | 'double_elimination' | 'round_robin'>('single_elimination');
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [bestOf, setBestOf] = useState(3);
  const [timeLimit, setTimeLimit] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onCreate({
      name, description, game_type: gameType, format, max_participants: maxParticipants,
      start_date: startDate,
      rules: { best_of: bestOf, time_limit_minutes: timeLimit, allow_spectators: true, custom_rules: [] }
    });
    setLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-gray-700 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Create Tournament</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Tournament Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Weekly Championship" required className="bg-gray-800 border-gray-700" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Tournament description" className="bg-gray-800 border-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Game</label>
              <select value={gameType} onChange={e => setGameType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white">
                <option value="up-shitz-creek">Up Shitz Creek</option>
                <option value="o-craps">O'Craps</option>
                <option value="shito">SHITO</option>
                <option value="slanging-shit">Slanging Shit</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Format</label>
              <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white">
                <option value="single_elimination">Single Elimination</option>
                <option value="double_elimination">Double Elimination</option>
                <option value="round_robin">Round Robin</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Max Players</label>
              <select value={maxParticipants} onChange={e => setMaxParticipants(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white">
                {[8, 16, 32, 64].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required className="bg-gray-800 border-gray-700" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Best Of</label>
              <select value={bestOf} onChange={e => setBestOf(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white">
                {[1, 3, 5, 7].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Time Limit (min)</label>
              <Input type="number" min={10} value={timeLimit} onChange={e => setTimeLimit(Number(e.target.value))} className="bg-gray-800 border-gray-700" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-amber-500 to-lime-500 text-black font-bold hover:from-amber-400 hover:to-lime-400">
            {loading ? 'Creating...' : 'Create Tournament'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateTournamentModal;
