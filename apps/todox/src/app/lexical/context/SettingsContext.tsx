"use client";

import type * as React from "react";
import type { JSX } from "react";
import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import type { SettingName } from "../settings";

import { DEFAULT_SETTINGS, INITIAL_SETTINGS } from "../settings";

type SettingsContextShape = {
  readonly setOption: (name: SettingName, value: boolean) => void;
  readonly settings: Record<SettingName, boolean>;
};

const Context: React.Context<SettingsContextShape> = createContext({
  setOption: (name: SettingName, value: boolean) => {
    return;
  },
  settings: INITIAL_SETTINGS,
});

export const SettingsContext = ({ children }: { readonly children: ReactNode }): JSX.Element => {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);

  const setOption = useCallback((setting: SettingName, value: boolean) => {
    setSettings((options) => ({
      ...options,
      [setting]: value,
    }));
    setURLParam(setting, value);
  }, []);

  const contextValue = useMemo(() => {
    return { setOption, settings };
  }, [setOption, settings]);

  return <Context.Provider value={contextValue}>{children}</Context.Provider>;
};

export const useSettings = (): SettingsContextShape => {
  return useContext(Context);
};

function setURLParam(param: SettingName, value: null | boolean) {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  if (value !== DEFAULT_SETTINGS[param]) {
    params.set(param, String(value));
  } else {
    params.delete(param);
  }
  url.search = params.toString();
  window.history.pushState(null, "", url.toString());
}
