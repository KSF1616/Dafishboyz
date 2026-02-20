import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileSpreadsheet, 
  RefreshCw, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Database,
  Play,
  AlertCircle,
  Search,
  Wifi,
  WifiOff,
  TestTube,
  Terminal,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { 
  parseAllExcelCards, 
  parseSingleExcelFile, 
  clearParsedCards, 
  listParseableAssets,
  getGameCards,
  getCardCount,
  testTableAccess,
  testTableInsert,
  parseExcelCards,
  type ParsedGameCard 
} from '@/lib/gameCardService';
import { getGameDisplayName } from '@/lib/gameAssets';

interface ParseResult {
  key: string;
  success: boolean;
  count?: number;
  error?: string;
}

interface Asset {
  key: string;
  gameId: string;
  cardType: string;
  url?: string;
}

interface DebugLog {
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'warn';
  message: string;
  data?: unknown;
}

export default function AdminCardParser() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [parseResults, setParseResults] = useState<ParseResult[]>([]);
  const [cards, setCards] = useState<ParsedGameCard[]>([]);
  const [cardCounts, setCardCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Diagnostic state
  const [dbStatus, setDbStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [dbDetails, setDbDetails] = useState<string>('');
  const [testing, setTesting] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const [showDebug, setShowDebug] = useState(true);
  const debugEndRef = useRef<HTMLDivElement>(null);

  const addLog = (level: DebugLog['level'], message: string, data?: unknown) => {
    const log: DebugLog = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      data,
    };
    setDebugLogs(prev => [...prev, log]);
    console.log(`[CardParser ${level.toUpperCase()}]`, message, data || '');
  };

  useEffect(() => {
    // Auto-scroll debug log
    debugEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [debugLogs]);

  useEffect(() => {
    addLog('info', 'Admin Card Parser loaded. Running initial diagnostics...');
    handleTestConnection();
    loadAssets();
    loadCardCounts();
  }, []);

  useEffect(() => {
    loadCards();
  }, [selectedGame, selectedType]);

  const handleTestConnection = async () => {
    setTesting(true);
    addLog('info', 'Testing database connection to parsed_game_cards table...');
    
    try {
      const result = await testTableAccess();
      
      if (result.accessible) {
        setDbStatus('connected');
        setDbDetails(result.details);
        addLog('success', `Table accessible! ${result.count} rows found.`, result);
      } else {
        setDbStatus('error');
        setDbDetails(result.details);
        addLog('error', `Table NOT accessible: ${result.error}`, result);
      }
    } catch (err) {
      setDbStatus('error');
      setDbDetails(String(err));
      addLog('error', `Connection test exception: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestInsert = async () => {
    setTesting(true);
    addLog('info', 'Testing write access (insert + delete)...');
    
    try {
      const result = await testTableInsert();
      
      if (result.canInsert && result.canDelete) {
        addLog('success', 'Full read/write/delete access confirmed!', result);
        setSuccessMessage('Database write access confirmed! The table is fully accessible.');
      } else if (result.canInsert) {
        addLog('warn', 'Insert works but delete failed', result);
        setSuccessMessage('Insert works but delete failed. Check RLS policies.');
      } else {
        addLog('error', `Write test failed: ${result.error}`, result);
        setError(`Write access failed: ${result.error}`);
      }
    } catch (err) {
      addLog('error', `Write test exception: ${String(err)}`);
      setError(`Write test exception: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestEdgeFunction = async () => {
    setTesting(true);
    addLog('info', 'Testing edge function with check-table action...');
    
    try {
      const result = await parseExcelCards('check-table');
      addLog(result.success ? 'success' : 'error', `Edge function check-table response`, result);
      
      if (result.success) {
        setSuccessMessage(`Edge function working! ${result.message || 'Table check passed.'}`);
      } else {
        setError(`Edge function error: ${result.error}`);
      }
    } catch (err) {
      addLog('error', `Edge function test exception: ${String(err)}`);
      setError(`Edge function test failed: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const handlePingEdgeFunction = async () => {
    setTesting(true);
    addLog('info', 'Pinging edge function (no DB call)...');
    
    try {
      const result = await parseExcelCards('ping');
      addLog(result.success ? 'success' : 'error', `Edge function ping response`, result);
      
      if (result.success) {
        setSuccessMessage(`Edge function is alive! ${result.message || ''}`);
      } else {
        setError(`Edge function ping failed: ${result.error}`);
      }
    } catch (err) {
      addLog('error', `Edge function ping exception: ${String(err)}`);
      setError(`Edge function ping failed: ${String(err)}`);
    } finally {
      setTesting(false);
    }
  };

  const loadAssets = async () => {
    addLog('info', 'Loading parseable assets...');
    try {
      const result = await listParseableAssets();
      if (result.success && result.assets) {
        setAssets(result.assets as Asset[]);
        addLog('success', `Found ${result.assets.length} parseable assets`, result.assets.map(a => a.key));
        if (result.message) {
          addLog('info', result.message);
        }
      } else {
        addLog('warn', `No assets found: ${result.error || 'unknown'}`);
      }
    } catch (err) {
      addLog('error', `Error loading assets: ${String(err)}`);
    }
  };

  const loadCardCounts = async () => {
    addLog('info', 'Loading card counts from database...');
    try {
      const games = ['shito', 'shitz-creek', 'slanging-shit'];
      const counts: Record<string, number> = {};
      
      for (const game of games) {
        counts[game] = await getCardCount(game);
      }
      
      counts['total'] = await getCardCount();
      setCardCounts(counts);
      addLog('success', `Card counts loaded: total=${counts['total']}, shito=${counts['shito']}, shitz-creek=${counts['shitz-creek']}, slanging-shit=${counts['slanging-shit']}`);
    } catch (err) {
      addLog('error', `Error loading card counts: ${String(err)}`);
    }
  };

  const loadCards = async () => {
    setLoading(true);
    try {
      const options: { gameId?: string; cardType?: string; limit: number } = { limit: 100 };
      
      if (selectedGame !== 'all') {
        options.gameId = selectedGame;
      }
      if (selectedType !== 'all') {
        options.cardType = selectedType;
      }
      
      const fetchedCards = await getGameCards(options);
      setCards(fetchedCards);
      addLog('info', `Loaded ${fetchedCards.length} cards (game: ${selectedGame}, type: ${selectedType})`);
    } catch (err) {
      console.error('Error loading cards:', err);
      setError('Failed to load cards');
      addLog('error', `Failed to load cards: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const handleParseAll = async () => {
    setParsing(true);
    setError(null);
    setSuccessMessage(null);
    setParseResults([]);
    addLog('info', '=== STARTING PARSE ALL ===');
    
    try {
      addLog('info', 'Calling parseAllExcelCards() → edge function parse-excel-cards with action: parse-all');
      const result = await parseAllExcelCards();
      
      addLog('info', 'Raw response from edge function:', result);
      
      if (result.success) {
        setParseResults(result.results || []);
        const msg = `Successfully parsed ${result.totalParsed} cards from ${result.results?.length} files`;
        setSuccessMessage(msg);
        addLog('success', msg, result.results);
        await loadCardCounts();
        await loadCards();
      } else {
        setError(result.error || 'Failed to parse files');
        addLog('error', `Parse failed: ${result.error}`, result);
        if (result.debug) {
          addLog('error', 'Debug info:', result.debug);
        }
      }
    } catch (err) {
      setError(String(err));
      addLog('error', `Parse exception: ${String(err)}`);
    } finally {
      setParsing(false);
      addLog('info', '=== PARSE ALL COMPLETE ===');
    }
  };

  const handleParseSingle = async (assetKey: string) => {
    setParsing(true);
    setError(null);
    setSuccessMessage(null);
    addLog('info', `Parsing single file: ${assetKey}`);
    
    try {
      const result = await parseSingleExcelFile(assetKey);
      addLog('info', `Single parse response:`, result);
      
      if (result.success) {
        setParseResults(result.results || []);
        const parsed = result.results?.[0];
        if (parsed?.success) {
          const msg = `Successfully parsed ${parsed.count} cards from ${assetKey}`;
          setSuccessMessage(msg);
          addLog('success', msg);
        } else {
          setError(parsed?.error || 'Failed to parse file');
          addLog('error', `Parse failed for ${assetKey}: ${parsed?.error}`);
        }
        await loadCardCounts();
        await loadCards();
      } else {
        setError(result.error || 'Failed to parse file');
        addLog('error', `Edge function error for ${assetKey}: ${result.error}`);
      }
    } catch (err) {
      setError(String(err));
      addLog('error', `Parse exception for ${assetKey}: ${String(err)}`);
    } finally {
      setParsing(false);
    }
  };

  const handleClearCards = async (gameId?: string, cardType?: string) => {
    if (!confirm(`Are you sure you want to clear ${gameId || 'all'} ${cardType || ''} cards?`)) {
      return;
    }
    
    setLoading(true);
    setError(null);
    addLog('info', `Clearing cards: game=${gameId || 'all'}, type=${cardType || 'all'}`);
    
    try {
      const result = await clearParsedCards(gameId, cardType);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Cards cleared successfully');
        addLog('success', result.message || 'Cards cleared');
        await loadCardCounts();
        await loadCards();
      } else {
        setError(result.error || 'Failed to clear cards');
        addLog('error', `Clear failed: ${result.error}`);
      }
    } catch (err) {
      setError(String(err));
      addLog('error', `Clear exception: ${String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      card.card_name?.toLowerCase().includes(query) ||
      card.card_text?.toLowerCase().includes(query) ||
      card.card_effect?.toLowerCase().includes(query) ||
      card.card_category?.toLowerCase().includes(query)
    );
  });

  const uniqueCardTypes = [...new Set(cards.map(c => c.card_type))];

  const getLogColor = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      default: return 'text-blue-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8" />
              Game Card Parser
            </h1>
            <p className="text-amber-200 mt-1">
              Parse Excel files and manage game card data
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* DB Status Indicator */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
              dbStatus === 'connected' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              dbStatus === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              'bg-gray-500/20 text-gray-300 border border-gray-500/30'
            }`}>
              {dbStatus === 'connected' ? <Wifi className="h-4 w-4" /> :
               dbStatus === 'error' ? <WifiOff className="h-4 w-4" /> :
               <Loader2 className="h-4 w-4 animate-spin" />}
              {dbStatus === 'connected' ? 'DB Connected' :
               dbStatus === 'error' ? 'DB Error' : 'Checking...'}
            </div>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Back to Admin
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert className="bg-green-500/20 border-green-500 text-green-100">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{cardCounts['total'] || 0}</div>
              <div className="text-amber-200 text-sm">Total Cards</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{cardCounts['shito'] || 0}</div>
              <div className="text-amber-200 text-sm">SHITO Cards</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{cardCounts['shitz-creek'] || 0}</div>
              <div className="text-amber-200 text-sm">Shitz Creek</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{cardCounts['slanging-shit'] || 0}</div>
              <div className="text-amber-200 text-sm">Slanging Shit</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white">{assets.length}</div>
              <div className="text-amber-200 text-sm">Excel Files</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="diagnostics" className="space-y-4">
          <TabsList className="bg-white/10">
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-amber-600">
              <TestTube className="h-4 w-4 mr-2" />
              Diagnostics
            </TabsTrigger>
            <TabsTrigger value="parse" className="data-[state=active]:bg-amber-600">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Parse Files
            </TabsTrigger>
            <TabsTrigger value="cards" className="data-[state=active]:bg-amber-600">
              <Database className="h-4 w-4 mr-2" />
              View Cards
            </TabsTrigger>
          </TabsList>

          {/* Diagnostics Tab */}
          <TabsContent value="diagnostics" className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Database & Edge Function Diagnostics
                </CardTitle>
                <CardDescription className="text-amber-200">
                  Test database connectivity, table access, and edge function health before parsing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Test Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={handleTestConnection}
                    disabled={testing}
                    className="bg-blue-600 hover:bg-blue-700 h-auto py-4 flex-col gap-2"
                  >
                    {testing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Database className="h-5 w-5" />}
                    <span className="text-sm font-medium">Test Table Access</span>
                    <span className="text-xs opacity-75">SELECT from parsed_game_cards</span>
                  </Button>
                  
                  <Button
                    onClick={handleTestInsert}
                    disabled={testing}
                    className="bg-purple-600 hover:bg-purple-700 h-auto py-4 flex-col gap-2"
                  >
                    {testing ? <Loader2 className="h-5 w-5 animate-spin" /> : <TestTube className="h-5 w-5" />}
                    <span className="text-sm font-medium">Test Write Access</span>
                    <span className="text-xs opacity-75">INSERT + DELETE test row</span>
                  </Button>
                  
                  <Button
                    onClick={handlePingEdgeFunction}
                    disabled={testing}
                    className="bg-green-600 hover:bg-green-700 h-auto py-4 flex-col gap-2"
                  >
                    {testing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                    <span className="text-sm font-medium">Ping Edge Function</span>
                    <span className="text-xs opacity-75">Health check (no DB)</span>
                  </Button>
                  
                  <Button
                    onClick={handleTestEdgeFunction}
                    disabled={testing}
                    className="bg-orange-600 hover:bg-orange-700 h-auto py-4 flex-col gap-2"
                  >
                    {testing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wifi className="h-5 w-5" />}
                    <span className="text-sm font-medium">Test Edge + DB</span>
                    <span className="text-xs opacity-75">Edge function check-table</span>
                  </Button>
                </div>

                {/* Connection Status */}
                {dbDetails && (
                  <div className={`p-4 rounded-lg border ${
                    dbStatus === 'connected' ? 'bg-green-500/10 border-green-500/30' :
                    dbStatus === 'error' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-gray-500/10 border-gray-500/30'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {dbStatus === 'connected' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-400" />
                      )}
                      <span className="text-white font-medium">
                        {dbStatus === 'connected' ? 'Database Connection OK' : 'Database Connection Failed'}
                      </span>
                    </div>
                    <p className="text-sm text-amber-200 whitespace-pre-wrap">{dbDetails}</p>
                  </div>
                )}

                {/* Quick Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Supabase Config</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-amber-300">URL:</span>
                        <span className="text-white font-mono text-xs">yrfjejengmkqpjbluexn.supabase.co</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-300">Table:</span>
                        <span className="text-white font-mono text-xs">public.parsed_game_cards</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-amber-300">Auth:</span>
                        <span className="text-white font-mono text-xs">anon key</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 className="text-white font-medium mb-2">Expected Table Schema</h4>
                    <div className="text-xs text-amber-200 font-mono space-y-0.5">
                      <div>id (uuid), game_id (text), card_type (text)</div>
                      <div>card_name, card_text, card_effect (text)</div>
                      <div>card_category (text), card_number (int)</div>
                      <div>drink_count (int), metadata (jsonb)</div>
                      <div>source_file (text), created_at, updated_at</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Debug Log */}
            <Card className="bg-white/10 border-white/20">
              <CardHeader className="cursor-pointer" onClick={() => setShowDebug(!showDebug)}>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Debug Log ({debugLogs.length} entries)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => { e.stopPropagation(); setDebugLogs([]); }}
                      className="text-amber-200 hover:text-white hover:bg-white/10"
                    >
                      Clear
                    </Button>
                    {showDebug ? <ChevronUp className="h-4 w-4 text-amber-200" /> : <ChevronDown className="h-4 w-4 text-amber-200" />}
                  </div>
                </CardTitle>
              </CardHeader>
              {showDebug && (
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-lg bg-gray-900/80 p-4 font-mono text-xs">
                    {debugLogs.length === 0 ? (
                      <div className="text-gray-500">No logs yet. Run a diagnostic test to see output.</div>
                    ) : (
                      debugLogs.map((log, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                          <span className={getLogColor(log.level)}>
                            [{log.level.toUpperCase()}]
                          </span>{' '}
                          <span className="text-gray-200">{log.message}</span>
                          {log.data && (
                            <div className="ml-4 text-gray-400 whitespace-pre-wrap">
                              {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                    <div ref={debugEndRef} />
                  </ScrollArea>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          {/* Parse Tab */}
          <TabsContent value="parse" className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Parse Excel Files</CardTitle>
                <CardDescription className="text-amber-200">
                  Fetch and parse Excel files from storage to populate the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={handleParseAll}
                    disabled={parsing}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {parsing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    Parse All Files
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleClearCards()}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Cards
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => { loadCardCounts(); loadCards(); }}
                    disabled={loading}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Counts
                  </Button>
                </div>

                {/* Available Assets */}
                <div className="space-y-2">
                  <h3 className="text-white font-medium">Available Excel Files</h3>
                  {assets.length === 0 ? (
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10 text-amber-200 text-sm">
                      <AlertCircle className="h-4 w-4 inline mr-2" />
                      No assets loaded. The edge function may not be responding. Check the Diagnostics tab.
                    </div>
                  ) : (
                    <div className="grid gap-2">
                      {assets.map((asset) => (
                        <div
                          key={asset.key}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                        >
                          <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-5 w-5 text-green-400" />
                            <div>
                              <div className="text-white font-medium">{asset.key}</div>
                              <div className="text-amber-200 text-sm">
                                {getGameDisplayName(asset.gameId)} - {asset.cardType}
                              </div>
                              {asset.url && (
                                <div className="text-amber-300/50 text-xs font-mono truncate max-w-md">
                                  {asset.url.substring(0, 80)}...
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-amber-200 border-amber-400">
                              {asset.gameId}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleParseSingle(asset.key)}
                              disabled={parsing}
                              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              {parsing ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Parse Results */}
                {parseResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white font-medium">Parse Results</h3>
                    <div className="space-y-2">
                      {parseResults.map((result, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            result.success
                              ? 'bg-green-500/10 border-green-500/30'
                              : 'bg-red-500/10 border-red-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {result.success ? (
                              <CheckCircle2 className="h-5 w-5 text-green-400" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-400" />
                            )}
                            <span className="text-white">{result.key}</span>
                          </div>
                          <div className="text-right">
                            {result.success ? (
                              <span className="text-green-400">{result.count} cards</span>
                            ) : (
                              <span className="text-red-400 text-sm">{result.error}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cards Tab */}
          <TabsContent value="cards" className="space-y-4">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Parsed Cards</CardTitle>
                <CardDescription className="text-amber-200">
                  View and manage cards stored in the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="space-y-1">
                    <Label className="text-amber-200">Game</Label>
                    <Select value={selectedGame} onValueChange={setSelectedGame}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Games</SelectItem>
                        <SelectItem value="shito">SHITO</SelectItem>
                        <SelectItem value="shitz-creek">Shitz Creek</SelectItem>
                        <SelectItem value="slanging-shit">Slanging Shit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-amber-200">Card Type</Label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        {uniqueCardTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1 flex-1 min-w-[200px]">
                    <Label className="text-amber-200">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-amber-400" />
                      <Input
                        placeholder="Search cards..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-amber-300/50"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-amber-200">&nbsp;</Label>
                    <Button
                      variant="outline"
                      onClick={loadCards}
                      disabled={loading}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Cards Table */}
                <ScrollArea className="h-[500px] rounded-lg border border-white/20">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/20 hover:bg-white/5">
                        <TableHead className="text-amber-200">#</TableHead>
                        <TableHead className="text-amber-200">Game</TableHead>
                        <TableHead className="text-amber-200">Type</TableHead>
                        <TableHead className="text-amber-200">Name/Category</TableHead>
                        <TableHead className="text-amber-200">Text</TableHead>
                        <TableHead className="text-amber-200">Effect</TableHead>
                        <TableHead className="text-amber-200">Drinks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" />
                          </TableCell>
                        </TableRow>
                      ) : filteredCards.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-amber-200">
                            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                            No cards found. Parse Excel files to populate the database.
                            {dbStatus === 'error' && (
                              <div className="text-red-400 text-sm mt-2">
                                Database connection issue detected. Check the Diagnostics tab.
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCards.map((card, idx) => (
                          <TableRow key={card.id} className="border-white/10 hover:bg-white/5">
                            <TableCell className="text-white">{card.card_number || idx + 1}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-amber-200 border-amber-400">
                                {card.game_id}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-amber-200">{card.card_type}</TableCell>
                            <TableCell className="text-white">
                              {card.card_name || card.card_category || '-'}
                            </TableCell>
                            <TableCell className="text-white max-w-xs truncate">
                              {card.card_text || '-'}
                            </TableCell>
                            <TableCell className="text-amber-200 max-w-xs truncate">
                              {card.card_effect || '-'}
                            </TableCell>
                            <TableCell className="text-white">
                              {card.drink_count > 0 ? card.drink_count : '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
                
                <div className="text-amber-200 text-sm">
                  Showing {filteredCards.length} of {cards.length} cards
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
