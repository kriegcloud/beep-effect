import { Schema } from "effect"
import { ContentBlock } from "./ports.js"
import { CheckpointAction, ModelFinishReason, TurnAuditReasonCode } from "./status.js"

export class SubmitTurnRequest extends Schema.Class<SubmitTurnRequest>("SubmitTurnRequest")({
  turnId: Schema.String,
  conversationId: Schema.String,
  agentId: Schema.String,
  content: Schema.String,
  contentBlocks: Schema.Array(ContentBlock),
  createdAt: Schema.DateTimeUtcFromString,
  inputTokens: Schema.Number
}) {}

export class TurnStartedEvent extends Schema.Class<TurnStartedEvent>("TurnStartedEvent")({
  type: Schema.Literal("turn.started"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  createdAt: Schema.DateTimeUtcFromString
}) {}

export class AssistantDeltaEvent extends Schema.Class<AssistantDeltaEvent>("AssistantDeltaEvent")({
  type: Schema.Literal("assistant.delta"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  delta: Schema.String
}) {}

export class ToolCallEvent extends Schema.Class<ToolCallEvent>("ToolCallEvent")({
  type: Schema.Literal("tool.call"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  toolCallId: Schema.String,
  toolName: Schema.String,
  inputJson: Schema.String
}) {}

export class ToolResultEvent extends Schema.Class<ToolResultEvent>("ToolResultEvent")({
  type: Schema.Literal("tool.result"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  toolCallId: Schema.String,
  toolName: Schema.String,
  outputJson: Schema.String,
  isError: Schema.Boolean
}) {}

export class ToolErrorEvent extends Schema.Class<ToolErrorEvent>("ToolErrorEvent")({
  type: Schema.Literal("tool.error"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  toolCallId: Schema.String,
  toolName: Schema.String,
  outputJson: Schema.String
}) {}

export class IterationCompletedEvent extends Schema.Class<IterationCompletedEvent>(
  "IterationCompletedEvent"
)({
  type: Schema.Literal("iteration.completed"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  iteration: Schema.Number,
  finishReason: ModelFinishReason,
  toolCallsThisIteration: Schema.Number,
  toolCallsTotal: Schema.Number
}) {}

export class TurnCompletedEvent extends Schema.Class<TurnCompletedEvent>(
  "TurnCompletedEvent"
)({
  type: Schema.Literal("turn.completed"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  accepted: Schema.Boolean,
  auditReasonCode: TurnAuditReasonCode,
  iterationsUsed: Schema.Number,
  toolCallsTotal: Schema.Number,
  modelFinishReason: Schema.Union([ModelFinishReason, Schema.Null]),
  modelUsageJson: Schema.Union([Schema.String, Schema.Null])
}) {}

export const TurnFailureCode = Schema.Literals([
  "provider_credit_exhausted",
  "checkpoint_payload_mismatch",
  "checkpoint_not_approved",
  "checkpoint_payload_invalid",
  "checkpoint_transition_failed",
  "unknown_tool_definition",
  "policy_denied",
  "tool_quota_exceeded",
  "tool_timeout",
  "tool_execution_error",
  "session_entity_error",
  "turn_processing_error"
])
export type TurnFailureCode = typeof TurnFailureCode.Type

export class TurnFailedEvent extends Schema.Class<TurnFailedEvent>("TurnFailedEvent")({
  type: Schema.Literal("turn.failed"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  errorCode: TurnFailureCode,
  message: Schema.String
}) {}

export class TurnCheckpointRequiredEvent extends Schema.Class<TurnCheckpointRequiredEvent>(
  "TurnCheckpointRequiredEvent"
)({
  type: Schema.Literal("turn.checkpoint_required"),
  sequence: Schema.Number,
  turnId: Schema.String,
  sessionId: Schema.String,
  checkpointId: Schema.String,
  action: CheckpointAction,
  reason: Schema.String
}) {}

export const TurnStreamEvent = Schema.Union([
  TurnStartedEvent,
  AssistantDeltaEvent,
  ToolCallEvent,
  ToolResultEvent,
  ToolErrorEvent,
  IterationCompletedEvent,
  TurnCheckpointRequiredEvent,
  TurnCompletedEvent,
  TurnFailedEvent
])
export type TurnStreamEvent = typeof TurnStreamEvent.Type
