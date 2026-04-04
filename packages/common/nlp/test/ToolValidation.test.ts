import { Effect, pipe, Schema } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import { describe, expect, it } from "vitest";
import { ChunkBySentences } from "../src/Tools/ChunkBySentences.ts";
import { ExtractKeywords } from "../src/Tools/ExtractKeywords.ts";
import { NlpToolkitLive } from "../src/Tools/NlpToolkit.ts";
import { exportTools } from "../src/Tools/ToolExport.ts";

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
