/**
 * ChunkBySentences tool - chunks text by sentence boundaries under a target size.
 * @since 3.0.0
 */

import { Tool } from "@effect/ai"
import { Schema } from "effect"
import { AiSentenceChunkSchema } from "./_schemas.js"

export const ChunkBySentences = Tool.make("ChunkBySentences", {
  description:
    "Split text into sentence-aligned chunks, targeting a maximum character size per chunk",
  parameters: {
    text: Schema.String.annotations({
      description: "The text to chunk",
      examples: [
        "First sentence. Second sentence. Third sentence. Fourth sentence."
      ]
    }),
    maxChunkChars: Schema.Number.annotations({
      description:
        "Target maximum number of characters per chunk. If a single sentence exceeds this, it is returned as its own chunk.",
      examples: [500, 1200, 2000]
    })
  },
  success: Schema.Struct({
    chunks: Schema.Array(AiSentenceChunkSchema),
    chunkCount: Schema.Number,
    originalSentenceCount: Schema.Number
  })
})
