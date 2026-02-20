import React, { useState } from 'react';
import { Achievement, ACHIEVEMENT_ICONS } from '@/types/stats';
import { 
  Lock, Trophy, Crown, Star, Gamepad2, Medal, Gem, Flame, Zap, Shield,
  Wine, Heart, Target, Grid3X3, Dice5, Waves, Leaf, Layers, PartyPopper, Award
} from 'lucide-react';

interface Props {
  achievements: Achievement[];
  achievementProgress?: {
    unlocked: number;
    total: number;
    percentage: number;
    points: number;
    maxPoints: number;
  };
}

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  trophy: Trophy,
  crown: Crown,
  star: Star,
  gamepad: Gamepad2,
  medal: Medal,
  gem: Gem,
  flame: Flame,
  zap: Zap,
  shield: Shield,
  beer: Wine,
  party: PartyPopper,
  bottle: Wine,
  liver: Heart,
  target: Target,
  grid: Grid3X3,
  dice: Dice5,
  paddle: Waves,
  peace: Leaf,
  cards: Layers,
  award: Award
};

const categoryInfo: Record<string, { name: string; color: string; bgColor: string }> = {
  milestones: { name: 'Milestones', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  streaks: { name: 'Win Streaks', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
  drinking: { name: 'Drinking Games', color: 'text-amber-600', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
  scores: { name: 'High Scores', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
  games: { name: 'Game Masters', color: 'text-emerald-600', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' }
};

const rarityColors: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  common: { border: 'border-gray-300', bg: 'bg-gray-100', text: 'text-gray-600', glow: '' },
  rare: { border: 'border-blue-400', bg: 'bg-blue-100', text: 'text-blue-600', glow: 'shadow-blue-200' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-100', text: 'text-purple-600', glow: 'shadow-purple-300' },
  legendary: { border: 'border-amber-500', bg: 'bg-gradient-to-br from-amber-100 to-yellow-100', text: 'text-amber-600', glow: 'shadow-amber-300 shadow-lg' }
};

const AchievementsList: React.FC<Props> = ({ achievements, achievementProgress }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUnlocked, setShowUnlocked] = useState(true);
  
  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  // Group by category
  const categories = achievements.reduce((acc, a) => {
    if (!acc[a.category]) acc[a.category] = [];
    acc[a.category].push(a);
    return acc;
  }, {} as Record<string, Achievement[]>);

  const filteredAchievements = selectedCategory 
    ? achievements.filter(a => a.category === selectedCategory)
    : achievements;

  const displayedAchievements = showUnlocked 
    ? filteredAchievements.filter(a => a.unlocked)
    : filteredAchievements.filter(a => !a.unlocked);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Trophy;
    return IconComponent;
  };

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Achievements</h3>
            <p className="text-purple-200">
              {achievementProgress?.unlocked || unlocked.length} / {achievementProgress?.total || achievements.length} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{achievementProgress?.points || 0}</div>
            <div className="text-purple-200 text-sm">Achievement Points</div>
          </div>
        </div>
        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-500"
            style={{ width: `${achievementProgress?.percentage || (unlocked.length / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedCategory === null 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All ({achievements.length})
        </button>
        {Object.entries(categoryInfo).map(([key, info]) => {
          const count = categories[key]?.length || 0;
          if (count === 0) return null;
          
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedCategory === key 
                  ? 'bg-purple-600 text-white' 
                  : `${info.bgColor} ${info.color} hover:opacity-80`
              }`}
            >
              {info.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Toggle Unlocked/Locked */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowUnlocked(true)}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            showUnlocked 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Unlocked ({(selectedCategory ? filteredAchievements : achievements).filter(a => a.unlocked).length})
        </button>
        <button
          onClick={() => setShowUnlocked(false)}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            !showUnlocked 
              ? 'bg-gray-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Locked ({(selectedCategory ? filteredAchievements : achievements).filter(a => !a.unlocked).length})
        </button>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayedAchievements.map(achievement => {
          const Icon = getIcon(achievement.icon);
          const rarity = rarityColors[achievement.rarity] || rarityColors.common;
          const catInfo = categoryInfo[achievement.category] || { name: 'Other', color: 'text-gray-600', bgColor: 'bg-gray-100' };
          
          return (
            <div 
              key={achievement.id || achievement.achievement_id} 
              className={`relative rounded-xl p-4 border-2 transition-all hover:scale-105 ${
                achievement.unlocked 
                  ? `${rarity.border} ${rarity.bg} ${rarity.glow}` 
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
              }`}
            >
              {/* Rarity Badge */}
              <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                achievement.unlocked ? `${rarity.bg} ${rarity.text}` : 'bg-gray-200 text-gray-500'
              }`}>
                {achievement.rarity}
              </div>
              
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                achievement.unlocked 
                  ? `bg-gradient-to-br from-purple-500 to-pink-500 text-white` 
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {achievement.unlocked ? (
                  <Icon className="w-8 h-8" />
                ) : (
                  <Lock className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              {/* Content */}
              <div className="text-center">
                <h4 className={`font-bold ${achievement.unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                  {achievement.name}
                </h4>
                <p className={`text-sm mt-1 ${achievement.unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400'}`}>
                  {achievement.description}
                </p>
                
                {/* Points */}
                <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  achievement.unlocked ? `${catInfo.bgColor} ${catInfo.color}` : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                }`}>
                  <Star className="w-3 h-3" />
                  {achievement.points} pts
                </div>
                
                {/* Unlock Date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <div className="text-xs text-purple-500 mt-2">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {displayedAchievements.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {showUnlocked ? 'No achievements unlocked yet' : 'All achievements in this category are unlocked!'}
          </p>
          <p className="text-sm mt-1">
            {showUnlocked ? 'Keep playing to earn achievements!' : 'Great job!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementsList;
