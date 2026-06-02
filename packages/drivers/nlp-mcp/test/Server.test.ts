import { NlpToolkit, NlpTools } from "@beep/nlp/Tools/NlpToolkit";
import { WinkNlpToolkitLive } from "@beep/wink";
import { assert, describe, it, layer } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";

describe("nlp-mcp tool surface", () => {
  it("mounts the full @beep/nlp NlpToolkit", () => {
    const names = NlpTools.map((tool) => tool.name);
    assert.strictEqual(names.length, 25);
    assert.strictEqual(new Set(names).size, names.length);
    assert.strictEqual(Object.keys(NlpToolkit.tools).length, 25);
    assert.isTrue(names.includes("Tokenize"));
  });
});

describe("nlp-mcp wink-backed handlers", () => {
  layer(WinkNlpToolkitLive)("via the mounted toolkit", (it) => {
    it.effect("Tokenize resolves through the wink handler layer", () =>
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("Tokenize", { text: "Hello world." });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        assert.isDefined(first);
        assert.isFalse(first.isFailure);
      })
    );

    it.effect("WordCount resolves through the wink handler layer", () =>
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("WordCount", { text: "Hello brave new world." });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        assert.isDefined(first);
        assert.isFalse(first.isFailure);
      })
    );

    it.effect("Stem resolves through the wink handler layer", () =>
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("Stem", { text: "running runners ran" });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        assert.isDefined(first);
        assert.isFalse(first.isFailure);
      })
    );

    it.effect("BagOfWords encodes its nested AiNGram array through the wink handler layer", () =>
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("BagOfWords", { text: "the cat sat on the mat" });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        assert.isDefined(first);
        assert.isFalse(first.isFailure);
      })
    );

    it.effect("Analyze encodes its nested AiAnalysis token array through the wink handler layer", () =>
      Effect.gen(function* () {
        const toolkit = yield* NlpToolkit;
        const stream = yield* toolkit.handle("Analyze", { text: "The quick brown fox. It was fast." });
        const results = yield* Stream.runCollect(stream);
        const first = results[0];
        assert.isDefined(first);
        assert.isFalse(first.isFailure);
      })
    );
  });
});
