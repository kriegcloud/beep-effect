"use client";

// import {Config, initialConfig} from "config";
import { type SettingsAction, SettingsConfig } from "@beep/ui-core/settings/schema";
import { getColor, getItemFromStore } from "@beep/ui-core/utils";
import { createContext, type Dispatch, type PropsWithChildren, use, useEffect, useReducer } from "react";
import { useTranslation } from "react-i18next";

import { COLLAPSE_NAVBAR, EXPAND_NAVBAR, SET_CONFIG, settingsReducer } from "./SettingsReducer";

interface SettingsContextInterFace {
  config: SettingsConfig.Type;
  configDispatch: Dispatch<SettingsAction.Type>;
  setConfig: (payload: Partial<SettingsConfig.Type>) => void;
  handleDrawerToggle: () => void;
  toggleNavbarCollapse: () => void;
  getThemeColor: (color: string) => string;
}

export const SettingsContext = createContext({} as SettingsContextInterFace);

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const persistedSidenavType = (getItemFromStore("sidenavType") ??
    getItemFromStore("sideNavType") ??
    SettingsConfig.initialValue.sidenavType) as SettingsConfig.Type["sidenavType"];

  const persistedTopnavType = (getItemFromStore("topnavType") ??
    getItemFromStore("topNavType") ??
    SettingsConfig.initialValue.topnavType) as SettingsConfig.Type["topnavType"];

  const configState: SettingsConfig.Type = {
    ...SettingsConfig.initialValue,
    sidenavCollapsed: getItemFromStore("sidenavCollapsed", SettingsConfig.initialValue.sidenavCollapsed),
    sidenavType: persistedSidenavType,
    topnavType: persistedTopnavType,
    textDirection: getItemFromStore("textDirection", SettingsConfig.initialValue.textDirection),
    navigationMenuType: getItemFromStore("navigationMenuType", SettingsConfig.initialValue.navigationMenuType),
    navColor: getItemFromStore("navColor", SettingsConfig.initialValue.navColor),
    locale: getItemFromStore("locale", SettingsConfig.initialValue.locale),
  };
  const [config, configDispatch] = useReducer(settingsReducer, configState);
  const { i18n } = useTranslation();

  const setConfig = (payload: Partial<SettingsConfig.Type>) => {
    configDispatch({
      type: SET_CONFIG,
      payload,
    });
  };

  const handleDrawerToggle = () => {
    setConfig({
      openNavbarDrawer: !config.openNavbarDrawer,
    });
  };

  const toggleNavbarCollapse = () => {
    if (config.sidenavCollapsed) {
      configDispatch({
        type: EXPAND_NAVBAR,
      });
    } else {
      configDispatch({
        type: COLLAPSE_NAVBAR,
      });
    }
  };

  const getThemeColor = (color: string) => {
    return getColor(color);
  };

  useEffect(() => {
    i18n.changeLanguage(config.locale.split("-").join(""));
  }, [config.locale]);

  return (
    <SettingsContext
      value={{
        config,
        configDispatch,
        setConfig,
        handleDrawerToggle,
        toggleNavbarCollapse,
        getThemeColor,
      }}
    >
      {children}
    </SettingsContext>
  );
};

export const useSettingsContext = () => use(SettingsContext);
