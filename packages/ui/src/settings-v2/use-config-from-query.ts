import { useThemeMode } from "@beep/ui/hooks";
import type { ThemeMode } from "@beep/ui-core/settings";
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
    const defaultConfigs = searchParams.get("defaultConfigs");
    if (paramCount > 0 && Object.keys(validators).some((key) => searchParams.has(key))) {
      configDispatch({ type: RESET });
    }

    if (defaultConfigs) {
      resetTheme();
      configDispatch({ type: RESET });
    }

    const config: Record<string, string> = {};

    Object.keys(validators).forEach((key) => {
      const value = searchParams.get(key);
      if (value && (validators as any)[key].includes(value)) {
        config[key] = value;
      }
    });

    if (Object.keys(config).length) {
      if (config.themeMode) {
        setThemeMode(config.themeMode as ThemeMode.Type);
        delete config.themeMode;
      }

      setConfig(config);
    }
  }, [searchParams]);
};
