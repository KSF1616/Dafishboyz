import { supabase } from './supabase';
import { storageConfig, generateFileName, StorageType } from './storageConfig';

export interface UploadResult {
  success: boolean;
  fileName: string;
  publicUrl: string;
  size: number;
  error?: string;
}

export interface UploadOptions {
  gameId: string;
  cardType?: string;
  onProgress?: (progress: number) => void;
  storageType?: StorageType;
}

// Upload to local server API
async function uploadToLocal(file: File, options: UploadOptions): Promise<UploadResult> {
  const { gameId, cardType = 'cards', onProgress } = options;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('gameId', gameId);
  formData.append('cardType', cardType);

  try {
    const response = await fetch(`${storageConfig.localApiUrl}/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Upload failed');
    onProgress?.(100);
    return { success: true, fileName: data.fileName, publicUrl: data.publicUrl, size: file.size };
  } catch (error: any) {
    return { success: false, fileName: '', publicUrl: '', size: 0, error: error.message };
  }
}

// Upload to Supabase storage
async function uploadToSupabase(file: File, options: UploadOptions): Promise<UploadResult> {
  const { gameId, cardType = 'cards', onProgress } = options;
  const fileName = generateFileName(gameId, cardType);

  try {
    const { error } = await supabase.storage.from('game-cards').upload(fileName, file, { contentType: 'application/pdf', upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('game-cards').getPublicUrl(fileName);
    onProgress?.(100);
    return { success: true, fileName, publicUrl: urlData.publicUrl, size: file.size };
  } catch (error: any) {
    return { success: false, fileName: '', publicUrl: '', size: 0, error: error.message };
  }
}

// Main upload function - routes to appropriate storage
export async function uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
  const storageType = options.storageType || storageConfig.type;
  return storageType === 'local' ? uploadToLocal(file, options) : uploadToSupabase(file, options);
}

// Delete file from storage
export async function deleteFile(fileName: string, storageType: StorageType = storageConfig.type): Promise<boolean> {
  if (storageType === 'local') {
    const res = await fetch(`${storageConfig.localApiUrl}/delete`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileName }) });
    return res.ok;
  }
  const { error } = await supabase.storage.from('game-cards').remove([fileName]);
  return !error;
}
