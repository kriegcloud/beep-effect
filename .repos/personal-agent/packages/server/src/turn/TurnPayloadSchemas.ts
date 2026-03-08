import { GenerationConfigOverrideSchema, ModelOverrideSchema } from "@template/domain/config"
import {
  CHECKPOINT_REPLAY_PAYLOAD_VERSION,
  ContentBlock as ContentBlockSchema
} from "@template/domain/ports"
import { Schema } from "effect"

export const InvokeToolReplayExecutionSchema = Schema.Struct({
  replayPayloadVersion: Schema.Literal(CHECKPOINT_REPLAY_PAYLOAD_VERSION),
  toolName: Schema.String,
  inputJson: Schema.String,
  outputJson: Schema.String,
  isError: Schema.Boolean
})
export type InvokeToolReplayExecution = typeof InvokeToolReplayExecutionSchema.Type

export const ProcessTurnPayloadCommonFields = {
  turnId: Schema.String,
  sessionId: Schema.String,
  conversationId: Schema.String,
  agentId: Schema.String,
  userId: Schema.String,
  channelId: Schema.String,
  content: Schema.String,
  contentBlocks: Schema.Array(ContentBlockSchema),
  inputTokens: Schema.Number,
  checkpointId: Schema.optionalKey(Schema.String),
  invokeToolReplay: Schema.optionalKey(InvokeToolReplayExecutionSchema),
  modelOverride: Schema.optionalKey(ModelOverrideSchema),
  generationConfigOverride: Schema.optionalKey(GenerationConfigOverrideSchema)
} as const

export const ProcessTurnPayloadSchema = Schema.Struct({
  ...ProcessTurnPayloadCommonFields,
  createdAt: Schema.DateTimeUtc
})
export type ProcessTurnPayload = typeof ProcessTurnPayloadSchema.Type

export const ProcessTurnPayloadEntityFields = {
  ...ProcessTurnPayloadCommonFields,
  createdAt: Schema.DateTimeUtcFromString
} as const
