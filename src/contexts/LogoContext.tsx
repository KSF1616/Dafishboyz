import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Default logo URL - CORRECT URL from user
const DEFAULT_LOGO_URL = 'https://yrfjejengmkqpjbluexn.supabase.co/storage/v1/object/public/Logo/dafishboyz-logo.png';

interface LogoContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  resetToDefault: () => void;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

const LOGO_STORAGE_KEY = 'dafishboyz_logo_url';

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrlState] = useState<string>(() => {
    // Try to get from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOGO_STORAGE_KEY);
      return saved || DEFAULT_LOGO_URL;
    }
    return DEFAULT_LOGO_URL;
  });

  const setLogoUrl = (url: string) => {
    setLogoUrlState(url);
    localStorage.setItem(LOGO_STORAGE_KEY, url);
  };

  const resetToDefault = () => {
    setLogoUrlState(DEFAULT_LOGO_URL);
    localStorage.removeItem(LOGO_STORAGE_KEY);
  };

  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl, resetToDefault }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error('useLogo must be used within a LogoProvider');
  }
  return context;
}

// Export default URL for reference
export const DEFAULT_LOGO = DEFAULT_LOGO_URL;
