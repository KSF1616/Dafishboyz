import React from 'react';
import { Game } from '@/types/game';
import { useCart } from '@/contexts/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Music, Sparkles } from 'lucide-react';

interface GameDetailModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
}

const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, isOpen, onClose }) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  if (!isOpen || !game) return null;

  const handlePlayOnline = () => {
    onClose();
    navigate(`/lobby?game=${game.slug}`);
  };

  const isDropDeuce = game.slug === 'drop-deuce';
  const isShito = game.slug === 'shito';
  const isLetThatShitGo = game.slug === 'let-that-shit-go';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-amber-500/30">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img src={game.image} alt={game.name} className="w-full h-64 object-cover" />
        <div className="p-6">
          <span className="inline-block bg-lime-500 text-black px-3 py-1 rounded-full text-sm font-bold mb-3">{game.category}</span>
          <h2 className="text-3xl font-black text-amber-400 mb-2">{game.name}</h2>
          <p className="text-lime-400 italic mb-4">{game.tagline}</p>
          <p className="text-gray-300 mb-6">{game.description}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Players</p>
              <p className="text-white font-bold text-lg">{game.players}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Play Time</p>
              <p className="text-white font-bold text-lg">{game.playTime}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Age</p>
              <p className="text-white font-bold text-lg">{game.age}</p>
            </div>
          </div>

          {/* Physical Game Tools Section */}
          {(isDropDeuce || isShito || isLetThatShitGo) && (
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-4 mb-6 border border-purple-500/30">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Physical Game Tools
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Own the physical game? Use these digital tools to enhance your gameplay!
              </p>
              <div className="flex flex-wrap gap-3">
                {isDropDeuce && (
                  <>
                    <Link
                      to="/drop-deuce-rules"
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      <BookOpen className="w-4 h-4" />
                      Game Rules
                    </Link>
                    <Link
                      to="/drop-deuce-rules"
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      <Music className="w-4 h-4" />
                      Hot Poo Music Timer
                    </Link>
                  </>
                )}
                {isLetThatShitGo && (
                  <Link
                    to="/let-that-shit-go-rules"
                    onClick={onClose}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    How to Play
                  </Link>
                )}
                {isShito && (
                  <>
                    <Link
                      to="/shito-calling-cards"
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Digital Calling Cards
                    </Link>
                    <Link
                      to="/adult-shito"
                      onClick={onClose}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-lg font-bold text-sm transition-all"
                    >
                      <span className="text-sm">🔞</span>
                      Adult SHITO Game
                    </Link>
                  </>
                )}

              </div>
            </div>
          )}


          <div className="flex items-center justify-between mb-6">
            <span className="text-3xl font-black text-white">${game.price.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handlePlayOnline}
              className="py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all"
            >
              Play Online
            </button>
            <button
              onClick={() => { addToCart(game, 'physical'); onClose(); }}
              className="py-3 bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-400 hover:to-lime-400 text-black font-bold rounded-xl transition-all"
            >
              Buy Physical - ${game.price.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDetailModal;
