import { Schema } from "effect"
import { AgentId, SessionId, ToolName } from "./ids.js"

export class TokenBudgetExceeded extends Schema.ErrorClass<TokenBudgetExceeded>("TokenBudgetExceeded")({
  _tag: Schema.tag("TokenBudgetExceeded"),
  agentId: AgentId,
  requestedTokens: Schema.Number,
  remainingTokens: Schema.Number
}) {}

export class ToolQuotaExceeded extends Schema.ErrorClass<ToolQuotaExceeded>("ToolQuotaExceeded")({
  _tag: Schema.tag("ToolQuotaExceeded"),
  agentId: AgentId,
  toolName: ToolName,
  remainingInvocations: Schema.Number
}) {}

export class SandboxViolation extends Schema.ErrorClass<SandboxViolation>("SandboxViolation")({
  _tag: Schema.tag("SandboxViolation"),
  agentId: AgentId,
  reason: Schema.String
}) {}

export class SessionNotFound extends Schema.ErrorClass<SessionNotFound>("SessionNotFound")({
  _tag: Schema.tag("SessionNotFound"),
  sessionId: SessionId
}) {}

export class ContextWindowExceeded extends Schema.ErrorClass<ContextWindowExceeded>("ContextWindowExceeded")({
  _tag: Schema.tag("ContextWindowExceeded"),
  sessionId: SessionId,
  tokenCapacity: Schema.Number,
  attemptedTokensUsed: Schema.Number
}) {}

export class ChannelNotFound extends Schema.ErrorClass<ChannelNotFound>("ChannelNotFound")({
  _tag: Schema.tag("ChannelNotFound"),
  channelId: Schema.String
}) {}

export class ChannelTypeMismatch extends Schema.ErrorClass<ChannelTypeMismatch>("ChannelTypeMismatch")({
  _tag: Schema.tag("ChannelTypeMismatch"),
  channelId: Schema.String,
  existingType: Schema.String,
  requestedType: Schema.String
}) {}

export class IntegrationNotFound extends Schema.ErrorClass<IntegrationNotFound>("IntegrationNotFound")({
  _tag: Schema.tag("IntegrationNotFound"),
  integrationId: Schema.String
}) {}

export class MemoryAccessDenied extends Schema.ErrorClass<MemoryAccessDenied>("MemoryAccessDenied")({
  _tag: Schema.tag("MemoryAccessDenied"),
  agentId: AgentId,
  action: Schema.Literals([
    "ReadMemory",
    "WriteMemory"
  ]),
  decision: Schema.Literals([
    "Deny",
    "RequireApproval"
  ]),
  reason: Schema.String
}, {
  description: "Memory access denied by governance policy",
  httpApiStatus: 403
}) {}

export class CheckpointNotFound extends Schema.ErrorClass<CheckpointNotFound>("CheckpointNotFound")({
  _tag: Schema.tag("CheckpointNotFound"),
  checkpointId: Schema.String
}) {}

export class CheckpointAlreadyDecided extends Schema.ErrorClass<CheckpointAlreadyDecided>("CheckpointAlreadyDecided")({
  _tag: Schema.tag("CheckpointAlreadyDecided"),
  checkpointId: Schema.String,
  currentStatus: Schema.String
}) {}

export class CheckpointExpired extends Schema.ErrorClass<CheckpointExpired>("CheckpointExpired")({
  _tag: Schema.tag("CheckpointExpired"),
  checkpointId: Schema.String
}) {}

export class CheckpointNotApproved extends Schema.ErrorClass<CheckpointNotApproved>("CheckpointNotApproved")({
  _tag: Schema.tag("CheckpointNotApproved"),
  checkpointId: Schema.String,
  currentStatus: Schema.String
}) {}

export class CheckpointPayloadMismatch extends Schema.ErrorClass<CheckpointPayloadMismatch>("CheckpointPayloadMismatch")({
  _tag: Schema.tag("CheckpointPayloadMismatch"),
  checkpointId: Schema.String,
  expectedHash: Schema.String,
  actualHash: Schema.String
}) {}
