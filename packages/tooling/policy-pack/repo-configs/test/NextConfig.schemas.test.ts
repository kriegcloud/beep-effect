import { AllowedDevOrigin } from "@beep/repo-configs/next/models/AllowedDevOrigin.schema";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeAllowedDevOrigin = S.decodeUnknownEffect(AllowedDevOrigin);

const decodeAllowedDevOriginExit = (value: unknown) => Effect.runPromise(Effect.exit(decodeAllowedDevOrigin(value)));

describe("AllowedDevOrigin", () => {
  it("accepts documented exact and wildcard host entries", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(yield* decodeAllowedDevOrigin("local-origin.dev")).toBe("local-origin.dev");
        expect(yield* decodeAllowedDevOrigin("*.local-origin.dev")).toBe("*.local-origin.dev");
        expect(yield* decodeAllowedDevOrigin(" codedank-web.localhost ")).toBe("codedank-web.localhost");
      })
    ));

  it("rejects URL-like values and invalid wildcard domains", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(decodeAllowedDevOriginExit(""))))).toBe(true);
        expect(
          Exit.isFailure(
            yield* Effect.promise(() => Promise.resolve(decodeAllowedDevOriginExit("https://local-origin.dev")))
          )
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* Effect.promise(() => Promise.resolve(decodeAllowedDevOriginExit("local-origin.dev:3000")))
          )
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* Effect.promise(() => Promise.resolve(decodeAllowedDevOriginExit("local-origin.dev/path")))
          )
        ).toBe(true);
        expect(
          Exit.isFailure(
            yield* Effect.promise(() => Promise.resolve(decodeAllowedDevOriginExit("*.*.local-origin.dev")))
          )
        ).toBe(true);
        expect(Exit.isFailure(yield* Effect.promise(() => Promise.resolve(decodeAllowedDevOriginExit("*."))))).toBe(
          true
        );
      })
    ));
});
