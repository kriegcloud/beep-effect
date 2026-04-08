import { Cause, Effect, Exit, Schema } from "effect";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";
import { BowCosineSimilarity } from "../src/Tools/BowCosineSimilarity.ts";
import { ChunkBySentences } from "../src/Tools/ChunkBySentences.ts";
import { CreateCorpus } from "../src/Tools/CreateCorpus.ts";
import { ExtractKeywords } from "../src/Tools/ExtractKeywords.ts";
import { TextSimilarity } from "../src/Tools/TextSimilarity.ts";
import { TverskySimilarity } from "../src/Tools/TverskySimilarity.ts";
import { WinkEngine, WinkEngineLive } from "../src/Wink/WinkEngine.ts";
import { CustomEntityExample, EntityGroupName, WinkEngineCustomEntities } from "../src/Wink/WinkPattern.ts";

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

  it("rejects invalid custom-entity bracket patterns during engine learning", async () => {
    const brokenEntities = new WinkEngineCustomEntities({
      name: EntityGroupName.make("custom-entities"),
      patterns: [
        new CustomEntityExample({
          mark: O.none(),
          name: "BROKEN_ENTITY",
          patterns: ["[NOT_A_TAG]"],
        }),
      ],
    });

    const result = await Effect.runPromise(
      Effect.exit(
        Effect.gen(function* () {
          const engine = yield* WinkEngine;
          yield* engine.learnCustomEntities(brokenEntities);
        }).pipe(Effect.provide(WinkEngineLive))
      )
    );

    expect(Exit.isFailure(result)).toBe(true);
    if (Exit.isFailure(result)) {
      const rendered = Cause.pretty(result.cause);

      expect(rendered).toContain("learnCustomEntities");
      expect(rendered).toContain('incorrect token "not_a_tag"');
    }
  });
});
