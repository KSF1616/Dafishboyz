import { BulkImportCard, BulkImportRow, ValidationError, REQUIRED_FIELDS, VALID_CARD_TYPES } from '@/types/bulkImport';
import { games } from '@/data/gamesData';

const validGameIds = games.map(g => g.id);

export function parseCSV(content: string): BulkImportCard[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows: BulkImportCard[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const row: any = {};
    headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
    rows.push(row as BulkImportCard);
  }
  return rows;
}

export function parseJSON(content: string): BulkImportCard[] {
  try {
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : [data];
  } catch { return []; }
}

export function validateRow(data: BulkImportCard, index: number): BulkImportRow {
  const errors: ValidationError[] = [];
  
  REQUIRED_FIELDS.forEach(field => {
    if (!data[field] || String(data[field]).trim() === '') {
      errors.push({ field, message: `${field} is required` });
    }
  });
  
  if (data.game_id && !validGameIds.includes(data.game_id)) {
    errors.push({ field: 'game_id', message: `Invalid game_id. Must be: ${validGameIds.join(', ')}` });
  }
  
  if (data.card_type && !VALID_CARD_TYPES.includes(data.card_type)) {
    errors.push({ field: 'card_type', message: 'Must be "prompt" or "response"' });
  }
  
  if (data.file_url && !data.file_url.startsWith('http')) {
    errors.push({ field: 'file_url', message: 'Must be a valid URL' });
  }
  
  return { index, data, isValid: errors.length === 0, isDuplicate: false, errors };
}

export function detectDuplicates(rows: BulkImportRow[], existingUrls: string[]): BulkImportRow[] {
  const seenUrls = new Set(existingUrls);
  
  return rows.map(row => {
    const url = row.data.file_url;
    const isDuplicate = seenUrls.has(url);
    if (!isDuplicate) seenUrls.add(url);
    return { ...row, isDuplicate };
  });
}

export function parseFile(content: string, fileName: string): BulkImportCard[] {
  const ext = fileName.toLowerCase().split('.').pop();
  return ext === 'json' ? parseJSON(content) : parseCSV(content);
}
