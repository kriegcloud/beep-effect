/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {Node, Edge} from "../../entities/index.ts"
import * as S from "effect/Schema";

const $I = $ScratchId.create("mem/values/MemorySummary/MemorySummary.model")

export class MemorySummary extends S.Class<MemorySummary>($I`MemorySummary`)(
  {
    nodes: S.HashSet(Node.Model),
    edges: S.HashSet(Edge.Model),
  },
  $I.annote(
    "MemorySummary",
    {
      description: "A summary of a memory",
    },
  ),
) {
}
