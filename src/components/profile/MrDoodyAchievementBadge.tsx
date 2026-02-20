import React, { useState } from 'react';
import { MrDoodyAchievement, AchievementProgress } from '@/types/mrDoodyAchievements';
import { 
  getRarityColor, 
  getRarityBgColor, 
  getRarityBorderColor,
  getRarityGradient 
} from '@/data/mrDoodyAchievements';
import { Lock, Check, Clock, Star } from 'lucide-react';

interface MrDoodyAchievementBadgeProps {
  achievement: MrDoodyAchievement;
  progress: AchievementProgress;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onClick?: () => void;
}

const MrDoodyAchievementBadge: React.FC<MrDoodyAchievementBadgeProps> = ({
  achievement,
  progress,
  size = 'md',
  showDetails = false,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  };
  
  const iconSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`relative ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge Container */}
      <div 
        className={`
          ${sizeClasses[size]} 
          rounded-full 
          flex items-center justify-center 
          transition-all duration-300
          ${progress.isUnlocked 
            ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)} shadow-lg ${isHovered ? 'scale-110 shadow-xl' : ''}` 
            : 'bg-gray-200 dark:bg-gray-700'
          }
          ${progress.isUnlocked ? getRarityBorderColor(achievement.rarity) : 'border-gray-300 dark:border-gray-600'}
          border-2
        `}
      >
        {progress.isUnlocked ? (
          <span className={`${iconSizes[size]} drop-shadow-md`}>
            {achievement.icon}
          </span>
        ) : achievement.secret && progress.percentage < 50 ? (
          <span className={`${iconSizes[size]} text-gray-400`}>?</span>
        ) : (
          <Lock className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6'} text-gray-400`} />
        )}
        
        {/* Progress ring for locked achievements */}
        {!progress.isUnlocked && progress.percentage > 0 && (
          <svg 
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-300 dark:text-gray-600"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray={`${progress.percentage * 2.89} 289`}
              className={getRarityColor(achievement.rarity)}
              strokeLinecap="round"
            />
          </svg>
        )}
        
        {/* Unlocked checkmark */}
        {progress.isUnlocked && (
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
            <Check className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      {/* Details section */}
      {showDetails && (
        <div className="mt-2 text-center">
          <h4 className={`font-medium text-sm ${progress.isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
            {achievement.secret && !progress.isUnlocked && progress.percentage < 50 
              ? '???' 
              : achievement.name
            }
          </h4>
          
          {progress.isUnlocked ? (
            <div className="flex items-center justify-center gap-1 text-xs text-green-600 dark:text-green-400 mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatDate(progress.unlockedAt!)}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 mt-1">
              {progress.currentProgress}/{progress.targetProgress}
            </div>
          )}
        </div>
      )}
      
      {/* Hover tooltip */}
      {isHovered && !showDetails && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 pointer-events-none">
          <div className={`
            bg-white dark:bg-gray-800 
            rounded-xl shadow-xl 
            p-4 
            border-2 
            ${progress.isUnlocked ? getRarityBorderColor(achievement.rarity) : 'border-gray-200 dark:border-gray-700'}
          `}>
            {/* Header */}
            <div className="flex items-start gap-3 mb-2">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${progress.isUnlocked 
                  ? `bg-gradient-to-br ${getRarityGradient(achievement.rarity)}` 
                  : 'bg-gray-200 dark:bg-gray-700'
                }
              `}>
                <span className="text-xl">
                  {achievement.secret && !progress.isUnlocked ? '?' : achievement.icon}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {achievement.secret && !progress.isUnlocked && progress.percentage < 50 
                    ? 'Secret Achievement' 
                    : achievement.name
                  }
                </h4>
                <div className={`flex items-center gap-1 text-xs ${getRarityColor(achievement.rarity)}`}>
                  <Star className="w-3 h-3" />
                  <span className="capitalize">{achievement.rarity}</span>
                </div>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              {achievement.secret && !progress.isUnlocked && progress.percentage < 50
                ? 'Complete a secret action to unlock this achievement!'
                : achievement.description
              }
            </p>
            
            {/* Progress */}
            {!progress.isUnlocked && (
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress.percentage)}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full bg-gradient-to-r ${getRarityGradient(achievement.rarity)}`}
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-400 mt-1 text-center">
                  {progress.currentProgress} / {progress.targetProgress}
                </div>
              </div>
            )}
            
            {/* Unlock date */}
            {progress.isUnlocked && progress.unlockedAt && (
              <div className="flex items-center justify-between text-xs bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                <span className="text-green-700 dark:text-green-400 font-medium">Unlocked!</span>
                <span className="text-green-600 dark:text-green-500">
                  {formatDate(progress.unlockedAt)} at {formatTime(progress.unlockedAt)}
                </span>
              </div>
            )}
            
            {/* Reward */}
            {achievement.reward && progress.isUnlocked && (
              <div className="mt-2 flex items-center gap-2 text-xs bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                <span className="text-purple-600 dark:text-purple-400">Reward:</span>
                <span className="text-purple-700 dark:text-purple-300">{achievement.reward.description}</span>
              </div>
            )}
            
            {/* Arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-gray-800 rotate-45 border-r-2 border-b-2 border-gray-200 dark:border-gray-700" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MrDoodyAchievementBadge;
