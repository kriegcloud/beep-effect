/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/ChunkStrategies/ChunkStrategies.model")

export const ChunkStrategy = MappedLiteralKit([
  [
    "EXACT",
    "exact",
  ],
  [
    "PARAGRAPH",
    "paragraph",
  ],
  [
    "SENTENCE",
    "sentence",
  ],
  [
    "CODE",
    "code",
  ],
  [
    "LANGCHAIN_CHARACTER",
    "langchain_character",
  ],
]).pipe(
  $I.annoteSchema("ChunkStrategy", {
    description: "A chunk strategy in the knowledge graph"
  })
)

export type ChunkStrategy = typeof ChunkStrategy.Type;
