"use client";

import { useCookies, useLocalStorage } from "@beep/ui/hooks";
import { SETTINGS_STORAGE_KEY } from "@beep/ui-core/settings/settings-config";
import type { SettingsProviderProps, SettingsState } from "@beep/ui-core/settings/types";
import { getCookie, getStorage } from "@beep/ui-core/utils";
import * as Equal from "effect/Equal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SettingsContext } from "./settings-context";

export function SettingsProvider({
  children,
  cookieSettings,
  defaultSettings,
  storageKey = SETTINGS_STORAGE_KEY,
}: SettingsProviderProps) {
  const isCookieEnabled = !!cookieSettings;
  const useStorage = isCookieEnabled ? useCookies : useLocalStorage;
  const initialSettings = isCookieEnabled ? cookieSettings : defaultSettings;
  const getStorageValue = isCookieEnabled ? getCookie : getStorage;

  const { state, setState, resetState, setField } = useStorage<SettingsState>(storageKey, initialSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !Equal.equals(state, defaultSettings);

  const onReset = useCallback(() => {
    resetState(defaultSettings);
  }, [defaultSettings, resetState]);

  // Version check and reset handling
  useEffect(() => {
    const storedValue = getStorageValue<SettingsState>(storageKey);

    if (storedValue) {
      try {
        if (!storedValue.version || storedValue.version !== defaultSettings.version) {
          onReset();
        }
      } catch {
        onReset();
      }
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      canReset,
      onReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      state,
      setState,
      setField,
    }),
    [canReset, onReset, openDrawer, onCloseDrawer, onToggleDrawer, state, setField, setState]
  );

  return <SettingsContext value={memoizedValue}>{children}</SettingsContext>;
}
