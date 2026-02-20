import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Users, Clock, Star, Trophy, Music, ChevronDown, ChevronUp, 
  Sparkles, PartyPopper, Target, Zap, Settings, X, Printer, Scissors, 
  Download, Baby, User, Users2, Heart, Shield, Gamepad2, BookOpen,
  CheckCircle, AlertCircle, Info
} from 'lucide-react';

import { usePartyMode } from '@/contexts/PartyModeContext';
import PartyTimer from '@/components/dropDeuce/PartyTimer';
import PartyPlaylist from '@/components/dropDeuce/PartyPlaylist';
import PartySoundboard from '@/components/dropDeuce/PartySoundboard';
import PartyThemeSelector from '@/components/dropDeuce/PartyThemeSelector';
import ConfettiEffect from '@/components/dropDeuce/ConfettiEffect';
import FloatingPartyButton from '@/components/FloatingPartyButton';

const DropADeuceRulesContent: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [showPartyMode, setShowPartyMode] = useState(false);
  const [partyModeTab, setPartyModeTab] = useState<'timer' | 'music' | 'sounds' | 'themes'>('timer');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<'kids' | 'teens' | 'adults'>('kids');
  const [showPrintableCards, setShowPrintableCards] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  
  const { state, activatePartyMode, deactivatePartyMode, triggerConfetti } = usePartyMode();

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleOpenPartyMode = () => {
    setShowPartyMode(true);
    activatePartyMode();
  };

  const handleClosePartyMode = () => {
    setShowPartyMode(false);
    deactivatePartyMode();
  };

  const handlePrint = () => {
    window.print();
  };

  const images = {
    circleSetup: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389297575_a1670355.jpg',
    chaseScene: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389317940_236137dd.jpg',
    hotPoo: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389377952_d7df636e.png',
    trophy: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389394207_1d817413.jpg',
  };

  const ageGroupVariations = {
    kids: {
      title: 'Kids Mode (Ages 6-10)',
      icon: Baby,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      rules: [
        { rule: 'Walking pace only - no running', icon: Shield },
        { rule: 'Soft taps on shoulders instead of heads', icon: Heart },
        { rule: 'Shorter timer rounds (15-20 seconds)', icon: Clock },
        { rule: 'Extra silly Challenge Cards', icon: Sparkles },
        { rule: 'Everyone gets a participation sticker', icon: Star },
      ],
      scoring: 'First to 3 points wins',
      tips: 'Keep rounds short and celebrate every player!',
    },
    teens: {
      title: 'Teen Mode (Ages 11-17)',
      icon: User,
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      rules: [
        { rule: 'Light jogging allowed', icon: Zap },
        { rule: 'Standard gameplay rules apply', icon: BookOpen },
        { rule: 'Medium timer rounds (20-30 seconds)', icon: Clock },
        { rule: 'Add dare-style Challenge Cards', icon: Sparkles },
        { rule: 'Tournament bracket for larger groups', icon: Trophy },
      ],
      scoring: 'First to 5 points wins',
      tips: 'Add music and let teens control the playlist!',
    },
    adults: {
      title: 'Adult Party Mode (Ages 18+)',
      icon: Users2,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'from-amber-50 to-orange-50',
      rules: [
        { rule: 'Full speed gameplay', icon: Zap },
        { rule: 'Add beverage penalties (optional)', icon: Gamepad2 },
        { rule: 'Longer timer rounds (30-45 seconds)', icon: Clock },
        { rule: 'Truth or Dare style challenges', icon: Sparkles },
        { rule: 'Team-based tournament mode', icon: Users },
      ],
      scoring: 'First to 7 points wins or last one standing',
      tips: 'Great for house parties and game nights!',
    },
  };

  const quickReferenceCards = [
    {
      title: 'Drop & Chase',
      subtitle: 'Quick Rules',
      color: 'from-pink-500 to-rose-500',
      steps: [
        'Sit in a circle',
        'Dropper walks around saying "Drop... Drop..."',
        'Say "DEUCE!" and drop the poop behind someone',
        'Run! Chaser picks up poop and chases',
        'Safe = 1 point, Tagged = chaser gets 1 point',
      ],
    },
    {
      title: 'Hot Poo',
      subtitle: 'Quick Rules',
      color: 'from-purple-500 to-indigo-500',
      steps: [
        'Sit in a circle',
        'Start the music/timer',
        'Pass the poop quickly around',
        'Music stops = whoever has it is OUT',
        'Last player standing wins!',
      ],
    },
    {
      title: 'Scoring',
      subtitle: 'Points Guide',
      color: 'from-green-500 to-emerald-500',
      steps: [
        'Dropper reaches seat safely: +1 point',
        'Chaser tags Dropper: +1 point',
        'Hot Poo survivor: +1 point per round',
        'Challenge completed: +1 bonus point',
        'First to goal wins! (3/5/7 points)',
      ],
    },
    {
      title: 'Safety Tips',
      subtitle: 'Play Safe!',
      color: 'from-blue-500 to-cyan-500',
      steps: [
        'Clear the play area',
        'Play on soft surfaces',
        'No pushing or shoving',
        'Walk for younger kids',
        'Adult supervision recommended',
      ],
    },
  ];

  const gameModes = [
    {
      id: 'classic',
      name: 'Classic Mode',
      description: 'The original Drop & Chase gameplay',
      icon: Target,
      color: 'from-pink-500 to-rose-500',
      players: '4-10',
      duration: '20-30 min',
    },
    {
      id: 'hotpoo',
      name: 'Hot Poo',
      description: 'Musical hot potato with a twist',
      icon: Zap,
      color: 'from-purple-500 to-indigo-500',
      players: '4-15',
      duration: '15-25 min',
    },
    {
      id: 'tournament',
      name: 'Tournament Mode',
      description: 'Bracket-style elimination rounds',
      icon: Trophy,
      color: 'from-amber-500 to-orange-500',
      players: '8-16',
      duration: '45-60 min',
    },
    {
      id: 'team',
      name: 'Team Battle',
      description: 'Teams compete head-to-head',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      players: '6-20',
      duration: '30-45 min',
    },
    {
      id: 'speed',
      name: 'Speed Round',
      description: 'Fast-paced quick elimination',
      icon: Clock,
      color: 'from-red-500 to-rose-500',
      players: '4-8',
      duration: '10-15 min',
    },
    {
      id: 'challenge',
      name: 'Challenge Mode',
      description: 'Every round includes a challenge card',
      icon: Sparkles,
      color: 'from-cyan-500 to-blue-500',
      players: '4-12',
      duration: '25-40 min',
    },
  ];

  const currentVariation = ageGroupVariations[selectedAgeGroup];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-section, .print-section * {
            visibility: visible;
          }
          .print-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Confetti Effect */}
      <ConfettiEffect 
        isActive={state.showConfetti} 
        intensity={state.confettiIntensity}
        theme={state.currentTheme}
      />

      {/* Header */}
      <header 
        className="text-white py-6 px-4 sticky top-0 z-40 shadow-lg transition-all duration-300 no-print"
        style={{
          background: state.isActive 
            ? `linear-gradient(135deg, ${state.currentTheme.primaryColor}, ${state.currentTheme.secondaryColor})`
            : 'linear-gradient(to right, #ec4899, #8b5cf6, #6366f1)'
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">Back to Games</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrintableCards(true)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-bold transition-all"
            >
              <Printer className="w-5 h-5" />
              <span className="hidden sm:inline">Print Cards</span>
            </button>
            <button
              onClick={handleOpenPartyMode}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-bold transition-all animate-pulse hover:animate-none"
            >
              <PartyPopper className="w-5 h-5" />
              Party Mode
              <Sparkles className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Party Mode Modal */}
      {showPartyMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div 
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
            style={{
              background: `linear-gradient(135deg, ${state.currentTheme.gradientFrom.replace('from-', '')} 0%, ${state.currentTheme.gradientTo.replace('to-', '')} 100%)`,
              backgroundColor: '#1f2937'
            }}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 p-4 border-b border-white/10 backdrop-blur-sm bg-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${state.currentTheme.primaryColor}, ${state.currentTheme.secondaryColor})`
                    }}
                  >
                    <PartyPopper className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white">Party Mode</h2>
                    <p className="text-white/60 text-sm">{state.currentTheme.name} Theme</p>
                  </div>
                </div>
                <button 
                  onClick={handleClosePartyMode}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {[
                  { id: 'timer', label: 'Timer', icon: Clock },
                  { id: 'music', label: 'Music', icon: Music },
                  { id: 'sounds', label: 'Sounds', icon: Sparkles },
                  { id: 'themes', label: 'Themes', icon: Settings }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setPartyModeTab(tab.id as typeof partyModeTab)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                      partyModeTab === tab.id
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-4">
              {partyModeTab === 'timer' && (
                <div className="space-y-4">
                  <PartyTimer onTimerEnd={() => triggerConfetti('extreme')} />
                  
                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => triggerConfetti('high')}
                      className="p-4 bg-white/10 hover:bg-white/20 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Trigger Confetti
                    </button>
                    <button
                      onClick={() => triggerConfetti('extreme')}
                      className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Trophy className="w-5 h-5" />
                      Winner Celebration!
                    </button>
                  </div>
                </div>
              )}
              
              {partyModeTab === 'music' && (
                <PartyPlaylist />
              )}
              
              {partyModeTab === 'sounds' && (
                <PartySoundboard />
              )}
              
              {partyModeTab === 'themes' && (
                <PartyThemeSelector />
              )}
            </div>
            
            {/* Quick Controls Footer */}
            <div className="sticky bottom-0 p-4 border-t border-white/10 backdrop-blur-sm bg-black/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PartyThemeSelector compact />
                </div>
                <div className="text-white/60 text-sm">
                  Round {state.roundNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Quick Reference Cards Modal */}
      {showPrintableCards && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm no-print">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl">
            <div className="sticky top-0 z-10 p-4 border-b bg-white flex items-center justify-between">
              <h2 className="text-xl font-black text-gray-800">Printable Quick Reference Cards</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-full font-bold hover:opacity-90 transition-all"
                >
                  <Printer className="w-5 h-5" />
                  Print Cards
                </button>
                <button 
                  onClick={() => setShowPrintableCards(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 print-section" ref={printRef}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickReferenceCards.map((card, index) => (
                  <div 
                    key={index}
                    className={`print-card bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg`}
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-2xl font-black">{card.title}</h3>
                      <p className="text-white/80">{card.subtitle}</p>
                    </div>
                    <div className="bg-white/20 rounded-xl p-4">
                      <ol className="space-y-2">
                        {card.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <span className="w-6 h-6 bg-white text-gray-800 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {stepIndex + 1}
                            </span>
                            <span className="text-sm font-medium">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="mt-4 text-center text-white/80 text-xs">
                      Drop A Deuce - DaFish Boyz Games
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Scoring Reference Card */}
              <div className="mt-6 print-card bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
                <h3 className="text-2xl font-black text-center mb-4">Score Tracker</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((playerNum) => (
                    <div key={playerNum} className="bg-white/20 rounded-xl p-4">
                      <p className="font-bold text-center mb-2">Player {playerNum}</p>
                      <div className="grid grid-cols-5 gap-1">
                        {[1, 2, 3, 4, 5].map((point) => (
                          <div key={point} className="w-6 h-6 border-2 border-white/50 rounded-full" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-white/80 text-xs">
                  Fill in circles as points are earned - Drop A Deuce
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden no-print">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-indigo-400/20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm mb-4">
              <PartyPopper className="w-4 h-4" />
              Official Game Rules
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 mb-4">
              Drop A Deuce
            </h1>
            <p className="text-xl text-purple-700 font-medium">
              The Ultimate Party Game for All Ages!
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">3-20</p>
              <p className="text-sm text-gray-600">Players</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">15-60</p>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">6+</p>
              <p className="text-sm text-gray-600">Age</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Bar */}
      <section className="px-4 -mt-4 mb-8 no-print">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={handleOpenPartyMode}
              className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex flex-col items-center gap-2"
            >
              <PartyPopper className="w-6 h-6" />
              <span className="font-bold text-sm">Party Mode</span>
            </button>
            <button
              onClick={() => setShowPrintableCards(true)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex flex-col items-center gap-2"
            >
              <Printer className="w-6 h-6" />
              <span className="font-bold text-sm">Print Cards</span>
            </button>
            <Link
              to="/drop-deuce-party-pack"
              className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex flex-col items-center gap-2"
            >
              <Scissors className="w-6 h-6" />
              <span className="font-bold text-sm">Party Pack</span>
            </Link>
            <button
              onClick={() => toggleSection('overview')}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex flex-col items-center gap-2"
            >
              <BookOpen className="w-6 h-6" />
              <span className="font-bold text-sm">Full Rules</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16 no-print">
        {/* Game Overview */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('overview')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Game Overview</h2>
                <p className="text-indigo-100">What's in the box & how to get started</p>
              </div>
            </div>
            {expandedSection === 'overview' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'overview' && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    What's Included
                  </h3>
                  <ul className="space-y-3">
                    {[
                      '1 Adorable Poop Plushie (The "Deuce")',
                      '30 Challenge Cards',
                      '4 Score Tracking Cards',
                      '1 Quick Start Guide',
                      'Access to Digital Party Mode',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-gray-700">
                        <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Info className="w-6 h-6 text-blue-500" />
                    Game Objective
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Drop A Deuce is a hilarious party game where players take turns being the "Dropper" 
                    who sneakily drops the poop plushie behind another player, then races to steal their spot!
                  </p>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-purple-700 font-medium">
                      <strong>Goal:</strong> Be the first player to reach the winning score by successfully 
                      dropping the deuce and making it back to safety, or by catching the dropper!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Setup */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('setup')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-green-500 to-emerald-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Settings className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Game Setup</h2>
                <p className="text-green-100">Get ready to play in minutes!</p>
              </div>
            </div>
            {expandedSection === 'setup' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'setup' && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                <div>
                  <ol className="space-y-4">
                    {[
                      { step: 'Clear a large open space (at least 15ft x 15ft)', tip: 'Living rooms, backyards, or gyms work great!' },
                      { step: 'Have all players sit or stand in a circle', tip: 'Leave about 3 feet between each player' },
                      { step: 'Choose the first "Dropper" (youngest player goes first!)', tip: 'Or use rock-paper-scissors' },
                      { step: 'Give the Dropper the poop plushie', tip: 'Make sure everyone can see it clearly' },
                      { step: 'Shuffle the Challenge Cards and place face-down in center', tip: 'Optional but adds extra fun!' },
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-800">{item.step}</p>
                          <p className="text-gray-500 text-sm">{item.tip}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={images.circleSetup} alt="Players sitting in a circle" className="w-full h-64 object-cover" />
                </div>
              </div>

              {/* Safety Notice */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-yellow-800 mb-2">Safety First!</h4>
                    <ul className="text-yellow-700 space-y-1 text-sm">
                      <li>• Remove any obstacles or tripping hazards from the play area</li>
                      <li>• Play on soft surfaces like grass, carpet, or gym mats</li>
                      <li>• Younger children should walk instead of run</li>
                      <li>• Adult supervision recommended for ages 6-10</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Modes Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-purple-500" />
            Game Modes
          </h2>
          <p className="text-gray-600 mb-6">
            Choose from multiple exciting ways to play Drop A Deuce!
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => toggleSection(mode.id)}
                className={`bg-gradient-to-br ${mode.color} rounded-2xl p-5 text-white text-left transform hover:scale-[1.02] transition-all shadow-lg hover:shadow-xl`}
              >
                <mode.icon className="w-8 h-8 mb-3" />
                <h3 className="text-lg font-bold mb-1">{mode.name}</h3>
                <p className="text-white/80 text-sm mb-3">{mode.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {mode.players}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {mode.duration}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Drop & Chase Rules */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('dropChase')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-pink-500 to-rose-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Drop & Chase Mode</h2>
                <p className="text-pink-100">The classic circle chase game!</p>
              </div>
            </div>
            {expandedSection === 'dropChase' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'dropChase' && (
            <div className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">How to Play</h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ol className="space-y-4">
                    {[
                      { title: 'Walk & Chant', desc: 'The Dropper walks around the outside of the circle, tapping each player\'s head while saying "Drop... Drop... Drop a..."' },
                      { title: 'Drop the Deuce!', desc: 'When the Dropper says "DEUCE!" they drop the poop plushie behind a player and RUN!' },
                      { title: 'Chase!', desc: 'The "dropped on" player grabs the Deuce and chases the Dropper around the circle!' },
                      { title: 'Safe or Tagged?', desc: 'The Dropper tries to reach the empty spot and sit down before being tagged!' },
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-bold text-gray-800">{item.title}</p>
                          <p className="text-gray-600 text-sm">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.chaseScene} alt="Kids chasing around circle" className="w-full h-64 object-cover" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hot Poo Rules */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('hotPoo')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Zap className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Hot Poo Mode</h2>
                <p className="text-purple-100">Musical hot potato with a twist!</p>
              </div>
            </div>
            {expandedSection === 'hotPoo' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'hotPoo' && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
                <ol className="space-y-4">
                  {[
                    { title: 'Start the Music', desc: 'Open Party Mode and press play!' },
                    { title: 'Pass the Hot Poo!', desc: 'Quickly pass the poop plushie around the circle - it\'s HOT!' },
                    { title: 'Music Stops!', desc: 'When the buzzer sounds, whoever is holding the Hot Poo is OUT!' },
                    { title: 'Keep Playing!', desc: 'Continue until only one player remains - they\'re the winner!' },
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-bold text-gray-800">{item.title}</p>
                        <p className="text-gray-600 text-sm">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="rounded-2xl overflow-hidden shadow-lg">
                  <img src={images.hotPoo} alt="Hot poo being passed" className="w-full h-64 object-cover" />
                </div>
              </div>
              
              <button
                onClick={handleOpenPartyMode}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white font-bold flex items-center justify-center gap-3 hover:from-purple-400 hover:to-indigo-400 transition-all"
              >
                <PartyPopper className="w-6 h-6" />
                Open Party Mode Timer
                <Music className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Scoring Rules */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('scoring')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Scoring Rules</h2>
                <p className="text-amber-100">How to win the game!</p>
              </div>
            </div>
            {expandedSection === 'scoring' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'scoring' && (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                  <h3 className="font-bold text-green-700 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Drop & Chase Scoring
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">+1</span>
                      <span className="text-gray-700">Dropper reaches seat safely</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">+1</span>
                      <span className="text-gray-700">Chaser tags the Dropper</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">+1</span>
                      <span className="text-gray-700">Complete a Challenge Card</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Hot Poo Scoring
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">+1</span>
                      <span className="text-gray-700">Survive each round</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold">+3</span>
                      <span className="text-gray-700">Win the game (last standing)</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-bold">+1</span>
                      <span className="text-gray-700">Complete elimination challenge</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-6">
                <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Winning the Game
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center">
                    <Baby className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">Kids Mode</p>
                    <p className="text-2xl font-black text-pink-500">3 Points</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <User className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">Teen Mode</p>
                    <p className="text-2xl font-black text-purple-500">5 Points</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center">
                    <Users2 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="font-bold text-gray-800">Adult Mode</p>
                    <p className="text-2xl font-black text-orange-500">7 Points</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Age Group Variations */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            Age-Appropriate Variations
          </h2>
          
          {/* Age Group Selector */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {Object.entries(ageGroupVariations).map(([key, variation]) => (
              <button
                key={key}
                onClick={() => setSelectedAgeGroup(key as 'kids' | 'teens' | 'adults')}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedAgeGroup === key
                    ? `bg-gradient-to-r ${variation.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <variation.icon className="w-5 h-5" />
                {variation.title.split(' ')[0]} {variation.title.split(' ')[1]}
              </button>
            ))}
          </div>

          {/* Selected Variation Details */}
          <div className={`bg-gradient-to-br ${currentVariation.bgColor} rounded-2xl p-6`}>
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 bg-gradient-to-br ${currentVariation.color} rounded-2xl flex items-center justify-center`}>
                <currentVariation.icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-800">{currentVariation.title}</h3>
                <p className="text-gray-600">{currentVariation.tips}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Special Rules</h4>
                <ul className="space-y-3">
                  {currentVariation.rules.map((item, index) => (
                    <li key={index} className="flex items-center gap-3 bg-white/80 rounded-xl p-3">
                      <item.icon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">{item.rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-3">Winning Score</h4>
                <div className="bg-white/80 rounded-xl p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                  <p className="text-2xl font-black text-gray-800">{currentVariation.scoring}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenge Cards Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <button
            onClick={() => toggleSection('challenges')}
            className="w-full p-6 flex items-center justify-between bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black">Challenge Cards</h2>
                <p className="text-yellow-100">Add extra fun with silly challenges!</p>
              </div>
            </div>
            {expandedSection === 'challenges' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'challenges' && (
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                When a player is "out" or loses a round, they draw a Challenge Card and must complete the silly task to earn a bonus point!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: 'Silly Walk', desc: 'Walk around the circle like a penguin', color: 'from-pink-400 to-pink-500' },
                  { title: 'Animal Sounds', desc: 'Make 3 different animal sounds', color: 'from-purple-400 to-purple-500' },
                  { title: 'Dance Move', desc: 'Show everyone your best dance move', color: 'from-blue-400 to-blue-500' },
                  { title: 'Funny Face', desc: 'Make the funniest face you can', color: 'from-green-400 to-green-500' },
                  { title: 'Sing a Song', desc: 'Sing "Happy Birthday" in a silly voice', color: 'from-yellow-400 to-yellow-500' },
                  { title: 'Freeze!', desc: 'Strike a pose and freeze for 10 seconds', color: 'from-orange-400 to-orange-500' },
                  { title: 'Hop Around', desc: 'Hop on one foot around the circle', color: 'from-red-400 to-red-500' },
                  { title: 'Robot Talk', desc: 'Talk like a robot for the next round', color: 'from-indigo-400 to-indigo-500' },
                  { title: 'Compliment', desc: 'Give everyone in the circle a compliment', color: 'from-teal-400 to-teal-500' },
                ].map((card, index) => (
                  <div 
                    key={index}
                    className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 text-white transform hover:scale-105 transition-transform cursor-pointer shadow-lg`}
                  >
                    <h4 className="font-bold text-lg mb-1">{card.title}</h4>
                    <p className="text-white/90 text-sm">{card.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Party Pack Banner */}
        <Link
          to="/drop-deuce-party-pack"
          className="block bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 rounded-3xl p-8 mb-8 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:animate-bounce">
                <Scissors className="w-8 h-8" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-black flex items-center gap-2">
                  FREE Party Pack
                  <span className="px-2 py-0.5 bg-white text-orange-500 text-xs font-bold rounded-full">PRINTABLE</span>
                </h3>
                <p className="text-white/90">
                  Invitations, scorecards, name tags, decorations & 30 challenge cards!
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Download className="w-6 h-6" />
              <span className="font-bold">Download</span>
              <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
            </div>
          </div>
        </Link>

        {/* Buy CTA */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-center text-white">
          <h2 className="text-3xl font-black mb-4">Ready to Drop Some Fun?</h2>
          <p className="text-white/90 mb-6 max-w-lg mx-auto">
            Get the physical Drop A Deuce game with the adorable poop plushie, Challenge Cards, and more!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/?game=drop-deuce"
              className="px-8 py-4 bg-white text-purple-600 font-black text-lg rounded-2xl hover:bg-purple-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Buy Now - $15.00
            </Link>
            <button
              onClick={handleOpenPartyMode}
              className="px-8 py-4 bg-white/20 hover:bg-white/30 font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <PartyPopper className="w-5 h-5" />
              Launch Party Mode
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 no-print">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400 mb-4">© 2025 DaFish Boyz Games. All rights reserved.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/" className="text-purple-400 hover:text-purple-300 transition-colors">
              Back to All Games
            </Link>
            <Link to="/let-that-shit-go-rules" className="text-purple-400 hover:text-purple-300 transition-colors">
              Let That Shit Go Rules
            </Link>
            <Link to="/drop-deuce-party-pack" className="text-purple-400 hover:text-purple-300 transition-colors">
              Party Pack
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating Party Button */}
      <FloatingPartyButton />
    </div>
  );
};

const DropADeuceRules: React.FC = () => {
  return <DropADeuceRulesContent />;
};

export default DropADeuceRules;
