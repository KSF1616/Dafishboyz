import React, { useState } from 'react';
import { Game } from '@/types/game';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { Music, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

interface GameCardProps {
  game: Game;
  onViewDetails: (game: Game) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onViewDetails }) => {
  const { addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);

  const isDropDeuce = game.slug === 'drop-deuce';
  const isShito = game.slug === 'shito';
  const isLetThatShitGo = game.slug === 'let-that-shit-go';
  const hasPhysicalTools = isDropDeuce || isShito || isLetThatShitGo;
  
  // Games that support practice mode (not Drop Deuce - it's a kids game)
  const supportsPractice = !isDropDeuce;

  const getToolLink = () => {
    if (isDropDeuce) return '/drop-deuce-rules';
    if (isLetThatShitGo) return '/let-that-shit-go-rules';
    if (isShito) return '/shito-calling-cards';
    return '#';
  };

  const getToolIcon = () => {
    if (isDropDeuce) return <Music className="w-3 h-3" />;
    if (isLetThatShitGo) return <BookOpen className="w-3 h-3" />;
    return <Sparkles className="w-3 h-3" />;
  };

  const getToolLabel = () => {
    if (isDropDeuce) return 'Music Timer';
    if (isLetThatShitGo) return 'How to Play';
    return 'Calling Cards';
  };

  return (
    <div 
      className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden border border-amber-500/30 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/20" 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden">
        <img 
          src={game.image} 
          alt={game.name} 
          className={`w-full h-56 object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : ''}`} 
        />
        <div className="absolute top-3 right-3 bg-lime-500 text-black px-3 py-1 rounded-full text-sm font-bold">
          {game.category}
        </div>
        {/* Physical Game Tools Badge */}
        {hasPhysicalTools && (
          <div className="absolute top-3 left-3">
            <Link
              to={getToolLink()}
              className={`flex items-center gap-1 ${
                isLetThatShitGo ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-purple-600 hover:bg-purple-500'
              } text-white px-2 py-1 rounded-full text-xs font-bold transition-all`}
              onClick={(e) => e.stopPropagation()}
            >
              {getToolIcon()}
              {getToolLabel()}
            </Link>
          </div>
        )}
        {/* Practice Mode Badge */}
        {supportsPractice && (
          <div className="absolute bottom-3 left-3">
            <Link
              to={`/practice?game=${game.slug}`}
              className="flex items-center gap-1 bg-purple-600/90 hover:bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold transition-all backdrop-blur-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <GraduationCap className="w-3 h-3" />
              Practice
            </Link>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-amber-400 mb-1">{game.name}</h3>
        <p className="text-lime-400 text-sm italic mb-3">{game.tagline}</p>
        <div className="flex gap-3 text-xs text-gray-400 mb-4">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            {game.players}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {game.playTime}
          </span>
          <span>{game.age}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-white">${game.price.toFixed(2)}</span>
          <div className="flex gap-2">
            <button 
              onClick={() => onViewDetails(game)} 
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Details
            </button>
            <button 
              onClick={() => addToCart(game, 'physical')} 
              className="px-3 py-2 bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-400 hover:to-lime-400 text-black font-bold rounded-lg text-sm transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
