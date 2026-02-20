import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileJson, 
  Trash2,
  LogOut,
  Zap,
  Server,
  ArrowRightLeft,
  Info,
  Eye,
  EyeOff,
  Plug
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface TableCounts {
  [key: string]: number;
}

interface ExportData {
  [key: string]: any[];
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

interface ImportResults {
  [key: string]: ImportResult;
}

const AVAILABLE_TABLES = [
  { id: 'game_cards', name: 'Game Cards', description: 'Card PDFs and metadata for all games' },
  { id: 'promo_codes', name: 'Promo Codes', description: 'Promotional discount codes' },
  { id: 'game_settings', name: 'Game Settings', description: 'Bundle discounts and other settings' },
  { id: 'profiles', name: 'User Profiles', description: 'User profile data and preferences' },
  { id: 'free_trials', name: 'Free Trials', description: 'Free trial registrations' },
  { id: 'subscriptions', name: 'Subscriptions', description: 'User subscription data' },
  { id: 'promo_redemptions', name: 'Promo Redemptions', description: 'Promo code usage history' },
];

// New DaFish Boyz Games database credentials (target)
const TARGET_DB_URL = 'https://yrfjejengmkqpjbluexn.supabase.co';

const AdminDataMigration: React.FC = () => {
  const [currentCounts, setCurrentCounts] = useState<TableCounts>({});
  const [sourceCounts, setSourceCounts] = useState<TableCounts>({});
  const [selectedTables, setSelectedTables] = useState<string[]>(AVAILABLE_TABLES.map(t => t.id));
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingCounts, setIsLoadingCounts] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [exportedData, setExportedData] = useState<ExportData | null>(null);
  const [importResults, setImportResults] = useState<ImportResults | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'failed'>('untested');
  
  // Source database credentials (old database)
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceKey, setSourceKey] = useState('');
  const [showSourceKey, setShowSourceKey] = useState(false);
  
  // Target database key (for the new database - URL is fixed)
  const [targetKey, setTargetKey] = useState('');
  const [showTargetKey, setShowTargetKey] = useState(false);
  
  const { toast } = useToast();
  const { user, signOut, isDemo } = useAuth();

  const fetchCurrentCounts = async () => {
    setIsLoadingCounts(true);
    try {
      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: { action: 'get-table-counts', tables: AVAILABLE_TABLES.map(t => t.id) }
      });
      
      if (data?.success) {
        setCurrentCounts(data.counts);
      } else {
        toast({ title: 'Error', description: data?.error || 'Failed to fetch table counts', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setIsLoadingCounts(false);
  };

  const handleExportFromSource = async () => {
    if (!sourceUrl || !sourceKey) {
      toast({ title: 'Error', description: 'Please enter source database URL and key', variant: 'destructive' });
      return;
    }

    setIsExporting(true);
    setExportedData(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: { 
          action: 'export-from-source', 
          sourceUrl, 
          sourceKey,
          tables: selectedTables 
        }
      });
      
      if (data?.success) {
        setExportedData(data.data);
        setSourceCounts(data.counts);
        toast({ 
          title: 'Export Successful', 
          description: `Exported data from ${Object.keys(data.counts).length} tables` 
        });
        
        if (data.errors && data.errors.length > 0) {
          toast({ 
            title: 'Some tables had errors', 
            description: data.errors.join(', '), 
            variant: 'destructive' 
          });
        }
      } else {
        toast({ title: 'Export Failed', description: data?.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Export Failed', description: err.message, variant: 'destructive' });
    }
    
    setIsExporting(false);
  };

  const handleExportCurrent = async () => {
    setIsExporting(true);
    setExportedData(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: { action: 'export', tables: selectedTables }
      });
      
      if (data?.success) {
        setExportedData(data.data);
        toast({ 
          title: 'Export Successful', 
          description: `Exported data from ${Object.keys(data.counts).length} tables` 
        });
      } else {
        toast({ title: 'Export Failed', description: data?.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Export Failed', description: err.message, variant: 'destructive' });
    }
    
    setIsExporting(false);
  };

  const handleDownloadExport = () => {
    if (!exportedData) return;
    
    const blob = new Blob([JSON.stringify(exportedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dafish-boyz-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({ title: 'Downloaded', description: 'Export file saved to your downloads' });
  };

  const handleImportFromExport = async () => {
    if (!exportedData) {
      toast({ title: 'Error', description: 'No exported data to import', variant: 'destructive' });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportResults(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: { action: 'import', data: exportedData }
      });
      
      if (data?.success) {
        setImportResults(data.results);
        setImportProgress(100);
        toast({ title: 'Import Complete', description: 'Data has been imported successfully' });
        fetchCurrentCounts();
      } else {
        toast({ title: 'Import Failed', description: data?.error || 'Unknown error', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Import Failed', description: err.message, variant: 'destructive' });
    }
    
    setIsImporting(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setExportedData(data);
        
        // Calculate counts from uploaded data
        const counts: TableCounts = {};
        Object.keys(data).forEach(table => {
          counts[table] = Array.isArray(data[table]) ? data[table].length : 0;
        });
        setSourceCounts(counts);
        
        toast({ title: 'File Loaded', description: 'Export file loaded successfully' });
      } catch (err) {
        toast({ title: 'Error', description: 'Invalid JSON file', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearTable = async (tableName: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: { action: 'clear-table', tableName }
      });
      
      if (data?.success) {
        toast({ title: 'Table Cleared', description: `${tableName} has been cleared` });
        fetchCurrentCounts();
      } else {
        toast({ title: 'Error', description: data?.error || 'Failed to clear table', variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
    setShowClearConfirm(null);
  };

  const toggleTableSelection = (tableId: string) => {
    setSelectedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(t => t !== tableId)
        : [...prev, tableId]
    );
  };

  const selectAllTables = () => {
    setSelectedTables(AVAILABLE_TABLES.map(t => t.id));
  };

  const deselectAllTables = () => {
    setSelectedTables([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied', description: 'Copied to clipboard' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Data migration operations may be limited in demo mode.</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
              <ArrowLeft className="w-4 h-4" /> Back to Admin
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />Sign Out
            </Button>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <ArrowRightLeft className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Data Migration Tool</h1>
              <p className="text-gray-500">Export and import data between Supabase databases</p>
            </div>
          </div>
          <Button variant="outline" onClick={fetchCurrentCounts} disabled={isLoadingCounts}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingCounts ? 'animate-spin' : ''}`} />
            Refresh Counts
          </Button>
        </div>

        {/* Current Database Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Server className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold">Current Database (DaFish Boyz Games)</h2>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
              Connected
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {AVAILABLE_TABLES.map(table => (
              <div key={table.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-white">
                  {currentCounts[table.id] !== undefined ? (
                    currentCounts[table.id] === -1 ? (
                      <span className="text-red-500 text-sm">Error</span>
                    ) : (
                      currentCounts[table.id]
                    )
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate" title={table.name}>{table.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="migrate" className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm">
            <TabsTrigger value="migrate" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700">
              <ArrowRightLeft className="w-4 h-4" />
              Migrate from Old DB
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
              <Download className="w-4 h-4" />
              Export Current
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-700">
              <Upload className="w-4 h-4" />
              Import from File
            </TabsTrigger>
          </TabsList>

          {/* Migrate Tab */}
          <TabsContent value="migrate" className="space-y-6">
            {/* Source Database Credentials */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold">Source Database Credentials</h2>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">How to get your old database credentials:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-600 dark:text-blue-400">
                      <li>Go to your old Supabase project dashboard</li>
                      <li>Navigate to Settings → API</li>
                      <li>Copy the Project URL and service_role key (NOT anon key)</li>
                      <li>The service_role key is needed to access all data</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="sourceUrl">Source Database URL</Label>
                  <Input
                    id="sourceUrl"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://xxxxx.supabase.co"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="sourceKey">Service Role Key</Label>
                  <div className="relative mt-1">
                    <Input
                      id="sourceKey"
                      type={showSourceKey ? 'text' : 'password'}
                      value={sourceKey}
                      onChange={(e) => setSourceKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSourceKey(!showSourceKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showSourceKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Select Tables to Migrate</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllTables}>Select All</Button>
                  <Button variant="outline" size="sm" onClick={deselectAllTables}>Deselect All</Button>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {AVAILABLE_TABLES.map(table => (
                  <label
                    key={table.id}
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTables.includes(table.id)
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      checked={selectedTables.includes(table.id)}
                      onCheckedChange={() => toggleTableSelection(table.id)}
                    />
                    <div>
                      <div className="font-medium">{table.name}</div>
                      <div className="text-sm text-gray-500">{table.description}</div>
                      {sourceCounts[table.id] !== undefined && (
                        <div className="text-xs text-blue-600 mt-1">
                          {sourceCounts[table.id]} records in source
                        </div>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export from Source Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleExportFromSource}
                disabled={isExporting || !sourceUrl || !sourceKey || selectedTables.length === 0}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-6 text-lg"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Exporting from Source...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Export from Old Database
                  </>
                )}
              </Button>
            </div>

            {/* Exported Data Preview */}
            {exportedData && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                    <h2 className="text-xl font-bold">Data Exported Successfully</h2>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadExport}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries(sourceCounts).map(([table, count]) => (
                    <div key={table} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{count}</div>
                      <div className="text-xs text-gray-500">{table}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleImportFromExport}
                    disabled={isImporting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-6 text-lg"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        Importing to New Database...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Import to DaFish Boyz Games
                      </>
                    )}
                  </Button>
                </div>

                {isImporting && (
                  <div className="mt-4">
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-center text-sm text-gray-500 mt-2">Importing data...</p>
                  </div>
                )}
              </div>
            )}

            {/* Import Results */}
            {importResults && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  <h2 className="text-xl font-bold">Import Complete</h2>
                </div>

                <div className="space-y-4">
                  {Object.entries(importResults).map(([table, result]) => (
                    <div key={table} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{table}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            {result.success} success
                          </span>
                          {result.failed > 0 && (
                            <span className="text-red-600 flex items-center gap-1">
                              <XCircle className="w-4 h-4" />
                              {result.failed} failed
                            </span>
                          )}
                        </div>
                      </div>
                      {result.errors.length > 0 && (
                        <Accordion type="single" collapsible>
                          <AccordionItem value="errors">
                            <AccordionTrigger className="text-sm text-red-600">
                              View {result.errors.length} errors
                            </AccordionTrigger>
                            <AccordionContent>
                              <ul className="text-xs text-red-500 space-y-1 max-h-32 overflow-y-auto">
                                {result.errors.map((err, i) => (
                                  <li key={i}>{err}</li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Export Current Tab */}
          <TabsContent value="export" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-bold">Export Current Database</h2>
              </div>
              
              <p className="text-gray-500 mb-6">
                Export all data from the current DaFish Boyz Games database to a JSON file for backup or migration.
              </p>

              {/* Table Selection */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Select Tables to Export</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllTables}>Select All</Button>
                    <Button variant="outline" size="sm" onClick={deselectAllTables}>Deselect All</Button>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AVAILABLE_TABLES.map(table => (
                    <label
                      key={table.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedTables.includes(table.id)
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Checkbox
                        checked={selectedTables.includes(table.id)}
                        onCheckedChange={() => toggleTableSelection(table.id)}
                      />
                      <span>{table.name}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        {currentCounts[table.id] ?? '-'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleExportCurrent}
                disabled={isExporting || selectedTables.length === 0}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Selected Tables
                  </>
                )}
              </Button>

              {exportedData && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Export Ready</span>
                    </div>
                    <Button onClick={handleDownloadExport}>
                      <FileJson className="w-4 h-4 mr-2" />
                      Download JSON
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Import from File Tab */}
          <TabsContent value="import" className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Upload className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold">Import from JSON File</h2>
              </div>
              
              <p className="text-gray-500 mb-6">
                Upload a previously exported JSON file to import data into the current database.
              </p>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center mb-6">
                <FileJson className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Drag & drop a JSON export file here, or click to browse
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="json-upload"
                />
                <label htmlFor="json-upload">
                  <Button variant="outline" asChild>
                    <span>Choose File</span>
                  </Button>
                </label>
              </div>

              {exportedData && (
                <>
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      <span className="font-medium">File Loaded</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(sourceCounts).map(([table, count]) => (
                        <div key={table} className="bg-white dark:bg-gray-800 rounded p-2 text-center">
                          <div className="font-bold">{count}</div>
                          <div className="text-xs text-gray-500">{table}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleImportFromExport}
                    disabled={isImporting}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {isImporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Import to Database
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>

            {/* Danger Zone - Clear Tables */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border-2 border-red-200 dark:border-red-900">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
              </div>
              
              <p className="text-gray-500 mb-6">
                Clear tables before importing to avoid duplicate data. This action cannot be undone.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AVAILABLE_TABLES.map(table => (
                  <Button
                    key={table.id}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setShowClearConfirm(table.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear {table.name}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Clear Table Confirmation */}
      <AlertDialog open={!!showClearConfirm} onOpenChange={() => setShowClearConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Clear Table?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear the <strong>{showClearConfirm}</strong> table? 
              This will permanently delete all {currentCounts[showClearConfirm || ''] || 0} records. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => showClearConfirm && handleClearTable(showClearConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, Clear Table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminDataMigration;
