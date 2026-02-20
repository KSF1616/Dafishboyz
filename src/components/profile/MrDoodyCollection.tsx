import React, { useState, useEffect, useCallback } from 'react';
import MrDoody, { MrDoodyMood } from '@/components/MrDoody';
import CollectibleCharacter from '@/components/CollectibleCharacter';
import MrDoodyGiftCard from '@/components/MrDoodyGiftCard';
import MrDoodyMiniGame from '@/components/MrDoodyMiniGame';
import MrDoodyAchievementBadge from '@/components/profile/MrDoodyAchievementBadge';
import RewardsInventory from '@/components/profile/RewardsInventory';
import ShareYourLook from '@/components/profile/ShareYourLook';
import { useMrDoodyAchievements } from '@/hooks/useMrDoodyAchievements';
import { useRewardsInventory } from '@/hooks/useRewardsInventory';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  MR_DOODY_ACHIEVEMENTS, 
  CATEGORY_INFO,
  getRarityColor as getAchievementRarityColor,
  getRarityBgColor as getAchievementRarityBgColor
} from '@/data/mrDoodyAchievements';
import { 
  COLLECTIBLE_CHARACTERS, 
  getCharacterById, 
  getRarityColor, 
  getRarityBgColor,
  getRarityBorderColor 
} from '@/data/collectibleCharacters';
import { CollectibleCharacter as CharacterType, CharacterMood } from '@/types/collectibles';
import { 
  Gift, Heart, Lock, Sparkles, Gamepad2, Music, Moon, Sun, Smile, PartyPopper, 
  Crown, Star, Zap, ChevronLeft, ChevronRight, Trophy, Target, Users, Award,
  Filter, Search, X, Package, Share2, RefreshCw, Cloud, CloudOff, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MrDoodyCollectionProps {
  className?: string;
}

const MILESTONES = [
  { count: 10, title: 'First Dance!', message: 'Mr. Doody is so happy he learned to dance!' },
  { count: 25, title: 'Hug Enthusiast', message: 'Your friendship is growing stronger!' },
  { count: 50, title: 'Best Friends', message: 'Mr. Doody considers you his best friend!' },
  { count: 100, title: 'Hug Master', message: 'You\'ve mastered the art of pocket hugs!' },
  { count: 250, title: 'Legendary Hugger', message: 'Your hugs are legendary!' },
  { count: 500, title: 'Hug Champion', message: 'You are the ultimate hug champion!' },
];

const MrDoodyCollection: React.FC<MrDoodyCollectionProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [hasMrDoody, setHasMrDoody] = useState(false);
  const [claimedDate, setClaimedDate] = useState<string | null>(null);
  const [showGiftCard, setShowGiftCard] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showShareLook, setShowShareLook] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [mood, setMood] = useState<MrDoodyMood>('happy');
  const [isDancing, setIsDancing] = useState(false);
  const [showMilestone, setShowMilestone] = useState<typeof MILESTONES[0] | null>(null);
  const [unlockedMilestones, setUnlockedMilestones] = useState<number[]>([]);
  const [miniGameHighScore, setMiniGameHighScore] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType | null>(null);
  const [unlockedCharacters, setUnlockedCharacters] = useState<string[]>(['mr-doody']);
  const [showCharacterDetail, setShowCharacterDetail] = useState(false);
  const [viewMode, setViewMode] = useState<'active' | 'collection' | 'achievements' | 'rewards'>('active');
  const [achievementFilter, setAchievementFilter] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [showNewAchievementModal, setShowNewAchievementModal] = useState(false);
  const [equippedItemsVersion, setEquippedItemsVersion] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [cloudSource, setCloudSource] = useState<string | null>(null);


  // Achievement tracking
  const {
    stats,
    unlockedAchievements,
    newAchievements,
    trackHug,
    trackDance,
    trackBodyPartTap,
    trackMoodChange,
    trackMiniGameScore,
    trackStreak,
    getAchievementProgress,
    getAllAchievementProgress,
    getUnlockedCount,
    getTotalCount,
    clearNewAchievement,
    clearAllNewAchievements
  } = useMrDoodyAchievements();

  // Rewards inventory for equipped items
  const {
    inventory,
    getEquippedRewards,
    syncWithAchievements
  } = useRewardsInventory();

  // Get equipped items for character rendering
  const equippedItems = inventory.equippedItems;

  // Check database for Mr. Doody ownership (cross-device sync)
  const checkDatabaseOwnership = useCallback(async () => {
    if (!user?.email) return;
    
    try {
      setSyncStatus('syncing');
      const { data, error } = await supabase.functions.invoke('mr-doody-manager', {
        body: {
          action: 'check',
          email: user.email
        }
      });

      if (error) {
        console.error('Error checking database ownership:', error);
        setSyncStatus('error');
        return;
      }

      if (data?.has_mr_doody) {
        // User owns Mr. Doody in database - sync to localStorage
        if (localStorage.getItem('mrDoodyOwned') !== 'true') {
          localStorage.setItem('mrDoodyOwned', 'true');
          localStorage.setItem('mrDoodyClaimedDate', data.mr_doody_awarded_at || new Date().toISOString());
          setHasMrDoody(true);
          setClaimedDate(data.mr_doody_awarded_at);
        }
        setCloudSource(data.mr_doody_source);
        setSyncStatus('synced');
      } else {
        // Check if user has localStorage but not database - sync to database
        const localOwned = localStorage.getItem('mrDoodyOwned') === 'true';
        const localDate = localStorage.getItem('mrDoodyClaimedDate');
        
        if (localOwned) {
          // Sync localStorage to database
          await supabase.functions.invoke('mr-doody-manager', {
            body: {
              action: 'sync',
              email: user.email,
              user_id: user.id,
              metadata: { claimed_date: localDate }
            }
          });
          setCloudSource('sync');
          setSyncStatus('synced');
        } else {
          setSyncStatus('idle');
        }
      }
    } catch (err) {
      console.error('Error syncing Mr. Doody ownership:', err);
      setSyncStatus('error');
    }
  }, [user?.email, user?.id]);

  // Load saved data
  useEffect(() => {
    const owned = localStorage.getItem('mrDoodyOwned') === 'true';
    const date = localStorage.getItem('mrDoodyClaimedDate');
    const interactions = parseInt(localStorage.getItem('mrDoodyInteractions') || '0');
    const unlocked = JSON.parse(localStorage.getItem('mrDoodyMilestones') || '[]');
    const highScore = parseInt(localStorage.getItem('mrDoodyMiniGameHighScore') || '0');
    const savedUnlockedChars = JSON.parse(localStorage.getItem('unlockedCharacters') || '["mr-doody"]');
    const savedSelectedChar = localStorage.getItem('selectedCharacter') || 'mr-doody';
    
    setHasMrDoody(owned);
    setClaimedDate(date);
    setInteractionCount(interactions);
    setUnlockedMilestones(unlocked);
    setMiniGameHighScore(highScore);
    setUnlockedCharacters(savedUnlockedChars);
    
    const char = getCharacterById(savedSelectedChar);
    if (char && savedUnlockedChars.includes(savedSelectedChar)) {
      setSelectedCharacter(char);
    } else {
      setSelectedCharacter(getCharacterById('mr-doody') || null);
    }

    checkAchievementUnlocks();
  }, []);

  // Check database ownership when user is available
  useEffect(() => {
    if (user?.email) {
      checkDatabaseOwnership();
    }
  }, [user?.email, checkDatabaseOwnership]);

  // Show new achievement notification
  useEffect(() => {
    if (newAchievements.length > 0) {
      setShowNewAchievementModal(true);
    }
  }, [newAchievements]);

  const checkAchievementUnlocks = () => {
    const gamesWon = parseInt(localStorage.getItem('gamesWon') || '0');
    const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
    const emotionalReleaseCount = parseInt(localStorage.getItem('emotionalReleaseCount') || '0');
    const tournamentWins = parseInt(localStorage.getItem('tournamentWins') || '0');
    const hugsGiven = parseInt(localStorage.getItem('mrDoodyInteractions') || '0');
    const letgoWins = parseInt(localStorage.getItem('letgoWins') || '0');
    const accuracy = parseInt(localStorage.getItem('overallAccuracy') || '0');

    const newUnlocks: string[] = [];
    
    COLLECTIBLE_CHARACTERS.forEach(char => {
      if (char.id === 'mr-doody') return;
      
      let shouldUnlock = false;
      
      switch (char.unlockRequirement.type) {
        case 'games_won':
          shouldUnlock = gamesWon >= char.unlockRequirement.count;
          break;
        case 'games_played':
          shouldUnlock = gamesPlayed >= char.unlockRequirement.count;
          break;
        case 'emotional_release':
          shouldUnlock = emotionalReleaseCount >= char.unlockRequirement.count;
          break;
        case 'tournament_wins':
          shouldUnlock = tournamentWins >= char.unlockRequirement.count;
          break;
        case 'hugs_given':
          shouldUnlock = hugsGiven >= char.unlockRequirement.count;
          break;
        case 'letgo_wins':
          shouldUnlock = letgoWins >= char.unlockRequirement.count;
          break;
        case 'accuracy':
          shouldUnlock = accuracy >= char.unlockRequirement.count;
          break;
      }
      
      if (shouldUnlock) {
        newUnlocks.push(char.id);
      }
    });

    if (newUnlocks.length > 0) {
      setUnlockedCharacters(prev => {
        const updated = [...new Set([...prev, ...newUnlocks])];
        localStorage.setItem('unlockedCharacters', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const checkMilestone = useCallback((count: number) => {
    const milestone = MILESTONES.find(m => m.count === count && !unlockedMilestones.includes(m.count));
    if (milestone) {
      setShowMilestone(milestone);
      setIsDancing(true);
      setMood('excited');
      
      const newUnlocked = [...unlockedMilestones, milestone.count];
      setUnlockedMilestones(newUnlocked);
      localStorage.setItem('mrDoodyMilestones', JSON.stringify(newUnlocked));
      
      setTimeout(() => {
        setShowMilestone(null);
        setIsDancing(false);
        setMood('happy');
      }, 5000);
    }
  }, [unlockedMilestones]);

  const handleInteraction = useCallback(() => {
    const newCount = interactionCount + 1;
    setInteractionCount(newCount);
    localStorage.setItem('mrDoodyInteractions', newCount.toString());
    checkMilestone(newCount);
    trackHug();
    
    if (newCount >= 100 && !unlockedCharacters.includes('lady-loo')) {
      setUnlockedCharacters(prev => {
        const updated = [...prev, 'lady-loo'];
        localStorage.setItem('unlockedCharacters', JSON.stringify(updated));
        return updated;
      });
    }
  }, [interactionCount, checkMilestone, unlockedCharacters, trackHug]);

  const handleBodyPartTap = useCallback((part: string) => {
    trackBodyPartTap(part);
  }, [trackBodyPartTap]);

  const handleMoodChange = useCallback((newMood: MrDoodyMood) => {
    setMood(newMood);
    trackMoodChange(newMood);
    if (newMood === 'excited') {
      setIsDancing(true);
      setTimeout(() => setIsDancing(false), 3000);
    } else {
      setIsDancing(false);
    }
  }, [trackMoodChange]);

  const handleDanceToggle = useCallback(() => {
    const newDancing = !isDancing;
    setIsDancing(newDancing);
    if (newDancing) {
      setMood('excited');
      trackDance();
    }
  }, [isDancing, trackDance]);

  const handleMiniGameScore = (score: number, mode?: 'speed' | 'challenge') => {
    if (score > miniGameHighScore) {
      setMiniGameHighScore(score);
    }
    trackMiniGameScore(score, mode || 'challenge');
  };

  const handleSelectCharacter = (char: CharacterType) => {
    if (unlockedCharacters.includes(char.id)) {
      setSelectedCharacter(char);
      localStorage.setItem('selectedCharacter', char.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getHugLevel = () => {
    if (interactionCount >= 500) return { level: 'Hug Champion', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '👑' };
    if (interactionCount >= 250) return { level: 'Legendary Hugger', color: 'text-pink-400', bg: 'bg-pink-500/20', icon: '💎' };
    if (interactionCount >= 100) return { level: 'Hug Master', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '🏆' };
    if (interactionCount >= 50) return { level: 'Best Friends', color: 'text-amber-400', bg: 'bg-amber-500/20', icon: '⭐' };
    if (interactionCount >= 25) return { level: 'Hug Enthusiast', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '💪' };
    if (interactionCount >= 10) return { level: 'Hug Beginner', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🌱' };
    return { level: 'New Friend', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '🤝' };
  };

  const getNextMilestone = () => {
    return MILESTONES.find(m => m.count > interactionCount);
  };

  const getUnlockProgress = (char: CharacterType) => {
    const req = char.unlockRequirement;
    let current = 0;
    
    switch (req.type) {
      case 'games_won':
        current = parseInt(localStorage.getItem('gamesWon') || '0');
        break;
      case 'games_played':
        current = parseInt(localStorage.getItem('gamesPlayed') || '0');
        break;
      case 'emotional_release':
        current = parseInt(localStorage.getItem('emotionalReleaseCount') || '0');
        break;
      case 'tournament_wins':
        current = parseInt(localStorage.getItem('tournamentWins') || '0');
        break;
      case 'hugs_given':
        current = interactionCount;
        break;
      case 'letgo_wins':
        current = parseInt(localStorage.getItem('letgoWins') || '0');
        break;
      case 'accuracy':
        current = parseInt(localStorage.getItem('overallAccuracy') || '0');
        break;
    }
    
    return { current, target: req.count, percentage: Math.min((current / req.count) * 100, 100) };
  };

  const getFilteredAchievements = () => {
    let filtered = MR_DOODY_ACHIEVEMENTS;
    
    if (achievementFilter !== 'all') {
      filtered = filtered.filter(a => a.category === achievementFilter);
    }
    
    if (showUnlockedOnly) {
      filtered = filtered.filter(a => unlockedAchievements.some(u => u.achievementId === a.id));
    }
    
    return filtered;
  };

  const hugLevel = getHugLevel();
  const nextMilestone = getNextMilestone();

  const moodOptions: { mood: MrDoodyMood; icon: React.ReactNode; label: string }[] = [
    { mood: 'happy', icon: <Smile className="w-4 h-4" />, label: 'Happy' },
    { mood: 'excited', icon: <PartyPopper className="w-4 h-4" />, label: 'Excited' },
    { mood: 'sleepy', icon: <Moon className="w-4 h-4" />, label: 'Sleepy' },
    { mood: 'love', icon: <Heart className="w-4 h-4" />, label: 'Love' },
    { mood: 'surprised', icon: <Sun className="w-4 h-4" />, label: 'Surprised' },
  ];

  const getRarityIcon = (rarity: CharacterType['rarity']) => {
    switch (rarity) {
      case 'common': return <Star className="w-3 h-3" />;
      case 'rare': return <Zap className="w-3 h-3" />;
      case 'epic': return <Crown className="w-3 h-3" />;
      case 'legendary': return <Sparkles className="w-3 h-3" />;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-yellow-500 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Pocket Hug Collection
          </h3>
          {/* Cloud sync status */}
          {user && (
            <div className="flex items-center gap-2">
              {syncStatus === 'syncing' && (
                <div className="flex items-center gap-1 text-amber-100 text-xs">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Syncing...</span>
                </div>
              )}
              {syncStatus === 'synced' && (
                <div className="flex items-center gap-1 text-green-200 text-xs" title="Synced to cloud">
                  <Cloud className="w-4 h-4" />
                </div>
              )}
              {syncStatus === 'error' && (
                <button 
                  onClick={checkDatabaseOwnership}
                  className="flex items-center gap-1 text-red-200 text-xs hover:text-white"
                  title="Sync failed - click to retry"
                >
                  <CloudOff className="w-4 h-4" />
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-amber-100 text-sm mt-1">
          <span>{unlockedCharacters.length} / {COLLECTIBLE_CHARACTERS.length} characters</span>
          <span>•</span>
          <span>{getUnlockedCount()} / {getTotalCount()} achievements</span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          onClick={() => setViewMode('active')}
          className={`flex-shrink-0 flex-1 py-3 text-sm font-medium transition-colors ${
            viewMode === 'active' 
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Buddy
        </button>
        <button
          onClick={() => setViewMode('collection')}
          className={`flex-shrink-0 flex-1 py-3 text-sm font-medium transition-colors ${
            viewMode === 'collection' 
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Characters
        </button>
        <button
          onClick={() => setViewMode('achievements')}
          className={`flex-shrink-0 flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            viewMode === 'achievements' 
              ? 'text-amber-600 border-b-2 border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Award className="w-4 h-4" />
          Badges
          {newAchievements.length > 0 && (
            <span className="ml-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {newAchievements.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setViewMode('rewards')}
          className={`flex-shrink-0 flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1 ${
            viewMode === 'rewards' 
              ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Package className="w-4 h-4" />
          Rewards
        </button>
      </div>



      <div className="p-6">
        {viewMode === 'active' ? (
          // Active Buddy View
          hasMrDoody && selectedCharacter ? (
            <div className="space-y-6">
              {/* Milestone Celebration Overlay */}
              {showMilestone && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
                  <div className="bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-bounce">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-white mb-2">{showMilestone.title}</h3>
                    <p className="text-amber-100 mb-4">{showMilestone.message}</p>
                    <div className="text-4xl">{hugLevel.icon}</div>
                  </div>
                </div>
              )}

              {/* Cloud sync indicator */}
              {cloudSource && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <Cloud className="w-3 h-3" />
                  <span>Awarded via {cloudSource === 'purchase' ? 'game purchase' : cloudSource === 'sync' ? 'account sync' : cloudSource}</span>
                </div>
              )}

              {/* Character Display */}
              <div className="flex flex-col items-center">
                <div 
                  className="relative cursor-pointer group"
                  onClick={handleInteraction}
                >
                  <div className={`absolute -inset-4 bg-gradient-to-r rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity ${isDancing ? 'animate-pulse' : ''}`}
                    style={{ 
                      background: `linear-gradient(to right, ${selectedCharacter.colors.highlight}, ${selectedCharacter.colors.primary}, ${selectedCharacter.colors.highlight})` 
                    }}
                  />
                  {selectedCharacter.id === 'mr-doody' ? (
                    <MrDoody 
                      size="xl" 
                      animated={true} 
                      interactive={true}
                      mood={mood}
                      isDancing={isDancing}
                      onHug={handleInteraction}
                      onBodyPartTap={handleBodyPartTap}
                      enableSounds={true}
                      equippedItems={equippedItems}
                    />
                  ) : (
                    <CollectibleCharacter
                      character={selectedCharacter}
                      size="xl"
                      animated={true}
                      interactive={true}
                      mood={mood as CharacterMood}
                      isDancing={isDancing}
                      onHug={handleInteraction}
                      enableSounds={true}
                      equippedItems={equippedItems}
                    />
                  )}
                </div>

                <div className="mt-4 text-center">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${getRarityBgColor(selectedCharacter.rarity)} ${getRarityColor(selectedCharacter.rarity)}`}>
                    {getRarityIcon(selectedCharacter.rarity)}
                    {selectedCharacter.rarity.toUpperCase()}
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{selectedCharacter.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{selectedCharacter.title}</p>
                </div>
              </div>

              {/* Mood Selector */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 font-medium">Mood</div>
                <div className="flex justify-center gap-2 flex-wrap">
                  {moodOptions.map((option) => (
                    <button
                      key={option.mood}
                      onClick={() => handleMoodChange(option.mood)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all ${
                        mood === option.mood 
                          ? 'bg-amber-500 text-white shadow-md' 
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-amber-100 dark:hover:bg-gray-500'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-center mt-3">
                  <button
                    onClick={handleDanceToggle}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isDancing 
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse shadow-lg' 
                        : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-pink-100 dark:hover:bg-gray-500'
                    }`}
                  >
                    <Music className="w-4 h-4" />
                    {isDancing ? 'Dancing!' : 'Make Them Dance'}
                  </button>
                </div>
              </div>

              {/* Hug Stats */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Hug Level</span>
                  <span className={`text-sm font-bold ${hugLevel.color} flex items-center gap-1`}>
                    <span>{hugLevel.icon}</span>
                    {hugLevel.level}
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${hugLevel.bg} rounded-full flex items-center justify-center`}>
                    <Heart className={`w-5 h-5 ${hugLevel.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Total Hugs</span>
                      <span>{interactionCount}</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${nextMilestone ? Math.min((interactionCount / nextMilestone.count) * 100, 100) : 100}%` }}
                      />
                    </div>
                    {nextMilestone && (
                      <div className="text-xs text-gray-400 mt-1">
                        {nextMilestone.count - interactionCount} hugs until "{nextMilestone.title}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Achievements Preview */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Recent Achievements
                  </span>
                  <button 
                    onClick={() => setViewMode('achievements')}
                    className="text-xs text-amber-600 hover:text-amber-700"
                  >
                    View All
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {unlockedAchievements.slice(-5).reverse().map(unlocked => {
                    const achievement = MR_DOODY_ACHIEVEMENTS.find(a => a.id === unlocked.achievementId);
                    if (!achievement) return null;
                    const progress = getAchievementProgress(achievement.id);
                    if (!progress) return null;
                    return (
                      <MrDoodyAchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        progress={progress}
                        size="sm"
                      />
                    );
                  })}
                  {unlockedAchievements.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No achievements yet. Keep hugging!</p>
                  )}
                </div>
              </div>

              {/* Quote Card */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-700">
                <p className="text-amber-800 dark:text-amber-200 text-sm italic text-center">
                  "{selectedCharacter.catchphrase}"
                </p>
                <p className="text-amber-600 dark:text-amber-400 text-xs text-center mt-2">
                  — {selectedCharacter.name}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  onClick={() => setShowMiniGame(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Gamepad2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Mini Game</span>
                  <span className="sm:hidden">Play</span>
                </Button>
                <Button 
                  onClick={() => setShowShareLook(true)}
                  className="bg-gradient-to-r from-pink-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 text-white"
                >
                  <Share2 className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Share Look</span>
                  <span className="sm:hidden">Share</span>
                </Button>
                <Button 
                  onClick={() => setViewMode('collection')}
                  variant="outline"
                  className="border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                >
                  <Users className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </Button>
              </div>

            </div>
          ) : (
            // Not owned state
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-10 h-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Pocket Hugs Yet</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                Purchase a physical game to receive Mr. Doody, your pocket hug buddy!
              </p>
              <div className="opacity-50">
                <MrDoody size="md" animated={false} interactive={false} />
              </div>
              {user && (
                <p className="text-xs text-gray-400 mt-4">
                  Logged in as {user.email} - Mr. Doody will sync across devices when unlocked
                </p>
              )}
            </div>
          )
        ) : viewMode === 'collection' ? (
          // Collection View
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Unlock characters by completing achievements!
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {COLLECTIBLE_CHARACTERS.map((char) => {
                const isUnlocked = unlockedCharacters.includes(char.id);
                const progress = getUnlockProgress(char);
                const isSelected = selectedCharacter?.id === char.id;
                
                return (
                  <div
                    key={char.id}
                    onClick={() => isUnlocked && handleSelectCharacter(char)}
                    className={`relative rounded-xl p-4 transition-all cursor-pointer ${
                      isUnlocked 
                        ? isSelected
                          ? `bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border-2 ${getRarityBorderColor(char.rarity)} shadow-lg`
                          : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-75'
                    }`}
                  >
                    {/* Rarity Badge */}
                    <div className={`absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getRarityBgColor(char.rarity)} ${getRarityColor(char.rarity)}`}>
                      {getRarityIcon(char.rarity)}
                    </div>
                    
                    {/* Character Preview */}
                    <div className="flex justify-center mb-3">
                      {isUnlocked ? (
                        char.id === 'mr-doody' ? (
                          <MrDoody size="sm" animated={false} interactive={false} />
                        ) : (
                          <CollectibleCharacter
                            character={char}
                            size="sm"
                            animated={false}
                            interactive={false}
                          />
                        )
                      ) : (
                        <div className="w-20 h-30 flex items-center justify-center">
                          <div 
                            className="w-16 h-24 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: char.colors.primary + '40' }}
                          >
                            <Lock className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Character Info */}
                    <div className="text-center">
                      <h5 className={`font-bold text-sm ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                        {char.name}
                      </h5>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {char.title}
                      </p>
                    </div>
                    
                    {/* Unlock Progress */}
                    {!isUnlocked && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{progress.current}/{progress.target}</span>
                          <span>{Math.round(progress.percentage)}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${progress.percentage}%`,
                              backgroundColor: char.colors.primary
                            }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {char.unlockRequirement.description}
                        </p>
                      </div>
                    )}
                    
                    {/* Selected Indicator */}
                    {isSelected && isUnlocked && (
                      <div className="absolute -top-1 -left-1 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                        <Star className="w-3 h-3 text-white fill-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Rarity Levels</div>
              <div className="flex flex-wrap gap-2">
                {(['common', 'rare', 'epic', 'legendary'] as const).map((rarity) => (
                  <div 
                    key={rarity}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getRarityBgColor(rarity)} ${getRarityColor(rarity)}`}
                  >
                    {getRarityIcon(rarity)}
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'achievements' ? (
          // Achievements View
          <div className="space-y-4">
            {/* Achievement Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-amber-600">{getUnlockedCount()}</div>
                <div className="text-xs text-amber-700 dark:text-amber-400">Unlocked</div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">{getTotalCount()}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round((getUnlockedCount() / getTotalCount()) * 100)}%</div>
                <div className="text-xs text-purple-700 dark:text-purple-400">Complete</div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                <Filter className="w-4 h-4" />
                Filter:
              </div>
              <select
                value={achievementFilter}
                onChange={(e) => setAchievementFilter(e.target.value)}
                className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <option key={key} value={key}>{info.icon} {info.label}</option>
                ))}
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnlockedOnly}
                  onChange={(e) => setShowUnlockedOnly(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Unlocked only
              </label>
            </div>

            {/* Category Headers with Achievements */}
            {achievementFilter === 'all' ? (
              Object.entries(CATEGORY_INFO).map(([category, info]) => {
                const categoryAchievements = getFilteredAchievements().filter(a => a.category === category);
                if (categoryAchievements.length === 0) return null;
                
                return (
                  <div key={category} className="space-y-3">
                    <h4 className={`font-medium text-sm flex items-center gap-2 ${info.color}`}>
                      <span>{info.icon}</span>
                      {info.label}
                      <span className="text-gray-400 font-normal">
                        ({categoryAchievements.filter(a => unlockedAchievements.some(u => u.achievementId === a.id)).length}/{categoryAchievements.length})
                      </span>
                    </h4>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {categoryAchievements.map(achievement => {
                        const progress = getAchievementProgress(achievement.id);
                        if (!progress) return null;
                        return (
                          <MrDoodyAchievementBadge
                            key={achievement.id}
                            achievement={achievement}
                            progress={progress}
                            size="md"
                            showDetails={true}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {getFilteredAchievements().map(achievement => {
                  const progress = getAchievementProgress(achievement.id);
                  if (!progress) return null;
                  return (
                    <MrDoodyAchievementBadge
                      key={achievement.id}
                      achievement={achievement}
                      progress={progress}
                      size="md"
                      showDetails={true}
                    />
                  );
                })}
              </div>
            )}

            {/* Rarity Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Achievement Rarity</div>
              <div className="flex flex-wrap gap-2">
                {(['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const).map((rarity) => (
                  <div 
                    key={rarity}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getAchievementRarityBgColor(rarity)} ${getAchievementRarityColor(rarity)}`}
                  >
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : viewMode === 'rewards' ? (
          // Rewards View
          <RewardsInventory 
            onEquipChange={() => setEquippedItemsVersion(v => v + 1)}
          />
        ) : null}

      </div>

      {/* New Achievement Modal */}
      {showNewAchievementModal && newAchievements.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-bounce">
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Achievement Unlocked!
              </h3>
              <div className="space-y-3 mb-4">
                {newAchievements.map(notification => (
                  <div 
                    key={notification.achievement.id}
                    className={`p-3 rounded-xl ${getAchievementRarityBgColor(notification.achievement.rarity)} border ${getRarityBorderColor(notification.achievement.rarity as any)}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{notification.achievement.icon}</span>
                      <div className="text-left">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {notification.achievement.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {notification.achievement.description}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => {
                  setShowNewAchievementModal(false);
                  clearAllNewAchievements();
                }}
                className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
              >
                Awesome!
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Card Modal */}
      {showGiftCard && (
        <MrDoodyGiftCard 
          onClose={() => setShowGiftCard(false)}
          claimed={true}
          variant="modal"
        />
      )}

      {/* Mini Game Modal */}
      {showMiniGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto">
            <MrDoodyMiniGame 
              onClose={() => setShowMiniGame(false)}
              onScoreUpdate={(score) => handleMiniGameScore(score, 'challenge')}
            />
          </div>
        </div>
      )}

      {/* Share Your Look Modal */}
      {showShareLook && selectedCharacter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <ShareYourLook
            characterId={selectedCharacter.id}
            equippedItems={equippedItems}
            playerName={localStorage.getItem('playerName') || 'Anonymous'}
            onClose={() => setShowShareLook(false)}
          />
        </div>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MrDoodyCollection;
