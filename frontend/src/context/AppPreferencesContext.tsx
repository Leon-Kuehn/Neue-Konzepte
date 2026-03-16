import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate } from "../i18n";
import type { AppLanguage, TranslationKey } from "../i18n";

export type AppThemeMode = "light" | "dark";

const THEME_KEY = "ui-theme-mode";
const LANGUAGE_KEY = "ui-language";

type AppPreferencesContextValue = {
  themeMode: AppThemeMode;
  language: AppLanguage;
  setThemeMode: (mode: AppThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  t: (key: TranslationKey) => string;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function getStoredThemeMode(): AppThemeMode {
  const raw = localStorage.getItem(THEME_KEY);
  return raw === "dark" ? "dark" : "light";
}

function getStoredLanguage(): AppLanguage {
  const raw = localStorage.getItem(LANGUAGE_KEY);
  if (raw === "de" || raw === "fr") {
    return raw;
  }
  return "en";
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<AppThemeMode>(getStoredThemeMode);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      themeMode,
      language,
      setThemeMode,
      setLanguage,
      t: (key) => translate(language, key),
    }),
    [language, themeMode],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}

export function useAppPreferences(): AppPreferencesContextValue {
  const context = useContext(AppPreferencesContext);
  if (!context) {
    throw new Error("useAppPreferences must be used inside AppPreferencesProvider");
  }
  return context;
}
