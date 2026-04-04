import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { tokenCount } from "../src/Core/Tokenization.ts";
import { NLPAppLive } from "../src/Layers/index.ts";
import { WinkEngine } from "../src/Wink/WinkEngine.ts";

describe("Layers", () => {
  it("provides the legacy NLP app bundle with engine and tokenization access", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const engine = yield* WinkEngine;
        const count = yield* tokenCount("Ada wrote code.");
        const its = yield* engine.its;

        return {
          count,
          hasIts: typeof its === "object",
        };
      }).pipe(Effect.provide(NLPAppLive))
    );

    expect(result.count).toBe(4);
    expect(result.hasIts).toBe(true);
  });
});
