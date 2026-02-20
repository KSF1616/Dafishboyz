import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, Mail, Scissors, 
  PartyPopper, FileText, Users, Gift, Sparkles,
  Star, ChevronDown, ChevronUp, Eye, Palette,
  Calendar, MapPin, Phone, Clock, CheckCircle2,
  UtensilsCrossed, Cake, Music, Camera, Trophy,
  Heart, Lightbulb, ShoppingCart, Timer, Bookmark,
  Check, Circle, AlertCircle, Info, Grid3X3, ZoomIn
} from 'lucide-react';
import { partyPackThemes, challengeCards, PartyPackTheme } from '@/types/partyPack';
import PrintableScorecard from '@/components/partyPack/PrintableScorecard';
import PrintableNameTags from '@/components/partyPack/PrintableNameTags';
import PrintableDecorations from '@/components/partyPack/PrintableDecorations';
import PrintableChallengeCards from '@/components/partyPack/PrintableChallengeCards';
import DropADeuceInvitationGenerator from '@/components/partyPack/DropADeuceInvitationGenerator';
import PrintablePreviewGallery from '@/components/partyPack/PrintablePreviewGallery';


type TabType = 'gallery' | 'invitations' | 'scorecards' | 'nametags' | 'decorations' | 'challenges' | 'partyguide';

interface ChecklistItem {
  id: string;
  text: string;
  category: 'planning' | 'decorations' | 'food' | 'activities' | 'dayof';
  daysBeforeParty?: number;
}

const PartyPack: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('gallery');
  const [selectedTheme, setSelectedTheme] = useState<PartyPackTheme>(partyPackThemes[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState<'2hour' | '3hour' | '4hour'>('2hour');
  const [checklistItems, setChecklistItems] = useState<Record<string, boolean>>({});
  const [showPrintableChecklist, setShowPrintableChecklist] = useState(false);
  const [useAdvancedInvitations, setUseAdvancedInvitations] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  // Invitation form state
  const [invitationData, setInvitationData] = useState({
    childName: '',
    partyDate: '',
    partyTime: '',
    location: '',
    rsvpPhone: '',
    rsvpEmail: '',
    specialInstructions: ''
  });

  // Name tags state
  const [guestNames, setGuestNames] = useState<string[]>(['', '', '', '', '', '', '', '']);

  // Decoration type state
  const [decorationType, setDecorationType] = useState<'banner' | 'doorSign' | 'cupcakeToppers' | 'photoProps'>('doorSign');

  // Challenge cards filter
  const [challengeFilter, setChallengeFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const handlePrint = () => {
    window.print();
  };

  const toggleChecklistItem = (id: string) => {
    setChecklistItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Handle gallery item selection
  const handleGalleryItemSelect = (category: string, subType?: string) => {
    if (category === 'invitations') {
      setActiveTab('invitations');
    } else if (category === 'scorecards') {
      setActiveTab('scorecards');
    } else if (category === 'nametags') {
      setActiveTab('nametags');
    } else if (category === 'decorations') {
      if (subType) {
        setDecorationType(subType as typeof decorationType);
      }
      setActiveTab('decorations');
    } else if (category === 'challenges') {
      setActiveTab('challenges');
    }
  };

  const tabs = [
    { id: 'gallery' as TabType, label: 'Preview All', icon: Grid3X3 },
    { id: 'invitations' as TabType, label: 'Invitations', icon: Mail },
    { id: 'scorecards' as TabType, label: 'Scorecards', icon: FileText },
    { id: 'nametags' as TabType, label: 'Name Tags', icon: Users },
    { id: 'decorations' as TabType, label: 'Decorations', icon: Gift },
    { id: 'challenges' as TabType, label: 'Challenge Cards', icon: Sparkles },
    { id: 'partyguide' as TabType, label: 'Party Guide', icon: PartyPopper }
  ];

  const filteredChallengeCards = challengeFilter === 'all' 
    ? challengeCards 
    : challengeCards.filter(c => c.difficulty === challengeFilter);


  // Party Planning Data
  const decorationIdeas = [
    {
      title: 'Poop Emoji Paradise',
      icon: '💩',
      color: 'from-amber-500 to-yellow-600',
      items: [
        'Giant inflatable poop emoji balloons',
        'Brown and gold streamers twisted together',
        'Toilet paper roll garlands',
        'Poop emoji tablecloths and plates',
        'Golden plunger centerpieces (spray paint dollar store plungers!)',
        'Bathroom sign photo booth props'
      ]
    },
    {
      title: 'Rainbow Splash Zone',
      icon: '🌈',
      color: 'from-pink-500 to-purple-600',
      items: [
        'Rainbow balloon arch at entrance',
        'Colorful tissue paper pom poms',
        'Glitter toilet seat decorations',
        'Unicorn poop themed dessert table',
        'Rainbow streamers cascading from ceiling',
        'Sparkly "Drop A Deuce" banner'
      ]
    },
    {
      title: 'Game Night Arena',
      icon: '🎮',
      color: 'from-blue-500 to-indigo-600',
      items: [
        'Tournament bracket poster on wall',
        'Winner\'s podium for photos',
        'Score tracking whiteboard',
        'Player number bibs or badges',
        'Medal and trophy display area',
        'Game rules poster boards'
      ]
    },
    {
      title: 'Outdoor Adventure',
      icon: '🏕️',
      color: 'from-green-500 to-teal-600',
      items: [
        'Camping tent play area',
        'Outdoor game stations',
        'Nature-themed decorations',
        'Picnic blanket seating areas',
        'Bug spray station (for real outdoor parties)',
        'Tiki torches for evening parties'
      ]
    }
  ];

  const snackIdeas = [
    {
      category: 'Sweet Treats',
      icon: Cake,
      color: 'bg-pink-500',
      items: [
        { name: 'Poop Emoji Cupcakes', desc: 'Chocolate cupcakes with swirled brown frosting' },
        { name: 'Toilet Paper Roll Cake Pops', desc: 'White cake pops wrapped to look like TP' },
        { name: 'Golden Plunger Cookies', desc: 'Sugar cookies shaped like plungers with gold icing' },
        { name: 'Rainbow Unicorn Poop Candy', desc: 'Colorful meringue cookies in swirl shapes' },
        { name: 'Chocolate Mousse Cups', desc: 'Served in mini toilet-shaped cups' },
        { name: 'Dirt Pudding Cups', desc: 'Chocolate pudding with cookie crumbs and gummy worms' }
      ]
    },
    {
      category: 'Savory Snacks',
      icon: UtensilsCrossed,
      color: 'bg-orange-500',
      items: [
        { name: 'Hot Dog "Logs"', desc: 'Mini hot dogs in crescent roll "toilet paper"' },
        { name: 'Plunger Veggie Cups', desc: 'Veggies in cups with ranch "plunger" picks' },
        { name: 'Cheese Ball "Bombs"', desc: 'Round cheese balls with pretzel stick fuses' },
        { name: 'Toilet Bowl Dip', desc: 'Spinach dip in a bread bowl "toilet"' },
        { name: 'Poop-shaped Meatballs', desc: 'BBQ meatballs arranged in swirl patterns' },
        { name: 'Pretzel Stick "Matches"', desc: 'Pretzel rods with red candy-dipped tips' }
      ]
    },
    {
      category: 'Drinks',
      icon: UtensilsCrossed,
      color: 'bg-blue-500',
      items: [
        { name: 'Swamp Juice', desc: 'Green punch with floating gummy frogs' },
        { name: 'Toilet Water Blue Lemonade', desc: 'Blue raspberry lemonade' },
        { name: 'Golden Stream Punch', desc: 'Yellow fruit punch (lemon-lime)' },
        { name: 'Chocolate Milk Shakes', desc: 'Served in mini toilet cup novelties' },
        { name: 'Rainbow Layered Drinks', desc: 'Colorful layered fruit juices' },
        { name: 'Fizzy Flush Floats', desc: 'Root beer floats with extra fizz' }
      ]
    }
  ];

  const partyTimelines = {
    '2hour': {
      title: '2-Hour Party',
      subtitle: 'Perfect for younger kids (ages 4-7)',
      schedule: [
        { time: '0:00', duration: '15 min', activity: 'Guest Arrival & Free Play', icon: Users, color: 'bg-green-500' },
        { time: '0:15', duration: '10 min', activity: 'Welcome & Game Rules Explanation', icon: Info, color: 'bg-blue-500' },
        { time: '0:25', duration: '25 min', activity: 'Drop A Deuce - Round 1 (Classic Mode)', icon: Trophy, color: 'bg-purple-500' },
        { time: '0:50', duration: '20 min', activity: 'Snack Break & Cake Time', icon: Cake, color: 'bg-pink-500' },
        { time: '1:10', duration: '25 min', activity: 'Drop A Deuce - Round 2 (Hot Poo Mode)', icon: Trophy, color: 'bg-orange-500' },
        { time: '1:35', duration: '15 min', activity: 'Prize Awards & Photo Time', icon: Camera, color: 'bg-yellow-500' },
        { time: '1:50', duration: '10 min', activity: 'Goodie Bags & Goodbye', icon: Gift, color: 'bg-red-500' }
      ]
    },
    '3hour': {
      title: '3-Hour Party',
      subtitle: 'Great for ages 6-10',
      schedule: [
        { time: '0:00', duration: '20 min', activity: 'Guest Arrival & Name Tag Station', icon: Users, color: 'bg-green-500' },
        { time: '0:20', duration: '15 min', activity: 'Welcome & Team Formation', icon: Info, color: 'bg-blue-500' },
        { time: '0:35', duration: '30 min', activity: 'Drop A Deuce Tournament - Round 1', icon: Trophy, color: 'bg-purple-500' },
        { time: '1:05', duration: '20 min', activity: 'Challenge Card Mini-Games', icon: Sparkles, color: 'bg-indigo-500' },
        { time: '1:25', duration: '25 min', activity: 'Pizza & Snack Break', icon: UtensilsCrossed, color: 'bg-orange-500' },
        { time: '1:50', duration: '30 min', activity: 'Drop A Deuce Tournament - Finals', icon: Trophy, color: 'bg-red-500' },
        { time: '2:20', duration: '20 min', activity: 'Cake & Happy Birthday', icon: Cake, color: 'bg-pink-500' },
        { time: '2:40', duration: '15 min', activity: 'Awards Ceremony & Photos', icon: Camera, color: 'bg-yellow-500' },
        { time: '2:55', duration: '5 min', activity: 'Goodie Bags & Departure', icon: Gift, color: 'bg-teal-500' }
      ]
    },
    '4hour': {
      title: '4-Hour Party',
      subtitle: 'Ultimate party for ages 8+',
      schedule: [
        { time: '0:00', duration: '30 min', activity: 'Guest Arrival & Free Play Zone', icon: Users, color: 'bg-green-500' },
        { time: '0:30', duration: '15 min', activity: 'Welcome, Rules & Team Draft', icon: Info, color: 'bg-blue-500' },
        { time: '0:45', duration: '35 min', activity: 'Tournament Round 1 - Classic Mode', icon: Trophy, color: 'bg-purple-500' },
        { time: '1:20', duration: '25 min', activity: 'Snack Station Opens', icon: UtensilsCrossed, color: 'bg-orange-500' },
        { time: '1:45', duration: '30 min', activity: 'Challenge Card Relay Races', icon: Sparkles, color: 'bg-indigo-500' },
        { time: '2:15', duration: '35 min', activity: 'Tournament Round 2 - Hot Poo Mode', icon: Trophy, color: 'bg-red-500' },
        { time: '2:50', duration: '25 min', activity: 'Cake Cutting & Birthday Song', icon: Cake, color: 'bg-pink-500' },
        { time: '3:15', duration: '25 min', activity: 'Championship Finals', icon: Trophy, color: 'bg-amber-500' },
        { time: '3:40', duration: '15 min', activity: 'Awards, Photos & Speeches', icon: Camera, color: 'bg-yellow-500' },
        { time: '3:55', duration: '5 min', activity: 'Goodie Bags & Farewell', icon: Gift, color: 'bg-teal-500' }
      ]
    }
  };

  const checklistData: ChecklistItem[] = [
    // 4+ weeks before
    { id: 'set-date', text: 'Set party date and time', category: 'planning', daysBeforeParty: 28 },
    { id: 'guest-list', text: 'Create guest list (8-12 kids recommended)', category: 'planning', daysBeforeParty: 28 },
    { id: 'book-venue', text: 'Book venue or confirm home party space', category: 'planning', daysBeforeParty: 28 },
    { id: 'choose-theme', text: 'Choose party theme/color scheme', category: 'planning', daysBeforeParty: 28 },
    
    // 2-3 weeks before
    { id: 'send-invites', text: 'Send out invitations (use Party Pack!)', category: 'planning', daysBeforeParty: 21 },
    { id: 'order-game', text: 'Order/confirm Drop A Deuce game set', category: 'planning', daysBeforeParty: 21 },
    { id: 'plan-menu', text: 'Plan party menu and snacks', category: 'food', daysBeforeParty: 21 },
    { id: 'order-cake', text: 'Order birthday cake', category: 'food', daysBeforeParty: 14 },
    { id: 'buy-decorations', text: 'Purchase decorations', category: 'decorations', daysBeforeParty: 14 },
    { id: 'buy-prizes', text: 'Buy prizes and goodie bag items', category: 'activities', daysBeforeParty: 14 },
    
    // 1 week before
    { id: 'confirm-rsvps', text: 'Confirm RSVPs and final headcount', category: 'planning', daysBeforeParty: 7 },
    { id: 'print-materials', text: 'Print scorecards, name tags, decorations', category: 'decorations', daysBeforeParty: 7 },
    { id: 'test-game', text: 'Test game equipment and learn rules', category: 'activities', daysBeforeParty: 7 },
    { id: 'prep-playlist', text: 'Create party music playlist', category: 'activities', daysBeforeParty: 7 },
    { id: 'buy-groceries', text: 'Buy non-perishable food items', category: 'food', daysBeforeParty: 7 },
    
    // 2-3 days before
    { id: 'prep-goodie-bags', text: 'Assemble goodie bags', category: 'activities', daysBeforeParty: 3 },
    { id: 'clean-space', text: 'Clean and organize party space', category: 'planning', daysBeforeParty: 2 },
    { id: 'charge-devices', text: 'Charge camera/phone for photos', category: 'planning', daysBeforeParty: 2 },
    { id: 'prep-decorations', text: 'Pre-assemble decorations', category: 'decorations', daysBeforeParty: 2 },
    
    // Day before
    { id: 'buy-perishables', text: 'Buy perishable food items', category: 'food', daysBeforeParty: 1 },
    { id: 'setup-decorations', text: 'Set up decorations', category: 'decorations', daysBeforeParty: 1 },
    { id: 'setup-game-area', text: 'Set up game playing area', category: 'activities', daysBeforeParty: 1 },
    { id: 'prep-food', text: 'Prep food that can be made ahead', category: 'food', daysBeforeParty: 1 },
    { id: 'layout-supplies', text: 'Layout plates, cups, napkins, utensils', category: 'food', daysBeforeParty: 1 },
    
    // Day of party
    { id: 'final-food-prep', text: 'Final food preparation', category: 'dayof' },
    { id: 'setup-snack-table', text: 'Set up snack/drink station', category: 'dayof' },
    { id: 'setup-photo-area', text: 'Set up photo booth area', category: 'dayof' },
    { id: 'test-music', text: 'Test music/speakers', category: 'dayof' },
    { id: 'have-first-aid', text: 'Have first aid kit accessible', category: 'dayof' },
    { id: 'designate-helper', text: 'Brief helper/co-host on schedule', category: 'dayof' },
    { id: 'place-prizes', text: 'Place prizes at award station', category: 'dayof' },
    { id: 'relax', text: 'Take a deep breath - you\'ve got this!', category: 'dayof' }
  ];

  const getChecklistByCategory = (category: ChecklistItem['category']) => {
    return checklistData.filter(item => item.category === category);
  };

  const getCompletedCount = (category: ChecklistItem['category']) => {
    const items = getChecklistByCategory(category);
    return items.filter(item => checklistItems[item.id]).length;
  };

  const getTotalCount = (category: ChecklistItem['category']) => {
    return getChecklistByCategory(category).length;
  };

  const getOverallProgress = () => {
    const completed = Object.values(checklistItems).filter(Boolean).length;
    return Math.round((completed / checklistData.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100">
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-checklist {
            visibility: visible !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
          }
          .print-checklist * {
            visibility: visible !important;
          }
        }
      `}</style>

      {/* Header */}
      <header className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white py-6 px-4 sticky top-0 z-40 shadow-lg no-print">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/drop-a-deuce-rules" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-6 h-6" />
            <span className="font-bold">Back to Rules</span>
          </Link>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full font-bold transition-all"
            >
              <Printer className="w-5 h-5" />
              Print
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 no-print">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full font-bold text-sm mb-4">
            <Scissors className="w-4 h-4" />
            FREE Printables
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 mb-4">
            Drop A Deuce Party Pack
          </h1>
          <p className="text-lg text-purple-700 max-w-2xl mx-auto">
            Everything you need for an amazing Drop A Deuce birthday party! Print invitations, scorecards, name tags, decorations, and bonus challenge cards.
          </p>

        </div>
      </section>

      {/* Theme Selector */}
      <section className="px-4 mb-8 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-800">Choose Your Theme</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {partyPackThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme)}
                  className={`p-4 rounded-xl border-3 transition-all ${
                    selectedTheme.id === theme.id 
                      ? 'border-gray-800 shadow-lg scale-105' 
                      : 'border-transparent hover:border-gray-300'
                  }`}
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center mb-2">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white font-bold text-sm">{theme.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 mb-6 no-print">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        {/* Party Guide Tab Content */}
        {activeTab === 'partyguide' ? (
          <div className="space-y-12">
            {/* Party Guide Hero */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-8 text-white text-center">
              <PartyPopper className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Drop A Deuce Party Planning Guide
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Your complete guide to throwing the ultimate Drop A Deuce birthday party! 
                From themed decorations to delicious snacks and perfectly timed activities.
              </p>
            </div>

            {/* Themed Decoration Ideas */}
            <section className="no-print">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Themed Decoration Ideas</h2>
                  <p className="text-gray-600">Choose a theme that matches your party vibe!</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {decorationIdeas.map((theme, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className={`bg-gradient-to-r ${theme.color} p-6 text-white`}>
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{theme.icon}</span>
                        <h3 className="text-xl font-black">{theme.title}</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-3">
                        {theme.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* DIY Tips */}
              <div className="mt-8 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 border-2 border-yellow-300">
                <div className="flex items-start gap-4">
                  <Lightbulb className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-lg text-yellow-800 mb-2">DIY Decoration Tips</h4>
                    <ul className="space-y-2 text-yellow-900">
                      <li>• Use brown paper bags to create "poop emoji" luminaries with LED candles</li>
                      <li>• Wrap toilet paper rolls in gold spray paint for fancy centerpieces</li>
                      <li>• Create a "Wall of Fame" with photos of past winners</li>
                      <li>• Make a balloon arch using brown, gold, and your accent color</li>
                      <li>• Print our free decorations from the Decorations tab!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Suggested Snacks */}
            <section className="no-print">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Cake className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Party Snacks & Treats</h2>
                  <p className="text-gray-600">Delicious themed food ideas kids will love!</p>
                </div>
              </div>

              <div className="space-y-6">
                {snackIdeas.map((category, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className={`${category.color} p-4 text-white flex items-center gap-3`}>
                      <category.icon className="w-6 h-6" />
                      <h3 className="text-xl font-bold">{category.category}</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items.map((item, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                            <h4 className="font-bold text-gray-800 mb-1">{item.name}</h4>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Allergy Notice */}
              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200 flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-800">Allergy Reminder</h4>
                  <p className="text-sm text-blue-700">
                    Always ask parents about food allergies when they RSVP. Consider having nut-free, 
                    gluten-free, and dairy-free options available for guests with dietary restrictions.
                  </p>
                </div>
              </div>
            </section>

            {/* Party Timeline Templates */}
            <section className="no-print">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Party Timeline Templates</h2>
                  <p className="text-gray-600">Choose a schedule that fits your party length</p>
                </div>
              </div>

              {/* Timeline Selector */}
              <div className="flex flex-wrap gap-3 mb-6">
                {Object.entries(partyTimelines).map(([key, timeline]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTimeline(key as typeof selectedTimeline)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      selectedTimeline === key
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    {timeline.title}
                  </button>
                ))}
              </div>

              {/* Selected Timeline */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 text-white">
                  <h3 className="text-2xl font-black">{partyTimelines[selectedTimeline].title}</h3>
                  <p className="text-blue-100">{partyTimelines[selectedTimeline].subtitle}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {partyTimelines[selectedTimeline].schedule.map((item, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-20 text-right">
                          <span className="font-mono font-bold text-gray-800">{item.time}</span>
                          <p className="text-xs text-gray-500">{item.duration}</p>
                        </div>
                        <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-3">
                          <span className="font-medium text-gray-800">{item.activity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Tips */}
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <Timer className="w-6 h-6 text-green-600 mb-2" />
                  <h4 className="font-bold text-green-800">Build in Buffer Time</h4>
                  <p className="text-sm text-green-700">Add 5-10 minutes between activities for transitions and bathroom breaks.</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <Music className="w-6 h-6 text-purple-600 mb-2" />
                  <h4 className="font-bold text-purple-800">Use Party Mode</h4>
                  <p className="text-sm text-purple-700">Our digital Party Mode has built-in timers and music to keep things on track!</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <Users className="w-6 h-6 text-orange-600 mb-2" />
                  <h4 className="font-bold text-orange-800">Have a Helper</h4>
                  <p className="text-sm text-orange-700">Recruit another adult to help manage activities while you handle photos and food.</p>
                </div>
              </div>
            </section>

            {/* Downloadable Party Checklist */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-800">Party Planning Checklist</h2>
                    <p className="text-gray-600">Track your progress and never forget a thing!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPrintableChecklist(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-5 py-3 rounded-xl font-bold hover:from-green-600 hover:to-teal-600 transition-all no-print"
                >
                  <Download className="w-5 h-5" />
                  Download Checklist
                </button>
              </div>

              {/* Progress Overview */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 no-print">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">Overall Progress</h3>
                  <span className="text-2xl font-black text-green-600">{getOverallProgress()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${getOverallProgress()}%` }}
                  />
                </div>
              </div>

              {/* Checklist Categories */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 no-print">
                {[
                  { key: 'planning' as const, title: 'Planning & Logistics', icon: Calendar, color: 'from-blue-500 to-indigo-500' },
                  { key: 'decorations' as const, title: 'Decorations', icon: Gift, color: 'from-pink-500 to-purple-500' },
                  { key: 'food' as const, title: 'Food & Drinks', icon: Cake, color: 'from-orange-500 to-red-500' },
                  { key: 'activities' as const, title: 'Games & Activities', icon: Trophy, color: 'from-yellow-500 to-amber-500' },
                  { key: 'dayof' as const, title: 'Day of Party', icon: PartyPopper, color: 'from-green-500 to-teal-500' }
                ].map((category) => (
                  <div key={category.key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className={`bg-gradient-to-r ${category.color} p-4 text-white`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <category.icon className="w-5 h-5" />
                          <h3 className="font-bold">{category.title}</h3>
                        </div>
                        <span className="text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
                          {getCompletedCount(category.key)}/{getTotalCount(category.key)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {getChecklistByCategory(category.key).map((item) => (
                          <button
                            key={item.id}
                            onClick={() => toggleChecklistItem(item.id)}
                            className={`w-full flex items-start gap-3 p-2 rounded-lg transition-all text-left ${
                              checklistItems[item.id] 
                                ? 'bg-green-50 text-green-700' 
                                : 'hover:bg-gray-50 text-gray-700'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              checklistItems[item.id]
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300'
                            }`}>
                              {checklistItems[item.id] && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className={checklistItems[item.id] ? 'line-through' : ''}>
                              {item.text}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Printable Checklist Modal */}
              {showPrintableChecklist && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
                      <h3 className="text-xl font-bold">Printable Party Checklist</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white px-4 py-2 rounded-lg font-bold"
                        >
                          <Printer className="w-4 h-4" />
                          Print
                        </button>
                        <button
                          onClick={() => setShowPrintableChecklist(false)}
                          className="px-4 py-2 bg-gray-200 rounded-lg font-bold hover:bg-gray-300"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                    
                    {/* Printable Content */}
                    <div className="p-8 print-area print-checklist">
                      <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-gray-800 mb-2">Drop A Deuce Party Checklist</h1>
                        <p className="text-gray-600">Your complete party planning guide</p>
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                        {/* 4+ Weeks Before */}
                        <div>
                          <h2 className="font-bold text-lg border-b-2 border-purple-500 pb-2 mb-4 text-purple-700">
                            4+ Weeks Before
                          </h2>
                          <div className="space-y-3">
                            {checklistData.filter(i => i.daysBeforeParty && i.daysBeforeParty >= 21).map(item => (
                              <div key={item.id} className="flex items-start gap-2">
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                                <span className="text-sm">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 1-2 Weeks Before */}
                        <div>
                          <h2 className="font-bold text-lg border-b-2 border-blue-500 pb-2 mb-4 text-blue-700">
                            1-2 Weeks Before
                          </h2>
                          <div className="space-y-3">
                            {checklistData.filter(i => i.daysBeforeParty && i.daysBeforeParty >= 7 && i.daysBeforeParty < 21).map(item => (
                              <div key={item.id} className="flex items-start gap-2">
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                                <span className="text-sm">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 2-3 Days Before */}
                        <div>
                          <h2 className="font-bold text-lg border-b-2 border-green-500 pb-2 mb-4 text-green-700">
                            2-3 Days Before
                          </h2>
                          <div className="space-y-3">
                            {checklistData.filter(i => i.daysBeforeParty && i.daysBeforeParty >= 2 && i.daysBeforeParty < 7).map(item => (
                              <div key={item.id} className="flex items-start gap-2">
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                                <span className="text-sm">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Day Before */}
                        <div>
                          <h2 className="font-bold text-lg border-b-2 border-orange-500 pb-2 mb-4 text-orange-700">
                            Day Before
                          </h2>
                          <div className="space-y-3">
                            {checklistData.filter(i => i.daysBeforeParty === 1).map(item => (
                              <div key={item.id} className="flex items-start gap-2">
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                                <span className="text-sm">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Day of Party */}
                        <div className="col-span-2">
                          <h2 className="font-bold text-lg border-b-2 border-pink-500 pb-2 mb-4 text-pink-700">
                            Day of Party
                          </h2>
                          <div className="grid grid-cols-2 gap-3">
                            {checklistData.filter(i => i.category === 'dayof').map(item => (
                              <div key={item.id} className="flex items-start gap-2">
                                <Circle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                                <span className="text-sm">{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Notes Section */}
                      <div className="mt-8 border-t-2 border-gray-200 pt-6">
                        <h2 className="font-bold text-lg mb-4">Notes</h2>
                        <div className="space-y-4">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="border-b border-gray-300 h-8" />
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-8 text-center text-sm text-gray-500">
                        <p>Download more party supplies at dropadeuce.com/party-pack</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Quick Links */}
            <section className="no-print">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white">
                <h2 className="text-2xl font-black mb-6 text-center">Ready to Plan Your Party?</h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('invitations')}
                    className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all"
                  >
                    <Mail className="w-8 h-8 mx-auto mb-2" />
                    <span className="font-bold">Print Invitations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('decorations')}
                    className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all"
                  >
                    <Gift className="w-8 h-8 mx-auto mb-2" />
                    <span className="font-bold">Get Decorations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('scorecards')}
                    className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <span className="font-bold">Print Scorecards</span>
                  </button>
                  <Link
                    to="/drop-a-deuce-rules"
                    className="bg-white/20 hover:bg-white/30 rounded-xl p-4 text-center transition-all"
                  >
                    <Trophy className="w-8 h-8 mx-auto mb-2" />
                    <span className="font-bold">Learn the Rules</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        ) : activeTab === 'invitations' ? (
          /* Drop A Deuce Invitation Generator - Full Width */
          <div className="space-y-6">
            {/* Invitation Generator Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 rounded-3xl p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Drop A Deuce Party Invitation Generator
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Create custom party invitations with the official Drop A Deuce branding! 
                Choose from 5 unique themes, customize all details, and print professional invitations.
              </p>
            </div>

            {/* Invitation Generator Component */}
            <DropADeuceInvitationGenerator />

            {/* Quick Tips */}
            <div className="bg-amber-50 rounded-2xl p-6 border-2 border-amber-200">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-amber-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-amber-800 mb-2">Invitation Tips</h4>
                  <ul className="space-y-2 text-amber-900 text-sm">
                    <li>• Print on white cardstock (110 lb) for best results</li>
                    <li>• Send invitations 2-3 weeks before the party</li>
                    <li>• Include allergy information requests in your RSVP</li>
                    <li>• Consider adding a QR code linking to your RSVP form</li>
                    <li>• Print extras for keepsakes and last-minute guests!</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'gallery' ? (
          /* Preview Gallery - Full Width */
          <div className="space-y-6">
            {/* Gallery Header */}
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Grid3X3 className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                Preview All Printables
              </h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                Browse thumbnails of all available printable items. Click any item to see a larger preview 
                and navigate directly to print it!
              </p>
            </div>

            {/* Gallery Component */}
            <PrintablePreviewGallery 
              selectedTheme={selectedTheme}
              onSelectItem={handleGalleryItemSelect}
            />

            {/* Quick Tips */}
            <div className="bg-indigo-50 rounded-2xl p-6 border-2 border-indigo-200">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-indigo-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-lg text-indigo-800 mb-2">Printing Tips</h4>
                  <ul className="space-y-2 text-indigo-900 text-sm">
                    <li>• <strong>Invitations & Cards:</strong> Print on white cardstock (110 lb) for durability</li>
                    <li>• <strong>Name Tags:</strong> Use adhesive paper or laminate and add safety pins</li>
                    <li>• <strong>Decorations:</strong> Print on regular paper and cut out carefully</li>
                    <li>• <strong>Scorecards:</strong> Laminate for reuse with dry-erase markers</li>
                    <li>• <strong>Challenge Cards:</strong> Print double-sided for a professional look</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Other Tab Content */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form/Options Panel */}

            <div className="lg:col-span-1 no-print">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                {/* Scorecards Options */}
                {activeTab === 'scorecards' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-500" />
                      Scorecard Options
                    </h3>
                    <p className="text-sm text-gray-600">
                      Print scorecards to track points during your Drop A Deuce party! Includes scoring guides for both game modes.
                    </p>
                    <div className="p-4 rounded-xl" style={{ backgroundColor: `${selectedTheme.primaryColor}15` }}>
                      <p className="text-sm font-medium" style={{ color: selectedTheme.primaryColor }}>
                        Tip: Print multiple copies for tournament-style play!
                      </p>
                    </div>
                  </div>
                )}


                {/* Name Tags Form */}
                {activeTab === 'nametags' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-500" />
                      Guest Names
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter guest names or leave blank to write them in by hand.
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {guestNames.map((name, index) => (
                        <input
                          key={index}
                          type="text"
                          value={name}
                          onChange={(e) => {
                            const newNames = [...guestNames];
                            newNames[index] = e.target.value;
                            setGuestNames(newNames);
                          }}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:outline-none text-sm"
                          placeholder={`Guest ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Decorations Options */}
                {activeTab === 'decorations' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Gift className="w-5 h-5 text-orange-500" />
                      Decoration Type
                    </h3>
                    <div className="space-y-2">
                      {[
                        { id: 'doorSign', label: 'Door Sign', desc: 'Welcome sign for the party' },
                        { id: 'banner', label: 'Banner Letters', desc: 'Happy Birthday banner' },
                        { id: 'cupcakeToppers', label: 'Cupcake Toppers', desc: 'Decorations for treats' },
                        { id: 'photoProps', label: 'Photo Props', desc: 'Fun photo booth props' }
                      ].map((option) => (
                        <button
                          key={option.id}
                          onClick={() => setDecorationType(option.id as typeof decorationType)}
                          className={`w-full p-3 rounded-xl text-left transition-all ${
                            decorationType === option.id
                              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          <p className="font-bold">{option.label}</p>
                          <p className={`text-sm ${decorationType === option.id ? 'text-white/80' : 'text-gray-500'}`}>
                            {option.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenge Cards Filter */}
                {activeTab === 'challenges' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      Challenge Cards
                    </h3>
                    <p className="text-sm text-gray-600">
                      30 bonus challenge cards to add extra fun! Filter by difficulty level.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['all', 'easy', 'medium', 'hard'].map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setChallengeFilter(filter as typeof challengeFilter)}
                          className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                            challengeFilter === filter
                              ? filter === 'easy' ? 'bg-green-500 text-white'
                              : filter === 'medium' ? 'bg-yellow-500 text-white'
                              : filter === 'hard' ? 'bg-red-500 text-white'
                              : 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {filter.charAt(0).toUpperCase() + filter.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Tip:</strong> Print card backs on the reverse side for a professional look!
                      </p>
                    </div>
                  </div>
                )}

                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-5 h-5" />
                  Print {tabs.find(t => t.id === activeTab)?.label}
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
                <div className="flex items-center justify-between mb-4 no-print">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-blue-500" />
                    Preview
                  </h3>
                  <span className="text-sm text-gray-500">
                    Scroll to see full preview
                  </span>
                </div>
                
                {/* Preview Content */}
                <div 
                  ref={printRef}
                  className="print-area overflow-auto max-h-[800px] border-2 border-gray-200 rounded-xl"
                  style={{ backgroundColor: '#f5f5f5' }}
                >
                  <div className="flex justify-center p-4">
                    {activeTab === 'scorecards' && (
                      <PrintableScorecard
                        theme={selectedTheme}
                        gameMode="both"
                        maxPlayers={8}
                        maxRounds={10}
                      />
                    )}
                    
                    {activeTab === 'nametags' && (
                      <PrintableNameTags
                        theme={selectedTheme}
                        names={guestNames}
                      />
                    )}
                    
                    {activeTab === 'decorations' && (
                      <PrintableDecorations
                        theme={selectedTheme}
                        childName={invitationData.childName}
                        decorationType={decorationType}
                      />
                    )}
                    
                    {activeTab === 'challenges' && (
                      <div>
                        <PrintableChallengeCards
                          theme={selectedTheme}
                          cards={filteredChallengeCards}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Tips Section - Only show when not on party guide */}
        {activeTab !== 'partyguide' && (
          <section className="mt-12 no-print">
            <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-3xl p-8 text-white">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
                <PartyPopper className="w-8 h-8" />
                Party Planning Tips
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white/10 rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-2">Print on Card Stock</h3>
                  <p className="text-white/80 text-sm">
                    For best results, print invitations and challenge cards on card stock paper for durability.
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-2">Laminate Scorecards</h3>
                  <p className="text-white/80 text-sm">
                    Laminate scorecards and use dry-erase markers to reuse them for multiple games!
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5">
                  <h3 className="font-bold text-lg mb-2">Use Party Mode</h3>
                  <p className="text-white/80 text-sm">
                    Don't forget to use the digital Party Mode for timers, music, and confetti during the games!
                  </p>
                </div>
              </div>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab('partyguide')}
                  className="bg-white text-purple-600 px-6 py-3 rounded-full font-bold hover:bg-purple-50 transition-all inline-flex items-center gap-2"
                >
                  <PartyPopper className="w-5 h-5" />
                  View Full Party Planning Guide
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 no-print">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2025 DaFish Boyz Games. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-2">
            <Link to="/drop-a-deuce-rules" className="text-purple-400 hover:text-purple-300">
              Game Rules
            </Link>
            <Link to="/" className="text-purple-400 hover:text-purple-300">
              All Games
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PartyPack;
