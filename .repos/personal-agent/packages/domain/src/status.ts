import { Schema } from "effect"

export const PermissionMode = Schema.Literals([
  "Permissive",
  "Standard",
  "Restrictive"
])
export type PermissionMode = typeof PermissionMode.Type

export const AgentRole = Schema.Literals([
  "SystemRole",
  "UserRole",
  "AssistantRole",
  "ToolRole"
])
export type AgentRole = typeof AgentRole.Type

export const AuthorizationDecision = Schema.Literals([
  "Allow",
  "Deny",
  "RequireApproval"
])
export type AuthorizationDecision = typeof AuthorizationDecision.Type

export const ComplianceStatus = Schema.Literals([
  "Compliant",
  "NonCompliant"
])
export type ComplianceStatus = typeof ComplianceStatus.Type

export const PolicySelector = Schema.Literals([
  "AllTools",
  "SafeStandardTools",
  "ExplicitToolList",
  "UnknownTool",
  "MissingAgent",
  "InvalidRequest",
  "GovernanceError"
])
export type PolicySelector = typeof PolicySelector.Type

export const ToolSourceKind = Schema.Literals([
  "BuiltIn",
  "Integration"
])
export type ToolSourceKind = typeof ToolSourceKind.Type

export const ContentBlockType = Schema.Literals([
  "TextBlock",
  "ToolUseBlock",
  "ToolResultBlock",
  "ImageBlock"
])
export type ContentBlockType = typeof ContentBlockType.Type

export const ArtifactPurpose = Schema.Literals([
  "ToolResult",
  "SubroutineTrace",
  "TranscriptSnapshot",
  "CompactionDetail"
])
export type ArtifactPurpose = typeof ArtifactPurpose.Type

export const ScheduleStatus = Schema.Literals([
  "ScheduleActive",
  "SchedulePaused",
  "ScheduleExpired",
  "ScheduleDisabled"
])
export type ScheduleStatus = typeof ScheduleStatus.Type

export const ConcurrencyPolicy = Schema.Literals([
  "ConcurrencyAllow",
  "ConcurrencyForbid",
  "ConcurrencyReplace"
])
export type ConcurrencyPolicy = typeof ConcurrencyPolicy.Type

export const ExecutionOutcome = Schema.Literals([
  "ExecutionSucceeded",
  "ExecutionFailed",
  "ExecutionSkipped"
])
export type ExecutionOutcome = typeof ExecutionOutcome.Type

export const QuotaPeriod = Schema.Literals([
  "Daily",
  "Monthly",
  "Yearly",
  "Lifetime"
])
export type QuotaPeriod = typeof QuotaPeriod.Type

export const ModelFinishReason = Schema.Literals([
  "stop",
  "length",
  "content-filter",
  "tool-calls",
  "error",
  "pause",
  "other",
  "unknown"
])
export type ModelFinishReason = typeof ModelFinishReason.Type

export const ChannelType = Schema.Literals([
  "CLI",
  "Messaging",
  "WebChat",
  "APIChannel",
  "VoiceChannel",
  "EmailChannel"
])
export type ChannelType = typeof ChannelType.Type

export const ChannelCapability = Schema.Literals([
  "SendText",
  "SendFile",
  "Reactions",
  "Threads",
  "ReadReceipts",
  "Typing",
  "StreamingDelivery"
])
export type ChannelCapability = typeof ChannelCapability.Type

export const MemorySortOrder = Schema.Literals([
  "CreatedDesc",
  "CreatedAsc"
])
export type MemorySortOrder = typeof MemorySortOrder.Type

export const IntegrationStatus = Schema.Literals([
  "Connected",
  "Disconnected",
  "Error",
  "Initializing"
])
export type IntegrationStatus = typeof IntegrationStatus.Type

export const ConnectionStatus = Schema.Literals([
  "Open",
  "Closed",
  "Reconnecting",
  "Failed"
])
export type ConnectionStatus = typeof ConnectionStatus.Type

export const ServiceTransport = Schema.Literals([
  "stdio",
  "sse",
  "http"
])
export type ServiceTransport = typeof ServiceTransport.Type

// --- Memory enums (aligned with PAO ontology) ---

export const MemoryTier = Schema.Literals([
  "WorkingMemory",
  "EpisodicMemory",
  "SemanticMemory",
  "ProceduralMemory"
])
export type MemoryTier = typeof MemoryTier.Type

export const MemoryScope = Schema.Literals([
  "SessionScope",
  "GlobalScope"
])
export type MemoryScope = typeof MemoryScope.Type

export const MemorySource = Schema.Literals([
  "UserSource",
  "SystemSource",
  "AgentSource"
])
export type MemorySource = typeof MemorySource.Type

export const SensitivityLevel = Schema.Literals([
  "Public",
  "Internal",
  "Confidential",
  "Restricted"
])
export type SensitivityLevel = typeof SensitivityLevel.Type

export const GovernanceAction = Schema.Literals([
  "InvokeTool",
  "ReadMemory",
  "WriteMemory",
  "ExecuteSchedule",
  "SpawnSubAgent",
  "CreateGoal",
  "TransitionTask"
])
export type GovernanceAction = typeof GovernanceAction.Type

export const CheckpointAction = Schema.Literals([
  "InvokeTool",
  "ReadMemory"
])
export type CheckpointAction = typeof CheckpointAction.Type

export const CheckpointStatus = Schema.Literals([
  "Pending",
  "Approved",
  "Rejected",
  "Deferred",
  "Expired",
  "Consumed"
])
export type CheckpointStatus = typeof CheckpointStatus.Type

export const CheckpointDecision = Schema.Literals([
  "Approved",
  "Rejected",
  "Deferred"
])
export type CheckpointDecision = typeof CheckpointDecision.Type

export const TurnAuditReasonCode = Schema.Literals([
  "turn_processing_accepted",
  "turn_processing_policy_denied",
  "turn_processing_requires_approval",
  "turn_processing_checkpoint_required",
  "turn_processing_token_budget_exceeded",
  "turn_processing_provider_credit_exhausted",
  "turn_processing_model_error"
])
export type TurnAuditReasonCode = typeof TurnAuditReasonCode.Type

export const SubroutineTriggerType = Schema.Literals([
  "PostTurn",
  "PostSession",
  "Scheduled",
  "ContextPressure"
])
export type SubroutineTriggerType = typeof SubroutineTriggerType.Type
