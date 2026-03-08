import { Schema } from "effect"

export const AgentId = Schema.String.pipe(Schema.brand("AgentId"))
export type AgentId = typeof AgentId.Type

export const SessionId = Schema.String.pipe(Schema.brand("SessionId"))
export type SessionId = typeof SessionId.Type

export const ConversationId = Schema.String.pipe(Schema.brand("ConversationId"))
export type ConversationId = typeof ConversationId.Type

export const TurnId = Schema.String.pipe(Schema.brand("TurnId"))
export type TurnId = typeof TurnId.Type

export const MessageId = Schema.String.pipe(Schema.brand("MessageId"))
export type MessageId = typeof MessageId.Type

export const MemoryItemId = Schema.String.pipe(Schema.brand("MemoryItemId"))
export type MemoryItemId = typeof MemoryItemId.Type

export const ScheduleId = Schema.String.pipe(Schema.brand("ScheduleId"))
export type ScheduleId = typeof ScheduleId.Type

export const ScheduledExecutionId = Schema.String.pipe(Schema.brand("ScheduledExecutionId"))
export type ScheduledExecutionId = typeof ScheduledExecutionId.Type

export const WorkflowExecutionId = Schema.String.pipe(Schema.brand("WorkflowExecutionId"))
export type WorkflowExecutionId = typeof WorkflowExecutionId.Type

export const PolicyId = Schema.String.pipe(Schema.brand("PolicyId"))
export type PolicyId = typeof PolicyId.Type

export const AuditEntryId = Schema.String.pipe(Schema.brand("AuditEntryId"))
export type AuditEntryId = typeof AuditEntryId.Type

export const ToolName = Schema.String.pipe(Schema.brand("ToolName"))
export type ToolName = typeof ToolName.Type

export const ToolInvocationId = Schema.String.pipe(Schema.brand("ToolInvocationId"))
export type ToolInvocationId = typeof ToolInvocationId.Type

export const ArtifactId = Schema.String.pipe(Schema.brand("ArtifactId"))
export type ArtifactId = typeof ArtifactId.Type

export const ToolDefinitionId = Schema.String.pipe(Schema.brand("ToolDefinitionId"))
export type ToolDefinitionId = typeof ToolDefinitionId.Type

export const AuditLogId = Schema.String.pipe(Schema.brand("AuditLogId"))
export type AuditLogId = typeof AuditLogId.Type

export const ChannelId = Schema.String.pipe(Schema.brand("ChannelId"))
export type ChannelId = typeof ChannelId.Type

export const IntegrationId = Schema.String.pipe(Schema.brand("IntegrationId"))
export type IntegrationId = typeof IntegrationId.Type

export const ExternalServiceId = Schema.String.pipe(Schema.brand("ExternalServiceId"))
export type ExternalServiceId = typeof ExternalServiceId.Type

export const CheckpointId = Schema.String.pipe(Schema.brand("CheckpointId"))
export type CheckpointId = typeof CheckpointId.Type

export const CompactionCheckpointId = Schema.String.pipe(Schema.brand("CompactionCheckpointId"))
export type CompactionCheckpointId = typeof CompactionCheckpointId.Type
