// Storage configuration for self-hosted vs Supabase deployments
export type StorageType = 'supabase' | 'local';

export interface StorageConfig {
  type: StorageType;
  localApiUrl: string;
  publicPath: string;
}

// Default configuration - can be overridden via environment variables
export const storageConfig: StorageConfig = {
  // Set to 'local' for self-hosted deployments
  type: (import.meta.env.VITE_STORAGE_TYPE as StorageType) || 'supabase',
  // Local API endpoint for self-hosted file uploads
  localApiUrl: import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:3001/api',
  // Public path where files are served from
  publicPath: import.meta.env.VITE_PUBLIC_PATH || '/game-cards'
};

// File naming conventions
export const generateFileName = (gameId: string, cardType: string = 'cards'): string => {
  const timestamp = Date.now();
  const sanitizedGameId = gameId.replace(/[^a-zA-Z0-9-_]/g, '_');
  const sanitizedCardType = cardType.replace(/[^a-zA-Z0-9-_]/g, '_');
  return `${sanitizedGameId}-${sanitizedCardType}-${timestamp}.pdf`;
};

// Get public URL for a file based on storage type
export const getPublicUrl = (fileName: string, storageType: StorageType = storageConfig.type): string => {
  if (storageType === 'local') {
    return `${storageConfig.publicPath}/${fileName}`;
  }
  // For Supabase, the URL is returned from the upload response
  return fileName;
};

export const isLocalStorage = (): boolean => storageConfig.type === 'local';
