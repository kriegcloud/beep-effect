import { BowCosineSimilarity } from "@beep/nlp-processing/Tools/BowCosineSimilarity";
import { ChunkBySentences } from "@beep/nlp-processing/Tools/ChunkBySentences";
import { CreateCorpus } from "@beep/nlp-processing/Tools/CreateCorpus";
import { ExtractKeywords } from "@beep/nlp-processing/Tools/ExtractKeywords";
import { NlpToolkit } from "@beep/nlp-processing/Tools/NlpToolkit";
import { TextSimilarity } from "@beep/nlp-processing/Tools/TextSimilarity";
import { TverskySimilarity } from "@beep/nlp-processing/Tools/TverskySimilarity";
import {
  CustomEntityExample,
  EntityGroupName,
  WinkEngine,
  WinkEngineCustomEntities,
  WinkEngineLive,
  WinkNlpToolkitLive,
} from "@beep/wink";
import { Cause, Effect, Exit, Layer, Schema, Stream } from "effect";
import * as O from "effect/Option";
import { FastCheck as fc } from "effect/testing";
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

  it("round-trips Tversky success payloads derived from the source schema", () => {
    const arbitrary = Schema.toArbitrary(TverskySimilarity.successSchema);
    const decode = Schema.decodeUnknownSync(TverskySimilarity.successSchema);
    const encode = Schema.encodeUnknownSync(TverskySimilarity.successSchema);

    fc.assert(
      fc.property(arbitrary, (value) => {
        expect(decode(encode(value))).toEqual(value);
      }),
      { numRuns: 50 }
    );
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

  it("returns structured tool failures for expected toolkit errors", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* Effect.gen(function* () {
          const toolkit = yield* NlpToolkit;
          const stream = yield* toolkit.handle("QueryCorpus", {
            corpusId: "missing-corpus",
            query: "refund policy",
          });
          const results = yield* Stream.runCollect(stream);

          return results[0];
        }).pipe(provideScopedLayer(WinkNlpToolkitLive));

        expect(result?.isFailure).toBe(true);
        expect(result?.result).toMatchObject({
          operation: "corpus.query",
          reason: "CorpusManagerError",
          retryable: false,
          toolName: "QueryCorpus",
        });
        expect(result?.encodedResult).toMatchObject({
          operation: "corpus.query",
          reason: "CorpusManagerError",
          retryable: false,
          toolName: "QueryCorpus",
        });
      })
    ));
});
