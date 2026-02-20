import React, { useState, useCallback } from 'react';
import { Database, CheckCircle, AlertTriangle, XCircle, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BulkImportDropzone } from './BulkImportDropzone';
import { BulkImportPreview } from './BulkImportPreview';
import { parseFile, validateRow, detectDuplicates } from '@/lib/bulkImportParser';
import { BulkImportRow, ImportProgress } from '@/types/bulkImport';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Props { existingUrls: string[]; onImportComplete: () => void; }

export const BulkImportSection: React.FC<Props> = ({ existingUrls, onImportComplete }) => {
  const [rows, setRows] = useState<BulkImportRow[]>([]);
  const [progress, setProgress] = useState<ImportProgress>({ current: 0, total: 0, status: 'idle', successCount: 0, errorCount: 0, errors: [] });
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileLoad = useCallback((content: string, fileName: string) => {
    setProgress(p => ({ ...p, status: 'validating' }));
    const parsed = parseFile(content, fileName);
    const validated = parsed.map((data, i) => validateRow(data, i));
    const withDuplicates = detectDuplicates(validated, existingUrls);
    setRows(withDuplicates);
    setProgress({ current: 0, total: withDuplicates.length, status: 'idle', successCount: 0, errorCount: 0, errors: [] });
  }, [existingUrls]);

  const handleRemoveRow = (index: number) => setRows(r => r.filter(row => row.index !== index));

  const validRows = rows.filter(r => r.isValid && !r.isDuplicate);
  const invalidCount = rows.filter(r => !r.isValid).length;
  const duplicateCount = rows.filter(r => r.isDuplicate).length;

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setProgress({ current: 0, total: validRows.length, status: 'importing', successCount: 0, errorCount: 0, errors: [] });
    
    let success = 0, errors: string[] = [];
    for (let i = 0; i < validRows.length; i++) {
      const row = validRows[i];
      try {
        const { error } = await supabase.from('game_cards').insert({ ...row.data, uploaded_by: user?.id });
        if (error) throw error;
        success++;
      } catch (e: any) { errors.push(`Row ${row.index + 1}: ${e.message}`); }
      setProgress(p => ({ ...p, current: i + 1, successCount: success, errorCount: errors.length, errors }));
    }
    setProgress(p => ({ ...p, status: 'complete' }));
    toast({ title: 'Import Complete', description: `${success} cards imported, ${errors.length} failed` });
    if (success > 0) { onImportComplete(); setRows([]); }
  };

  const downloadTemplate = () => {
    const csv = 'game_id,card_type,file_url,file_name,description\nup-shitz-creek,prompt,https://example.com/card.pdf,card1.pdf,Sample card';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bulk_import_template.csv'; a.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl"><Database className="w-8 h-8 text-blue-600" /></div>
          <div><h2 className="text-2xl font-bold">Bulk Import</h2><p className="text-gray-500">Upload CSV or JSON files</p></div>
        </div>
        <Button variant="outline" size="sm" onClick={downloadTemplate}><Download className="w-4 h-4 mr-2" />Template</Button>
      </div>

      <BulkImportDropzone onFileLoad={handleFileLoad} isLoading={progress.status === 'importing'} />

      {rows.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" />{validRows.length} valid</span>
            <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-red-500" />{invalidCount} invalid</span>
            <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-amber-500" />{duplicateCount} duplicates</span>
          </div>
          <BulkImportPreview rows={rows} onRemoveRow={handleRemoveRow} />
          {progress.status === 'importing' && <div><Progress value={(progress.current / progress.total) * 100} className="h-2" /><p className="text-sm text-center mt-2">{progress.current}/{progress.total}</p></div>}
          <Button onClick={handleImport} disabled={validRows.length === 0 || progress.status === 'importing'} className="w-full"><Play className="w-4 h-4 mr-2" />Import {validRows.length} Cards</Button>
        </div>
      )}
    </div>
  );
};
