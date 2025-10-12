import type { SupportedLangValue } from "@beep/ui-core/i18n/constants";
import { fallbackLang } from "@beep/ui-core/i18n/constants";
import { detectLanguage as detectLanguageHandler } from "@beep/ui-core/i18n/server";
import { defaultSettings } from "@beep/ui-core/settings";
import { detectSettings as detectSettingsHandler } from "@beep/ui-core/settings/server";
import type { SettingsState } from "@beep/ui-core/settings/types";
import type { Direction } from "@mui/material/styles";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";

export type AppConfig = {
  lang: SupportedLangValue.Type;
  i18nLang: SupportedLangValue.Type;
  cookieSettings: SettingsState;
  dir: Direction;
};

export class DetectLanguageError extends Data.TaggedError("DetectLanguageError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class DetectSettingsError extends Data.TaggedError("DetectSettingsError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

const detectLanguage = Effect.tryPromise({
  try: detectLanguageHandler,
  catch: (e) => new DetectLanguageError({ message: "Failed to detect language", cause: e }),
}).pipe(
  Effect.withSpan("detectLanguage"),
  Effect.tapError(() => Effect.logInfo("Failed to detect language, using fallback language `en`")),
  Effect.orElseSucceed(() => fallbackLang)
);

const detectSettings = Effect.tryPromise({
  try: () => detectSettingsHandler(),
  catch: (e) => new DetectSettingsError({ message: "Failed to detect settings", cause: e }),
}).pipe(
  Effect.withSpan("detectSettings"),
  Effect.tapError(() => Effect.logInfo("Failed to detect settings, using default settings")),
  Effect.orElseSucceed(() => defaultSettings)
);

export const getAppConfig = Effect.flatMap(Effect.all([detectLanguage, detectSettings]), ([lang, settings]) =>
  Effect.succeed({
    lang,
    i18nLang: lang,
    cookieSettings: settings,
    dir: settings.direction,
  })
).pipe(
  Effect.withSpan("getAppConfig"),
  Effect.tapError(() => Effect.logInfo("Failed to get app config, using default values"))
);
