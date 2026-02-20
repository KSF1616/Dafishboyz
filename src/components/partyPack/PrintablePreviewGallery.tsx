import React, { useState } from 'react';
import { 
  X, Printer, Download, Eye, ZoomIn, 
  FileText, Mail, Users, Gift, Sparkles,
  Star, Trophy, Crown, PartyPopper, Music,
  Calendar, Clock, MapPin, Phone, Heart, Zap,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { PartyPackTheme, partyPackThemes, challengeCards } from '@/types/partyPack';

interface PrintablePreviewGalleryProps {
  selectedTheme: PartyPackTheme;
  onSelectItem: (type: string, subType?: string) => void;
}

interface PreviewItem {
  id: string;
  title: string;
  description: string;
  category: 'scorecards' | 'invitations' | 'nametags' | 'decorations' | 'challenges';
  subType?: string;
  icon: React.ReactNode;
  previewBg: string;
}

// Poop SVG Icon Component for thumbnails
const PoopIcon: React.FC<{ className?: string; color?: string }> = ({ className = "w-8 h-8", color = "#92400e" }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 4C28 4 24 8 24 12C24 14 25 16 27 17C23 18 20 22 20 26C20 28 21 30 23 32C18 33 14 38 14 44C14 52 22 58 32 58C42 58 50 52 50 44C50 38 46 33 41 32C43 30 44 28 44 26C44 22 41 18 37 17C39 16 40 14 40 12C40 8 36 4 32 4Z" fill={color}/>
    <ellipse cx="24" cy="42" rx="4" ry="5" fill="white"/>
    <ellipse cx="40" cy="42" rx="4" ry="5" fill="white"/>
    <circle cx="24" cy="43" r="2" fill="#1f2937"/>
    <circle cx="40" cy="43" r="2" fill="#1f2937"/>
    <path d="M28 50C28 50 32 54 36 50" stroke="#1f2937" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PrintablePreviewGallery: React.FC<PrintablePreviewGalleryProps> = ({ 
  selectedTheme, 
  onSelectItem 
}) => {
  const [selectedPreview, setSelectedPreview] = useState<PreviewItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Items', icon: Eye, count: 12 },
    { id: 'invitations', label: 'Invitations', icon: Mail, count: 5 },
    { id: 'scorecards', label: 'Scorecards', icon: FileText, count: 1 },
    { id: 'nametags', label: 'Name Tags', icon: Users, count: 1 },
    { id: 'decorations', label: 'Decorations', icon: Gift, count: 4 },
    { id: 'challenges', label: 'Challenge Cards', icon: Sparkles, count: 1 },
  ];

  const previewItems: PreviewItem[] = [
    // Invitations
    {
      id: 'inv-classic',
      title: 'Classic Poop Party',
      description: 'The original poop emoji theme invitation',
      category: 'invitations',
      subType: 'classic-poop',
      icon: <span className="text-2xl">💩</span>,
      previewBg: 'from-amber-100 to-yellow-100'
    },
    {
      id: 'inv-rainbow',
      title: 'Rainbow Splash',
      description: 'Colorful unicorn poop vibes',
      category: 'invitations',
      subType: 'rainbow-splash',
      icon: <span className="text-2xl">🌈</span>,
      previewBg: 'from-pink-100 to-purple-100'
    },
    {
      id: 'inv-golden',
      title: 'Golden Throne',
      description: 'Royal and fancy party style',
      category: 'invitations',
      subType: 'golden-throne',
      icon: <Crown className="w-6 h-6 text-yellow-600" />,
      previewBg: 'from-yellow-100 to-amber-100'
    },
    {
      id: 'inv-neon',
      title: 'Neon Party',
      description: 'Bright and electric vibes',
      category: 'invitations',
      subType: 'neon-party',
      icon: <Zap className="w-6 h-6 text-emerald-500" />,
      previewBg: 'from-emerald-100 to-blue-100'
    },
    {
      id: 'inv-kawaii',
      title: 'Cute Kawaii',
      description: 'Adorable Japanese style',
      category: 'invitations',
      subType: 'cute-kawaii',
      icon: <Heart className="w-6 h-6 text-pink-500" />,
      previewBg: 'from-pink-100 to-rose-100'
    },
    // Scorecards
    {
      id: 'scorecard',
      title: 'Game Scorecard',
      description: 'Track scores for Drop & Chase and Hot Poo modes',
      category: 'scorecards',
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      previewBg: 'from-purple-100 to-pink-100'
    },
    // Name Tags
    {
      id: 'nametags',
      title: 'Party Name Tags',
      description: '8 name tags per sheet with themed designs',
      category: 'nametags',
      icon: <Users className="w-6 h-6 text-green-500" />,
      previewBg: 'from-green-100 to-teal-100'
    },
    // Decorations
    {
      id: 'dec-door',
      title: 'Door Sign',
      description: 'Welcome sign for the party entrance',
      category: 'decorations',
      subType: 'doorSign',
      icon: <PartyPopper className="w-6 h-6 text-orange-500" />,
      previewBg: 'from-orange-100 to-red-100'
    },
    {
      id: 'dec-banner',
      title: 'Banner Letters',
      description: 'Happy Birthday banner with name option',
      category: 'decorations',
      subType: 'banner',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      previewBg: 'from-yellow-100 to-orange-100'
    },
    {
      id: 'dec-cupcake',
      title: 'Cupcake Toppers',
      description: 'Themed toppers for treats and cupcakes',
      category: 'decorations',
      subType: 'cupcakeToppers',
      icon: <Gift className="w-6 h-6 text-pink-500" />,
      previewBg: 'from-pink-100 to-purple-100'
    },
    {
      id: 'dec-photo',
      title: 'Photo Props',
      description: 'Fun props for photo booth pictures',
      category: 'decorations',
      subType: 'photoProps',
      icon: <Music className="w-6 h-6 text-indigo-500" />,
      previewBg: 'from-indigo-100 to-purple-100'
    },
    // Challenge Cards
    {
      id: 'challenges',
      title: 'Challenge Cards',
      description: '30 bonus challenge cards for extra fun',
      category: 'challenges',
      icon: <Sparkles className="w-6 h-6 text-yellow-500" />,
      previewBg: 'from-amber-100 to-yellow-100'
    },
  ];

  const filteredItems = activeCategory === 'all' 
    ? previewItems 
    : previewItems.filter(item => item.category === activeCategory);

  const handleItemClick = (item: PreviewItem) => {
    setSelectedPreview(item);
  };

  const handlePrintItem = (item: PreviewItem) => {
    onSelectItem(item.category, item.subType);
    setSelectedPreview(null);
  };

  // Render thumbnail preview based on item type
  const renderThumbnailContent = (item: PreviewItem) => {
    switch (item.category) {
      case 'invitations':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-3">
            <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-2 shadow-sm">
              <PoopIcon className="w-8 h-8" color={item.subType === 'classic-poop' ? '#92400e' : item.subType === 'rainbow-splash' ? '#ec4899' : item.subType === 'golden-throne' ? '#b45309' : item.subType === 'neon-party' ? '#10b981' : '#f472b6'} />
            </div>
            <div className="text-center">
              <p className="text-[8px] font-bold text-gray-600 uppercase">You're Invited!</p>
              <p className="text-[10px] font-black text-gray-800">[Name]'s Party</p>
              <div className="mt-1 space-y-0.5">
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="w-2 h-2 text-gray-400" />
                  <span className="text-[6px] text-gray-500">Date</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-2 h-2 text-gray-400" />
                  <span className="text-[6px] text-gray-500">Time</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'scorecards':
        return (
          <div className="w-full h-full p-2">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="w-3 h-3" style={{ color: selectedTheme.primaryColor }} />
              <span className="text-[8px] font-bold" style={{ color: selectedTheme.primaryColor }}>Scorecard</span>
            </div>
            <div className="border rounded" style={{ borderColor: selectedTheme.primaryColor }}>
              <div className="h-2 text-[4px] font-bold text-white px-1 flex items-center" style={{ backgroundColor: selectedTheme.primaryColor }}>
                Player | R1 | R2 | R3 | Total
              </div>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`h-2 border-b flex items-center px-1 ${i % 2 === 0 ? 'bg-gray-50' : ''}`} style={{ borderColor: `${selectedTheme.primaryColor}30` }}>
                  <div className="w-1 h-1 rounded-full mr-1" style={{ backgroundColor: selectedTheme.secondaryColor }} />
                  <div className="flex-1 border-b border-gray-200 h-0.5" />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'nametags':
        return (
          <div className="w-full h-full p-2">
            <div className="grid grid-cols-2 gap-1 h-full">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="rounded border-2 flex flex-col items-center justify-center p-1"
                  style={{ borderColor: selectedTheme.primaryColor, backgroundColor: `${selectedTheme.backgroundColor}` }}
                >
                  <div className="w-3 h-3 rounded-full mb-0.5" style={{ backgroundColor: selectedTheme.primaryColor }}>
                    <Star className="w-3 h-3 text-white p-0.5" />
                  </div>
                  <div className="text-[4px] font-bold px-1 rounded text-white" style={{ backgroundColor: selectedTheme.secondaryColor }}>
                    HELLO
                  </div>
                  <div className="w-full h-1 border-b mt-0.5" style={{ borderColor: selectedTheme.primaryColor }} />
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'decorations':
        if (item.subType === 'doorSign') {
          return (
            <div className="w-full h-full flex items-center justify-center p-2">
              <div 
                className="w-full h-full rounded-lg border-2 flex flex-col items-center justify-center p-2"
                style={{ borderColor: selectedTheme.primaryColor, backgroundColor: selectedTheme.backgroundColor }}
              >
                <Crown className="w-4 h-4 mb-1" style={{ color: selectedTheme.primaryColor }} />
                <p className="text-[6px] font-bold" style={{ color: selectedTheme.primaryColor }}>WELCOME TO</p>
                <div className="px-2 py-0.5 rounded text-white text-[6px] font-bold" style={{ backgroundColor: selectedTheme.primaryColor }}>
                  [Name]'s
                </div>
                <p className="text-[8px] font-black mt-0.5" style={{ color: selectedTheme.secondaryColor }}>PARTY!</p>
              </div>
            </div>
          );
        }
        if (item.subType === 'banner') {
          return (
            <div className="w-full h-full flex items-center justify-center p-2">
              <div className="flex gap-0.5">
                {['H', 'A', 'P', 'P', 'Y'].map((letter, i) => (
                  <div 
                    key={i}
                    className="w-4 h-5 flex items-center justify-center text-white text-[8px] font-black"
                    style={{ 
                      background: `linear-gradient(135deg, ${selectedTheme.primaryColor}, ${selectedTheme.secondaryColor})`,
                      clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)'
                    }}
                  >
                    {letter}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (item.subType === 'cupcakeToppers') {
          return (
            <div className="w-full h-full flex items-center justify-center p-2">
              <div className="grid grid-cols-3 gap-1">
                {[Star, Sparkles, Trophy, PartyPopper, Crown, Gift].map((Icon, i) => (
                  <div 
                    key={i}
                    className="w-5 h-5 rounded-full flex items-center justify-center border"
                    style={{ 
                      backgroundColor: i % 2 === 0 ? selectedTheme.primaryColor : selectedTheme.secondaryColor,
                      borderColor: i % 2 === 0 ? selectedTheme.secondaryColor : selectedTheme.primaryColor
                    }}
                  >
                    <Icon className="w-2.5 h-2.5 text-white" />
                  </div>
                ))}
              </div>
            </div>
          );
        }
        if (item.subType === 'photoProps') {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
              <div 
                className="px-2 py-0.5 rounded text-white text-[6px] font-bold relative"
                style={{ backgroundColor: selectedTheme.primaryColor }}
              >
                DROP IT!
                <div 
                  className="absolute -bottom-1 left-2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent"
                  style={{ borderTopColor: selectedTheme.primaryColor }}
                />
              </div>
              <div className="flex gap-1 mt-1">
                <Star className="w-4 h-4" style={{ color: selectedTheme.accentColor, fill: selectedTheme.accentColor }} />
                <Trophy className="w-4 h-4" style={{ color: selectedTheme.secondaryColor }} />
              </div>
            </div>
          );
        }
        return null;
      
      case 'challenges':
        return (
          <div className="w-full h-full p-2">
            <div className="grid grid-cols-2 gap-1 h-full">
              {['Easy', 'Med', 'Hard', 'Team'].map((diff, i) => (
                <div 
                  key={i}
                  className="rounded border flex flex-col items-center justify-center p-1"
                  style={{ 
                    borderColor: selectedTheme.primaryColor,
                    backgroundColor: i === 0 ? '#dcfce7' : i === 1 ? '#fef9c3' : i === 2 ? '#fee2e2' : '#e0e7ff'
                  }}
                >
                  <Sparkles className="w-3 h-3 mb-0.5" style={{ color: i === 0 ? '#22c55e' : i === 1 ? '#eab308' : i === 2 ? '#ef4444' : '#6366f1' }} />
                  <span className="text-[5px] font-bold text-gray-700">{diff}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeCategory === cat.id ? 'bg-white/20' : 'bg-gray-100'
            }`}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredItems.map(item => (
          <button
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent hover:border-amber-400"
          >
            {/* Thumbnail Preview */}
            <div className={`aspect-[3/4] bg-gradient-to-br ${item.previewBg} relative overflow-hidden`}>
              {renderThumbnailContent(item)}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="bg-white rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                  <ZoomIn className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>
            
            {/* Item Info */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-bold text-sm text-gray-800 truncate">{item.title}</h3>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
            </div>
            
            {/* Category Badge */}
            <div className="absolute top-2 right-2">
              <span className={`text-[10px] font-bold px-2 py-1 rounded-full text-white ${
                item.category === 'invitations' ? 'bg-pink-500' :
                item.category === 'scorecards' ? 'bg-purple-500' :
                item.category === 'nametags' ? 'bg-green-500' :
                item.category === 'decorations' ? 'bg-orange-500' :
                'bg-yellow-500'
              }`}>
                {item.category === 'invitations' ? 'Invite' :
                 item.category === 'scorecards' ? 'Score' :
                 item.category === 'nametags' ? 'Tags' :
                 item.category === 'decorations' ? 'Decor' :
                 'Cards'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedPreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    {selectedPreview.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedPreview.title}</h3>
                    <p className="text-sm text-white/80">{selectedPreview.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6">
              {/* Large Preview */}
              <div className={`aspect-[4/3] bg-gradient-to-br ${selectedPreview.previewBg} rounded-2xl mb-6 flex items-center justify-center overflow-hidden border-2 border-gray-200`}>
                <div className="transform scale-[2] origin-center">
                  {renderThumbnailContent(selectedPreview)}
                </div>
              </div>
              
              {/* Info Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <FileText className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Format</p>
                  <p className="font-bold text-gray-800">8.5" x 11"</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Printer className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Best Paper</p>
                  <p className="font-bold text-gray-800">Card Stock</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 text-center">
                  <Eye className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Theme</p>
                  <p className="font-bold text-gray-800">{selectedTheme.name}</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => handlePrintItem(selectedPreview)}
                  className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  View Full Size & Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintablePreviewGallery;
