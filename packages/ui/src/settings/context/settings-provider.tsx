"use client";

import { useCookies, useLocalStorage } from "@beep/ui/hooks";
import { getCookie, getStorage } from "@beep/ui/utils";
import { isEqual } from "es-toolkit";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SETTINGS_STORAGE_KEY } from "../settings-config";
import type { SettingsProviderProps, SettingsState } from "../types";
import { SettingsContext } from "./settings-context";

// ----------------------------------------------------------------------

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

  const { state, setState, resetState, setField } = useStorage<SettingsState>(
    storageKey,
    initialSettings,
  );

  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, []);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const onReset = useCallback(() => {
    resetState(defaultSettings);
  }, [defaultSettings, resetState]);

  // Version check and reset handling
  useEffect(() => {
    const storedValue = getStorageValue<SettingsState>(storageKey);

    if (storedValue) {
      try {
        if (
          !storedValue.version ||
          storedValue.version !== defaultSettings.version
        ) {
          onReset();
        }
      } catch {
        onReset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    [
      canReset,
      onReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      state,
      setField,
      setState,
    ],
  );

  return <SettingsContext value={memoizedValue}>{children}</SettingsContext>;
}
