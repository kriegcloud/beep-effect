import { it } from "@beep/test-runner";
import { describe, expect } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { decodeReviewHubConfig } from "@/Config";

describe("review hub configuration", () => {
  it.effect("trims the login allow-list and preserves the configured server settings", () =>
    Effect.gen(function* () {
      const config = yield* decodeReviewHubConfig({
        allowedLogins: " attorney@example.test, , paralegal@example.test ",
        dataDirectory: "/synthetic/review-hub",
        port: 8787,
      });
      expect(config.allowedLogins).toEqual(["attorney@example.test", "paralegal@example.test"]);
      expect(config.dataDirectory).toBe("/synthetic/review-hub");
      expect(config.port).toBe(8787);
    })
  );

  it.effect("rejects an empty allow-list, an empty data directory, and an invalid port", () =>
    Effect.gen(function* () {
      const valid = {
        allowedLogins: "attorney@example.test",
        dataDirectory: "/synthetic/review-hub",
        port: 8787,
      };
      for (const invalid of [
        { ...valid, allowedLogins: " , " },
        { ...valid, dataDirectory: "" },
        { ...valid, port: 65536 },
      ]) {
        expect((yield* decodeReviewHubConfig(invalid).pipe(Effect.result))._tag).toBe("Failure");
      }
    })
  );
});
