/**
 * OPIP light and dark mode toggle.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Button } from "@beep/ui/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";

type OpipThemeMode = "light" | "dark";

const OPIP_THEME_STORAGE_KEY = "opip-theme-mode";
const MUI_MODE_STORAGE_KEY = "mui-mode";
const MUI_COLOR_SCHEME_STORAGE_KEY = "mui-color-scheme";

const isThemeMode = (value: null | string): value is OpipThemeMode => value === "light" || value === "dark";

const getLocalStorageItem = (key: string): null | string => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setLocalStorageItem = (key: string, value: string) => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Theme selection still applies for the current page when storage is unavailable.
  }
};

const readStoredThemeMode = (): OpipThemeMode => {
  if (globalThis.window === undefined) {
    return "light";
  }

  const storedMode = getLocalStorageItem(OPIP_THEME_STORAGE_KEY);

  if (isThemeMode(storedMode)) {
    return storedMode;
  }

  const muiMode = getLocalStorageItem(MUI_MODE_STORAGE_KEY);

  if (isThemeMode(muiMode)) {
    return muiMode;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const applyThemeMode = (mode: OpipThemeMode) => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(mode);
  document.documentElement.style.colorScheme = mode;
  setLocalStorageItem(OPIP_THEME_STORAGE_KEY, mode);
  setLocalStorageItem(MUI_MODE_STORAGE_KEY, mode);
  setLocalStorageItem(`${MUI_COLOR_SCHEME_STORAGE_KEY}-light`, "light");
  setLocalStorageItem(`${MUI_COLOR_SCHEME_STORAGE_KEY}-dark`, "dark");
};

const syncToggleButton = (button: HTMLButtonElement, mode: OpipThemeMode) => {
  const isDarkMode = mode === "dark";
  button.dataset.themeMode = mode;
  button.setAttribute("aria-label", `Switch to ${isDarkMode ? "light" : "dark"} mode`);
  button.setAttribute("aria-pressed", String(isDarkMode));
};

/**
 * Toggles the site between the configured light and dark themes.
 *
 * @category components
 * @since 0.0.0
 */
export function ThemeModeToggle() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<OpipThemeMode>(readStoredThemeMode);
  const isDarkMode = mode === "dark";

  useEffect(() => {
    const initialMode = readStoredThemeMode();
    applyThemeMode(initialMode);
    setMode(initialMode);
    if (buttonRef.current !== null) {
      syncToggleButton(buttonRef.current, initialMode);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode((currentMode) => {
      const nextMode = currentMode === "dark" ? "light" : "dark";
      applyThemeMode(nextMode);
      if (buttonRef.current !== null) {
        syncToggleButton(buttonRef.current, nextMode);
      }

      return nextMode;
    });
  }, []);

  return (
    <Button
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      aria-pressed={isDarkMode}
      className="group/theme h-9 rounded-full border border-[color-mix(in_oklab,var(--opip-on-soil)_24%,transparent)] bg-[color-mix(in_oklab,var(--opip-soil)_72%,transparent)] px-2 text-[var(--opip-on-soil)] shadow-none hover:bg-[color-mix(in_oklab,var(--opip-on-soil)_14%,transparent)] hover:text-[var(--opip-on-soil)]"
      data-theme-mode={mode}
      onClick={toggleMode}
      ref={buttonRef}
      size="sm"
      suppressHydrationWarning
      type="button"
      variant="ghost"
    >
      <span
        aria-hidden
        className="relative h-5 w-9 rounded-full border border-[color-mix(in_oklab,var(--opip-on-soil)_28%,transparent)] bg-[color-mix(in_oklab,var(--opip-on-soil)_12%,transparent)]"
      >
        <span className="absolute top-1/2 size-4 -translate-y-1/2 translate-x-0.5 rounded-full bg-[var(--opip-gold)] transition-transform group-data-[theme-mode=dark]/theme:translate-x-4" />
      </span>
    </Button>
  );
}
