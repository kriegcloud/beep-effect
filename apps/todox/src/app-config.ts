import { EnvValue } from "@beep/constants";
import { serverEnv } from "@beep/shared-env/ServerEnv";
import type { SupportedLangValue } from "@beep/ui-core/i18n/constants";
import { fallbackLang } from "@beep/ui-core/i18n/constants";
import { detectLanguage as detectLanguageHandler } from "@beep/ui-core/i18n/server";
import { defaultSettings } from "@beep/ui-core/settings";
import { detectSettings as detectSettingsHandler } from "@beep/ui-core/settings/server";
import type { SettingsState } from "@beep/ui-core/settings/types";

type Direction = "ltr" | "rtl";

import * as Effect from "effect/Effect";

export const isDev = EnvValue.is.dev(serverEnv.app.env);

export type AppConfig = {
  readonly lang: SupportedLangValue.Type;
  readonly i18nLang: SupportedLangValue.Type;
  readonly cookieSettings: SettingsState;
  readonly dir: Direction;
};

const detectLanguage = Effect.tryPromise({
  try: detectLanguageHandler,
  catch: (e) => fallbackLang,
}).pipe(
  Effect.withSpan("detectLanguage"),
  Effect.orElseSucceed(() => fallbackLang)
);

const detectSettings = Effect.tryPromise({
  try: () => detectSettingsHandler(),
  catch: (e) => defaultSettings,
}).pipe(
  Effect.withSpan("detectSettings"),
  Effect.orElseSucceed(() => defaultSettings)
);

export const getAppConfig = Effect.flatMap(Effect.all([detectLanguage, detectSettings]), ([lang, settings]) =>
  Effect.succeed({
    lang,
    i18nLang: lang,
    cookieSettings: settings,
    dir: settings.direction,
  })
).pipe(Effect.withSpan("getAppConfig"));
