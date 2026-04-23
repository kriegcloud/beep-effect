/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/ChunkSummary/ChunkSummary.model")

export class ChunkSummary extends S.Class<ChunkSummary>($I`ChunkSummary`)(
  {
    text: S.String,
    chunkId: S.String,
  },
  $I.annote(
    "ChunkSummary",
    {
      description: "A chunk summary in the knowledge graph",
    },
  ),
) {
}
