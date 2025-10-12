"use client";

import { createContext, type PropsWithChildren, use, useState } from "react";

export interface SettingsPanelConfig {
  showSettingPanelButton: boolean;
  openSettingPanel: boolean;
  disableNavigationMenuSection: boolean;
  disableSidenavShapeSection: boolean;
  disableTopShapeSection: boolean;
  disableNavColorSection: boolean;
}

interface SettingsPanelContextInterFace {
  settingsPanelConfig: SettingsPanelConfig;
  setSettingsPanelConfig: (config: Partial<SettingsPanelConfig>) => void;
}

export const SettingsPanelContext = createContext({} as SettingsPanelContextInterFace);

export const SettingsPanelProvider = ({ children }: PropsWithChildren) => {
  const [settingsPanelConfig, setSettingsPanelConfig] = useState<SettingsPanelConfig>({
    showSettingPanelButton: true,
    openSettingPanel: false,
    disableNavigationMenuSection: false,
    disableSidenavShapeSection: false,
    disableTopShapeSection: false,
    disableNavColorSection: false,
  });

  const updateSettingsPanelConfig = (config: Partial<SettingsPanelConfig>) => {
    setSettingsPanelConfig({
      ...settingsPanelConfig,
      ...config,
    });
  };

  return (
    <SettingsPanelContext
      value={{
        settingsPanelConfig,
        setSettingsPanelConfig: updateSettingsPanelConfig,
      }}
    >
      {children}
    </SettingsPanelContext>
  );
};

export const useSettingsPanelContext = () => use(SettingsPanelContext);
