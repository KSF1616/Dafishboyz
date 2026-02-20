import React, { useState, useEffect } from 'react';
import { ArrowLeft, FileText, FolderOpen, LogOut, Settings, DollarSign, Percent, AlertCircle, CloudUpload, X, Filter, Layers, Zap, Layout, Tag, Timer, CreditCard, Sparkles, Image, ArrowRightLeft, Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { PDFDropzone } from '@/components/admin/PDFDropzone';
import { UploadProgress } from '@/components/admin/UploadProgress';
import { GameCardsList } from '@/components/admin/GameCardsList';
import { GameRulesEditor } from '@/components/admin/GameRulesEditor';
import { BulkImportSection } from '@/components/admin/BulkImportSection';
import AudioUploadSection from '@/components/admin/AudioUploadSection';
import MarketingUploadSection from '@/components/admin/MarketingUploadSection';
import LogoUploadSection from '@/components/admin/LogoUploadSection';
import SoundTestingPanel from '@/components/admin/SoundTestingPanel';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { games } from '@/data/gamesData';
import { GameCard, CardType } from '@/types/gameCards';

interface BundleSettings { type: 'percentage' | 'fixed'; value: number; }

type ConnectionStatus = 'idle' | 'testing' | 'success' | 'error';

const AdminUpload: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [gameCards, setGameCards] = useState<GameCard[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [bundleSettings, setBundleSettings] = useState<BundleSettings>({ type: 'percentage', value: 25 });
  const [savingSettings, setSavingSettings] = useState(false);

  // Database connection test state
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [connectionMessage, setConnectionMessage] = useState<string>('');
  const [connectionDetails, setConnectionDetails] = useState<{ tables?: number; latency?: number } | null>(null);

  const [selectedGame, setSelectedGame] = useState(games[0].id);
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [previewCard, setPreviewCard] = useState<GameCard | null>(null);
  const { toast } = useToast();
  const { user, signOut, isDemo } = useAuth();

  useEffect(() => { fetchGameCards(); fetchBundleSettings(); }, []);

  // Database connection test function
  const testDatabaseConnection = async () => {
    setConnectionStatus('testing');
    setConnectionMessage('Testing connection...');
    setConnectionDetails(null);
    
    const startTime = Date.now();
    
    try {
      // Test 1: Simple query to check connection
      const { data: gameCardsData, error: gameCardsError } = await supabase
        .from('game_cards')
        .select('id', { count: 'exact', head: true });
      
      if (gameCardsError) throw gameCardsError;
      
      // Test 2: Try to get counts from multiple tables
      const [promoResult, settingsResult] = await Promise.all([
        supabase.from('promo_codes').select('id', { count: 'exact', head: true }),
        supabase.from('game_settings').select('id', { count: 'exact', head: true })
      ]);
      
      const latency = Date.now() - startTime;
      
      // Calculate how many tables responded
      let tablesResponded = 1; // game_cards worked
      if (!promoResult.error) tablesResponded++;
      if (!settingsResult.error) tablesResponded++;
      
      setConnectionStatus('success');
      setConnectionMessage('Database connection successful!');
      setConnectionDetails({ tables: tablesResponded, latency });
      
      toast({
        title: "Connection Successful",
        description: `Connected to DaFish Boyz Games database (${latency}ms)`,
      });
    } catch (error: any) {
      const latency = Date.now() - startTime;
      setConnectionStatus('error');
      setConnectionMessage(error.message || 'Failed to connect to database');
      setConnectionDetails({ latency });
      
      toast({
        title: "Connection Failed",
        description: error.message || 'Unable to connect to database',
        variant: "destructive",
      });
    }
  };



  const fetchBundleSettings = async () => {
    try {
      const { data, error } = await supabase.from('game_settings').select('setting_value').eq('setting_key', 'bundle_discount').single();
      if (!error && data) setBundleSettings(data.setting_value as BundleSettings);
    } catch (err) { console.log('Using default bundle settings'); }
  };

  const saveBundleSettings = async () => {
    setSavingSettings(true);
    try {
      const { error } = await supabase.from('game_settings').upsert({ setting_key: 'bundle_discount', setting_value: bundleSettings, updated_at: new Date().toISOString(), updated_by: user?.id }, { onConflict: 'setting_key' });
      if (error) throw error;
      toast({ title: "Settings Saved!" });
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    setSavingSettings(false);
  };

  const fetchGameCards = async () => {
    const { data, error } = await supabase.from('game_cards').select('*').order('uploaded_at', { ascending: false });
    if (!error && data) setGameCards(data);
  };

  const handleFileSelect = async (file: File, gameId: string, cardType: CardType, description: string) => {
    setIsUploading(true); setCurrentFile(file.name); setUploadProgress(0); setIsComplete(false); setUploadError(null);
    try {
      const progressInterval = setInterval(() => setUploadProgress(prev => Math.min(prev + 10, 90)), 200);
      const fileName = `${gameId}-${cardType}-${Date.now()}.pdf`;
      const { error: uploadErr } = await supabase.storage.from('game-cards').upload(fileName, file, { contentType: 'application/pdf', upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: urlData } = supabase.storage.from('game-cards').getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from('game_cards').insert({ game_id: gameId, card_type: cardType, file_url: urlData.publicUrl, file_name: fileName, file_size: file.size, description: description || null, uploaded_by: user?.id });
      clearInterval(progressInterval);
      if (dbErr) throw dbErr;
      setUploadProgress(100); setIsComplete(true);
      toast({ title: "Upload Successful!", description: `${cardType} cards uploaded for ${games.find(g => g.id === gameId)?.name}.` });
      setTimeout(() => { setIsUploading(false); setCurrentFile(null); fetchGameCards(); }, 2000);
    } catch (error: any) {
      setUploadError(error.message);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
      setTimeout(() => { setIsUploading(false); setCurrentFile(null); setUploadError(null); }, 3000);
    }
  };

  const handleDelete = async (card: GameCard) => {
    await supabase.storage.from('game-cards').remove([card.file_name]);
    await supabase.from('game_cards').delete().eq('id', card.id);
    setGameCards(prev => prev.filter(c => c.id !== card.id));
    toast({ title: "Card Deleted" });
  };

  const handleUpdate = async (card: GameCard, updates: { card_type?: CardType; description?: string }) => {
    const { error } = await supabase.from('game_cards').update(updates).eq('id', card.id);
    if (!error) { fetchGameCards(); toast({ title: "Card Updated" }); }
  };

  const filteredCards = gameCards.filter(c => (filterGame === 'all' || c.game_id === filterGame) && (filterType === 'all' || c.card_type === filterType));
  const existingUrls = gameCards.map(c => c.file_url);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isDemo && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">You're using a demo account. Some database operations may be limited. Create a real account for full access.</p>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700"><ArrowLeft className="w-4 h-4" /> Back</Link>
          <div className="flex items-center gap-4 flex-wrap">
            {isDemo && (
              <span className="flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-500 text-xs font-semibold">
                <Zap className="w-3 h-3" /> Demo
              </span>
            )}
            <Link to="/admin/promo-codes">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-600">
                <Tag className="w-4 h-4 mr-2" />Promo Codes
              </Button>
            </Link>
            <Link to="/admin/free-trials">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 hover:from-blue-600 hover:to-cyan-600">
                <Timer className="w-4 h-4 mr-2" />Free Trials
              </Button>
            </Link>
            <Link to="/admin/board-editor">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600">
                <Layout className="w-4 h-4 mr-2" />Board Editor
              </Button>
            </Link>
            <Link to="/admin/subscriptions">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600">
                <CreditCard className="w-4 h-4 mr-2" />Subscriptions
              </Button>
            </Link>
            <Link to="/admin/deck-builder">
              <Button variant="outline" size="sm"><Layers className="w-4 h-4 mr-2" />Deck Builder</Button>
            </Link>
            <Link to="/admin/shito-cards">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 hover:from-amber-600 hover:to-orange-600">
                <Sparkles className="w-4 h-4 mr-2" />Shito Cards
              </Button>
            </Link>
            <Link to="/admin/game-assets">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-slate-600 to-zinc-600 text-white border-0 hover:from-slate-700 hover:to-zinc-700">
                <Image className="w-4 h-4 mr-2" />Game Assets
              </Button>
            </Link>
            <Link to="/admin/data-migration">
              <Button variant="outline" size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0 hover:from-cyan-600 hover:to-blue-600">
                <ArrowRightLeft className="w-4 h-4 mr-2" />Data Migration
              </Button>
            </Link>
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
          </div>

        </div>


        {/* Database Connection Test Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${
                connectionStatus === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                connectionStatus === 'error' ? 'bg-red-100 dark:bg-red-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {connectionStatus === 'testing' ? (
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                ) : connectionStatus === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                ) : connectionStatus === 'error' ? (
                  <XCircle className="w-6 h-6 text-red-600" />
                ) : (
                  <Database className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">Database Connection</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {connectionStatus === 'idle' && 'DaFish Boyz Games Database'}
                  {connectionStatus === 'testing' && 'Testing connection...'}
                  {connectionStatus === 'success' && connectionMessage}
                  {connectionStatus === 'error' && connectionMessage}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {connectionDetails && (
                <div className="text-right text-sm">
                  {connectionDetails.latency !== undefined && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Latency: <span className={`font-medium ${connectionDetails.latency < 200 ? 'text-green-600' : connectionDetails.latency < 500 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {connectionDetails.latency}ms
                      </span>
                    </p>
                  )}
                  {connectionDetails.tables !== undefined && (
                    <p className="text-gray-500 dark:text-gray-400">
                      Tables responding: <span className="font-medium text-green-600">{connectionDetails.tables}/3</span>
                    </p>
                  )}
                </div>
              )}
              <Button 
                onClick={testDatabaseConnection}
                disabled={connectionStatus === 'testing'}
                className={`${
                  connectionStatus === 'success' ? 'bg-green-500 hover:bg-green-600' :
                  connectionStatus === 'error' ? 'bg-red-500 hover:bg-red-600' :
                  'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                {connectionStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Error details */}
          {connectionStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Connection Error</p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">{connectionMessage}</p>
                  <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                    Check your Supabase URL and API key in src/lib/supabase.ts
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Success details */}
          {connectionStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">Connected Successfully</p>
                  <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                    Your app is connected to the DaFish Boyz Games database and ready to use.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo Upload Section - Prominent placement at top for branding */}
        <LogoUploadSection />



        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl"><Settings className="w-8 h-8 text-amber-600" /></div>
            <h2 className="text-2xl font-bold">Bundle Discount</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div><Label>Type</Label><div className="flex gap-2 mt-2"><Button variant={bundleSettings.type === 'percentage' ? 'default' : 'outline'} onClick={() => setBundleSettings(s => ({ ...s, type: 'percentage' }))} className="flex-1"><Percent className="w-4 h-4 mr-2" />%</Button><Button variant={bundleSettings.type === 'fixed' ? 'default' : 'outline'} onClick={() => setBundleSettings(s => ({ ...s, type: 'fixed' }))} className="flex-1"><DollarSign className="w-4 h-4 mr-2" />$</Button></div></div>
            <div><Label>Value</Label><Input type="number" value={bundleSettings.value} onChange={(e) => setBundleSettings(s => ({ ...s, value: Number(e.target.value) }))} className="mt-2" min={0} /></div>
          </div>
          <Button onClick={saveBundleSettings} disabled={savingSettings} className="mt-6 bg-amber-500 hover:bg-amber-600">{savingSettings ? 'Saving...' : 'Save'}</Button>
        </div>

        <GameRulesEditor />
        <SoundTestingPanel />
        <AudioUploadSection />
        <MarketingUploadSection />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl"><CloudUpload className="w-8 h-8 text-purple-600" /></div>
            <div><h1 className="text-2xl font-bold">Game Cards Upload</h1><p className="text-gray-500">Upload PDF card files to the database</p></div>
          </div>
          <PDFDropzone onFileSelect={handleFileSelect} isUploading={isUploading} selectedGame={selectedGame} onGameChange={setSelectedGame} />
          {currentFile && <div className="mt-6"><UploadProgress fileName={currentFile} progress={uploadProgress} isComplete={isComplete} error={uploadError} /></div>}
        </div>

        <BulkImportSection existingUrls={existingUrls} onImportComplete={fetchGameCards} />

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><FolderOpen className="w-5 h-5" /> Uploaded Cards ({filteredCards.length})</h2>
            <div className="flex gap-2">
              <Select value={filterGame} onValueChange={setFilterGame}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Games</SelectItem>{games.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select>
              <Select value={filterType} onValueChange={setFilterType}><SelectTrigger className="w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="prompt">Prompt</SelectItem><SelectItem value="response">Response</SelectItem></SelectContent></Select>
            </div>
          </div>
          <GameCardsList cards={filteredCards} onDelete={handleDelete} onUpdate={handleUpdate} onPreview={setPreviewCard} />
        </div>
      </div>

      <Dialog open={!!previewCard} onOpenChange={() => setPreviewCard(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader><DialogTitle>{previewCard?.file_name}</DialogTitle></DialogHeader>
          {previewCard && <iframe src={previewCard.file_url} className="w-full h-full rounded-lg" title="PDF Preview" />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUpload;
