import { BowCosineSimilarity } from "@beep/nlp/Tools/BowCosineSimilarity";
import { ChunkBySentences } from "@beep/nlp/Tools/ChunkBySentences";
import { CreateCorpus } from "@beep/nlp/Tools/CreateCorpus";
import { ExtractKeywords } from "@beep/nlp/Tools/ExtractKeywords";
import { TextSimilarity } from "@beep/nlp/Tools/TextSimilarity";
import { TverskySimilarity } from "@beep/nlp/Tools/TverskySimilarity";
import { WinkEngine, WinkEngineLive } from "@beep/nlp/Wink/WinkEngine";
import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "@beep/nlp/Wink/WinkPattern";
import { Cause, Effect, Exit, Layer, Schema } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

describe("Tool validation", () => {
  it("rejects fractional keyword limits at the schema boundary", () => {
    expect(() => Schema.decodeUnknownSync(ExtractKeywords.parametersSchema)({ text: "hello", topN: 2.5 })).toThrow();
  });

  it("rejects non-positive chunk limits at the schema boundary", () => {
    expect(() =>
      Schema.decodeUnknownSync(ChunkBySentences.parametersSchema)({ maxChunkChars: 0, text: "One. Two." })
    ).toThrow();
  });

  it("rejects invalid BM25 ranges at the schema boundary", () => {
    expect(() =>
      Schema.decodeUnknownSync(CreateCorpus.parametersSchema)({
        bm25Config: {
          b: 2,
          k: 0,
          k1: -1,
        },
      })
    ).toThrow();
  });

  it("defaults Tversky parameters at the schema boundary", () => {
    expect(Schema.decodeUnknownSync(TverskySimilarity.parametersSchema)({ text1: "alpha", text2: "beta" })).toEqual({
      alpha: 0.5,
      beta: 0.5,
      text1: "alpha",
      text2: "beta",
    });
  });

  it("rejects out-of-range similarity scores in tool success schemas", () => {
    expect(() =>
      Schema.decodeUnknownSync(BowCosineSimilarity.successSchema)({
        method: "bow.cosine",
        score: 1.2,
      })
    ).toThrow();
    expect(() =>
      Schema.decodeUnknownSync(TextSimilarity.successSchema)({
        method: "vector.cosine",
        score: -0.1,
      })
    ).toThrow();
    expect(() =>
      Schema.decodeUnknownSync(TverskySimilarity.successSchema)({
        alpha: 0.5,
        beta: 0.5,
        method: "set.tversky",
        score: 2,
      })
    ).toThrow();
  });

  it("rejects invalid custom-entity bracket patterns during engine learning", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const brokenEntities = WinkEngineCustomEntities.make({
          name: EntityGroupName.make("custom-entities"),
          patterns: [
            CustomEntityExample.make({
              mark: O.none(),
              name: "BROKEN_ENTITY",
              patterns: ["[NOT_A_TAG]"],
            }),
          ],
        });

        const program = Effect.gen(function* () {
          const engine = yield* WinkEngine;
          yield* engine.learnCustomEntities(brokenEntities);
        }).pipe(provideScopedLayer(WinkEngineLive));
        const exitedProgram = Effect.exit(program);
        const result = yield* exitedProgram;
        const rendered = Exit.match(result, {
          onFailure: Cause.pretty,
          onSuccess: () => "",
        });

        expect(Exit.isFailure(result)).toBe(true);
        expect(rendered).toContain("learnCustomEntities");
        expect(rendered).toContain('incorrect token "not_a_tag"');
      })
    ));
});
