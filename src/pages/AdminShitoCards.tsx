import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  LogOut, 
  Sparkles, 
  RefreshCw, 
  Image as ImageIcon,
  FolderOpen,
  Zap,
  ExternalLink,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import ShitoCardUploader from '@/components/admin/ShitoCardUploader';
import ShitoCardsList, { ShitoCard } from '@/components/admin/ShitoCardsList';

const AdminShitoCards: React.FC = () => {
  const [cards, setCards] = useState<ShitoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  const { user, signOut, isDemo } = useAuth();

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      // Load from game-cards bucket, shito-calling-cards.singles folder
      const { data, error } = await supabase.storage
        .from('game-cards')
        .list('shito-calling-cards.singles', {
          limit: 200,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      if (data) {
        // Filter for image files only
        const imageFiles = data.filter(f => 
          f.name.match(/\.(png|jpg|jpeg|gif|webp)$/i)
        );

        const cardList: ShitoCard[] = imageFiles.map((f, i) => {
          const { data: urlData } = supabase.storage
            .from('game-cards')
            .getPublicUrl(`shito-calling-cards.singles/${f.name}`);
          
          // Extract display name from filename
          const baseName = f.name.replace(/\.[^/.]+$/, '');
          // Remove timestamp suffix if present
          const cleanName = baseName.replace(/-\d{13}$/, '');
          const displayName = cleanName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

          return {
            id: `card-${i}-${f.name}`,
            name: displayName,
            fileName: f.name,
            url: urlData.publicUrl,
            createdAt: f.created_at || new Date().toISOString()
          };
        });

        setCards(cardList);
      }
    } catch (error: any) {
      console.error('Error fetching cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load calling cards',
        variant: 'destructive'
      });
    }
    setLoading(false);
  };



  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Card list has been updated'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You're using a demo account. Some storage operations may be limited.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <Link to="/shito-calling-cards" target="_blank">
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="w-4 h-4" />
                View Game
              </Button>
            </Link>
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Shito Calling Cards</h1>
              <p className="text-white/80 mt-1">
                Upload and manage custom icons for the Shito game
              </p>
            </div>
          </div>
          
          <div className="relative z-10 mt-6 flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-white/70 text-sm">Total Cards</p>
              <p className="text-2xl font-bold">{cards.length}</p>
            </div>
            <div className="bg-white/20 rounded-xl px-4 py-2">
              <p className="text-white/70 text-sm">Storage Bucket</p>
              <p className="text-lg font-semibold">shito-calling-cards</p>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>Upload images to create custom calling card icons</li>
              <li>Give each icon a descriptive name (e.g., "Golden Toilet", "Plunger King")</li>
              <li>Uploaded images automatically appear in the Shito calling card deck</li>
              <li>Icons are used when rolling dice and drawing cards during gameplay</li>
              <li>Recommended image size: 200x200 pixels or larger, square aspect ratio</li>
            </ul>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
              <ImageIcon className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upload New Cards</h2>
              <p className="text-gray-500 text-sm">
                Drag and drop images or click to browse
              </p>
            </div>
          </div>
          
          <ShitoCardUploader onUploadComplete={fetchCards} />
        </div>

        {/* Cards List Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <FolderOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Uploaded Cards</h2>
                <p className="text-gray-500 text-sm">
                  {cards.length} card{cards.length !== 1 ? 's' : ''} in the deck
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          <ShitoCardsList 
            cards={cards} 
            loading={loading} 
            onRefresh={fetchCards}
          />
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link to="/admin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/shito-calling-cards">
            <Button className="gap-2 bg-amber-500 hover:bg-amber-600">
              <Sparkles className="w-4 h-4" />
              Play Shito
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminShitoCards;
