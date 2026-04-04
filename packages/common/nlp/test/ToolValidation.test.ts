import { Effect, pipe, Schema } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";
import { BowCosineSimilarity } from "../src/Tools/BowCosineSimilarity.ts";
import { ChunkBySentences } from "../src/Tools/ChunkBySentences.ts";
import { CreateCorpus } from "../src/Tools/CreateCorpus.ts";
import { ExtractKeywords } from "../src/Tools/ExtractKeywords.ts";
import { NlpToolkitLive } from "../src/Tools/NlpToolkit.ts";
import { TextSimilarity } from "../src/Tools/TextSimilarity.ts";
import { exportTools } from "../src/Tools/ToolExport.ts";
import { TverskySimilarity } from "../src/Tools/TverskySimilarity.ts";

const requireTool = (name: string) =>
  Effect.runPromise(
    exportTools.pipe(
      Effect.provide(NlpToolkitLive),
      Effect.flatMap((tools) =>
        pipe(
          tools,
          A.findFirst((tool) => tool.name === name),
          O.match({
            onNone: () => Effect.die(`Missing exported NLP tool: ${name}`),
            onSome: Effect.succeed,
          })
        )
      )
    )
  );

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

  it("rejects invalid custom-entity bracket patterns during tool execution", async () => {
    const tool = await requireTool("LearnCustomEntities");

    await expect(
      Effect.runPromise(
        tool.handle([
          undefined,
          undefined,
          [
            {
              name: "BROKEN_ENTITY",
              patterns: ["[NOT_A_TAG]"],
            },
          ],
        ])
      )
    ).rejects.toMatchObject({
      _tag: "ExportedToolError",
      toolName: "LearnCustomEntities",
    });
  });
});
