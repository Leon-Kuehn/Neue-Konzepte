import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { translate } from "../i18n";
import type { AppLanguage, TranslationKey } from "../i18n";

export type AppThemeMode = "light" | "dark" | "system";
export type AppTextScale = "normal" | "large";
export type AppColorStyle = "dhbw-red" | "ocean-blue" | "forest-green" | "violet";

export type SimulatorVisibility = {
  plantSimulator: boolean;
  warehouseSimulator: boolean;
};

export type AccessibilityPreferences = {
  reducedMotion: boolean;
  textScale: AppTextScale;
  highContrast: boolean;
  errorPulse: boolean;
};

const THEME_KEY = "ui-theme-mode";
const COLOR_STYLE_KEY = "ui-color-style";
const LANGUAGE_KEY = "ui-language";
const SIMULATOR_VISIBILITY_KEY = "ui-simulator-visibility";
const ACCESSIBILITY_KEY = "ui-accessibility";

type AppPreferencesContextValue = {
  themeMode: AppThemeMode;
  colorStyle: AppColorStyle;
  language: AppLanguage;
  simulatorVisibility: SimulatorVisibility;
  accessibility: AccessibilityPreferences;
  setThemeMode: (mode: AppThemeMode) => void;
  setColorStyle: (style: AppColorStyle) => void;
  setLanguage: (language: AppLanguage) => void;
  setSimulatorVisibility: (next: Partial<SimulatorVisibility>) => void;
  setAccessibility: (next: Partial<AccessibilityPreferences>) => void;
  t: (key: TranslationKey) => string;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

function getStoredThemeMode(): AppThemeMode {
  const raw = localStorage.getItem(THEME_KEY);
  if (raw === "dark" || raw === "system") {
    return raw;
  }
  return "light";
}

function getStoredAccessibility(): AccessibilityPreferences {
  const raw = localStorage.getItem(ACCESSIBILITY_KEY);
  if (!raw) {
    return {
      reducedMotion: false,
      textScale: "normal",
      highContrast: false,
      errorPulse: false,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AccessibilityPreferences>;
    return {
      reducedMotion: parsed.reducedMotion === true,
      textScale: parsed.textScale === "large" ? "large" : "normal",
      highContrast: parsed.highContrast === true,
      errorPulse: parsed.errorPulse === true,
    };
  } catch {
    return {
      reducedMotion: false,
      textScale: "normal",
      highContrast: false,
      errorPulse: false,
    };
  }
}

function getStoredColorStyle(): AppColorStyle {
  const raw = localStorage.getItem(COLOR_STYLE_KEY);
  if (raw === "ocean-blue" || raw === "forest-green" || raw === "violet") {
    return raw;
  }
  return "dhbw-red";
}

function getStoredLanguage(): AppLanguage {
  const raw = localStorage.getItem(LANGUAGE_KEY);
  if (raw === "de" || raw === "fr" || raw === "es") {
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
  const [colorStyle, setColorStyle] = useState<AppColorStyle>(getStoredColorStyle);
  const [language, setLanguage] = useState<AppLanguage>(getStoredLanguage);
  const [simulatorVisibility, setSimulatorVisibilityState] = useState<SimulatorVisibility>(
    getStoredSimulatorVisibility,
  );
  const [accessibility, setAccessibilityState] = useState<AccessibilityPreferences>(
    getStoredAccessibility,
  );

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeMode);
  }, [themeMode]);

  useEffect(() => {
    localStorage.setItem(COLOR_STYLE_KEY, colorStyle);
  }, [colorStyle]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem(SIMULATOR_VISIBILITY_KEY, JSON.stringify(simulatorVisibility));
  }, [simulatorVisibility]);

  useEffect(() => {
    localStorage.setItem(ACCESSIBILITY_KEY, JSON.stringify(accessibility));
  }, [accessibility]);

  const setSimulatorVisibility = (next: Partial<SimulatorVisibility>) => {
    setSimulatorVisibilityState((previous) => ({
      ...previous,
      ...next,
    }));
  };

  const setAccessibility = (next: Partial<AccessibilityPreferences>) => {
    setAccessibilityState((previous) => ({
      ...previous,
      ...next,
    }));
  };

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      themeMode,
      colorStyle,
      language,
      simulatorVisibility,
      accessibility,
      setThemeMode,
      setColorStyle,
      setLanguage,
      setSimulatorVisibility,
      setAccessibility,
      t: (key) => translate(language, key),
    }),
    [accessibility, colorStyle, language, simulatorVisibility, themeMode],
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
