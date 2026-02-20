import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DAFISH_BOYZ_LOGO_URL } from '@/lib/logoUrl';

// Re-export the logo URL for backward compatibility
export const FALLBACK_LOGO_URL = DAFISH_BOYZ_LOGO_URL;

interface MarketingAssets {
  logoUrl: string;
  flyerUrl: string | null;
  dfbUrl: string | null;
  isLoading: boolean;
  allFiles: string[];
  allImageUrls: string[];
  hasCustomLogo: boolean;
}

// Helper to check if a filename matches certain patterns
const matchesPattern = (filename: string, patterns: string[]): boolean => {
  const lower = filename.toLowerCase();
  return patterns.some(pattern => lower.includes(pattern.toLowerCase()));
};

// Helper to check if a file is an image
const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
  const lower = filename.toLowerCase();
  return imageExtensions.some(ext => lower.endsWith(ext));
};

export const useMarketingAssets = (): MarketingAssets => {
  // Always use the direct logo URL
  const [logoUrl] = useState<string>(DAFISH_BOYZ_LOGO_URL);
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [dfbUrl, setDfbUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allFiles, setAllFiles] = useState<string[]>([]);
  const [allImageUrls, setAllImageUrls] = useState<string[]>([]);
  // Logo is always "custom" since we're using the direct URL
  const [hasCustomLogo] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      const foundFiles: string[] = [];
      const foundImageUrls: string[] = [];
      let foundDfb: string | null = null;
      let foundFlyer: string | null = null;

      try {
        const dfbPatterns = ['dfb', 'd.f.b', 'd-f-b', 'd_f_b', 'founder', 'team'];
        const flyerPatterns = ['flyer', 'promo', 'promotional', 'poster', 'banner', 'ad'];

        // Process files from a folder
        const processFiles = async (folderPath: string, files: any[]) => {
          for (const file of files) {
            // Skip folders (they don't have an id)
            if (!file.id) continue;
            
            const name = file.name;
            const fullPath = folderPath ? `${folderPath}/${name}` : name;
            foundFiles.push(fullPath);
            
            // Only process image files
            if (!isImageFile(name)) continue;
            
            const { data: urlData } = supabase.storage
              .from('marketing')
              .getPublicUrl(fullPath);
            
            const publicUrl = urlData.publicUrl;
            foundImageUrls.push(publicUrl);
            
            // Check for DFB image
            if (!foundDfb && matchesPattern(name, dfbPatterns)) {
              console.log('Found DFB:', fullPath, publicUrl);
              foundDfb = publicUrl;
            }
            
            // Check for flyer/promo
            if (!foundFlyer && matchesPattern(name, flyerPatterns)) {
              console.log('Found flyer:', fullPath, publicUrl);
              foundFlyer = publicUrl;
            }
          }
        };

        // Fetch from general-marketing folder
        const { data: generalData, error: generalError } = await supabase.storage
          .from('marketing')
          .list('general-marketing');
        
        if (!generalError && generalData && generalData.length > 0) {
          await processFiles('general-marketing', generalData);
        }

        // Fetch from root marketing folder
        const { data: rootData, error: rootError } = await supabase.storage
          .from('marketing')
          .list('', { limit: 100 });
        
        if (!rootError && rootData && rootData.length > 0) {
          await processFiles('', rootData);
          
          // Check subfolders
          for (const item of rootData) {
            if (!item.id) {
              const { data: subfolderData } = await supabase.storage
                .from('marketing')
                .list(item.name);
              
              if (subfolderData && subfolderData.length > 0) {
                await processFiles(item.name, subfolderData);
              }
            }
          }
        }

        setDfbUrl(foundDfb);
        setFlyerUrl(foundFlyer);
        setAllFiles(foundFiles);
        setAllImageUrls(foundImageUrls);
        
        console.log('Marketing assets loaded:', { 
          logo: DAFISH_BOYZ_LOGO_URL, 
          dfb: foundDfb, 
          flyer: foundFlyer,
          totalFiles: foundFiles.length,
          totalImages: foundImageUrls.length
        });
        
      } catch (err) {
        console.error('Marketing assets error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { logoUrl, flyerUrl, dfbUrl, isLoading, allFiles, allImageUrls, hasCustomLogo };
};
