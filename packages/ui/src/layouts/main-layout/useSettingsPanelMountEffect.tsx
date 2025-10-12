"use client";

import { type SettingsPanelConfig, useSettingsPanelContext } from "@beep/ui/settings-v2/SettingsPanelProvider";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Struct from "effect/Struct";
import { useEffect } from "react";

const useSettingsPanelMountEffect = (effects: Partial<SettingsPanelConfig>) => {
  const { settingsPanelConfig, setSettingsPanelConfig } = useSettingsPanelContext();

  useEffect(() => {
    setSettingsPanelConfig(effects);
    const undoEffects = F.pipe(
      Struct.keys(effects),
      A.reduce({} as Partial<SettingsPanelConfig>, (acc, effect) => {
        acc[effect] = settingsPanelConfig[effect];
        return acc;
      })
    );
    return () => {
      setSettingsPanelConfig(undoEffects);
    };
  }, []);
};

export default useSettingsPanelMountEffect;
