import type { SupportedLangValue } from "@beep/ui/i18n/constants";
import { detectLanguage } from "@beep/ui/i18n/server";
import { detectSettings } from "@beep/ui/settings/server";
import type { SettingsState } from "@beep/ui/settings/types";
import type { Direction } from "@mui/material/styles";

export type AppConfig = {
  lang: SupportedLangValue.Type;
  i18nLang: SupportedLangValue.Type;
  cookieSettings: SettingsState;
  dir: Direction;
};

export async function getAppConfig(): Promise<AppConfig> {
  const [lang, settings] = await Promise.all([detectLanguage(), detectSettings()]);

  return {
    lang,
    i18nLang: lang,
    cookieSettings: settings,
    dir: settings.direction,
  };
}
