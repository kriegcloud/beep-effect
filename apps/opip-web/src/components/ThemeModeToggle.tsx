/**
 * OPIP light and dark mode toggle.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
"use client";

import { Button } from "@beep/ui/components/ui/button";
import { useCallback, useEffect, useRef } from "react";

type OpipThemeMode = "light" | "dark";

const OPIP_THEME_STORAGE_KEY = "opip-theme-mode";
const MUI_MODE_STORAGE_KEY = "mui-mode";
const MUI_COLOR_SCHEME_STORAGE_KEY = "mui-color-scheme";

const isThemeMode = (value: null | string): value is OpipThemeMode => value === "light" || value === "dark";

const readStoredThemeMode = (): OpipThemeMode => {
  if (globalThis.window === undefined) {
    return "light";
  }

  const storedMode = window.localStorage.getItem(OPIP_THEME_STORAGE_KEY);

  if (isThemeMode(storedMode)) {
    return storedMode;
  }

  const muiMode = window.localStorage.getItem(MUI_MODE_STORAGE_KEY);

  if (isThemeMode(muiMode)) {
    return muiMode;
  }

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
};

const applyThemeMode = (mode: OpipThemeMode) => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(mode);
  document.documentElement.style.colorScheme = mode;
  window.localStorage.setItem(OPIP_THEME_STORAGE_KEY, mode);
  window.localStorage.setItem(MUI_MODE_STORAGE_KEY, mode);
  window.localStorage.setItem(`${MUI_COLOR_SCHEME_STORAGE_KEY}-light`, "light");
  window.localStorage.setItem(`${MUI_COLOR_SCHEME_STORAGE_KEY}-dark`, "dark");
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

  useEffect(() => {
    const initialMode = readStoredThemeMode();
    applyThemeMode(initialMode);
    if (buttonRef.current !== null) {
      syncToggleButton(buttonRef.current, initialMode);
    }
  }, []);

  const toggleMode = useCallback(() => {
    const nextMode = document.documentElement.classList.contains("dark") ? "light" : "dark";
    applyThemeMode(nextMode);
    if (buttonRef.current !== null) {
      syncToggleButton(buttonRef.current, nextMode);
    }
  }, []);

  return (
    <Button
      aria-label="Switch to dark mode"
      aria-pressed={false}
      className="group/theme h-9 rounded-full border border-[color-mix(in_oklab,var(--opip-on-soil)_24%,transparent)] bg-[color-mix(in_oklab,var(--opip-soil)_72%,transparent)] px-2 text-[var(--opip-on-soil)] shadow-none hover:bg-[color-mix(in_oklab,var(--opip-on-soil)_14%,transparent)] hover:text-[var(--opip-on-soil)]"
      data-theme-mode="light"
      onClick={toggleMode}
      ref={buttonRef}
      size="sm"
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
