import { Achievement } from '@/types/leaderboard';
import { Trophy, Star, Medal, Crown, Gem, Flame, Zap, Target, Gamepad2, Coins, Diamond } from 'lucide-react';

interface AchievementBadgeProps {
  achievement: Achievement;
  earned?: boolean;
  earnedAt?: string;
  size?: 'sm' | 'md' | 'lg';
}

const iconMap: Record<string, any> = {
  trophy: Trophy, star: Star, medal: Medal, crown: Crown, gem: Gem,
  flame: Flame, fire: Flame, zap: Zap, target: Target, gamepad: Gamepad2,
  joystick: Gamepad2, coins: Coins, diamond: Diamond
};

const rarityColors: Record<string, string> = {
  common: 'from-gray-400 to-gray-600 border-gray-500',
  rare: 'from-blue-400 to-blue-600 border-blue-500',
  epic: 'from-purple-400 to-purple-600 border-purple-500',
  legendary: 'from-yellow-400 to-orange-500 border-yellow-500'
};

const rarityGlow: Record<string, string> = {
  common: '', rare: 'shadow-blue-500/30',
  epic: 'shadow-purple-500/50', legendary: 'shadow-yellow-500/50 animate-pulse'
};

export function AchievementBadge({ achievement, earned = true, earnedAt, size = 'md' }: AchievementBadgeProps) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const sizeClasses = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-20 h-20' };
  const iconSizes = { sm: 20, md: 28, lg: 36 };

  return (
    <div className={`relative group ${!earned ? 'opacity-40 grayscale' : ''}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${rarityColors[achievement.rarity]} 
        border-2 flex items-center justify-center shadow-lg ${earned ? rarityGlow[achievement.rarity] : ''}`}>
        <Icon size={iconSizes[size]} className="text-white drop-shadow-md" />
      </div>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 rounded-lg 
        opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[160px]">
        <p className="text-white font-semibold text-sm">{achievement.name}</p>
        <p className="text-gray-400 text-xs">{achievement.description}</p>
        <p className="text-yellow-400 text-xs mt-1">+{achievement.points} pts</p>
        {earnedAt && <p className="text-gray-500 text-xs">{new Date(earnedAt).toLocaleDateString()}</p>}
      </div>
    </div>
  );
}
