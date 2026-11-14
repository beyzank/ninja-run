import React, { createContext, useContext, useEffect, useState } from 'react';
import { GameStorage } from '../storage/GameStorage';
import { ar } from './locales/ar';
import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { pl } from './locales/pl';
import { ptBR } from './locales/ptBR';
import { ru } from './locales/ru';
import { tr } from './locales/tr';
import { zh } from './locales/zh';
import { LanguageInfo, SupportedLanguage, TranslationSchema } from './types';

export * from './types';

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Simplified Chinese', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'pt-BR', name: 'Portuguese (BR)', nativeName: 'Português (BR)', flag: '🇧🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', isRTL: true },
];

const LOCALES: Record<SupportedLanguage, TranslationSchema> = {
  tr,
  en,
  es,
  fr,
  de,
  zh,
  ru,
  'pt-BR': ptBR,
  pl,
  ar,
};

function detectDeviceLanguage(): SupportedLanguage {
  try {
    let locale = '';
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      locale = Intl.DateTimeFormat().resolvedOptions().locale;
    } else if (typeof navigator !== 'undefined' && navigator.language) {
      locale = navigator.language;
    }

    if (locale) {
      const lower = locale.toLowerCase();
      if (lower.startsWith('tr')) return 'tr';
      if (lower.startsWith('en')) return 'en';
      if (lower.startsWith('es')) return 'es';
      if (lower.startsWith('fr')) return 'fr';
      if (lower.startsWith('de')) return 'de';
      if (lower.startsWith('zh')) return 'zh';
      if (lower.startsWith('ru')) return 'ru';
      if (lower.startsWith('pt')) return 'pt-BR';
      if (lower.startsWith('pl')) return 'pl';
      if (lower.startsWith('ar')) return 'ar';
    }
  } catch {
    // Ignore
  }
  return 'tr';
}

class LocalizationService {
  private currentLanguage: SupportedLanguage;
  private listeners = new Set<() => void>();

  constructor() {
    const saved = GameStorage.getLanguage() as SupportedLanguage | null;
    if (saved && LOCALES[saved]) {
      this.currentLanguage = saved;
    } else {
      this.currentLanguage = detectDeviceLanguage();
      GameStorage.setLanguage(this.currentLanguage);
    }
  }

  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  getLanguageInfo(): LanguageInfo {
    return (
      SUPPORTED_LANGUAGES.find((l) => l.code === this.currentLanguage) ||
      SUPPORTED_LANGUAGES[0]
    );
  }

  isRTL(): boolean {
    return this.getLanguageInfo().isRTL === true;
  }

  setLanguage(lang: SupportedLanguage): void {
    if (LOCALES[lang]) {
      this.currentLanguage = lang;
      GameStorage.setLanguage(lang);
      this.notifyListeners();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of Array.from(this.listeners)) {
      try {
        listener();
      } catch {
        // Ignore errors
      }
    }
  }

  t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.');
    let value: any = LOCALES[this.currentLanguage];

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Fallback to English, then Turkish
        let fallbackValue: any = LOCALES.en;
        for (const fbKey of keys) {
          if (fallbackValue && typeof fallbackValue === 'object' && fbKey in fallbackValue) {
            fallbackValue = fallbackValue[fbKey];
          } else {
            fallbackValue = null;
            break;
          }
        }
        if (typeof fallbackValue === 'string') {
          value = fallbackValue;
        } else {
          let trFallback: any = LOCALES.tr;
          for (const trKey of keys) {
            if (trFallback && typeof trFallback === 'object' && trKey in trFallback) {
              trFallback = trFallback[trKey];
            } else {
              trFallback = null;
              break;
            }
          }
          value = typeof trFallback === 'string' ? trFallback : path;
        }
        break;
      }
    }

    if (typeof value !== 'string') {
      return path;
    }

    // Param interpolation: {{paramName}}
    if (params) {
      return value.replace(/\{\{([^{}]+)\}\}/g, (_: string, match: string) => {
        const trimmed = match.trim();
        return params[trimmed] !== undefined ? String(params[trimmed]) : `{{${match}}}`;
      });
    }

    return value;
  }
}

export const LocalizationManager = new LocalizationService();

export const t = (path: string, params?: Record<string, string | number>): string => {
  return LocalizationManager.t(path, params);
};

export const getLanguage = (): SupportedLanguage => {
  return LocalizationManager.getLanguage();
};

export const setLanguage = (lang: SupportedLanguage): void => {
  LocalizationManager.setLanguage(lang);
};

export const isRTL = (): boolean => {
  return LocalizationManager.isRTL();
};

export interface I18nContextValue {
  lang: SupportedLanguage;
  isRTL: boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
  setLanguage: (lang: SupportedLanguage) => void;
  currentLanguageInfo: LanguageInfo;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<SupportedLanguage>(() => LocalizationManager.getLanguage());

  useEffect(() => {
    return LocalizationManager.subscribe(() => {
      setLang(LocalizationManager.getLanguage());
    });
  }, []);

  const handleSetLanguage = (newLang: SupportedLanguage) => {
    LocalizationManager.setLanguage(newLang);
    setLang(newLang);
  };

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const contextValue: I18nContextValue = {
    lang,
    isRTL: currentLanguageInfo.isRTL === true,
    t: (path, params) => LocalizationManager.t(path, params),
    setLanguage: handleSetLanguage,
    currentLanguageInfo,
  };

  return React.createElement(
    I18nContext.Provider,
    { value: contextValue },
    children
  );
};

/**
 * React Hook for component reactive translations
 */
export function useLanguage(): I18nContextValue {
  const context = useContext(I18nContext);
  const [fallbackLang, setFallbackLang] = useState<SupportedLanguage>(() => LocalizationManager.getLanguage());

  useEffect(() => {
    if (!context) {
      return LocalizationManager.subscribe(() => {
        setFallbackLang(LocalizationManager.getLanguage());
      });
    }
  }, [context]);

  if (context) {
    return context;
  }

  const currentLanguageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === fallbackLang) || SUPPORTED_LANGUAGES[0];

  return {
    lang: fallbackLang,
    isRTL: currentLanguageInfo.isRTL === true,
    t: (path: string, params?: Record<string, string | number>) =>
      LocalizationManager.t(path, params),
    setLanguage: (newLang: SupportedLanguage) => LocalizationManager.setLanguage(newLang),
    currentLanguageInfo,
  };
}
