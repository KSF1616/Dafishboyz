import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Share2, Download, Copy, Check, X, Heart, Eye, ExternalLink,
  Twitter, Facebook, MessageCircle, RefreshCw, Sparkles, Users,
  ChevronLeft, ChevronRight, Star, Trophy, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import MrDoody from '@/components/MrDoody';
import CollectibleCharacter from '@/components/CollectibleCharacter';
import { EquippedItems } from '@/types/rewards';
import { SharedLook } from '@/types/shareLook';
import { CollectibleCharacter as CharacterType, CharacterMood } from '@/types/collectibles';
import { getCharacterById } from '@/data/collectibleCharacters';
import { supabase } from '@/lib/supabase';

interface ShareYourLookProps {
  characterId: string;
  equippedItems: EquippedItems;
  playerName?: string;
  onClose?: () => void;
}

const ShareYourLook: React.FC<ShareYourLookProps> = ({
  characterId,
  equippedItems,
  playerName = 'Anonymous',
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'share' | 'gallery'>('share');
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [communityLooks, setCommunityLooks] = useState<SharedLook[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [selectedLook, setSelectedLook] = useState<SharedLook | null>(null);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'featured'>('recent');
  const [likedLooks, setLikedLooks] = useState<Set<string>>(new Set());
  const [editName, setEditName] = useState(playerName);
  const characterRef = useRef<HTMLDivElement>(null);

  const character = getCharacterById(characterId);

  // Generate unique share code
  const generateShareCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // Share the look
  const handleShareLook = async () => {
    setIsGenerating(true);
    try {
      const code = generateShareCode();
      
      const { data, error } = await supabase
        .from('shared_looks')
        .insert({
          player_name: editName || 'Anonymous',
          character_id: characterId,
          equipped_items: equippedItems,
          share_code: code
        })
        .select()
        .single();

      if (error) throw error;
      
      setShareCode(code);
    } catch (err) {
      console.error('Error sharing look:', err);
      // Generate local code if DB fails
      setShareCode(generateShareCode());
    } finally {
      setIsGenerating(false);
    }
  };

  // Load community gallery
  const loadCommunityGallery = useCallback(async () => {
    setLoadingGallery(true);
    try {
      let query = supabase
        .from('shared_looks')
        .select('*')
        .limit(20);

      if (sortBy === 'recent') {
        query = query.order('created_at', { ascending: false });
      } else if (sortBy === 'popular') {
        query = query.order('likes_count', { ascending: false });
      } else if (sortBy === 'featured') {
        query = query.eq('featured', true).order('likes_count', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setCommunityLooks(data || []);
    } catch (err) {
      console.error('Error loading gallery:', err);
      // Load mock data if DB fails
      setCommunityLooks(getMockCommunityLooks());
    } finally {
      setLoadingGallery(false);
    }
  }, [sortBy]);

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadCommunityGallery();
    }
  }, [activeTab, sortBy, loadCommunityGallery]);

  // Load liked looks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('likedLooks');
    if (saved) {
      setLikedLooks(new Set(JSON.parse(saved)));
    }
  }, []);

  // Like a look
  const handleLike = async (lookId: string) => {
    const newLiked = new Set(likedLooks);
    if (newLiked.has(lookId)) {
      newLiked.delete(lookId);
    } else {
      newLiked.add(lookId);
    }
    setLikedLooks(newLiked);
    localStorage.setItem('likedLooks', JSON.stringify([...newLiked]));

    // Update in database
    try {
      const increment = newLiked.has(lookId) ? 1 : -1;
      await supabase.rpc('increment_likes', { look_id: lookId, amount: increment });
    } catch (err) {
      console.error('Error updating likes:', err);
    }
  };

  // Copy share link
  const copyShareLink = () => {
    const url = `${window.location.origin}/look/${shareCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download character image
  const downloadImage = async () => {
    if (!characterRef.current) return;

    try {
      // Create a canvas and draw the SVG
      const svg = characterRef.current.querySelector('svg');
      if (!svg) return;

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      canvas.width = 480;
      canvas.height = 720;

      img.onload = () => {
        if (ctx) {
          // Add background
          ctx.fillStyle = '#1a1a2e';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw character centered
          ctx.drawImage(img, 120, 100, 240, 360);
          
          // Add watermark
          ctx.fillStyle = '#ffffff';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Let That Shit Go!', canvas.width / 2, canvas.height - 40);
          ctx.font = '12px Arial';
          ctx.fillText(`@${editName}`, canvas.width / 2, canvas.height - 20);

          // Download
          const link = document.createElement('a');
          link.download = `my-pocket-hug-${shareCode || 'character'}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  // Social share URLs
  const getShareUrl = () => `${window.location.origin}/look/${shareCode}`;
  const getShareText = () => `Check out my customized Pocket Hug character! 🎉 #LetThatShitGo #PocketHug`;

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareText())}&url=${encodeURIComponent(getShareUrl())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}&quote=${encodeURIComponent(getShareText())}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToDiscord = () => {
    // Copy formatted message for Discord
    const message = `${getShareText()}\n${getShareUrl()}`;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mock community looks for fallback
  const getMockCommunityLooks = (): SharedLook[] => [
    {
      id: '1',
      player_name: 'HugMaster2000',
      character_id: 'mr-doody',
      equipped_items: { headAccessory: 'golden-crown', faceAccessory: 'cool-sunglasses', bodyAccessory: 'superhero-cape' },
      share_code: 'ABCD1234',
      likes_count: 42,
      views_count: 156,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      player_name: 'DanceQueen',
      character_id: 'mr-doody',
      equipped_items: { headAccessory: 'party-hat', neckAccessory: 'gold-chain', activeDance: 'disco-fever' },
      share_code: 'EFGH5678',
      likes_count: 38,
      views_count: 120,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '3',
      player_name: 'WizardPoop',
      character_id: 'mr-doody',
      equipped_items: { headAccessory: 'wizard-hat', handAccessory: 'magic-wand', activeTheme: 'theme-galaxy' },
      share_code: 'IJKL9012',
      likes_count: 55,
      views_count: 200,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '4',
      player_name: 'AngelBuddy',
      character_id: 'mr-doody',
      equipped_items: { headAccessory: 'halo', bodyAccessory: 'angel-wings', activeTheme: 'theme-golden' },
      share_code: 'MNOP3456',
      likes_count: 67,
      views_count: 245,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '5',
      player_name: 'RainbowFan',
      character_id: 'mr-doody',
      equipped_items: { faceAccessory: 'rainbow-glasses', neckAccessory: 'rainbow-scarf', activeTheme: 'theme-rainbow' },
      share_code: 'QRST7890',
      likes_count: 89,
      views_count: 312,
      featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '6',
      player_name: 'FancyPants',
      character_id: 'mr-doody',
      equipped_items: { headAccessory: 'top-hat', faceAccessory: 'monocle-fancy', neckAccessory: 'red-bowtie' },
      share_code: 'UVWX1234',
      likes_count: 34,
      views_count: 98,
      featured: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const renderCharacter = (charId: string, items: EquippedItems, size: 'sm' | 'md' | 'lg' | 'xl' = 'xl') => {
    const char = getCharacterById(charId);
    if (charId === 'mr-doody' || !char) {
      return (
        <MrDoody
          size={size}
          animated={true}
          interactive={false}
          mood="happy"
          isDancing={false}
          equippedItems={items}
        />
      );
    }
    return (
      <CollectibleCharacter
        character={char}
        size={size}
        animated={true}
        interactive={false}
        mood="happy"
        isDancing={false}
        equippedItems={items}
      />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Share Your Look
          </h2>
          {onClose && (
            <button onClick={onClose} className="text-white/80 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('share')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'share'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-1" />
            Share
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTab === 'gallery'
                ? 'bg-white text-purple-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            <Users className="w-4 h-4 inline mr-1" />
            Community Gallery
          </button>
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'share' ? (
          <div className="space-y-6">
            {/* Character Preview */}
            <div className="flex flex-col items-center">
              <div 
                ref={characterRef}
                className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-8 shadow-inner"
              >
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs">
                  <Sparkles className="w-3 h-3" />
                  Preview
                </div>
                {renderCharacter(characterId, equippedItems)}
              </div>
              
              {/* Name Input */}
              <div className="mt-4 w-full max-w-xs">
                <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  maxLength={20}
                />
              </div>
            </div>

            {/* Share Actions */}
            {!shareCode ? (
              <Button
                onClick={handleShareLook}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Share2 className="w-5 h-5 mr-2" />
                    Generate Share Link
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                {/* Share Link */}
                <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Share Code</span>
                    <span className="text-lg font-mono font-bold text-purple-600">{shareCode}</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/look/${shareCode}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                    />
                    <Button
                      onClick={copyShareLink}
                      variant="outline"
                      className="shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Social Share Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={shareToTwitter}
                    className="bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white"
                  >
                    <Twitter className="w-5 h-5 mr-1" />
                    Twitter
                  </Button>
                  <Button
                    onClick={shareToFacebook}
                    className="bg-[#4267B2] hover:bg-[#365899] text-white"
                  >
                    <Facebook className="w-5 h-5 mr-1" />
                    Facebook
                  </Button>
                  <Button
                    onClick={shareToDiscord}
                    className="bg-[#5865F2] hover:bg-[#4752c4] text-white"
                  >
                    <MessageCircle className="w-5 h-5 mr-1" />
                    Discord
                  </Button>
                </div>

                {/* Download Button */}
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="w-full border-purple-400 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Save Image to Device
                </Button>
              </div>
            )}

            {/* Equipped Items Summary */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Equipped Items</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(equippedItems).filter(([_, v]) => v).length === 0 ? (
                  <span className="text-gray-400 text-sm italic">No items equipped</span>
                ) : (
                  Object.entries(equippedItems)
                    .filter(([_, value]) => value)
                    .map(([slot, itemId]) => (
                      <span
                        key={slot}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                      >
                        {slot.replace(/([A-Z])/g, ' $1').replace('Accessory', '').trim()}: {itemId}
                      </span>
                    ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Community Gallery */
          <div className="space-y-4">
            {/* Sort Options */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 dark:text-white">Community Looks</h3>
              <div className="flex gap-2">
                {(['recent', 'popular', 'featured'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      sortBy === option
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option === 'featured' && <Star className="w-3 h-3 inline mr-1" />}
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Gallery Grid */}
            {loadingGallery ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {communityLooks.map((look) => (
                  <div
                    key={look.id}
                    onClick={() => setSelectedLook(look)}
                    className="relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all group"
                  >
                    {look.featured && (
                      <div className="absolute top-1 left-1 bg-yellow-500 text-white p-1 rounded-full">
                        <Crown className="w-3 h-3" />
                      </div>
                    )}
                    
                    <div className="flex justify-center mb-2">
                      {renderCharacter(look.character_id, look.equipped_items as EquippedItems, 'sm')}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {look.player_name}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Heart className={`w-3 h-3 ${likedLooks.has(look.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          {look.likes_count + (likedLooks.has(look.id) ? 1 : 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {look.views_count}
                        </span>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">View Details</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Refresh Button */}
            <Button
              onClick={loadCommunityGallery}
              variant="outline"
              className="w-full"
              disabled={loadingGallery}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingGallery ? 'animate-spin' : ''}`} />
              Refresh Gallery
            </Button>
          </div>
        )}
      </div>

      {/* Look Detail Modal */}
      {selectedLook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedLook(null)}>
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{selectedLook.player_name}'s Look</h3>
              <button onClick={() => setSelectedLook(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex justify-center mb-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4">
              {renderCharacter(selectedLook.character_id, selectedLook.equipped_items as EquippedItems, 'lg')}
            </div>

            <div className="flex items-center justify-center gap-6 mb-4">
              <button
                onClick={() => handleLike(selectedLook.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                  likedLooks.has(selectedLook.id)
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-5 h-5 ${likedLooks.has(selectedLook.id) ? 'fill-current' : ''}`} />
                {selectedLook.likes_count + (likedLooks.has(selectedLook.id) ? 1 : 0)}
              </button>
              <div className="flex items-center gap-2 text-gray-500">
                <Eye className="w-5 h-5" />
                {selectedLook.views_count} views
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Share Code</p>
              <p className="font-mono font-bold text-purple-600">{selectedLook.share_code}</p>
            </div>

            <Button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/look/${selectedLook.share_code}`);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy Share Link'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareYourLook;
