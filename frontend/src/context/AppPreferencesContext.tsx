import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate } from "../i18n";
import type { AppLanguage, TranslationKey } from "../i18n";

export type AppThemeMode = "light" | "dark";

export type SimulatorVisibility = {
  plantSimulator: boolean;
  warehouseSimulator: boolean;
};

const THEME_KEY = "ui-theme-mode";
const LANGUAGE_KEY = "ui-language";
const SIMULATOR_VISIBILITY_KEY = "ui-simulator-visibility";

type AppPreferencesContextValue = {
  themeMode: AppThemeMode;
  language: AppLanguage;
  simulatorVisibility: SimulatorVisibility;
  setThemeMode: (mode: AppThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setSimulatorVisibility: (next: Partial<SimulatorVisibility>) => void;
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

function getStoredSimulatorVisibility(): SimulatorVisibility {
  const raw = localStorage.getItem(SIMULATOR_VISIBILITY_KEY);
  if (!raw) {
    return {
      plantSimulator: true,
      warehouseSimulator: true,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SimulatorVisibility>;
    return {
      plantSimulator: parsed.plantSimulator !== false,
      warehouseSimulator: parsed.warehouseSimulator !== false,
    };
  } catch {
    return {
      plantSimulator: true,
      warehouseSimulator: true,
    };
  }
}

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<AppThemeMode>(getStoredThemeMode);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage);
  const [simulatorVisibility, setSimulatorVisibilityState] = useState<SimulatorVisibility>(
    getStoredSimulatorVisibility,
  );

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem(SIMULATOR_VISIBILITY_KEY, JSON.stringify(simulatorVisibility));
  }, [simulatorVisibility]);

  const setSimulatorVisibility = (next: Partial<SimulatorVisibility>) => {
    setSimulatorVisibilityState((previous) => ({
      ...previous,
      ...next,
    }));
  };

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      themeMode,
      language,
      simulatorVisibility,
      setThemeMode,
      setLanguage,
      setSimulatorVisibility,
      t: (key) => translate(language, key),
    }),
    [language, simulatorVisibility, themeMode],
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
