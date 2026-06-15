import { collectToolParamsJson } from "@beep/anthropic";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Stream } from "effect";
import { Response } from "effect/unstable/ai";

describe("Anthropic repair helpers", () => {
  it.effect(
    "collects streamed tool params until the end marker",
    Effect.fnUntraced(function* () {
      const json = yield* collectToolParamsJson(
        Stream.make(
          Response.makePart("tool-params-delta", { delta: '{"repairs":', id: "repair" }),
          Response.makePart("tool-params-delta", { delta: "[]}", id: "repair" }),
          Response.makePart("tool-params-end", { id: "repair" }),
          Response.makePart("tool-params-delta", { delta: "ignored", id: "repair" })
        )
      );

      expect(json).toBe('{"repairs":[]}');
    })
  );
});
