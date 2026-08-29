import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

// ---------------------------------------------------------------------------
// Language System
// ---------------------------------------------------------------------------
// This module provides the global language state for the ENTIRE application.
//
//  - en = English, ta = Tamil, hi = Hindi
//  - The selected language is persisted to localStorage so it survives a page
//    refresh or navigating between pages (dashboard -> application -> payment
//    -> certificate ...).
//  - The default language after login is English (en).
//
// The LOGIN page is intentionally left OUT of this system — it is always shown
// in English only with no language selector.
// ---------------------------------------------------------------------------

const LanguageContext = createContext(null);

// Key used to persist the selected language in the browser.
const STORAGE_KEY = 'lm_language';

export function LanguageProvider({ children }) {
  // Read the saved language from localStorage, defaulting to English.
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && translations[saved]) return saved;
    } catch {
      /* ignore storage errors */
    }
    return 'en';
  });

  // Keep localStorage in sync whenever the language changes.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* ignore */ }
  }, [language]);

  // The translation lookup function. Usage: t('dashboard')
  // Falls back to English (then the key itself) if a translation is missing.
  const t = (key) => {
    const table = translations[language] || translations.en;
    if (table && table[key] != null) return table[key];
    if (translations.en && translations.en[key] != null) return translations.en[key];
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
