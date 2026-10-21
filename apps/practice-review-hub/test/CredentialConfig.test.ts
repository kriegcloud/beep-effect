import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Inspectable from "effect/Inspectable";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { decodeReviewHubConfig, ReviewHubConfig } from "@/Config";

const flags = {
  allowedLogins: "attorney@example.test",
  dataDirectory: "/synthetic-review-hub",
  port: 8787,
};

const token = "synthetic-test-token-with-32-characters";

describe("review hub credential configuration", () => {
  it.effect("fails closed when the independent application credential is absent", () =>
    Effect.gen(function* () {
      const error = yield* Effect.flip(decodeReviewHubConfig(flags)).pipe(
        Effect.provideService(ConfigProvider.ConfigProvider, ConfigProvider.fromUnknown({}))
      );
      expect(Inspectable.toStringUnknown(error)).toContain("PRACTICE_REVIEW_HUB_API_TOKEN");
    })
  );

  for (const invalid of ["", "short-synthetic-token", Str.repeat(257)("x")]) {
    it.effect(`rejects a credential of length ${Str.length(invalid)}`, () =>
      Effect.gen(function* () {
        const error = yield* Effect.flip(decodeReviewHubConfig(flags)).pipe(
          Effect.provideService(
            ConfigProvider.ConfigProvider,
            ConfigProvider.fromUnknown({ PRACTICE_REVIEW_HUB_API_TOKEN: invalid })
          )
        );
        if (Str.isNonEmpty(invalid)) expect(Inspectable.toStringUnknown(error)).not.toContain(invalid);
      })
    );
  }

  it.effect("retains the credential as Redacted and prevents config JSON from exposing it", () =>
    Effect.gen(function* () {
      const config = yield* decodeReviewHubConfig(flags).pipe(
        Effect.provideService(
          ConfigProvider.ConfigProvider,
          ConfigProvider.fromUnknown({ PRACTICE_REVIEW_HUB_API_TOKEN: token })
        )
      );
      expect(Redacted.value(config.apiToken)).toBe(token);
      expect(Inspectable.toStringUnknown(config)).not.toContain(token);
      const error = yield* Effect.flip(S.encodeEffect(S.fromJsonString(S.toCodecJson(ReviewHubConfig)))(config));
      expect(Inspectable.toStringUnknown(error)).not.toContain(token);
    })
  );
});
