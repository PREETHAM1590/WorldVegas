'use client';

import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useI18n, LANGUAGES, LanguageCode } from '@/lib/i18n';

export function LanguageSelector() {
  const { locale, setLocale, languages } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLanguage = languages[locale];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
      >
        <Globe className="w-4 h-4 text-white/60" />
        <span className="text-sm">{currentLanguage.flag}</span>
        <span className="text-sm hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown
          className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
          {Object.values(languages).map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLocale(lang.code as LanguageCode);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors ${
                locale === lang.code ? 'bg-purple-600/20' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{lang.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-medium">{lang.nativeName}</p>
                  <p className="text-xs text-white/50">{lang.name}</p>
                </div>
              </div>
              {locale === lang.code && <Check className="w-4 h-4 text-purple-400" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for mobile/settings
export function LanguageSelectorCompact() {
  const { locale, setLocale, languages } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as LanguageCode)}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      {Object.values(languages).map((lang) => (
        <option key={lang.code} value={lang.code} className="bg-gray-800">
          {lang.flag} {lang.nativeName}
        </option>
      ))}
    </select>
  );
}

export default LanguageSelector;
