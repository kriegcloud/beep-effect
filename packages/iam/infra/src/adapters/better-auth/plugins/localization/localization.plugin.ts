import { LangValueToAdapterLocale } from "@beep/ui-core/i18n/constants";
import { detectLanguage } from "@beep/ui-core/i18n/server";
import { localization } from "better-auth-localization";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as S from "effect/Schema";

export type LocalizationPluginEffect = Effect.Effect<ReturnType<typeof localization>>;
export type LocalizationPlugin = Effect.Effect.Success<LocalizationPluginEffect>;

export class LocalizationError extends Data.TaggedError("NextCookiesError")<{
  readonly type: "failed_to_detect_language" | "unknown";
  readonly message: string;
  readonly cause: unknown;
}> {}

export const localizationPlugin: LocalizationPluginEffect = Effect.succeed(
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
  })
);
