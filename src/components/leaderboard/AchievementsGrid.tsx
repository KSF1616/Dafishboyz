import { Achievement, PlayerAchievement } from '@/types/leaderboard';
import { AchievementBadge } from './AchievementBadge';

interface AchievementsGridProps {
  achievements: Achievement[];
  earnedAchievements: PlayerAchievement[];
  filter: 'all' | 'earned' | 'locked';
}

export function AchievementsGrid({ achievements, earnedAchievements, filter }: AchievementsGridProps) {
  const earnedIds = new Set(earnedAchievements.map(ea => ea.achievement_id));
  
  const filteredAchievements = achievements.filter(a => {
    if (filter === 'earned') return earnedIds.has(a.id);
    if (filter === 'locked') return !earnedIds.has(a.id);
    return true;
  });

  const groupedByRarity = {
    legendary: filteredAchievements.filter(a => a.rarity === 'legendary'),
    epic: filteredAchievements.filter(a => a.rarity === 'epic'),
    rare: filteredAchievements.filter(a => a.rarity === 'rare'),
    common: filteredAchievements.filter(a => a.rarity === 'common'),
  };

  const rarityLabels = {
    legendary: { label: 'Legendary', color: 'text-yellow-400' },
    epic: { label: 'Epic', color: 'text-purple-400' },
    rare: { label: 'Rare', color: 'text-blue-400' },
    common: { label: 'Common', color: 'text-gray-400' },
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedByRarity).map(([rarity, items]) => items.length > 0 && (
        <div key={rarity}>
          <h3 className={`text-lg font-semibold mb-4 ${rarityLabels[rarity as keyof typeof rarityLabels].color}`}>
            {rarityLabels[rarity as keyof typeof rarityLabels].label} ({items.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {items.map(achievement => {
              const earned = earnedAchievements.find(ea => ea.achievement_id === achievement.id);
              return (
                <div key={achievement.id} className="flex flex-col items-center gap-2">
                  <AchievementBadge 
                    achievement={achievement} 
                    earned={!!earned}
                    earnedAt={earned?.earned_at}
                    size="md"
                  />
                  <p className="text-xs text-gray-400 text-center truncate w-full">{achievement.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {filteredAchievements.length === 0 && (
        <p className="text-center text-gray-500 py-8">No achievements found</p>
      )}
    </div>
  );
}
