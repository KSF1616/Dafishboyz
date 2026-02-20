import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Clock, Star, Trophy, Music, ChevronDown, ChevronUp, Sparkles, PartyPopper, Target, Zap, Settings, X, Printer, Scissors } from 'lucide-react';

import { usePartyMode } from '@/contexts/PartyModeContext';
import PartyTimer from '@/components/dropDeuce/PartyTimer';
import PartyPlaylist from '@/components/dropDeuce/PartyPlaylist';
import PartySoundboard from '@/components/dropDeuce/PartySoundboard';
import PartyThemeSelector from '@/components/dropDeuce/PartyThemeSelector';
import ConfettiEffect from '@/components/dropDeuce/ConfettiEffect';
import FloatingPartyButton from '@/components/FloatingPartyButton';

const DropDeuceRulesContent: React.FC = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>('overview');
  const [showPartyMode, setShowPartyMode] = useState(false);
  const [partyModeTab, setPartyModeTab] = useState<'timer' | 'music' | 'sounds' | 'themes'>('timer');
  
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

  const images = {
    circleSetup: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389297575_a1670355.jpg',
    chaseScene: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389317940_236137dd.jpg',
    hotPoo: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389377952_d7df636e.png',
    trophy: 'https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765389394207_1d817413.jpg',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100">
      {/* Confetti Effect */}
      <ConfettiEffect 
        isActive={state.showConfetti} 
        intensity={state.confettiIntensity}
        theme={state.currentTheme}
      />

      {/* Header */}
      <header 
        className="text-white py-6 px-4 sticky top-0 z-40 shadow-lg transition-all duration-300"
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
          <button
            onClick={handleOpenPartyMode}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-bold transition-all animate-pulse hover:animate-none"
          >
            <PartyPopper className="w-5 h-5" />
            Party Mode
            <Sparkles className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Party Mode Modal */}
      {showPartyMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
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

      {/* Hero Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-indigo-400/20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm mb-4">
              <PartyPopper className="w-4 h-4" />
              Ages 6+
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 mb-4">
              Drop A Deuce
            </h1>

            <p className="text-xl text-purple-700 font-medium">
              The Ultimate Kids Party Game!
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Users className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">3-10</p>
              <p className="text-sm text-gray-600">Players</p>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl p-4 text-center shadow-lg">
              <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-black text-gray-800">20-40</p>
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

      {/* Party Mode Banner */}
      <section className="px-4 -mt-4 mb-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleOpenPartyMode}
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:animate-bounce">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-black flex items-center gap-2">
                    Party Mode
                    <span className="px-2 py-0.5 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">NEW</span>
                  </h3>
                  <p className="text-white/80">
                    Timer, music, sound effects, confetti & customizable themes!
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Sparkles className="w-6 h-6 animate-pulse" />
                <span className="font-bold">Launch</span>
                <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Game Modes Introduction */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-black text-gray-800 mb-4 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            Two Ways to Play!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Drop A Deuce features two exciting game modes that will have everyone laughing and having a blast!

          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-pink-800 mb-2">Drop & Chase</h3>
              <p className="text-pink-700">Circle around and drop the deuce - then run for your seat!</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-6">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-purple-800 mb-2">Hot Poo</h3>
              <p className="text-purple-700">Pass the hot poo before the music stops!</p>
            </div>
          </div>
        </div>

        {/* Game Mode 1: Drop & Chase */}
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
                <h2 className="text-2xl font-black">Game Mode 1: Drop & Chase</h2>
                <p className="text-pink-100">The classic circle chase game!</p>
              </div>
            </div>
            {expandedSection === 'dropChase' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'dropChase' && (
            <div className="p-8">
              {/* Setup */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Setup
                </h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <span className="text-gray-700">All players sit or stand in a circle facing inward</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <span className="text-gray-700">Leave enough space between players for someone to walk around the outside</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <span className="text-gray-700">Choose one player to be the first "Dropper"</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                        </span>
                        <span className="text-gray-700">The Dropper holds the "Deuce" (the poop plushie from the game)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.circleSetup} alt="Players sitting in a circle" className="w-full h-48 object-cover" />
                  </div>
                </div>
              </div>

              {/* How to Play */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  How to Play
                </h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div className="rounded-2xl overflow-hidden shadow-lg order-2 md:order-1">
                    <img src={images.chaseScene} alt="Kids chasing around circle" className="w-full h-48 object-cover" />
                  </div>
                  <div className="order-1 md:order-2">
                    <ol className="space-y-4">
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                        <div>
                          <p className="font-bold text-gray-800">Walk & Chant</p>
                          <p className="text-gray-600 text-sm">The Dropper walks around the outside of the circle, tapping each player's head while saying "Drop... Drop... Drop a..."</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                        <div>
                          <p className="font-bold text-gray-800">Drop the Deuce!</p>
                          <p className="text-gray-600 text-sm">When the Dropper says "DEUCE!" they drop the poop plushie behind a player and RUN!</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                        <div>
                          <p className="font-bold text-gray-800">Chase!</p>
                          <p className="text-gray-600 text-sm">The "dropped on" player grabs the Deuce and chases the Dropper around the circle!</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-8 h-8 bg-gradient-to-br from-pink-500 to-rose-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                        <div>
                          <p className="font-bold text-gray-800">Safe or Tagged?</p>
                          <p className="text-gray-600 text-sm">The Dropper tries to reach the empty spot and sit down before being tagged!</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Scoring */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Scoring & Winning
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-pink-700 mb-2">If the Dropper makes it safely:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• The chaser becomes the new Dropper</li>
                      <li>• The original Dropper earns 1 point</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-bold text-pink-700 mb-2">If the Dropper gets tagged:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• The Dropper must go again</li>
                      <li>• The chaser earns 1 point</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded-xl flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <p className="text-gray-800 font-bold">First player to reach 5 points wins!</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Mode 2: Hot Poo */}
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
                <h2 className="text-2xl font-black">Game Mode 2: Hot Poo</h2>
                <p className="text-purple-100">Musical hot potato with a twist!</p>
              </div>
            </div>
            {expandedSection === 'hotPoo' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'hotPoo' && (
            <div className="p-8">
              {/* Setup */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Setup
                </h3>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-gray-700">All players sit in a circle</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-gray-700">One player starts holding the "Hot Poo" (the poop plushie)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </span>
                    <span className="text-gray-700">Use Party Mode for the timer and music!</span>
                  </li>
                </ul>

                {/* Party Mode CTA */}
                <button
                  onClick={handleOpenPartyMode}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl p-4 text-white font-bold flex items-center justify-center gap-3 hover:from-purple-400 hover:to-indigo-400 transition-all transform hover:scale-[1.02]"
                >
                  <PartyPopper className="w-6 h-6" />
                  Open Party Mode Timer
                  <Music className="w-5 h-5" />
                </button>
              </div>

              {/* How to Play */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  How to Play
                </h3>
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <ol className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                      <div>
                        <p className="font-bold text-gray-800">Start the Music</p>
                        <p className="text-gray-600 text-sm">Open Party Mode and press play!</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                      <div>
                        <p className="font-bold text-gray-800">Pass the Hot Poo!</p>
                        <p className="text-gray-600 text-sm">Quickly pass the poop plushie around the circle - it's HOT!</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                      <div>
                        <p className="font-bold text-gray-800">Music Stops!</p>
                        <p className="text-gray-600 text-sm">When the buzzer sounds, whoever is holding the Hot Poo is OUT!</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                      <div>
                        <p className="font-bold text-gray-800">Keep Playing!</p>
                        <p className="text-gray-600 text-sm">Continue until only one player remains - they're the winner!</p>
                      </div>
                    </li>
                  </ol>
                  <div className="rounded-2xl overflow-hidden shadow-lg">
                    <img src={images.hotPoo} alt="Hot poo being passed" className="w-full h-64 object-cover" />
                  </div>
                </div>
              </div>

              {/* Winning */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Winning the Game
                </h3>
                <div className="flex items-center gap-6">
                  <img src={images.trophy} alt="Winner trophy" className="w-24 h-24 rounded-2xl object-cover shadow-lg" />
                  <div>
                    <p className="text-gray-700 mb-2">The last player remaining who hasn't been caught holding the Hot Poo is the <span className="font-bold text-purple-600">WINNER!</span></p>
                    <p className="text-gray-600 text-sm">Tip: Play multiple rounds and keep track of wins for a tournament!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                <h2 className="text-2xl font-black">Bonus: Challenge Cards</h2>
                <p className="text-yellow-100">Add extra fun with silly challenges!</p>
              </div>
            </div>
            {expandedSection === 'challenges' ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
          </button>
          
          {expandedSection === 'challenges' && (
            <div className="p-8">
              <p className="text-gray-600 mb-6">
                For extra laughs, add Challenge Cards! When a player is "out" or loses a round, they draw a Challenge Card and must complete the silly task!
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

        {/* Tips Section */}
        <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </span>
            Tips for Parents & Party Hosts
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/80 rounded-2xl p-5">
              <h3 className="font-bold text-green-700 mb-2">Safety First!</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Play on soft grass or carpet</li>
                <li>• Make sure there's plenty of space</li>
                <li>• Remove any obstacles from the play area</li>
                <li>• Supervise younger children</li>
              </ul>
            </div>
            <div className="bg-white/80 rounded-2xl p-5">
              <h3 className="font-bold text-green-700 mb-2">Make it More Fun!</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Use Party Mode for music & timer</li>
                <li>• Trigger confetti when someone wins!</li>
                <li>• Let kids take turns being the DJ</li>
                <li>• Create your own Challenge Cards!</li>
              </ul>
            </div>
          </div>
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
              <Printer className="w-6 h-6" />
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
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-400">© 2025 DaFish Boyz Games. All rights reserved.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
            Back to All Games
          </Link>
          <Link to="/" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
            Back to All Games
          </Link>
        </div>
      </footer>

      {/* Floating Party Button */}
      <FloatingPartyButton />
    </div>
  );
};

// Export directly since PartyModeProvider is in main.tsx
const DropDeuceRules: React.FC = () => {
  return <DropDeuceRulesContent />;
};

export default DropDeuceRules;
