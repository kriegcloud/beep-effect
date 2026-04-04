/**
 * ChunkBySentences tool definition.
 *
 * @since 0.0.0
 * @module @beep/nlp/Tools/ChunkBySentences
 */

import { $NlpId } from "@beep/identity";
import { PosInt } from "@beep/schema";
import * as S from "effect/Schema";
import { Tool } from "effect/unstable/ai";
import { AiSentenceChunk } from "./_schemas.ts";

const $I = $NlpId.create("Tools/ChunkBySentences");

class ChunkBySentencesParameters extends S.Class<ChunkBySentencesParameters>($I`ChunkBySentencesParameters`)(
  {
    maxChunkChars: PosInt.annotateKey({
      description:
        "Target maximum number of characters per chunk. If a single sentence exceeds this, it is returned as its own chunk.",
      examples: [PosInt.makeUnsafe(500), PosInt.makeUnsafe(1200), PosInt.makeUnsafe(2000)],
    }),
    text: S.String.annotateKey({
      description: "The text to chunk",
      examples: ["First sentence. Second sentence. Third sentence. Fourth sentence."],
    }),
  },
  $I.annote("ChunkBySentencesParameters", {
    description: "Inputs required to split text into sentence-aligned chunks.",
  })
) {}

class ChunkBySentencesSuccess extends S.Class<ChunkBySentencesSuccess>($I`ChunkBySentencesSuccess`)(
  {
    chunkCount: S.Number,
    chunks: S.Array(AiSentenceChunk),
    originalSentenceCount: S.Number,
  },
  $I.annote("ChunkBySentencesSuccess", {
    description: "Sentence-aligned text chunks and their source sentence counts.",
  })
) {}

/**
 * Tool for chunking text along sentence boundaries.
 *
 * @since 0.0.0
 * @category Tools
 */
export const ChunkBySentences = Tool.make("ChunkBySentences", {
  description: "Split text into sentence-aligned chunks, targeting a maximum character size per chunk.",
  parameters: ChunkBySentencesParameters,
  success: ChunkBySentencesSuccess,
});
