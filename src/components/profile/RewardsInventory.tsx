import React, { useState, useMemo } from 'react';
import { 
  REWARDS, 
  getRewardById, 
  getRewardRarityColor, 
  getRewardRarityBgColor,
  getRewardRarityBorderColor,
  getCategoryIcon,
  getSlotIcon
} from '@/data/rewardsData';
import { Reward, RewardCategory, AccessorySlot } from '@/types/rewards';
import { useRewardsInventory } from '@/hooks/useRewardsInventory';
import { Button } from '@/components/ui/button';
import { 
  Package, Star, Check, Lock, Heart, Sparkles, 
  Music, Palette, Shirt, Filter, Search, X, ChevronDown
} from 'lucide-react';

interface RewardsInventoryProps {
  onEquipChange?: () => void;
  className?: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: 'All', icon: Package },
  { id: 'accessory', label: 'Accessories', icon: Shirt },
  { id: 'sound', label: 'Sounds', icon: Music },
  { id: 'dance', label: 'Dances', icon: Sparkles },
  { id: 'theme', label: 'Themes', icon: Palette },
];

const SLOT_FILTERS = [
  { id: 'all', label: 'All Slots' },
  { id: 'head', label: 'Head' },
  { id: 'face', label: 'Face' },
  { id: 'neck', label: 'Neck' },
  { id: 'body', label: 'Body' },
  { id: 'hand', label: 'Hand' },
];

const RewardsInventory: React.FC<RewardsInventoryProps> = ({ onEquipChange, className = '' }) => {
  const {
    inventory,
    newRewards,
    isEquipped,
    isUnlocked,
    isFavorite,
    equipItem,
    unequipItem,
    toggleFavorite,
    getUnlockDate,
    getStats,
    clearAllNewRewards
  } = useRewardsInventory();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [slotFilter, setSlotFilter] = useState<string>('all');
  const [showUnlockedOnly, setShowUnlockedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showNewRewardsModal, setShowNewRewardsModal] = useState(false);

  const stats = getStats();

  // Filter rewards
  const filteredRewards = useMemo(() => {
    let filtered = REWARDS;

    // Category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(r => r.category === activeCategory);
    }

    // Slot filter (for accessories)
    if (slotFilter !== 'all' && activeCategory === 'accessory') {
      filtered = filtered.filter(r => r.slot === slotFilter);
    }

    // Unlocked only filter
    if (showUnlockedOnly) {
      filtered = filtered.filter(r => isUnlocked(r.id));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Sort: unlocked first, then by rarity
    const rarityOrder = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    filtered.sort((a, b) => {
      const aUnlocked = isUnlocked(a.id) ? 0 : 1;
      const bUnlocked = isUnlocked(b.id) ? 0 : 1;
      if (aUnlocked !== bUnlocked) return aUnlocked - bUnlocked;
      return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
    });

    return filtered;
  }, [activeCategory, slotFilter, showUnlockedOnly, searchQuery, isUnlocked]);

  const handleEquip = (reward: Reward) => {
    if (isEquipped(reward.id)) {
      unequipItem(reward.category, reward.slot);
    } else {
      equipItem(reward.id);
    }
    onEquipChange?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            Rewards Inventory
          </h3>
          {newRewards.length > 0 && (
            <button
              onClick={() => setShowNewRewardsModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              {newRewards.length} New!
            </button>
          )}
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-4 text-purple-100 text-sm mt-2">
          <span>{stats.unlocked} / {stats.total} unlocked</span>
          <span>•</span>
          <span>{stats.equipped} equipped</span>
          <span>•</span>
          <span>{stats.favorites} favorites</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {CATEGORY_TABS.map(tab => {
          const Icon = tab.icon;
          const count = tab.id === 'all' 
            ? stats.unlocked 
            : stats.byCategory[tab.id as keyof typeof stats.byCategory] || 0;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                if (tab.id !== 'accessory') setSlotFilter('all');
              }}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors ${
                activeCategory === tab.id
                  ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs text-gray-400">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Slot Filter (for accessories) */}
          {activeCategory === 'accessory' && (
            <select
              value={slotFilter}
              onChange={(e) => setSlotFilter(e.target.value)}
              className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5"
            >
              {SLOT_FILTERS.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.id !== 'all' && getSlotIcon(slot.id)} {slot.label}
                </option>
              ))}
            </select>
          )}

          {/* Unlocked Only Toggle */}
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
      </div>

      {/* Rewards Grid */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {filteredRewards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No rewards found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {filteredRewards.map(reward => {
              const unlocked = isUnlocked(reward.id);
              const equipped = isEquipped(reward.id);
              const favorite = isFavorite(reward.id);
              
              return (
                <div
                  key={reward.id}
                  onClick={() => unlocked && setSelectedReward(reward)}
                  className={`relative rounded-xl p-3 transition-all cursor-pointer ${
                    unlocked
                      ? equipped
                        ? `${getRewardRarityBgColor(reward.rarity)} border-2 ${getRewardRarityBorderColor(reward.rarity)} shadow-lg`
                        : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                      : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 opacity-60'
                  }`}
                >
                  {/* Equipped Badge */}
                  {equipped && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Favorite Badge */}
                  {favorite && (
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center shadow-md">
                      <Heart className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}

                  {/* Lock Icon */}
                  {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                      <Lock className="w-6 h-6 text-gray-400" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className="text-3xl text-center mb-2">{reward.icon}</div>

                  {/* Name */}
                  <div className={`text-xs font-medium text-center truncate ${
                    unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'
                  }`}>
                    {reward.name}
                  </div>

                  {/* Rarity */}
                  <div className={`text-xs text-center mt-1 ${getRewardRarityColor(reward.rarity)}`}>
                    {reward.rarity}
                  </div>

                  {/* Slot indicator for accessories */}
                  {reward.slot && (
                    <div className="text-xs text-center text-gray-400 mt-1">
                      {getSlotIcon(reward.slot)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Reward Detail Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center">
              {/* Icon */}
              <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${getRewardRarityBgColor(selectedReward.rarity)}`}>
                <span className="text-5xl">{selectedReward.icon}</span>
              </div>

              {/* Name & Rarity */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {selectedReward.name}
              </h3>
              <div className={`text-sm font-medium ${getRewardRarityColor(selectedReward.rarity)} mb-2`}>
                {selectedReward.rarity.charAt(0).toUpperCase() + selectedReward.rarity.slice(1)}
              </div>

              {/* Category & Slot */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-3">
                <span>{getCategoryIcon(selectedReward.category)} {selectedReward.category}</span>
                {selectedReward.slot && (
                  <>
                    <span>•</span>
                    <span>{getSlotIcon(selectedReward.slot)} {selectedReward.slot}</span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {selectedReward.description}
              </p>

              {/* Unlock Date */}
              {isUnlocked(selectedReward.id) && (
                <p className="text-xs text-gray-400 mb-4">
                  Unlocked: {formatDate(getUnlockDate(selectedReward.id) || new Date().toISOString())}
                </p>
              )}

              {/* Theme Preview */}
              {selectedReward.themeColors && (
                <div className="flex justify-center gap-2 mb-4">
                  {Object.entries(selectedReward.themeColors).slice(0, 4).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: color }}
                      title={key}
                    />
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => toggleFavorite(selectedReward.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite(selectedReward.id) ? 'fill-pink-500 text-pink-500' : ''}`} />
                  {isFavorite(selectedReward.id) ? 'Unfavorite' : 'Favorite'}
                </Button>
                <Button
                  onClick={() => {
                    handleEquip(selectedReward);
                    setSelectedReward(null);
                  }}
                  className={isEquipped(selectedReward.id) 
                    ? 'flex-1 bg-red-500 hover:bg-red-600' 
                    : 'flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                  }
                >
                  {isEquipped(selectedReward.id) ? 'Unequip' : 'Equip'}
                </Button>
              </div>

              <button
                onClick={() => setSelectedReward(null)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Rewards Modal */}
      {showNewRewardsModal && newRewards.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="text-5xl mb-3">🎁</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                New Rewards Unlocked!
              </h3>
            </div>

            <div className="space-y-3 mb-4">
              {newRewards.map(notification => (
                <div
                  key={notification.reward.id}
                  className={`p-4 rounded-xl ${getRewardRarityBgColor(notification.reward.rarity)} border ${getRewardRarityBorderColor(notification.reward.rarity)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{notification.reward.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {notification.reward.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {notification.reward.description}
                      </div>
                      <div className={`text-xs mt-1 ${getRewardRarityColor(notification.reward.rarity)}`}>
                        {notification.reward.rarity} {notification.reward.category}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setShowNewRewardsModal(false);
                clearAllNewRewards();
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              Awesome!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RewardsInventory;
