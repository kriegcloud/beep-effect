import { AllowedDevOrigin } from "@beep/repo-configs/next/models/AllowedDevOrigin.schema";
import { Effect, Exit } from "effect";
import * as S from "effect/Schema";
import { describe, expect, it } from "vitest";

const decodeAllowedDevOrigin = S.decodeUnknownEffect(AllowedDevOrigin);

const decodeAllowedDevOriginExit = (value: unknown) => Effect.runPromise(Effect.exit(decodeAllowedDevOrigin(value)));

describe("AllowedDevOrigin", () => {
  it("accepts documented exact and wildcard host entries", async () => {
    await expect(Effect.runPromise(decodeAllowedDevOrigin("local-origin.dev"))).resolves.toBe("local-origin.dev");
    await expect(Effect.runPromise(decodeAllowedDevOrigin("*.local-origin.dev"))).resolves.toBe("*.local-origin.dev");
    await expect(Effect.runPromise(decodeAllowedDevOrigin(" codedank-web.localhost "))).resolves.toBe(
      "codedank-web.localhost"
    );
  });

  it("rejects URL-like values and invalid wildcard domains", async () => {
    expect(Exit.isFailure(await decodeAllowedDevOriginExit(""))).toBe(true);
    expect(Exit.isFailure(await decodeAllowedDevOriginExit("https://local-origin.dev"))).toBe(true);
    expect(Exit.isFailure(await decodeAllowedDevOriginExit("local-origin.dev:3000"))).toBe(true);
    expect(Exit.isFailure(await decodeAllowedDevOriginExit("local-origin.dev/path"))).toBe(true);
    expect(Exit.isFailure(await decodeAllowedDevOriginExit("*.*.local-origin.dev"))).toBe(true);
    expect(Exit.isFailure(await decodeAllowedDevOriginExit("*."))).toBe(true);
  });
});
