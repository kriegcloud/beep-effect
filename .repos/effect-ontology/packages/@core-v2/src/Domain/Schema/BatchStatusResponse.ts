import { Schema } from "effect"
import { BatchId } from "../Identity.js"
import { BatchState } from "../Model/BatchWorkflow.js"

export const BatchStatusResponse = Schema.Union(
  Schema.Struct({
    _tag: Schema.Literal("Active"),
    state: BatchState
  }),
  Schema.Struct({
    _tag: Schema.Literal("Suspended"),
    batchId: BatchId,
    cause: Schema.optional(Schema.String),
    lastKnownState: Schema.optional(BatchState),
    canResume: Schema.Boolean
  }),
  Schema.Struct({
    _tag: Schema.Literal("NotFound"),
    batchId: BatchId
  })
)

export type BatchStatusResponse = typeof BatchStatusResponse.Type
