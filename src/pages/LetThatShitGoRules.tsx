import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Clock, Star, Trophy, ChevronDown, ChevronUp, 
  Sparkles, Target, Heart, Zap, User, RotateCcw, Check, X,
  Circle, ArrowRight, Lightbulb
} from 'lucide-react';
import FloatingPartyButton from '@/components/FloatingPartyButton';

const LetThatShitGoRules: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const images = {
    hero: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765390081652_982393b8.png',
    multiplayer: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765390101779_d1b392b8.jpg',
    emotional: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765390133363_f5552d9d.png',
    trophy: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765390186514_b582c5a2.png',
  };

  const shootingPositions = [
    { name: 'Close Range', distance: 1, successRate: '68%', points: 1 },
    { name: 'Free Throw', distance: 2, successRate: '56%', points: 1 },
    { name: 'Mid Range', distance: 3, successRate: '44%', points: 2 },
    { name: 'Three Point', distance: 4, successRate: '32%', points: 2 },
    { name: 'Half Court', distance: 5, successRate: '20%', points: 3 },
  ];

  return (

    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-cyan-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">Back to Games</span>
          </Link>
          <Link
            to="/lobby?game=let-that-shit-go"
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-bold transition-all"
          >
            <Zap className="w-5 h-5" />
            Play Online
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 via-teal-400/20 to-cyan-400/20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm mb-4">
              <Heart className="w-4 h-4" />
              Ages 17+
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-4">
              Let That Shit Go!
            </h1>
            <p className="text-xl text-teal-700 font-medium">
              Release the drama, embrace the chaos!
            </p>
          </div>

          {/* Hero Image */}
          <div className="max-w-2xl mx-auto mb-8">
            <img 
              src={images.hero} 
              alt="Let That Shit Go Game" 
              className="w-full rounded-3xl shadow-2xl"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Users className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">3-8</p>
              <p className="text-sm text-gray-600">Players</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Clock className="w-8 h-8 text-teal-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">30-45</p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">17+</p>
              <p className="text-sm text-gray-600">Age</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Game Overview */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-4 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            What's in the Box?
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Let That Shit Go is a therapeutic party game where players compete to let go of their baggage 
            in the most hilarious ways possible. Shoot poop balls through a toilet seat hoop and release 
            your emotional baggage!
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-emerald-800 mb-3">Game Components</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>1 Toilet Seat Hoop (suction cup mount)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>6 Poop Ball Plushies</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Letter Cards (L-E-T-G-O)</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Emotional Release Cards</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Position Markers</span>
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  <span>Score Pad</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-teal-800 mb-3">Two Ways to Play!</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Multiplayer LETGO</p>
                    <p className="text-sm text-gray-600">Like HORSE! Last one standing wins!</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Emotional Release</p>
                    <p className="text-sm text-gray-600">Solo or group therapy mode!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Game Mode 1: Multiplayer LETGO */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('multiplayer')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Game Mode 1: Multiplayer LETGO</h2>
                <p className="text-purple-100">Like HORSE basketball - but crappier!</p>
              </div>
            </div>
            {expandedSection === 'multiplayer' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'multiplayer' && (
            <div className="p-8">
              {/* Setup */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Setup
                </h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </span>
                        <span className="text-gray-700">Mount the Toilet Seat Hoop on a wall or door at a comfortable height</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </span>
                        <span className="text-gray-700">Place position markers at different distances (use tape or the included markers)</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </span>
                        <span className="text-gray-700">Give each player a set of LETGO letter cards face-down</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <Check className="w-4 h-4" />
                        </span>
                        <span className="text-gray-700">Decide who goes first (youngest, birthday closest, or rock-paper-scissors)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.multiplayer} alt="Friends playing together" className="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>

              {/* How to Play */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  How to Play
                </h3>
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6">
                    <h4 className="font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Taking Your Turn
                    </h4>
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <div>
                          <p className="font-bold text-gray-800">Choose Your Position</p>
                          <p className="text-gray-600 text-sm">Pick any shooting position - the farther away, the harder the shot!</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <div>
                          <p className="font-bold text-gray-800">Announce Your Shot</p>
                          <p className="text-gray-600 text-sm">Call out where you're shooting from (e.g., "Free Throw!" or "Half Court!")</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <div>
                          <p className="font-bold text-gray-800">Take the Shot!</p>
                          <p className="text-gray-600 text-sm">Throw your poop ball and try to make it through the toilet seat hoop!</p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6">
                    <h4 className="font-bold text-pink-800 mb-4 flex items-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      Matching Shots
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Check className="w-5 h-5 text-green-500" />
                          <span className="font-bold text-green-700">If You MAKE Your Shot</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          The next player must attempt the SAME shot from the SAME position. 
                          If they miss, they earn a letter!
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <X className="w-5 h-5 text-red-500" />
                          <span className="font-bold text-red-700">If You MISS Your Shot</span>
                        </div>
                        <p className="text-gray-600 text-sm">
                          The next player becomes the new "setter" and can choose any position 
                          for their shot.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Earning Letters */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                  Earning Letters
                </h3>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
                  <p className="text-gray-700 mb-4">
                    When you fail to match a shot that the previous player made, you earn a letter:
                  </p>
                  <div className="flex justify-center gap-2 mb-4">
                    {['L', 'E', 'T', 'G', 'O'].map((letter, idx) => (
                      <div 
                        key={letter}
                        className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-gray-800">
                      <span className="font-bold text-red-600">Spell LETGO = You're OUT!</span>
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      When you earn all 5 letters, you're eliminated from the game.
                    </p>
                  </div>
                </div>
              </div>

              {/* Winning */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Winning the Game
                </h3>
                <div className="flex items-center gap-6">
                  <img src={images.trophy} alt="Winner trophy" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                  <div>
                    <p className="text-gray-700 mb-2">
                      The <span className="font-bold text-purple-600">last player standing</span> who hasn't spelled LETGO wins!
                    </p>
                    <p className="text-gray-600 text-sm">
                      Pro tip: Choose harder shots when you're confident - it puts more pressure on opponents!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Mode 2: Emotional Release */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('emotional')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-emerald-600 to-cyan-600 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Heart className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Game Mode 2: Emotional Release</h2>
                <p className="text-emerald-100">Therapeutic gameplay for the soul!</p>
              </div>
            </div>
            {expandedSection === 'emotional' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'emotional' && (
            <div className="p-8">
              {/* Overview */}
              <div className="mb-8">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">What is Emotional Release Mode?</h3>
                    <p className="text-gray-600 mb-4">
                      This mode is perfect for solo play or group therapy sessions. It's a mindful way to 
                      acknowledge what's weighing you down and symbolically let it go through the act of shooting.
                    </p>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <p className="text-emerald-700 text-sm italic">
                        "Sometimes you just gotta let that shit go!" - The philosophy behind this therapeutic game mode.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.emotional} alt="Peaceful meditation" className="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>

              {/* Setup */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Setup
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="text-gray-700">Set up the Toilet Seat Hoop in a comfortable space</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="text-gray-700">Take 3 Emotional Release Cards (or blank cards to write your own)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4" />
                    </span>
                    <span className="text-gray-700">Gather 12 poop balls (you'll take 12 shots total)</span>
                  </li>
                </ul>
              </div>

              {/* How to Play */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  How to Play
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl p-6">
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <div>
                          <p className="font-bold text-gray-800">Write Down 3 Things</p>
                          <p className="text-gray-600 text-sm">
                            On your cards, write 3 things you want to emotionally release. These could be:
                          </p>
                          <ul className="mt-2 text-sm text-gray-600 space-y-1">
                            <li>• Stress from work or school</li>
                            <li>• A grudge you've been holding</li>
                            <li>• Anxiety about the future</li>
                            <li>• Negative self-talk</li>
                            <li>• A past mistake you keep dwelling on</li>
                          </ul>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <div>
                          <p className="font-bold text-gray-800">Take Your 12 Shots</p>
                          <p className="text-gray-600 text-sm">
                            With each shot, focus on what you're releasing. Say it out loud if you want!
                            "I'm letting go of [your item]!"
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <div>
                          <p className="font-bold text-gray-800">Track Your Progress</p>
                          <p className="text-gray-600 text-sm">
                            Each made shot represents successfully releasing some emotional weight.
                            The more you make, the more you let go!
                          </p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                  Your Emotional Release Score
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-red-500">0-3</p>
                    <p className="text-sm text-gray-600">Keep working on it!</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-orange-500">4-6</p>
                    <p className="text-sm text-gray-600">Making progress!</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-yellow-500">7-9</p>
                    <p className="text-sm text-gray-600">Great release!</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <p className="text-3xl font-black text-green-500">10-12</p>
                    <p className="text-sm text-gray-600">Total freedom!</p>
                  </div>
                </div>
              </div>

              {/* Group Play */}
              <div className="bg-gradient-to-br from-cyan-50 to-emerald-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6 text-cyan-500" />
                  Group Emotional Release
                </h3>
                <p className="text-gray-600 mb-4">
                  Playing with friends? Take turns sharing what you're releasing and support each other!
                </p>
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2">Group Rules:</h4>
                  <ul className="space-y-2 text-gray-600 text-sm">
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      Each player takes turns shooting their 12 shots
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      Share (or keep private) what you're releasing
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      Cheer each other on - no judgment zone!
                    </li>
                    <li className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500" />
                      Celebrate everyone's emotional wins together
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shooting Positions Reference */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('positions')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Shooting Positions Guide</h2>
                <p className="text-amber-100">Know your distances and difficulty!</p>
              </div>
            </div>
            {expandedSection === 'positions' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'positions' && (
            <div className="p-8">
              <div className="grid gap-4">
                {shootingPositions.map((pos, idx) => (
                  <div 
                    key={pos.name}
                    className="flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{pos.name}</p>
                        <p className="text-sm text-gray-600">Distance Level: {pos.distance}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{pos.successRate}</p>
                      <p className="text-sm text-gray-500">Success Rate</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-amber-100 rounded-xl p-4">
                <p className="text-amber-800 text-sm flex items-start gap-2">
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Pro Tip:</strong> In LETGO mode, choosing harder shots puts more pressure on your opponents, 
                    but missing gives them a free turn to set their own shot!
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-teal-100 to-emerald-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-yellow-500" />
            Pro Tips & House Rules
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-2xl p-5">
              <h3 className="font-bold text-emerald-700 mb-2">Multiplayer Tips</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Start with easier shots to warm up</li>
                <li>• Watch your opponents' weaknesses</li>
                <li>• Mix up your shooting positions</li>
                <li>• Stay calm under pressure - it's just poop!</li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-2xl p-5">
              <h3 className="font-bold text-emerald-700 mb-2">Fun House Rules</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• "Trick Shot" - Add a spin or bounce</li>
                <li>• "Eyes Closed" - For the brave!</li>
                <li>• "Call Your Shot" - Describe how it'll go in</li>
                <li>• "Redemption Round" - One last chance when eliminated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buy CTA */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-black mb-4">Ready to Let That Shit Go?</h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Get the physical game with the toilet seat hoop, poop ball plushies, and all the cards you need!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/?game=let-that-shit-go"
              className="px-8 py-4 bg-white text-emerald-600 font-black text-lg rounded-2xl hover:bg-emerald-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Buy Now - $20.00
            </Link>
            <Link
              to="/lobby?game=let-that-shit-go"
              className="px-8 py-4 bg-white/20 hover:bg-white/30 font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Play Online Free
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">© 2025 DaFish Boyz Games. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/" className="text-emerald-400 hover:text-emerald-300">
              Back to All Games
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/drop-deuce-rules" className="text-pink-400 hover:text-pink-300">
              Drop A Deuce Rules
            </Link>

          </div>
        </div>
      </footer>

      {/* Floating Party Button */}
      <FloatingPartyButton />
    </div>
  );
};

export default LetThatShitGoRules;
