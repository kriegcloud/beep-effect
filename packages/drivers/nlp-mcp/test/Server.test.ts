import * as Schemas from "@beep/nlp-mcp/Schemas";
import * as Server from "@beep/nlp-mcp/Server";
import * as Tools from "@beep/nlp-mcp/Tools";
import { A } from "@beep/utils";
import { assert, describe, it, layer } from "@effect/vitest";
import * as Effect from "effect/Effect";

describe("nlp-mcp Tools", () => {
  it("exposes the five NLP tools with stable names", () => {
    assert.strictEqual(Tools.Sentencize.name, "nlp_sentencize");
    assert.strictEqual(Tools.Tokenize.name, "nlp_tokenize");
    assert.strictEqual(Tools.PosTag.name, "nlp_pos_tag");
    assert.strictEqual(Tools.Lemmatize.name, "nlp_lemmatize");
    assert.strictEqual(Tools.ExtractEntities.name, "nlp_entities");
  });
});

describe("nlp-mcp Server handlers", () => {
  layer(Server.BackendLive)("backed by wink-nlp", (it) => {
    it.effect("nlp_tokenize returns tokens with a matching count", () =>
      Effect.gen(function* () {
        const handlers = yield* Server.makeNlpHandlers;
        const result = yield* handlers.nlp_tokenize(Schemas.TextInput.make({ text: "Hello world." }));
        assert.isTrue(result.count > 0);
        assert.strictEqual(result.count, A.length(result.result));
      })
    );

    it.effect("nlp_sentencize returns sentences with a matching count", () =>
      Effect.gen(function* () {
        const handlers = yield* Server.makeNlpHandlers;
        const result = yield* handlers.nlp_sentencize(
          Schemas.TextInput.make({ text: "First sentence. Second sentence." })
        );
        assert.isTrue(result.count >= 1);
        assert.strictEqual(result.count, A.length(result.result));
      })
    );

    it.effect("nlp_pos_tag tags every token with a position and tag", () =>
      Effect.gen(function* () {
        const handlers = yield* Server.makeNlpHandlers;
        const result = yield* handlers.nlp_pos_tag(Schemas.TextInput.make({ text: "Cats sleep." }));
        assert.isTrue(result.count > 0);
        assert.strictEqual(result.count, A.length(result.result));
        yield* Effect.forEach(result.result, (entry) =>
          Effect.sync(() => {
            assert.isString(entry.tag);
            assert.isString(entry.text);
          })
        );
      })
    );

    it.effect("nlp_entities yields entities with a type", () =>
      Effect.gen(function* () {
        const handlers = yield* Server.makeNlpHandlers;
        const result = yield* handlers.nlp_entities(
          Schemas.TextInput.make({ text: "Barack Obama visited Paris in March." })
        );
        assert.strictEqual(result.count, A.length(result.result));
        yield* Effect.forEach(result.result, (entry) => Effect.sync(() => assert.isString(entry.entityType)));
      })
    );
  });
});
