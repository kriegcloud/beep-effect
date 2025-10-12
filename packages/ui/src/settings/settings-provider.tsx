import { useBoolean, useCookies, useLocalStorage } from "@beep/ui/hooks";
import { SETTINGS_STORAGE_KEY } from "@beep/ui-core/settings/settings-config";
import type { SettingsContextValue, SettingsProviderProps, SettingsState } from "@beep/ui-core/settings/types";
import { createCtx, getCookie, getStorage } from "@beep/ui-core/utils";
import * as Equal from "effect/Equal";
import React from "react";

const [useSettings, Provider] = createCtx<SettingsContextValue>("@beep/ui/SettingsProvider");

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  cookieSettings,
  defaultSettings,
  storageKey = SETTINGS_STORAGE_KEY,
}) => {
  const isCookieEnabled = !!cookieSettings;
  const useStorage = isCookieEnabled ? useCookies : useLocalStorage;
  const initialSettings = isCookieEnabled ? cookieSettings : defaultSettings;
  const getStorageValue = isCookieEnabled ? getCookie : getStorage;

  const { state, setState, resetState, setField } = useStorage<SettingsState>(storageKey, initialSettings);

  const { value: openDrawer, setValue: setOpenDrawer } = useBoolean();

  const onToggleDrawer = React.useCallback(() => setOpenDrawer((prev) => !prev), []);

  const onCloseDrawer = React.useCallback(() => setOpenDrawer(false), []);

  const canReset = !Equal.equals(state, defaultSettings);

  const onReset = React.useCallback(() => resetState(defaultSettings), [defaultSettings, resetState]);

  React.useEffect(() => {
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

  const memoizedValue = React.useMemo(
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

  return <Provider value={memoizedValue}>{children}</Provider>;
};

export { useSettings };
