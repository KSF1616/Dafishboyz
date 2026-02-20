import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Info, Dices, Printer, Sparkles, Gamepad2, Users, Loader2, RefreshCw, AlertTriangle, ExternalLink } from 'lucide-react';
import { DAFISH_BOYZ_LOGO_URL } from '@/lib/logoUrl';
import ShitoCallingCardPlayer from '@/components/shito/ShitoCallingCardPlayer';
import PrintableShitoCard from '@/components/shito/PrintableShitoCard';
import FloatingPartyButton from '@/components/FloatingPartyButton';
import {
  ShitoCallingCard,
  ShitoBingoCard,
  loadCallingCardsFromDb,
  loadBingoCardsFromDb,
} from '@/lib/shitoCardService';
import { SHITO_ICONS } from '@/data/shitoIcons';

const ShitoCallingCardsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'caller' | 'cards'>('caller');

  // Shared card state — loaded once, passed to both tools
  const [callingCards, setCallingCards] = useState<ShitoCallingCard[]>([]);
  const [bingoCards, setBingoCards] = useState<ShitoBingoCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    loadAllCards();
  }, []);

  const loadAllCards = async () => {
    setCardsLoading(true);
    setCardsError(null);
    try {
      const [ccResult, bcResult] = await Promise.allSettled([
        loadCallingCardsFromDb(),
        loadBingoCardsFromDb(),
      ]);

      let cc = ccResult.status === 'fulfilled' ? ccResult.value : [];
      const bc = bcResult.status === 'fulfilled' ? bcResult.value : [];

      if (cc.length === 0) {
        // Fallback to emoji icons
        cc = SHITO_ICONS.map((icon, i) => ({
          id: `fallback-${i}`,
          dbId: `fallback-${i}`,
          name: icon.name,
          iconId: icon.id,
          emoji: icon.emoji,
          color: icon.color,
          cardNumber: i + 1,
        }));
        setUseFallback(true);
      } else {
        setUseFallback(false);
      }

      setCallingCards(cc);
      setBingoCards(bc);
      console.log(`✅ ShitoCallingCardsPage: ${cc.length} calling cards, ${bc.length} bingo cards loaded`);
    } catch (err: any) {
      console.error('ShitoCallingCardsPage: failed to load cards', err);
      setCardsError(err?.message || 'Failed to load cards');
      // Fallback
      const fallback: ShitoCallingCard[] = SHITO_ICONS.map((icon, i) => ({
        id: `fallback-${i}`,
        dbId: `fallback-${i}`,
        name: icon.name,
        iconId: icon.id,
        emoji: icon.emoji,
        color: icon.color,
        cardNumber: i + 1,
      }));
      setCallingCards(fallback);
      setUseFallback(true);
    }
    setCardsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 via-orange-100 to-red-100">
      {/* Header - DAFISH BOYZ LOGO */}
      <header className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={DAFISH_BOYZ_LOGO_URL} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-md" />
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Games</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src={DAFISH_BOYZ_LOGO_URL} alt="Dafish Boyz" className="w-8 h-8 object-contain rounded-lg hidden md:block" />
            <h1 className="text-xl font-black">Shito Game Tools</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 mb-4">
            Shito Game Tools
          </h1>
          <p className="text-xl text-orange-700">
            Everything you need to play Shito!
          </p>
          {/* Card source status */}
          {cardsLoading ? (
            <div className="flex items-center justify-center gap-2 mt-3 text-amber-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading cards from database...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className={`text-sm px-3 py-1 rounded-full ${useFallback ? 'bg-amber-200 text-amber-800' : 'bg-green-200 text-green-800'}`}>
                {useFallback
                  ? `Using ${callingCards.length} fallback icons`
                  : `${callingCards.length} calling cards + ${bingoCards.length} bingo cards from DB`}
              </span>
              {cardsError && (
                <button onClick={loadAllCards} className="text-red-600 hover:text-red-800" title="Retry loading">
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error banner */}
        {cardsError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{cardsError}</p>
            <button onClick={loadAllCards} className="ml-auto text-red-600 hover:text-red-800 text-sm underline">
              Retry
            </button>
          </div>
        )}

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <Link
            to="/practice?game=shito"
            className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            <Gamepad2 className="w-5 h-5" />
            Practice with AI Bots
          </Link>
          <Link
            to="/lobby"
            className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all shadow-md hover:shadow-lg"
          >
            <Users className="w-5 h-5" />
            Play Online Multiplayer
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab('caller')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
              activeTab === 'caller'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-amber-50 shadow'
            }`}
          >
            <Dices className="w-5 h-5" />
            Calling Cards
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
              activeTab === 'cards'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg scale-105'
                : 'bg-white text-gray-600 hover:bg-amber-50 shadow'
            }`}
          >
            <Printer className="w-5 h-5" />
            Print Player Cards
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Info className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-2">
                {activeTab === 'caller' ? 'How to Use the Calling Cards' : 'How to Use Player Cards'}
              </h2>
              {activeTab === 'caller' ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Use this digital calling card tool to run your Shito game! The dice roll reveals which column 
                    (S, H, I, T, or O) the icon belongs to, then the card is drawn from the{' '}
                    <strong>{useFallback ? 'fallback icon set' : 'real game database'}</strong>.
                    Players check their cards for that icon in that specific column.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">S</span>
                      First column - Red
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold">H</span>
                      Second column - Orange
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center text-xs font-bold">I</span>
                      Third column - Yellow (FREE space in center!)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">T</span>
                      Fourth column - Green
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">O</span>
                      Fifth column - Blue
                    </li>
                  </ul>
                  <p className="text-gray-500 text-xs mt-3">
                    The calling cards and printed player cards use the <strong>same {callingCards.length} icons</strong> from the{' '}
                    {useFallback ? 'fallback set' : 'game database'}, so they always match.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Generate unique player cards for everyone playing! Each card has randomly placed icons 
                    from the <strong>same {callingCards.length} calling cards</strong> used by the digital caller,
                    so printed cards and the calling tool always match perfectly.
                  </p>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">1</span>
                      Choose how many cards you need
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">2</span>
                      Click "Shuffle" to generate new random cards
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">3</span>
                      Click "Print Cards" to print them out
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">4</span>
                      Cut out cards and give one to each player
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Tool — pass shared cards to both tools */}
        {cardsLoading ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-amber-700 font-semibold text-lg">Loading SHITO cards from database...</p>
            <p className="text-amber-500 text-sm mt-2">Fetching calling cards and bingo cards</p>
          </div>
        ) : activeTab === 'caller' ? (
          <ShitoCallingCardPlayer callingCards={callingCards} />
        ) : (
          <PrintableShitoCard callingCards={callingCards} bingoCards={bingoCards} />
        )}

        {/* Quick Rules */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            Quick Shito Rules
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-amber-50 rounded-xl p-4">
              <h3 className="font-bold text-amber-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-black">1</span>
                Setup
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Print player cards (one per player)</li>
                <li>Give each player markers/chips</li>
                <li>One person runs the calling cards</li>
                <li>Everyone marks their FREE space</li>
              </ul>
            </div>
            <div className="bg-orange-50 rounded-xl p-4">
              <h3 className="font-bold text-orange-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-black">2</span>
                Gameplay
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Caller clicks "Roll & Draw"</li>
                <li>Dice shows column (S, H, I, T, or O)</li>
                <li>Card shows the icon to find</li>
                <li>Players mark matching icons in that column</li>
              </ul>
            </div>
            <div className="bg-red-50 rounded-xl p-4">
              <h3 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-black">3</span>
                Winning
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>Complete a row (5 across)</li>
                <li>Complete a column (5 down)</li>
                <li>Complete a diagonal (corner to corner)</li>
                <li>Yell "SHITO!" when you win!</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 via-orange-100 to-red-100 rounded-xl">
            <p className="text-center font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-lg">
              First to complete a pattern and yell "SHITO!" wins the round!
            </p>
          </div>
        </div>

        {/* Win Patterns */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Win Patterns</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Horizontal */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">Horizontal</h3>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded ${
                      Math.floor(i / 5) === 2 ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Vertical */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">Vertical</h3>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded ${
                      i % 5 === 2 ? 'bg-orange-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Diagonal 1 */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">Diagonal</h3>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded ${
                      i === 0 || i === 6 || i === 12 || i === 18 || i === 24 ? 'bg-red-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            {/* Four Corners + Center */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-700 mb-2 text-center text-sm">4 Corners</h3>
              <div className="grid grid-cols-5 gap-1">
                {[...Array(25)].map((_, i) => (
                  <div 
                    key={i}
                    className={`aspect-square rounded ${
                      i === 0 || i === 4 || i === 12 || i === 20 || i === 24 ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Adult Version Banner */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-6 text-center text-white mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🔞</span>
            <h2 className="text-xl font-black">Looking for the Adult Version?</h2>
          </div>
          <p className="text-white/90 mb-4">
            Try our Adult SHITO game with grown-up themed images!
          </p>
          <Link
            to="/adult-shito"
            className="inline-block px-8 py-3 bg-white text-purple-600 font-black text-lg rounded-xl hover:bg-purple-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Play Adult SHITO
          </Link>
        </div>

        {/* Buy CTA */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl p-8 text-center text-white mt-8">
          <h2 className="text-2xl font-black mb-4">Want the Full Shito Experience?</h2>
          <p className="text-white/90 mb-6">
            Get the complete Shito game with premium boards, custom markers, and exclusive icons!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/?game=shito"
              className="inline-block px-8 py-4 bg-white text-orange-600 font-black text-lg rounded-2xl hover:bg-orange-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Buy Shito - $20.00
            </Link>
            <Link
              to="/practice?game=shito"
              className="inline-block px-8 py-4 bg-purple-500 text-white font-black text-lg rounded-2xl hover:bg-purple-400 transition-all transform hover:scale-105 shadow-lg"
            >
              Try Free Practice Mode
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2025 DaFish Boyz Games. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4 mt-3">
            <Link to="/" className="text-amber-400 hover:text-amber-300">
              Back to All Games
            </Link>
            <Link to="/practice?game=shito" className="text-purple-400 hover:text-purple-300">
              Practice Mode
            </Link>
            <Link to="/lobby" className="text-blue-400 hover:text-blue-300">
              Play Online
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Party Button */}
      <FloatingPartyButton />
    </div>
  );
};

export default ShitoCallingCardsPage;
