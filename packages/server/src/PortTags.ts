import type {
  AgentStatePort,
  ArtifactStorePort,
  ChannelPort,
  CheckpointPort,
  CompactionCheckpointPort,
  GovernancePort,
  IntegrationPort,
  MemoryPort,
  SchedulePort,
  SessionArtifactPort,
  SessionMetricsPort,
  SessionTurnPort
} from "@template/domain/ports"
import { ServiceMap } from "effect"

export const AgentStatePortTag = ServiceMap.Service<AgentStatePort>(
  "server/ports/AgentStatePort"
)

export const SessionTurnPortTag = ServiceMap.Service<SessionTurnPort>(
  "server/ports/SessionTurnPort"
)

export const SchedulePortTag = ServiceMap.Service<SchedulePort>("server/ports/SchedulePort")

export const GovernancePortTag = ServiceMap.Service<GovernancePort>("server/ports/GovernancePort")

export const MemoryPortTag = ServiceMap.Service<MemoryPort>("server/ports/MemoryPort")

export const ChannelPortTag = ServiceMap.Service<ChannelPort>("server/ports/ChannelPort")

export const IntegrationPortTag = ServiceMap.Service<IntegrationPort>("server/ports/IntegrationPort")

export const CheckpointPortTag = ServiceMap.Service<CheckpointPort>("server/ports/CheckpointPort")

export const CompactionCheckpointPortTag = ServiceMap.Service<CompactionCheckpointPort>(
  "server/ports/CompactionCheckpointPort"
)

export const ArtifactStorePortTag = ServiceMap.Service<ArtifactStorePort>(
  "server/ports/ArtifactStorePort"
)

export const SessionArtifactPortTag = ServiceMap.Service<SessionArtifactPort>(
  "server/ports/SessionArtifactPort"
)

export const SessionMetricsPortTag = ServiceMap.Service<SessionMetricsPort>(
  "server/ports/SessionMetricsPort"
)
