import React, { useState, useEffect } from 'react';
import { games } from '@/data/gamesData';
import { supabase } from '@/lib/supabase';

const HowToPlaySection: React.FC = () => {
  const [activeGame, setActiveGame] = useState(games[0].id);
  const [instructions, setInstructions] = useState<Record<string, string[]>>({});


  const defaultRules: Record<string, string[]> = {
    'up-shitz-creek': [
      'Players take turns moving around the board',
      'Land on Shit Pile spaces to draw special cards',
      'Collect paddles to stay in the game',
      'Steal paddles from other players with action cards',
      'Lose all your paddles and you\'re up Shitz Creek!',
      'First player to reach the end with two or more paddles is the winner.'
    ],
    'let-that-shit-go': [
      'Set up the toilet bowl target at a distance (6-10 feet recommended)',
      'Each player gets 3 poop emoji balls per round',
      'Take turns tossing balls into the toilet bowl',
      'Spell L-E-T-G-O by making shots (like HORSE in basketball)',
      'Miss a shot your opponent made? You get a letter!',
      'First player to spell LETGO loses the game',
      'Bonus: Call your shot for double points in party mode!',
      'Alternative: Play "Emotional Release" mode for therapeutic fun!'
    ],
    'drop-deuce': [
      'Place the toilet target in the center of the play area',
      'Each player gets 3 poop tokens to start',
      'Roll the dice to determine your challenge',
      'Complete silly challenges to earn bonus throws',
      'Toss your poop tokens into the toilet bowl',
      'Land in the golden zone for double points!',
      'Draw a "Plunger Card" to steal points from opponents',
      'First player to 21 points wins and becomes the Deuce Master!',
      'Perfect for kids parties - includes 50+ silly challenge cards!'
    ],
    'o-craps': [
      'Each player starts with 4 chips: White, Blue, Purple, and Black',
      'Roll 3 dice if you have 3+ chips, 2 dice if 2 chips, 1 die if 1 chip',
      'Skip your turn if you have no chips (you\'re not out yet!)',
      '💩 Poo: Roll that die again!',
      'C: Put a chip in the center Shit Pot (out of play)',
      'R: Pass a chip to the player on your Right',
      'A: Give a chip to Any player you choose',
      'P: Pass a chip to the player on your Left',
      'S: Your chip is Safe - keep it!',
      'Last player with chips wins the Shit Pot!',
      '🎵 Dice rolling sound effects play when you roll!'
    ],
    'shito': [
      'Each player gets a unique SHITO card with icons in a 5x4 grid',
      'No two players have the same card!',
      'The caller rolls the SHITO dice (S-H-I-T-O or 💩)',
      'Caller draws a calling card showing an icon',
      'If dice shows a letter, cover that icon ONLY in that column',
      'If dice shows 💩, cover that icon ANYWHERE on your card!',
      'Use poop-shaped chips to cover your spaces',
      'First to complete a full column or row, hit SHITO button to win!',
      '🎵 Dice rolling sound effects play when you roll!'
    ],
    'slanging-shit': [
      'One player acts out phrases like charades - NO TALKING!',
      'Turn on your camera so other players can see you',
      'Draw cards from the Slanging Shit pile',
      'You have 60 seconds per round',
      'You get ONE pass per round - use it wisely!',
      'Correct guesses earn points for the actor',
      'First player to 10 points wins!',
      '🎵 Timer beeps in the last 10 seconds!'
    ]
  };



  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      const { data } = await supabase.storage.from('game-instructions').list();
      if (data) {
        const loaded: Record<string, string[]> = {};
        for (const file of data) {
          if (file.name.endsWith('.txt') || file.name.endsWith('.md')) {
            const gameId = file.name.replace(/\.(txt|md)$/, '');
            const { data: content } = await supabase.storage.from('game-instructions').download(file.name);
            if (content) {
              const text = await content.text();
              loaded[gameId] = text.split('\n').filter(line => line.trim());
            }
          }
        }
        if (Object.keys(loaded).length > 0) setInstructions(loaded);
      }
    } catch (e) { console.error('Failed to load instructions', e); }
  };

  const getRules = (gameId: string) => instructions[gameId] || defaultRules[gameId] || [];
  const currentGame = games.find(g => g.id === activeGame);

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            LEARN TO PLAY
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            How to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-lime-400">Play</span>
          </h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => setActiveGame(game.id)}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                activeGame === game.id
                  ? 'bg-gradient-to-r from-amber-500 to-lime-500 text-black'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {game.name}
            </button>
          ))}
        </div>

        {currentGame && (
          <div className="bg-gray-800 rounded-2xl p-8 border border-amber-500/30">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <img src={currentGame.image} alt={currentGame.name} className="rounded-xl" />
              <div>
                <h3 className="text-2xl font-bold text-amber-400 mb-4">{currentGame.name} Rules</h3>
                <ul className="space-y-3">
                  {getRules(activeGame).map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-lime-500 text-black rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{idx + 1}</span>
                      <span className="text-gray-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HowToPlaySection;
