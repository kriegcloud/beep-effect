import { Schema } from "effect"
import { MemoryItemId } from "./ids.js"
import { MemoryScope, MemorySource, MemoryTier, SensitivityLevel } from "./status.js"
import {
  DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS,
  DEFAULT_SUBROUTINE_MAX_ITERATIONS,
  DEFAULT_SUBROUTINE_TOOL_CONCURRENCY,
  DEFAULT_TRACE_RETENTION_DAYS
} from "./system-defaults.js"

export const toMemoryItemIds = (ids: ReadonlyArray<string>): ReadonlyArray<MemoryItemId> =>
  [...new Set(ids
    .map((id) => id.trim())
    .filter((id) => id.length > 0))]
    .map((id) => MemoryItemId.makeUnsafe(id))

export const StoreItemInput = Schema.Struct({
  tier: MemoryTier,
  scope: MemoryScope,
  source: MemorySource,
  content: Schema.String,
  metadataJson: Schema.optional(Schema.String),
  generatedByTurnId: Schema.optional(Schema.String),
  sessionId: Schema.optional(Schema.String),
  sensitivity: Schema.optional(SensitivityLevel)
})
export type StoreItemInput = typeof StoreItemInput.Type

export const MemoryItemRecordSchema = Schema.Struct({
  memoryItemId: Schema.String,
  agentId: Schema.String,
  tier: MemoryTier,
  scope: MemoryScope,
  source: MemorySource,
  content: Schema.String,
  metadataJson: Schema.Union([Schema.String, Schema.Null]),
  generatedByTurnId: Schema.Union([Schema.String, Schema.Null]),
  sessionId: Schema.Union([Schema.String, Schema.Null]),
  sensitivity: SensitivityLevel,
  wasGeneratedBy: Schema.Union([Schema.String, Schema.Null]),
  wasAttributedTo: Schema.Union([Schema.String, Schema.Null]),
  governedByRetention: Schema.Union([Schema.String, Schema.Null]),
  lastAccessTime: Schema.Union([Schema.DateTimeUtc, Schema.Null]),
  createdAt: Schema.DateTimeUtc,
  updatedAt: Schema.DateTimeUtc
})
export type MemoryItemRecordSchema = typeof MemoryItemRecordSchema.Type

export const RetrieveQuery = Schema.Struct({
  query: Schema.String,
  tier: Schema.optional(MemoryTier),
  scope: Schema.optional(MemoryScope),
  limit: Schema.optional(Schema.Number)
})
export type RetrieveQuery = typeof RetrieveQuery.Type

export const ForgetFilter = Schema.Struct({
  cutoffDate: Schema.optional(Schema.DateTimeUtc),
  scope: Schema.optional(MemoryScope),
  itemIds: Schema.optional(Schema.Array(Schema.String))
})
export type ForgetFilter = typeof ForgetFilter.Type

// --- Subroutine Configuration Schemas ---

export const SubroutineTrigger = Schema.Union([
  Schema.Struct({ type: Schema.tag("PostTurn") }),
  Schema.Struct({
    type: Schema.tag("PostSession"),
    idleTimeoutSeconds: Schema.Int
  }),
  Schema.Struct({
    type: Schema.tag("Scheduled"),
    cronExpression: Schema.String,
    timezone: Schema.optionalKey(Schema.String)
  }),
  Schema.Struct({
    type: Schema.tag("ContextPressure"),
    reserveTokens: Schema.Int,
    retryOnOverflow: Schema.Boolean
  })
])
export type SubroutineTrigger = typeof SubroutineTrigger.Type

export const SubroutineToolScope = Schema.Struct({
  fileRead: Schema.Boolean,
  fileWrite: Schema.Boolean,
  shell: Schema.Boolean,
  memoryRead: Schema.Boolean,
  memoryWrite: Schema.Boolean,
  notification: Schema.Boolean
})
export type SubroutineToolScope = typeof SubroutineToolScope.Type

export const SubroutineModelOverride = Schema.Struct({
  provider: Schema.String,
  modelId: Schema.String
})
export type SubroutineModelOverride = typeof SubroutineModelOverride.Type

export const MemorySubroutineConfig = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  tier: MemoryTier,
  trigger: SubroutineTrigger,
  promptRef: Schema.String,
  maxIterations: Schema.Int.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_SUBROUTINE_MAX_ITERATIONS)
  ),
  toolConcurrency: Schema.Union([Schema.Int, Schema.Literal("inherit")]).pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_SUBROUTINE_TOOL_CONCURRENCY as number | "inherit")
  ),
  model: Schema.optionalKey(SubroutineModelOverride),
  toolScope: Schema.optionalKey(SubroutineToolScope),
  dedupeWindowSeconds: Schema.Int.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS)
  ),
  writesCheckpoint: Schema.optionalKey(Schema.Boolean)
})
export type MemorySubroutineConfig = typeof MemorySubroutineConfig.Type

export const MemoryTranscriptConfig = Schema.Struct({
  enabled: Schema.Boolean,
  directory: Schema.String
})
export type MemoryTranscriptConfig = typeof MemoryTranscriptConfig.Type

export const MemoryTraceConfig = Schema.Struct({
  enabled: Schema.Boolean,
  directory: Schema.String,
  retentionDays: Schema.Int.pipe(
    Schema.withDecodingDefaultKey(() => DEFAULT_TRACE_RETENTION_DAYS)
  )
})
export type MemoryTraceConfig = typeof MemoryTraceConfig.Type

export const MemoryRoutinesConfig = Schema.Struct({
  subroutines: Schema.Array(MemorySubroutineConfig),
  transcripts: Schema.optionalKey(MemoryTranscriptConfig),
  traces: Schema.optionalKey(MemoryTraceConfig)
})
export type MemoryRoutinesConfig = typeof MemoryRoutinesConfig.Type
