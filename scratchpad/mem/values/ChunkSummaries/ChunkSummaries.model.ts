/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import * as S from "effect/Schema";
import {ChunkSummary} from "../ChunkSummary/index.ts";

const $I = $ScratchId.create("mem/values/ChunkSummaries/ChunkSummaries.model")

export class ChunkSummaries extends S.Class<ChunkSummaries>($I`ChunkSummaries`)(
  {
    summaries: S.HashSet(ChunkSummary),
  },
  $I.annote(
    "ChunkSummaries",
    {
      description: "A collection of chunk summaries in the knowledge graph",
    },
  ),
) {
}
