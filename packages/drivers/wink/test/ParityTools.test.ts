import { NlpToolkit } from "@beep/nlp-processing/Tools/NlpToolkit";
import { WinkNlpToolkitLive } from "@beep/wink";
import { Effect, Layer, Stream } from "effect";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("Adjunct-parity NLP tools", () => {
  it("WordCount counts word-like tokens", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("WordCount", { text: "Hello brave new world." });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        expect(first).toBeDefined();
        expect(first?.isFailure).toBe(false);
        expect(first?.encodedResult).toMatchObject({ wordCount: 4 });
      }).pipe(provideScopedLayer(WinkNlpToolkitLive))
    ));

  it("RemoveStopWords drops at least one stop word", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("RemoveStopWords", {
          text: "the quick brown fox jumps over the lazy dog",
        });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        expect(first).toBeDefined();
        expect(first?.isFailure).toBe(false);
        const encoded = first?.encodedResult as { readonly removedCount: number };
        expect(encoded.removedCount >= 1).toBe(true);
      }).pipe(provideScopedLayer(WinkNlpToolkitLive))
    ));

  it("Paragraphize splits on blank-line boundaries", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("Paragraphize", { text: "A.\n\nB." });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        expect(first).toBeDefined();
        expect(first?.isFailure).toBe(false);
        expect(first?.encodedResult).toMatchObject({ count: 2 });
      }).pipe(provideScopedLayer(WinkNlpToolkitLive))
    ));

  it("Stem returns a stem for each word token", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("Stem", { text: "running runners ran" });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        expect(first).toBeDefined();
        expect(first?.isFailure).toBe(false);
        const encoded = first?.encodedResult as { readonly count: number; readonly stems: ReadonlyArray<string> };
        expect(encoded.count).toBe(3);
        expect(encoded.stems.length).toBe(3);
      }).pipe(provideScopedLayer(WinkNlpToolkitLive))
    ));
});
