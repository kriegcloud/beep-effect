/**
 *
 *
 * @module
 * @since 0.0.0
 */
import {$ScratchId} from "@beep/identity";
import {MappedLiteralKit} from "@beep/schema";

const $I = $ScratchId.create("mem/values/GraphDBType/GraphDBType.model")

export const GraphDBType = MappedLiteralKit([
  [
    "NETWORKX",
    0,
  ],
  [
    "NEO4J",
    1,
  ],
  [
    "KUZU",
    2,
  ],
])
  .pipe($I.annoteSchema(
    "GraphDBType",
    {
      description: "A type of graph database",
    },
  ))

export type GraphDBType = typeof GraphDBType.Type;
