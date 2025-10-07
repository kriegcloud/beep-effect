<<<<<<< HEAD
import type { PartialErrorCodesType } from "@beep/iam-infra/adapters/better-auth/plugins/localization/plugin-options";
=======
>>>>>>> auth-type-perf
import { LangValueToAdapterLocale } from "@beep/ui/i18n/constants";
import { detectLanguage } from "@beep/ui/i18n/server";
import { localization } from "better-auth-localization";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";
<<<<<<< HEAD
import type { LocalizationOptions } from "./plugin-options";

export type LocalizationPluginEffect<TCustomTranslations extends Record<string, PartialErrorCodesType> = {}> =
  Effect.Effect<ReturnType<typeof localization<TCustomTranslations>>>;
export type LocalizationPlugin<TCustomTranslations extends Record<string, PartialErrorCodesType> = {}> =
  Effect.Effect.Success<LocalizationPluginEffect<TCustomTranslations>>;
=======

export type LocalizationPluginEffect = Effect.Effect<ReturnType<typeof localization>>;
export type LocalizationPlugin = Effect.Effect.Success<LocalizationPluginEffect>;
>>>>>>> auth-type-perf

export class LocalizationError extends Data.TaggedError("NextCookiesError")<{
  readonly type: "failed_to_detect_language" | "unknown";
  readonly message: string;
  readonly cause: unknown;
}> {}

export const localizationPlugin: LocalizationPluginEffect = Effect.gen(function* () {
  return yield* Effect.succeed(
    localization({
      defaultLocale: "default",
      fallbackLocale: "default",
      getLocale: async () =>
        F.pipe(
          Effect.tryPromise({
            try: detectLanguage,
            catch: (e) =>
              new LocalizationError({
                type: "failed_to_detect_language",
                cause: e,
                message: "Failed to detect language",
              }),
          }),
          Effect.flatMap(S.decode(LangValueToAdapterLocale)),
          Effect.tapError((e) => Effect.logError(e)),
          Effect.orElseSucceed(() => "default" as const),
          Effect.runPromise
        ),
<<<<<<< HEAD
    } satisfies LocalizationOptions)
=======
    })
>>>>>>> auth-type-perf
  );
});
