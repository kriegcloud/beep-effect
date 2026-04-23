/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";


const $I = $ScratchId.create("mem/values/ChunkEngine/ChunkEngine.model")

export const ChunkEngine = MappedLiteralKit([
  [
    "LANGCHAIN_ENGINE",
    "langchain",
  ],
  [
    "DEFAULT_ENGINE",
    "default",
  ],
  [
    "HAYSTACK_ENGINE",
    "haystack",
  ],
]).pipe(
  $I.annoteSchema("ChunkEngine", {
    description: "A chunk engine in the knowledge graph"
  })
)


export type ChunkEngine = typeof ChunkEngine.Type;
