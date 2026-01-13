'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

// Import translations
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import zh from '@/locales/zh.json';

// Supported languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

// All translations
const translations: Record<LanguageCode, typeof en> = {
  en,
  es,
  zh,
};

// Type for translation keys
type TranslationKeys = typeof en;
type NestedKeyOf<T, K = keyof T> = K extends keyof T & string
  ? T[K] extends object
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K
  : never;

type TranslationKey = NestedKeyOf<TranslationKeys>;

// Context type
interface I18nContextType {
  locale: LanguageCode;
  setLocale: (locale: LanguageCode) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  languages: typeof LANGUAGES;
}

const I18nContext = createContext<I18nContextType | null>(null);

// Storage key
const LOCALE_STORAGE_KEY = 'worldvegas_locale';

// Get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

// Provider component
export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LanguageCode>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize locale from storage or browser preference
  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as LanguageCode | null;

    if (stored && stored in LANGUAGES) {
      setLocaleState(stored);
    } else {
      // Try to detect from browser
      const browserLang = navigator.language.split('-')[0] as LanguageCode;
      if (browserLang in LANGUAGES) {
        setLocaleState(browserLang);
      }
    }

    setIsInitialized(true);
  }, []);

  // Set locale and persist
  const setLocale = useCallback((newLocale: LanguageCode) => {
    if (newLocale in LANGUAGES) {
      setLocaleState(newLocale);
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);

      // Update document lang attribute
      document.documentElement.lang = newLocale;
    }
  }, []);

  // Translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const translation = getNestedValue(translations[locale] as Record<string, unknown>, key);

      if (!translation) {
        // Fallback to English
        const fallback = getNestedValue(translations.en as Record<string, unknown>, key);
        if (!fallback) {
          console.warn(`Translation missing for key: ${key}`);
          return key;
        }
        return interpolate(fallback, params);
      }

      return interpolate(translation, params);
    },
    [locale]
  );

  // Interpolate params into translation string
  const interpolate = (text: string, params?: Record<string, string | number>): string => {
    if (!params) return text;

    return text.replace(/\{(\w+)\}/g, (_, key) => {
      return params[key]?.toString() ?? `{${key}}`;
    });
  };

  // Don't render children until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n
export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }

  return context;
}

// Hook for just translation function (convenience)
export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}

export default I18nContext;
