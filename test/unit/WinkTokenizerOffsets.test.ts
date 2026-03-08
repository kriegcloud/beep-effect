import { assert, describe, it } from "@effect/vitest";
import { Chunk, Effect, Option } from "effect";
import { Tokenization } from "../../src/NLP/Core/Tokenization.js";
import { WinkTokenizationLive } from "../../src/NLP/Wink/WinkTokenizer.js";

describe("Wink tokenization adapter", () => {
  it.effect("computes correct character offsets", () =>
    Effect.gen(function* () {
      const tokenizer = yield* Tokenization;
      const text = "  Hello  world!";

      const tokens = yield* tokenizer.tokenize(text);
      const tokenList = Chunk.toReadonlyArray(tokens);

      assert.strictEqual(tokenList.length, 3);

      const [helloToken, worldToken, exclamationToken] = tokenList;

      assert.strictEqual(helloToken.text, "Hello");
      assert.strictEqual(Number(helloToken.start), 2);
      assert.strictEqual(Number(helloToken.end), 7);
      assert.deepStrictEqual(helloToken.precedingSpaces, Option.some("  "));
      assert.strictEqual(worldToken.text, "world");
      assert.strictEqual(Number(worldToken.start), 9);
      assert.strictEqual(Number(worldToken.end), 14);
      assert.deepStrictEqual(worldToken.precedingSpaces, Option.some("  "));

      assert.strictEqual(exclamationToken.text, "!");
      assert.strictEqual(Number(exclamationToken.start), 14);
      assert.strictEqual(Number(exclamationToken.end), 15);
      assert.isTrue(Option.isNone(exclamationToken.precedingSpaces));
    }).pipe(Effect.provide(WinkTokenizationLive))
  );
});
