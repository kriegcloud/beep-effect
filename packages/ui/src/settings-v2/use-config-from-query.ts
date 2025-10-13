import { useThemeMode } from "@beep/ui/hooks";
import { ThemeMode } from "@beep/ui-core/settings";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Struct from "effect/Struct";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSettingsContext } from "./SettingsProvider";
import { RESET } from "./SettingsReducer";

const validators = {
  themeMode: ["light", "dark", "system"],
  textDirection: ["ltr", "rtl"],
  navigationMenuType: ["sidenav", "topnav", "combo"],
  sidenavType: ["default", "stacked", "slim"],
  topnavType: ["default", "stacked", "slim"],
  navColor: ["default", "vibrant"],
  locale: ["en-US", "fr-FR", "bn-BD", "zh-CN", "hi-IN", "ar-SA"],
};

export const useConfigFromQuery = () => {
  const searchParams = useSearchParams();
  const { setThemeMode, resetTheme } = useThemeMode();
  const { setConfig, configDispatch } = useSettingsContext();
  useEffect(() => {
    const paramCount = Array.from(searchParams.entries()).length;
    const defaultConfigs = F.pipe(F.identity(searchParams.get("defaultConfigs")), O.fromNullable);

    if (paramCount > 0 && A.some(Struct.keys(validators), (key) => searchParams.has(key))) {
      configDispatch({ type: RESET });
    }

    if (defaultConfigs) {
      resetTheme();
      configDispatch({ type: RESET });
    }

    const config: Record<string, string> = {};

    Struct.keys(validators).forEach((key) => {
      const value = searchParams.get(key);
      if (value && validators[key].includes(value)) {
        config[key] = value;
      }
    });

    if (Struct.keys(config).length) {
      if (config.themeMode) {
        setThemeMode(ThemeMode.make(config.themeMode));
        delete config.themeMode;
      }

      setConfig(config);
    }
  }, [searchParams]);
};
