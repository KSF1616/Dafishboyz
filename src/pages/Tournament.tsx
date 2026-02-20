import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Plus, ArrowLeft, Users, Eye, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TournamentProvider, useTournament } from '@/contexts/TournamentContext';
import TournamentCard from '@/components/tournament/TournamentCard';
import TournamentBracket from '@/components/tournament/TournamentBracket';
import TournamentLeaderboard from '@/components/tournament/TournamentLeaderboard';
import CreateTournamentModal from '@/components/tournament/CreateTournamentModal';
import { Tournament } from '@/types/tournament';

const TournamentContent: React.FC = () => {
  const navigate = useNavigate();
  const { tournaments, leaderboard, currentTournament, setCurrentTournament, fetchTournaments, fetchLeaderboard, createTournament, joinTournament, matches } = useTournament();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'registration' | 'in_progress' | 'completed'>('all');
  const [view, setView] = useState<'list' | 'bracket' | 'leaderboard'>('list');

  useEffect(() => {
    fetchTournaments();
    fetchLeaderboard();
  }, []);

  const filteredTournaments = tournaments.filter(t => filter === 'all' || t.status === filter);

  const handleJoin = async (id: string) => {
    await joinTournament(id, 'current-user', 'Player');
    alert('Successfully joined tournament!');
  };

  const handleView = (tournament: Tournament) => {
    setCurrentTournament(tournament);
    setView('bracket');
  };

  const handleCreate = async (data: Partial<Tournament>) => {
    await createTournament(data);
    alert('Tournament created successfully!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black">
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-bold text-white">Tournaments</h1>
            </div>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="bg-gradient-to-r from-amber-500 to-lime-500 text-black font-bold">
            <Plus className="w-4 h-4 mr-2" /> Create Tournament
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['list', 'bracket', 'leaderboard'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>
                {v === 'list' ? 'Tournaments' : v === 'bracket' ? 'Bracket' : 'Leaderboard'}
              </button>
            ))}
          </div>
          {view === 'list' && (
            <div className="flex items-center gap-2 ml-auto">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-sm text-white">
                <option value="all">All</option>
                <option value="registration">Registration Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
        </div>

        {/* Content */}
        {view === 'list' && (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredTournaments.map(t => (
              <TournamentCard key={t.id} tournament={t} onJoin={handleJoin} onView={handleView} />
            ))}
            {filteredTournaments.length === 0 && (
              <div className="col-span-2 text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No tournaments found</p>
              </div>
            )}
          </div>
        )}

        {view === 'bracket' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            {currentTournament ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{currentTournament.name}</h2>
                    <p className="text-gray-400">{currentTournament.format.replace('_', ' ')}</p>
                  </div>
                  <Button variant="outline" onClick={() => setView('list')} className="border-gray-600">Back to List</Button>
                </div>
                <TournamentBracket matches={matches} totalRounds={4} />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Select a tournament to view its bracket</p>
              </div>
            )}
          </div>
        )}

        {view === 'leaderboard' && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <TournamentLeaderboard entries={leaderboard} />
          </div>
        )}
      </main>

      <CreateTournamentModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
};

const TournamentPage: React.FC = () => (
  <TournamentProvider>
    <TournamentContent />
  </TournamentProvider>
);

export default TournamentPage;
