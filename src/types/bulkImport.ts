import { CardType } from './gameCards';

export interface BulkImportCard {
  game_id: string;
  card_type: CardType;
  file_url: string;
  file_name: string;
  description?: string;
  file_size?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface BulkImportRow {
  index: number;
  data: BulkImportCard;
  isValid: boolean;
  isDuplicate: boolean;
  errors: ValidationError[];
}

export interface BulkImportState {
  rows: BulkImportRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
}

export interface ImportProgress {
  current: number;
  total: number;
  status: 'idle' | 'validating' | 'importing' | 'complete' | 'error';
  successCount: number;
  errorCount: number;
  errors: string[];
}

export const REQUIRED_FIELDS = ['game_id', 'card_type', 'file_url', 'file_name'] as const;

export const VALID_CARD_TYPES: CardType[] = ['prompt', 'response'];
