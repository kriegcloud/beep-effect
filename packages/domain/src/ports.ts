import type { Effect } from "effect"
import { Schema } from "effect"
import type {
  ContextWindowExceeded,
  SandboxViolation,
  SessionNotFound,
  TokenBudgetExceeded,
  ToolQuotaExceeded
} from "./errors.js"
import {
  AgentId,
  ArtifactId,
  ConversationId,
  MessageId,
  SessionId,
  TurnId
} from "./ids.js"
import type {
  AuditEntryId,
  AuditLogId,
  ChannelId,
  CheckpointId,
  CompactionCheckpointId,
  ExternalServiceId,
  IntegrationId,
  MemoryItemId,
  PolicyId,
  ScheduledExecutionId,
  ScheduleId,
  ToolDefinitionId,
  ToolInvocationId,
  ToolName
} from "./ids.js"
import type { ExternalServiceRecord, IntegrationRecord } from "./integration.js"
import {
  GenerationConfigOverrideSchema,
  ModelOverrideSchema,
  type AiProviderName
} from "./config.js"
import type {
  AuthorizationDecision,
  ArtifactPurpose,
  ComplianceStatus,
  ConcurrencyPolicy,
  ExecutionOutcome,
  GovernanceAction,
  IntegrationStatus,
  MemoryScope,
  MemorySortOrder,
  MemorySource,
  MemoryTier,
  PermissionMode,
  PolicySelector,
  QuotaPeriod,
  ScheduleStatus,
  SensitivityLevel,
  ToolSourceKind
} from "./status.js"
import {
  AgentRole,
  ChannelCapability,
  ChannelType,
  CheckpointAction,
  CheckpointDecision,
  CheckpointStatus,
  ModelFinishReason
} from "./status.js"

export const Instant = Schema.DateTimeUtc
export type Instant = typeof Instant.Type

export interface AgentState {
  readonly agentId: AgentId
  readonly permissionMode: PermissionMode
  readonly tokenBudget: number
  readonly maxToolIterations: number
  readonly quotaPeriod: QuotaPeriod
  readonly tokensConsumed: number
  readonly budgetResetAt: Instant | null
}

export interface SessionState {
  readonly sessionId: SessionId
  readonly conversationId: ConversationId
  readonly tokenCapacity: number
  readonly tokensUsed: number
}

export const ArtifactRefSchema = Schema.Struct({
  artifactId: ArtifactId,
  sha256: Schema.String,
  mediaType: Schema.String,
  bytes: Schema.Number,
  previewText: Schema.Union([Schema.String, Schema.Null])
})
export type ArtifactRef = typeof ArtifactRefSchema.Type

export interface SessionArtifactRecord {
  readonly sessionArtifactId: string
  readonly sessionId: SessionId
  readonly artifact: ArtifactRef
  readonly purpose: ArtifactPurpose
  readonly turnId: TurnId | null
  readonly toolInvocationId: ToolInvocationId | null
  readonly runId: string | null
  readonly createdAt: Instant
}

export interface SessionArtifactProvenance {
  readonly turnId?: TurnId | null
  readonly toolInvocationId?: ToolInvocationId | null
  readonly runId?: string | null
}

export interface SessionMetricsRecord {
  readonly sessionId: SessionId
  readonly tokenCount: number
  readonly toolResultBytes: number
  readonly artifactBytes: number
  readonly fileTouches: number
  readonly lastCompactionAt: Instant | null
  readonly updatedAt: Instant
}

export interface SessionMetricsDelta {
  readonly tokenCount?: number
  readonly toolResultBytes?: number
  readonly artifactBytes?: number
  readonly fileTouches?: number
  readonly lastCompactionAt?: Instant | null
}

export interface SessionCompactionPolicy {
  readonly tokenPressureRatio: number
  readonly tokenCapacity: number
  readonly toolResultBytes: number
  readonly artifactBytes: number
  readonly fileTouches: number
  readonly cooldownSeconds: number
  readonly now: Instant
}

export interface ContextPruningMessage {
  readonly messageId: string
  readonly role: "system" | "user" | "assistant" | "tool"
  readonly text: string
}

export interface ContextPruningArtifactReference {
  readonly artifactId: ArtifactId
  readonly sha256: string
  readonly mediaType: string
  readonly bytes: number
  readonly purpose: ArtifactPurpose
  readonly turnId: TurnId | null
  readonly toolInvocationId: ToolInvocationId | null
  readonly runId: string | null
  readonly previewText: string | null
  readonly createdAt: Instant
}

export interface ContextPruningToolReference {
  readonly toolInvocationId: ToolInvocationId
  readonly toolName: ToolName
  readonly turnId: TurnId
  readonly previewText: string
  readonly invokedAt: Instant
}

export interface ContextPruningPolicy {
  readonly keepRecentTurns: number
  readonly includeArtifactRefs: boolean
  readonly includeToolRefs: boolean
  readonly maxReferenceItems: number
  readonly summaryEnabled: boolean
  readonly summaryMaxChars: number
}

export interface ContextPruningDecision {
  readonly strategyId: string
  readonly note: string
}

export interface ContextPruningInput {
  readonly sessionId: SessionId
  readonly messages: ReadonlyArray<ContextPruningMessage>
  readonly artifactRefs: ReadonlyArray<ContextPruningArtifactReference>
  readonly toolRefs: ReadonlyArray<ContextPruningToolReference>
  readonly policy: ContextPruningPolicy
  readonly pinnedMessageIds: ReadonlyArray<string>
  readonly keptMessageIds: ReadonlyArray<string>
  readonly droppedMessageIds: ReadonlyArray<string>
  readonly insertedBlocks: ReadonlyArray<string>
  readonly summary: string | null
  readonly compactedPrompt: string
  readonly decisions: ReadonlyArray<ContextPruningDecision>
}

export interface ContextPruningOutput extends ContextPruningInput {}

export interface ContextPruningError {
  readonly _tag: "ContextPruningError"
  readonly strategyId: string
  readonly message: string
}

export interface ContextPruningStrategy {
  readonly strategyId: string
  readonly apply: (
    input: ContextPruningInput
  ) => Effect.Effect<ContextPruningOutput, ContextPruningError>
}

export const TextBlock = Schema.Struct({
  contentBlockType: Schema.Literal("TextBlock"),
  text: Schema.String
})
export type TextBlock = typeof TextBlock.Type

export const ToolUseBlock = Schema.Struct({
  contentBlockType: Schema.Literal("ToolUseBlock"),
  toolCallId: Schema.String,
  toolName: Schema.String,
  inputJson: Schema.String
})
export type ToolUseBlock = typeof ToolUseBlock.Type

export const ToolResultBlock = Schema.Struct({
  contentBlockType: Schema.Literal("ToolResultBlock"),
  toolCallId: Schema.String,
  toolName: Schema.String,
  outputJson: Schema.String,
  isError: Schema.Boolean
})
export type ToolResultBlock = typeof ToolResultBlock.Type

export const ImageBlock = Schema.Struct({
  contentBlockType: Schema.Literal("ImageBlock"),
  mediaType: Schema.String,
  source: Schema.String,
  altText: Schema.Union([Schema.String, Schema.Null])
})
export type ImageBlock = typeof ImageBlock.Type

export const ContentBlock = Schema.Union([
  TextBlock,
  ToolUseBlock,
  ToolResultBlock,
  ImageBlock
])
export type ContentBlock = typeof ContentBlock.Type

export const MessageRecord = Schema.Struct({
  messageId: MessageId,
  role: AgentRole,
  content: Schema.String,
  contentBlocks: Schema.Array(ContentBlock)
})
export type MessageRecord = typeof MessageRecord.Type

export class TurnRecord extends Schema.Class<TurnRecord>("TurnRecord")({
  turnId: TurnId,
  sessionId: SessionId,
  conversationId: ConversationId,
  turnIndex: Schema.Number,
  participantRole: AgentRole,
  participantAgentId: Schema.Union([AgentId, Schema.Null]),
  message: MessageRecord,
  modelFinishReason: Schema.Union([ModelFinishReason, Schema.Null]),
  modelUsageJson: Schema.Union([Schema.String, Schema.Null]),
  createdAt: Schema.DateTimeUtcFromString
}) {}

export interface MemorySearchQuery {
  readonly query?: string
  readonly tier?: MemoryTier
  readonly scope?: MemoryScope
  readonly source?: MemorySource
  readonly sort?: MemorySortOrder
  readonly limit?: number
  readonly cursor?: string
}

export interface MemorySearchResult {
  readonly items: ReadonlyArray<MemoryItemRecord>
  readonly cursor: string | null
  readonly totalCount: number
}

export interface MemoryQuery {
  readonly agentId: AgentId
  readonly text: string
  readonly limit: number
}

export interface MemoryForgetFilters {
  readonly cutoffDate?: Instant
  readonly scope?: MemoryScope
  readonly itemIds?: ReadonlyArray<MemoryItemId>
}

export interface RetrieveFilters {
  readonly query: string
  readonly tier?: MemoryTier | undefined
  readonly scope?: MemoryScope | undefined
  readonly limit: number
}

export interface ListFilters {
  readonly tier?: MemoryTier | undefined
  readonly scope?: MemoryScope | undefined
  readonly limit: number
}

export interface MemoryItemRecord {
  readonly memoryItemId: MemoryItemId
  readonly agentId: AgentId
  readonly tier: MemoryTier
  readonly scope: MemoryScope
  readonly source: MemorySource
  readonly content: string
  readonly metadataJson: string | null
  readonly generatedByTurnId: TurnId | null
  readonly sessionId: SessionId | null
  readonly sensitivity: SensitivityLevel
  readonly wasGeneratedBy: AgentId | null
  readonly wasAttributedTo: AgentId | null
  readonly governedByRetention: string | null
  readonly lastAccessTime: Instant | null
  readonly createdAt: Instant
  readonly updatedAt: Instant
}

export type MemoryItemRow = MemoryItemRecord

export interface PolicyInput {
  readonly agentId: AgentId
  readonly sessionId: SessionId | null
  readonly action: GovernanceAction
  readonly toolName?: ToolName
}

export interface PolicyDecision {
  readonly decision: AuthorizationDecision
  readonly policyId: PolicyId | null
  readonly toolDefinitionId: ToolDefinitionId | null
  readonly reason: string
}

export interface AuditEntryRecord {
  readonly auditEntryId: AuditEntryId
  readonly auditLogId?: AuditLogId | null
  readonly toolInvocationId?: ToolInvocationId | null
  readonly agentId: AgentId
  readonly sessionId: SessionId | null
  readonly decision: AuthorizationDecision
  readonly reason: string
  readonly createdAt: Instant
}

export interface ToolDefinitionRecord {
  readonly toolDefinitionId: ToolDefinitionId
  readonly toolName: ToolName
  readonly sourceKind: ToolSourceKind
  readonly integrationId: IntegrationId | null
  readonly isSafeStandard: boolean
  readonly createdAt: Instant
}

export interface PermissionPolicyRecord {
  readonly policyId: PolicyId
  readonly action: GovernanceAction
  readonly permissionMode: PermissionMode | null
  readonly selector: PolicySelector
  readonly decision: AuthorizationDecision
  readonly reasonTemplate: string
  readonly precedence: number
  readonly active: boolean
  readonly toolDefinitionIds: ReadonlyArray<ToolDefinitionId>
}

export interface AuditLogRecord {
  readonly auditLogId: AuditLogId
  readonly logName: string
  readonly createdAt: Instant
}

export interface ToolInvocationRecord {
  readonly toolInvocationId: ToolInvocationId
  readonly idempotencyKey: string
  readonly auditEntryId: AuditEntryId
  readonly toolDefinitionId: ToolDefinitionId | null
  readonly auditLogId: AuditLogId
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly conversationId: ConversationId
  readonly turnId: TurnId
  readonly toolName: ToolName
  readonly inputJson: string
  readonly outputJson: string
  readonly decision: AuthorizationDecision
  readonly complianceStatus: ComplianceStatus
  readonly policyId: PolicyId
  readonly reason: string
  readonly invokedAt: Instant
  readonly completedAt: Instant
  readonly policy?: {
    readonly selector: PolicySelector
    readonly decision: AuthorizationDecision
    readonly reasonTemplate: string
    readonly permissionMode: PermissionMode | null
    readonly precedence: number
  } | null
  readonly tool?: {
    readonly toolDefinitionId: ToolDefinitionId
    readonly toolName: ToolName
    readonly sourceKind: ToolSourceKind
    readonly isSafeStandard: boolean
    readonly integrationId: IntegrationId | null
  } | null
}

export interface ToolInvocationQuery {
  readonly limit?: number
  readonly offset?: number
  readonly decision?: AuthorizationDecision
  readonly complianceStatus?: ComplianceStatus
  readonly policyId?: PolicyId
  readonly toolName?: ToolName
}

export interface ToolInvocationSearchResult {
  readonly items: ReadonlyArray<ToolInvocationRecord>
  readonly totalCount: number
}

export interface RecurrencePattern {
  readonly label: string
  readonly cronExpression: string | null
  readonly intervalSeconds: number | null
}

export interface CronTrigger {
  readonly _tag: "CronTrigger"
}

export interface IntervalTrigger {
  readonly _tag: "IntervalTrigger"
}

export interface EventTrigger {
  readonly _tag: "EventTrigger"
}

export type Trigger = CronTrigger | IntervalTrigger | EventTrigger

export const TriggerSource = Schema.Literals([
  "CronTick",
  "IntervalTick",
  "Event",
  "Manual"
])
export type TriggerSource = typeof TriggerSource.Type

export const ScheduleSkipReason = Schema.Literals([
  "ConcurrencyForbid",
  "ConcurrencyReplace",
  "ManualTriggerInactive"
])
export type ScheduleSkipReason = typeof ScheduleSkipReason.Type

export const BackgroundActionLog = Schema.Struct({
  kind: Schema.Literal("Log")
})
export type BackgroundActionLog = typeof BackgroundActionLog.Type

export const BackgroundActionHealthCheck = Schema.Struct({
  kind: Schema.Literal("HealthCheck")
})
export type BackgroundActionHealthCheck = typeof BackgroundActionHealthCheck.Type

export const BackgroundActionCommand = Schema.Struct({
  kind: Schema.Literal("Command"),
  command: Schema.String
})
export type BackgroundActionCommand = typeof BackgroundActionCommand.Type

export const ScheduledMemorySessionMode = Schema.Literals([
  "synthetic",
  "active_agent_session",
  "session_id"
])
export type ScheduledMemorySessionMode = typeof ScheduledMemorySessionMode.Type

export const BackgroundActionMemorySubroutine = Schema.Struct({
  kind: Schema.Literal("MemorySubroutine"),
  subroutineId: Schema.String,
  sessionMode: ScheduledMemorySessionMode,
  sessionId: Schema.optionalKey(SessionId)
})
export type BackgroundActionMemorySubroutine = typeof BackgroundActionMemorySubroutine.Type

export const BackgroundActionUnknown = Schema.Struct({
  kind: Schema.Literal("Unknown"),
  actionRef: Schema.String
})
export type BackgroundActionUnknown = typeof BackgroundActionUnknown.Type

export const BackgroundAction = Schema.Union([
  BackgroundActionLog,
  BackgroundActionHealthCheck,
  BackgroundActionCommand,
  BackgroundActionMemorySubroutine,
  BackgroundActionUnknown
])
export type BackgroundAction = typeof BackgroundAction.Type

export interface ScheduleRecord {
  readonly scheduleId: ScheduleId
  readonly ownerAgentId: AgentId
  readonly recurrencePattern: RecurrencePattern
  readonly trigger: Trigger
  readonly action: BackgroundAction
  readonly scheduleStatus: ScheduleStatus
  readonly concurrencyPolicy: ConcurrencyPolicy
  readonly allowsCatchUp: boolean
  readonly autoDisableAfterRun: boolean
  readonly catchUpWindowSeconds: number
  readonly maxCatchUpRunsPerTick: number
  readonly lastExecutionAt: Instant | null
  readonly nextExecutionAt: Instant | null
}

export interface ScheduledExecutionRecord {
  readonly executionId: ScheduledExecutionId
  readonly scheduleId: ScheduleId
  readonly dueAt: Instant
  readonly triggerSource: TriggerSource
  readonly outcome: ExecutionOutcome
  readonly startedAt: Instant
  readonly endedAt: Instant | null
  readonly skipReason: ScheduleSkipReason | null
}

export interface ScheduleClaim {
  readonly executionId: ScheduledExecutionId
  readonly scheduleId: ScheduleId
  readonly ownerAgentId: AgentId
  readonly dueAt: Instant
  readonly triggerSource: TriggerSource
  readonly startedAt: Instant
  readonly action: BackgroundAction
  readonly leaseOwner: string
  readonly leaseExpiresAt: Instant
}

export interface DueScheduleRecord {
  readonly schedule: ScheduleRecord
  readonly dueAt: Instant
  readonly triggerSource: TriggerSource
}

// Stable MVP ports. Keep these narrow and compose on Effect primitives.
export interface AgentStatePort {
  readonly get: (agentId: AgentId) => Effect.Effect<AgentState | null>
  readonly upsert: (agentState: AgentState) => Effect.Effect<void>
  readonly consumeTokenBudget: (
    agentId: AgentId,
    requestedTokens: number,
    now: Instant
  ) => Effect.Effect<void, TokenBudgetExceeded>
  readonly listAgentStates: () => Effect.Effect<Array<AgentState>>
}

export interface SessionTurnPort {
  readonly startSession: (state: SessionState) => Effect.Effect<void>
  readonly appendTurn: (turn: TurnRecord) => Effect.Effect<void>
  readonly deleteSession: (sessionId: SessionId) => Effect.Effect<void>
  readonly updateContextWindow: (
    sessionId: SessionId,
    deltaTokens: number
  ) => Effect.Effect<void, ContextWindowExceeded | SessionNotFound>
  readonly getSession: (
    sessionId: SessionId
  ) => Effect.Effect<SessionState | null>
  readonly listTurns: (
    sessionId: SessionId
  ) => Effect.Effect<Array<TurnRecord>>
}

export interface MemoryPort {
  readonly search: (
    agentId: AgentId,
    query: MemorySearchQuery
  ) => Effect.Effect<MemorySearchResult>
  readonly encode: (
    agentId: AgentId,
    items: ReadonlyArray<{
      readonly tier: MemoryTier
      readonly scope: MemoryScope
      readonly source: MemorySource
      readonly content: string
      readonly metadataJson?: string | null
      readonly generatedByTurnId?: string | null
      readonly sessionId?: string | null
      readonly sensitivity?: SensitivityLevel
    }>,
    now: Instant
  ) => Effect.Effect<ReadonlyArray<MemoryItemId>>
  readonly retrieve: (
    agentId: AgentId,
    filters: RetrieveFilters
  ) => Effect.Effect<ReadonlyArray<MemoryItemRow>>
  readonly forget: (agentId: AgentId, filters: MemoryForgetFilters) => Effect.Effect<number>
  readonly listAll: (
    agentId: AgentId,
    filters: ListFilters
  ) => Effect.Effect<ReadonlyArray<MemoryItemRow>>
}

export interface GovernancePort {
  readonly evaluatePolicy: (input: PolicyInput) => Effect.Effect<PolicyDecision>
  readonly checkToolQuota: (
    agentId: AgentId,
    toolName: ToolName,
    now: Instant
  ) => Effect.Effect<void, ToolQuotaExceeded>
  readonly writeAudit: (entry: AuditEntryRecord) => Effect.Effect<void>
  readonly recordToolInvocation: (
    record: ToolInvocationRecord
  ) => Effect.Effect<void>
  readonly recordToolInvocationWithAudit: (input: {
    readonly invocation: ToolInvocationRecord
    readonly audit: AuditEntryRecord
  }) => Effect.Effect<void>
  readonly findToolInvocationByIdempotencyKey: (
    idempotencyKey: string
  ) => Effect.Effect<ToolInvocationRecord | null>
  readonly listToolInvocationsBySession: (
    sessionId: SessionId,
    query: ToolInvocationQuery
  ) => Effect.Effect<ToolInvocationSearchResult>
  readonly listPoliciesForAgent: (
    agentId: AgentId
  ) => Effect.Effect<ReadonlyArray<PermissionPolicyRecord>>
  readonly listAuditEntries: () => Effect.Effect<ReadonlyArray<AuditEntryRecord>>
  readonly enforceSandbox: <A, E, R>(
    agentId: AgentId,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | SandboxViolation, R>
}

export interface SchedulePort {
  readonly upsertSchedule: (schedule: ScheduleRecord) => Effect.Effect<void, import("./errors.js").ScheduleValidationError>
  readonly listDue: (now: Instant) => Effect.Effect<ReadonlyArray<DueScheduleRecord>>
  readonly recordExecution: (record: ScheduledExecutionRecord) => Effect.Effect<void>
  readonly claimDue: (params: {
    readonly now: Instant
    readonly leaseOwner: string
    readonly leaseDurationSeconds: number
    readonly maxClaims?: number
  }) => Effect.Effect<ReadonlyArray<ScheduleClaim>>
  readonly completeClaim: (params: {
    readonly executionId: ScheduledExecutionId
    readonly leaseOwner: string
    readonly outcome: ExecutionOutcome
    readonly endedAt: Instant
  }) => Effect.Effect<boolean>
  readonly renewClaim: (params: {
    readonly executionId: ScheduledExecutionId
    readonly leaseOwner: string
    readonly now: Instant
    readonly leaseDurationSeconds: number
  }) => Effect.Effect<boolean>
  readonly hasExecution: (executionId: ScheduledExecutionId) => Effect.Effect<boolean>
  readonly getSchedule: (scheduleId: ScheduleId) => Effect.Effect<ScheduleRecord | null>
  readonly listExecutions: () => Effect.Effect<Array<ScheduledExecutionRecord>>
}

export interface ArtifactStorePort {
  readonly putJson: (
    sessionId: SessionId,
    purpose: ArtifactPurpose,
    payload: unknown,
    metadata?: {
      readonly mediaType?: string
      readonly previewText?: string | null
    }
  ) => Effect.Effect<ArtifactRef>
  readonly putBytes: (
    sessionId: SessionId,
    purpose: ArtifactPurpose,
    bytes: Uint8Array,
    metadata?: {
      readonly mediaType?: string
      readonly previewText?: string | null
    }
  ) => Effect.Effect<ArtifactRef>
  readonly getBytes: (artifactId: ArtifactId) => Effect.Effect<Uint8Array>
}

export interface SessionArtifactPort {
  readonly link: (
    sessionId: SessionId,
    artifactRef: ArtifactRef,
    purpose: ArtifactPurpose,
    provenance?: SessionArtifactProvenance
  ) => Effect.Effect<void>
  readonly listBySession: (
    sessionId: SessionId,
    purpose?: ArtifactPurpose
  ) => Effect.Effect<ReadonlyArray<SessionArtifactRecord>>
}

export interface SessionMetricsPort {
  readonly increment: (
    sessionId: SessionId,
    deltas: SessionMetricsDelta
  ) => Effect.Effect<void>
  readonly get: (
    sessionId: SessionId
  ) => Effect.Effect<SessionMetricsRecord | null>
  readonly shouldTriggerCompaction: (
    sessionId: SessionId,
    policy: SessionCompactionPolicy
  ) => Effect.Effect<boolean>
}

export interface ChannelRecord {
  readonly channelId: ChannelId
  readonly channelType: ChannelType
  readonly agentId: AgentId
  readonly activeSessionId: SessionId
  readonly activeConversationId: ConversationId
  readonly capabilities: ReadonlyArray<ChannelCapability>
  readonly modelOverride: { readonly provider: AiProviderName; readonly modelId: string } | null
  readonly generationConfigOverride: {
    readonly temperature?: number
    readonly maxOutputTokens?: number
    readonly topP?: number
  } | null
  readonly createdAt: Instant
}

export interface ChannelSummaryRecord {
  readonly channelId: ChannelId
  readonly channelType: ChannelType
  readonly agentId: AgentId
  readonly activeSessionId: SessionId
  readonly activeConversationId: ConversationId
  readonly createdAt: Instant
  readonly lastTurnAt: Instant | null
  readonly messageCount: number
}

export const ChannelSummary = Schema.Struct({
  channelId: Schema.String,
  channelType: Schema.String,
  agentId: Schema.String,
  activeSessionId: Schema.String,
  activeConversationId: Schema.String,
  createdAt: Schema.String,
  lastTurnAt: Schema.Union([Schema.String, Schema.Null]),
  messageCount: Schema.Number
})
export type ChannelSummary = typeof ChannelSummary.Type

export const ListChannelsResponse = Schema.Struct({
  items: Schema.Array(ChannelSummary),
  totalCount: Schema.Number
})
export type ListChannelsResponse = typeof ListChannelsResponse.Type

export const OkResponse = Schema.Struct({
  ok: Schema.Literal(true)
})
export type OkResponse = typeof OkResponse.Type

export const InternalServerErrorResponse = Schema.Struct({
  error: Schema.Literal("InternalServerError")
})
export type InternalServerErrorResponse = typeof InternalServerErrorResponse.Type

export const ChannelNotFoundResponse = Schema.Struct({
  error: Schema.Literal("ChannelNotFound"),
  channelId: Schema.String
})
export type ChannelNotFoundResponse = typeof ChannelNotFoundResponse.Type

export const SessionNotFoundResponse = Schema.Struct({
  error: Schema.Literal("SessionNotFound"),
  sessionId: Schema.String
})
export type SessionNotFoundResponse = typeof SessionNotFoundResponse.Type

export const ChannelTypeMismatchResponse = Schema.Struct({
  error: Schema.Literal("ChannelTypeMismatch"),
  channelId: Schema.String,
  existingType: Schema.String,
  requestedType: Schema.String
})
export type ChannelTypeMismatchResponse = typeof ChannelTypeMismatchResponse.Type

export const ChannelAttachTarget = Schema.Struct({
  sessionId: Schema.String
})
export type ChannelAttachTarget = typeof ChannelAttachTarget.Type

export const InitializeChannelRequest = Schema.Struct({
  channelType: ChannelType.pipe(
    Schema.withDecodingDefaultKey(() => "CLI")
  ),
  agentId: Schema.String.pipe(
    Schema.withDecodingDefaultKey(() => "agent:bootstrap")
  ),
  attachTo: Schema.optionalKey(ChannelAttachTarget)
})
export type InitializeChannelRequest = typeof InitializeChannelRequest.Type

export const SetChannelModelPreferenceRequest = Schema.Struct({
  model: Schema.optionalKey(Schema.Union([ModelOverrideSchema, Schema.Null])),
  generationConfig: Schema.optionalKey(Schema.Union([GenerationConfigOverrideSchema, Schema.Null]))
})
export type SetChannelModelPreferenceRequest = typeof SetChannelModelPreferenceRequest.Type

export const SendChannelMessageRequest = Schema.Struct({
  content: Schema.String,
  model: Schema.optionalKey(ModelOverrideSchema),
  generationConfig: Schema.optionalKey(GenerationConfigOverrideSchema)
})
export type SendChannelMessageRequest = typeof SendChannelMessageRequest.Type

export const ChannelHistoryResponse = Schema.Array(TurnRecord)
export type ChannelHistoryResponse = typeof ChannelHistoryResponse.Type

export const ChannelStatus = Schema.Struct({
  channelId: Schema.String,
  channelType: ChannelType,
  capabilities: Schema.Array(ChannelCapability),
  activeSessionId: Schema.String,
  activeConversationId: Schema.String,
  modelOverride: Schema.Union([ModelOverrideSchema, Schema.Null]),
  generationConfigOverride: Schema.Union([GenerationConfigOverrideSchema, Schema.Null]),
  createdAt: Schema.DateTimeUtcFromString
})
export type ChannelStatus = typeof ChannelStatus.Type

export interface ChannelPort {
  readonly create: (channel: ChannelRecord) => Effect.Effect<void>
  readonly get: (channelId: ChannelId) => Effect.Effect<ChannelRecord | null>
  readonly delete: (channelId: ChannelId) => Effect.Effect<void>
  readonly release: (channelId: ChannelId) => Effect.Effect<{
    readonly channelId: ChannelId
    readonly sessionId: SessionId
    readonly remainingOwners: number
  } | null>
  readonly list: (query?: {
    readonly agentId?: AgentId
  }) => Effect.Effect<ReadonlyArray<ChannelSummaryRecord>>
  readonly updateModelPreference: (
    channelId: ChannelId,
    update: {
      readonly modelOverride?: ChannelRecord["modelOverride"]
      readonly generationConfigOverride?: ChannelRecord["generationConfigOverride"]
    }
  ) => Effect.Effect<void>
}

export interface CheckpointRecord {
  readonly checkpointId: CheckpointId
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly channelId: ChannelId
  readonly turnId: string
  readonly action: CheckpointAction
  readonly policyId: PolicyId | null
  readonly reason: string
  readonly payloadJson: string
  readonly payloadHash: string
  readonly status: CheckpointStatus
  readonly requestedAt: Instant
  readonly decidedAt: Instant | null
  readonly decidedBy: string | null
  readonly consumedAt: Instant | null
  readonly consumedBy: string | null
  readonly expiresAt: Instant | null
}

export const CheckpointRecordResponse = Schema.Struct({
  checkpointId: Schema.String,
  agentId: Schema.String,
  sessionId: Schema.String,
  channelId: Schema.String,
  turnId: Schema.String,
  action: CheckpointAction,
  policyId: Schema.Union([Schema.String, Schema.Null]),
  reason: Schema.String,
  payloadJson: Schema.String,
  payloadHash: Schema.String,
  status: CheckpointStatus,
  requestedAt: Schema.DateTimeUtcFromString,
  decidedAt: Schema.Union([Schema.DateTimeUtcFromString, Schema.Null]),
  decidedBy: Schema.Union([Schema.String, Schema.Null]),
  consumedAt: Schema.Union([Schema.DateTimeUtcFromString, Schema.Null]),
  consumedBy: Schema.Union([Schema.String, Schema.Null]),
  expiresAt: Schema.Union([Schema.DateTimeUtcFromString, Schema.Null])
})
export type CheckpointRecordResponse = typeof CheckpointRecordResponse.Type

export const ListPendingCheckpointsResponse = Schema.Struct({
  items: Schema.Array(CheckpointRecordResponse),
  totalCount: Schema.Number
})
export type ListPendingCheckpointsResponse = typeof ListPendingCheckpointsResponse.Type

export const CheckpointNotFoundResponse = Schema.Struct({
  error: Schema.Literal("CheckpointNotFound"),
  checkpointId: Schema.String
})
export type CheckpointNotFoundResponse = typeof CheckpointNotFoundResponse.Type

export const DecideCheckpointRequest = Schema.Struct({
  decision: CheckpointDecision,
  decidedBy: Schema.String
})
export type DecideCheckpointRequest = typeof DecideCheckpointRequest.Type

export const DecideCheckpointAckResponse = Schema.Struct({
  ok: Schema.Literal(true)
})
export type DecideCheckpointAckResponse = typeof DecideCheckpointAckResponse.Type

export const DecideCheckpointNotFoundResponse = CheckpointNotFoundResponse
export type DecideCheckpointNotFoundResponse = typeof DecideCheckpointNotFoundResponse.Type

export const DecideCheckpointAlreadyDecidedResponse = Schema.Struct({
  error: Schema.Literal("CheckpointAlreadyDecided"),
  checkpointId: Schema.String,
  currentStatus: CheckpointStatus
})
export type DecideCheckpointAlreadyDecidedResponse =
  typeof DecideCheckpointAlreadyDecidedResponse.Type

export const DecideCheckpointExpiredResponse = Schema.Struct({
  error: Schema.Literal("CheckpointExpired"),
  checkpointId: Schema.String
})
export type DecideCheckpointExpiredResponse = typeof DecideCheckpointExpiredResponse.Type

export const DecideCheckpointErrorResponse = Schema.Union([
  DecideCheckpointNotFoundResponse,
  DecideCheckpointAlreadyDecidedResponse,
  DecideCheckpointExpiredResponse
])
export type DecideCheckpointErrorResponse = typeof DecideCheckpointErrorResponse.Type

export const CheckpointReplayTurnContext = Schema.Struct({
  agentId: Schema.String,
  sessionId: Schema.String,
  conversationId: Schema.String,
  channelId: Schema.String,
  turnId: Schema.String,
  createdAt: Schema.DateTimeUtcFromString
})
export type CheckpointReplayTurnContext = typeof CheckpointReplayTurnContext.Type

export const CHECKPOINT_REPLAY_PAYLOAD_VERSION = 1 as const
export const CheckpointReplayPayloadVersion = Schema.Literal(
  CHECKPOINT_REPLAY_PAYLOAD_VERSION
)
export type CheckpointReplayPayloadVersion =
  typeof CheckpointReplayPayloadVersion.Type

export const InvokeToolReplayPayload = Schema.Struct({
  replayPayloadVersion: CheckpointReplayPayloadVersion,
  kind: Schema.Literal("InvokeTool"),
  toolName: Schema.String,
  inputJson: Schema.String,
  turnContext: CheckpointReplayTurnContext
})
export type InvokeToolReplayPayload = typeof InvokeToolReplayPayload.Type

export const ReadMemoryReplayPayload = Schema.Struct({
  replayPayloadVersion: CheckpointReplayPayloadVersion,
  kind: Schema.Literal("ReadMemory"),
  content: Schema.String,
  contentBlocks: Schema.Array(ContentBlock),
  turnContext: CheckpointReplayTurnContext
})
export type ReadMemoryReplayPayload = typeof ReadMemoryReplayPayload.Type

export const CheckpointReplayPayload = Schema.Union([
  InvokeToolReplayPayload,
  ReadMemoryReplayPayload
])
export type CheckpointReplayPayload = typeof CheckpointReplayPayload.Type

export interface CheckpointPort {
  readonly create: (record: CheckpointRecord) => Effect.Effect<void>
  readonly get: (checkpointId: CheckpointId) => Effect.Effect<CheckpointRecord | null>
  readonly deleteByChannel: (channelId: ChannelId) => Effect.Effect<void>
  readonly decidePending: (
    checkpointId: CheckpointId,
    decision: CheckpointDecision,
    decidedBy: string,
    decidedAt: Instant
  ) => Effect.Effect<
    void,
    import("./errors.js").CheckpointNotFound
    | import("./errors.js").CheckpointAlreadyDecided
    | import("./errors.js").CheckpointExpired
  >
  readonly consumeApproved: (
    checkpointId: CheckpointId,
    consumedBy: string,
    consumedAt: Instant
  ) => Effect.Effect<
    void,
    import("./errors.js").CheckpointNotFound
    | import("./errors.js").CheckpointAlreadyDecided
    | import("./errors.js").CheckpointExpired
  >
  /**
   * @deprecated Prefer `decidePending` and `consumeApproved`.
   */
  readonly transition: (
    checkpointId: CheckpointId,
    toStatus: CheckpointStatus,
    decidedBy: string,
    decidedAt: Instant
  ) => Effect.Effect<
    void,
    import("./errors.js").CheckpointNotFound
    | import("./errors.js").CheckpointAlreadyDecided
    | import("./errors.js").CheckpointExpired
  >
  readonly listPending: (agentId?: AgentId) => Effect.Effect<ReadonlyArray<CheckpointRecord>>
}

export interface IntegrationPort {
  readonly createService: (service: ExternalServiceRecord) => Effect.Effect<void>
  readonly getService: (serviceId: ExternalServiceId) => Effect.Effect<ExternalServiceRecord | null>
  readonly createIntegration: (integration: IntegrationRecord) => Effect.Effect<void>
  readonly getIntegration: (integrationId: IntegrationId) => Effect.Effect<IntegrationRecord | null>
  readonly getIntegrationByService: (
    agentId: AgentId,
    serviceId: ExternalServiceId
  ) => Effect.Effect<IntegrationRecord | null>
  readonly updateStatus: (integrationId: IntegrationId, status: IntegrationStatus) => Effect.Effect<void>
}

export interface CompactionCheckpointRecord {
  readonly checkpointId: CompactionCheckpointId
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly subroutineId: string
  readonly createdAt: Instant
  readonly summary: string
  readonly firstKeptTurnId: TurnId | null
  readonly firstKeptMessageId: MessageId | null
  readonly tokensBefore: number | null
  readonly tokensAfter: number | null
  readonly detailsJson: string | null
}

export interface CompactionCheckpointPort {
  readonly create: (record: CompactionCheckpointRecord) => Effect.Effect<void>
  readonly getLatestForSubroutine: (
    agentId: AgentId,
    sessionId: SessionId,
    subroutineId: string
  ) => Effect.Effect<CompactionCheckpointRecord | null>
  readonly listBySession: (sessionId: SessionId) => Effect.Effect<ReadonlyArray<CompactionCheckpointRecord>>
}

// ---------------------------------------------------------------------------
// Turn Post-Commit
// ---------------------------------------------------------------------------

export const ExecutePostCommitPayload = Schema.Struct({
  turnId: TurnId,
  agentId: AgentId,
  sessionId: SessionId,
  conversationId: ConversationId
})
export type ExecutePostCommitPayload = typeof ExecutePostCommitPayload.Type

export const ExecuteCompactionPayload = Schema.Struct({
  triggerSource: Schema.Literal("PostCommitMetrics"),
  agentId: AgentId,
  sessionId: SessionId,
  conversationId: ConversationId,
  turnId: TurnId,
  triggeredAt: Instant
})
export type ExecuteCompactionPayload = typeof ExecuteCompactionPayload.Type

export const CompactionWorkflowResult = Schema.Struct({
  status: Schema.Literals(["Applied", "Coalesced", "NoOp", "Failed"]),
  sessionId: SessionId,
  turnId: TurnId,
  detailsArtifactId: Schema.Union([ArtifactId, Schema.Null]),
  message: Schema.Union([Schema.String, Schema.Null])
})
export type CompactionWorkflowResult = typeof CompactionWorkflowResult.Type

export const PostCommitSubroutineOutcome = Schema.Struct({
  subroutineId: Schema.String,
  success: Schema.Boolean,
  errorTag: Schema.Union([Schema.String, Schema.Null])
})
export type PostCommitSubroutineOutcome = typeof PostCommitSubroutineOutcome.Type

export const PostCommitResult = Schema.Struct({
  subroutines: Schema.Array(PostCommitSubroutineOutcome),
  projectionSuccess: Schema.Boolean,
  projectionError: Schema.Union([Schema.String, Schema.Null])
})
export type PostCommitResult = typeof PostCommitResult.Type
