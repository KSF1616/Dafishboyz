import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { BulkImportRow } from '@/types/bulkImport';
import { games } from '@/data/gamesData';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  rows: BulkImportRow[];
  onRemoveRow: (index: number) => void;
}

export const BulkImportPreview: React.FC<Props> = ({ rows, onRemoveRow }) => {
  const getGameName = (id: string) => games.find(g => g.id === id)?.name || id;
  
  const StatusIcon = ({ row }: { row: BulkImportRow }) => {
    if (row.isDuplicate) return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    if (!row.isValid) return <XCircle className="w-4 h-4 text-red-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  if (rows.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="max-h-[400px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left w-12">#</th>
              <th className="px-3 py-2 text-left w-12">Status</th>
              <th className="px-3 py-2 text-left">Game</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">File Name</th>
              <th className="px-3 py-2 text-left">Issues</th>
              <th className="px-3 py-2 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row) => (
              <tr key={row.index} className={`${!row.isValid ? 'bg-red-50 dark:bg-red-900/20' : row.isDuplicate ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}>
                <td className="px-3 py-2 text-gray-500">{row.index + 1}</td>
                <td className="px-3 py-2"><StatusIcon row={row} /></td>
                <td className="px-3 py-2 font-medium">{getGameName(row.data.game_id)}</td>
                <td className="px-3 py-2">
                  <Badge variant={row.data.card_type === 'prompt' ? 'default' : 'secondary'}>
                    {row.data.card_type || '-'}
                  </Badge>
                </td>
                <td className="px-3 py-2 truncate max-w-[150px]">{row.data.file_name || '-'}</td>
                <td className="px-3 py-2">
                  {row.isDuplicate && <span className="text-amber-600 text-xs">Duplicate</span>}
                  {row.errors.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger><span className="text-red-600 text-xs">{row.errors.length} error(s)</span></TooltipTrigger>
                        <TooltipContent><ul className="text-xs">{row.errors.map((e, i) => <li key={i}>{e.field}: {e.message}</li>)}</ul></TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => onRemoveRow(row.index)} className="text-gray-400 hover:text-red-500"><XCircle className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
