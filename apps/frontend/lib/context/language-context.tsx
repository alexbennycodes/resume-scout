'use client';

import React, { createContext, useContext } from 'react';
import { locales, localeNames } from '@/i18n/config';

interface LanguageContextValue {
  contentLanguage: 'en';
  uiLanguage: 'en';
  isLoading: false;
  setContentLanguage: () => Promise<void>;
  setUiLanguage: () => void;
  languageNames: typeof localeNames;
  supportedLanguages: readonly ['en'];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const value: LanguageContextValue = {
    contentLanguage: 'en',
    uiLanguage: 'en',
    isLoading: false,
    setContentLanguage: async () => {},
    setUiLanguage: () => {},
    languageNames: localeNames,
    supportedLanguages: locales,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
