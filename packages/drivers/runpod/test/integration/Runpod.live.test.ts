import { Runpod } from "@beep/runpod";
import { A } from "@beep/utils";
import { describe, expect, it } from "@effect/vitest";
import { Config, Effect } from "effect";
import * as O from "effect/Option";

describe("@beep/runpod live", () => {
  it.effect("lists pods when RUNPOD_API_KEY is configured", () =>
    Effect.gen(function* () {
      const apiKey = yield* Config.redacted("RUNPOD_API_KEY").pipe(Config.option);
      if (O.isNone(apiKey)) {
        return;
      }

      const runpod = yield* Runpod;
      const pods = yield* runpod.listPods();
      expect(A.isReadonlyArray(pods)).toBe(true);
    }).pipe(Effect.provide(Runpod.layer))
  );

  it.effect("fetches the unauthenticated OpenAPI document", () =>
    Effect.gen(function* () {
      const apiKey = yield* Config.redacted("RUNPOD_API_KEY").pipe(Config.option);
      if (O.isNone(apiKey)) {
        return;
      }

      const runpod = yield* Runpod;
      const openApi = yield* runpod.getOpenAPI();
      expect(openApi).toHaveProperty("openapi");
    }).pipe(Effect.provide(Runpod.layer))
  );
});
