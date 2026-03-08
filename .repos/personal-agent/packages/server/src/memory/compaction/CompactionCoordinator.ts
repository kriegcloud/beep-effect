import type {
  CompactionWorkflowResult,
  ContextPruningArtifactReference,
  ContextPruningMessage,
  ContextPruningOutput,
  ContextPruningToolReference,
  ExecuteCompactionPayload,
  SessionArtifactRecord,
  ToolInvocationRecord
} from "@template/domain/ports"
import type { AuditEntryId, CompactionCheckpointId } from "@template/domain/ids"
import { DateTime, Effect, Layer, Ref, ServiceMap } from "effect"
import * as Chat from "effect/unstable/ai/Chat"
import * as Prompt from "effect/unstable/ai/Prompt"
import { AgentConfig } from "../../ai/AgentConfig.js"
import { PromptCatalog } from "../../ai/PromptCatalog.js"
import { safeJsonParseUnknown, safeJsonStringify } from "../../json/JsonCodec.js"
import {
  ArtifactStorePortTag,
  CompactionCheckpointPortTag,
  GovernancePortTag,
  SessionArtifactPortTag,
  SessionMetricsPortTag
} from "../../PortTags.js"
import { createDefaultContextPruningPipeline } from "./ContextPruningBuiltins.js"
import {
  makeInitialContextPruningInput,
  runContextPruningPipeline
} from "./ContextPruning.js"

const messageIdForIndex = (index: number): string => `msg:${index}`

const toMessageText = (message: Prompt.Message): string => {
  if (message.role === "system") {
    return message.content.trim()
  }

  const parts = message.content.map((part) => {
    switch (part.type) {
      case "text":
      case "reasoning":
        return part.text
      case "tool-call":
        return `[tool-call:${part.name}] ${safeJsonStringify(part.params)}`
      case "tool-result":
        return `[tool-result:${part.name}] ${safeJsonStringify(part.result)}`
      case "file":
        return `[file:${part.mediaType}]`
      case "tool-approval-request":
        return `[tool-approval-request:${part.approvalId}] ${part.toolCallId}`
      case "tool-approval-response":
        return `[tool-approval-response:${part.approvalId}] ${part.approved ? "approved" : "denied"}`
      default:
        return `[${(part as { readonly type?: string }).type ?? "unknown-part"}]`
    }
  })

  return parts.join(" ").trim()
}

const toPruningMessage = (message: Prompt.Message, index: number): ContextPruningMessage => ({
  messageId: messageIdForIndex(index),
  role: message.role,
  text: toMessageText(message)
})

const toArtifactReferences = (
  records: ReadonlyArray<SessionArtifactRecord>
): ReadonlyArray<ContextPruningArtifactReference> =>
  records.map((record) => ({
    artifactId: record.artifact.artifactId as ContextPruningArtifactReference["artifactId"],
    sha256: record.artifact.sha256,
    mediaType: record.artifact.mediaType,
    bytes: record.artifact.bytes,
    purpose: record.purpose as ContextPruningArtifactReference["purpose"],
    turnId: record.turnId as ContextPruningArtifactReference["turnId"],
    toolInvocationId: record.toolInvocationId as ContextPruningArtifactReference["toolInvocationId"],
    runId: record.runId,
    previewText: record.artifact.previewText,
    createdAt: record.createdAt
  }))

const parseToolOutputPreview = (outputJson: string): string => {
  const parsed = safeJsonParseUnknown(outputJson)
  if (
    typeof parsed === "object"
    && parsed !== null
    && "storage" in parsed
    && (parsed as { readonly storage?: unknown }).storage === "ArtifactRef"
    && "preview" in parsed
    && typeof (parsed as { readonly preview?: unknown }).preview === "string"
  ) {
    return (parsed as { readonly preview: string }).preview
  }

  if (typeof parsed === "string") {
    return parsed.slice(0, 200)
  }
  return safeJsonStringify(parsed).slice(0, 200)
}

const toToolReferences = (
  records: ReadonlyArray<ToolInvocationRecord>
): ReadonlyArray<ContextPruningToolReference> =>
  records.map((record) => ({
    toolInvocationId: record.toolInvocationId,
    toolName: record.toolName,
    turnId: record.turnId,
    previewText: parseToolOutputPreview(record.outputJson),
    invokedAt: record.invokedAt
  }))

const toInsertedMessages = (blocks: ReadonlyArray<string>): ReadonlyArray<Prompt.AssistantMessage> =>
  blocks.map((block) =>
    Prompt.assistantMessage({
      content: [
        Prompt.makePart("text", { text: block })
      ]
    })
  )

const toCompactedMessages = (
  originalMessages: ReadonlyArray<Prompt.Message>,
  pruning: ContextPruningOutput
): ReadonlyArray<Prompt.Message> => {
  const kept = originalMessages.filter((_, index) =>
    pruning.keptMessageIds.includes(messageIdForIndex(index))
  )

  if (pruning.insertedBlocks.length === 0) {
    return kept
  }

  const insertedMessages = toInsertedMessages(pruning.insertedBlocks)
  const systemMessages = kept.filter((message) => message.role === "system")
  const nonSystemMessages = kept.filter((message) => message.role !== "system")

  return [
    ...systemMessages,
    ...insertedMessages,
    ...nonSystemMessages
  ]
}

const summarizeCompaction = (
  beforeCount: number,
  afterCount: number,
  droppedCount: number
): string => `Compacted session context: kept=${afterCount}, dropped=${droppedCount}, before=${beforeCount}`

export interface CompactionCoordinatorService {
  readonly run: (
    payload: ExecuteCompactionPayload
  ) => Effect.Effect<CompactionWorkflowResult, unknown>
}

export class CompactionCoordinator extends ServiceMap.Service<CompactionCoordinator>()(
  "server/memory/compaction/CompactionCoordinator",
  {
    make: Effect.gen(function*() {
      const chatPersistence = yield* Chat.Persistence
      const agentConfig = yield* AgentConfig
      const promptCatalog = yield* PromptCatalog
      const sessionArtifactPort = yield* SessionArtifactPortTag
      const governancePort = yield* GovernancePortTag
      const artifactStore = yield* ArtifactStorePortTag
      const compactionCheckpointPort = yield* CompactionCheckpointPortTag
      const sessionMetricsPort = yield* SessionMetricsPortTag

      const run: CompactionCoordinatorService["run"] = (payload) =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          const chat = yield* chatPersistence.getOrCreate(payload.sessionId)
          const currentPrompt = yield* Ref.get(chat.history)
          const originalMessages = currentPrompt.content

          if (originalMessages.length === 0) {
            return {
              status: "NoOp",
              sessionId: payload.sessionId,
              turnId: payload.turnId,
              detailsArtifactId: null,
              message: "session history is empty"
            } satisfies CompactionWorkflowResult
          }

          const sessionArtifacts = yield* sessionArtifactPort.listBySession(payload.sessionId)
          const invocationSearch = yield* governancePort.listToolInvocationsBySession(
            payload.sessionId,
            { limit: Math.max(200, agentConfig.server.storage.compaction.pruning.maxReferenceItems) }
          )
          const promptBindings = yield* promptCatalog.getAgentBindings(payload.agentId).pipe(
            Effect.orDie
          )
          const summaryBlockTemplate = yield* promptCatalog.get(
            promptBindings.compaction.summaryBlockRef
          ).pipe(Effect.orDie)
          const artifactRefsBlockTemplate = yield* promptCatalog.get(
            promptBindings.compaction.artifactRefsBlockRef
          ).pipe(Effect.orDie)
          const toolRefsBlockTemplate = yield* promptCatalog.get(
            promptBindings.compaction.toolRefsBlockRef
          ).pipe(Effect.orDie)
          const keptContextBlockTemplate = yield* promptCatalog.get(
            promptBindings.compaction.keptContextBlockRef
          ).pipe(Effect.orDie)
          const pruningPipeline = createDefaultContextPruningPipeline({
            summaryBlockTemplate,
            artifactRefsBlockTemplate,
            toolRefsBlockTemplate,
            keptContextBlockTemplate
          })

          const pruningInput = makeInitialContextPruningInput({
            sessionId: payload.sessionId,
            messages: originalMessages.map(toPruningMessage),
            artifactRefs: toArtifactReferences(sessionArtifacts),
            toolRefs: toToolReferences(invocationSearch.items),
            policy: {
              keepRecentTurns: agentConfig.server.storage.compaction.pruning.keepRecentTurns,
              includeArtifactRefs: agentConfig.server.storage.compaction.pruning.includeArtifactRefs,
              includeToolRefs: agentConfig.server.storage.compaction.pruning.includeToolRefs,
              maxReferenceItems: agentConfig.server.storage.compaction.pruning.maxReferenceItems,
              summaryEnabled: agentConfig.server.storage.compaction.pruning.summaryEnabled,
              summaryMaxChars: agentConfig.server.storage.compaction.pruning.summaryMaxChars
            }
          })

          const pruning = yield* runContextPruningPipeline(pruningPipeline, pruningInput).pipe(
            Effect.mapError((error) => new Error(`${error.strategyId}: ${error.message}`)),
            Effect.orDie
          )

          if (pruning.droppedMessageIds.length === 0 && pruning.insertedBlocks.length === 0) {
            return {
              status: "NoOp",
              sessionId: payload.sessionId,
              turnId: payload.turnId,
              detailsArtifactId: null,
              message: "pruning produced no changes"
            } satisfies CompactionWorkflowResult
          }

          const compactedMessages = toCompactedMessages(originalMessages, pruning)
          if (compactedMessages.length === 0) {
            return {
              status: "NoOp",
              sessionId: payload.sessionId,
              turnId: payload.turnId,
              detailsArtifactId: null,
              message: "compaction would empty history"
            } satisfies CompactionWorkflowResult
          }

          yield* Ref.set(chat.history, Prompt.fromMessages(compactedMessages))

          const detailPayload = {
            version: 1,
            triggerSource: payload.triggerSource,
            generatedAt: DateTime.formatIso(now),
            messageCountBefore: originalMessages.length,
            messageCountAfter: compactedMessages.length,
            droppedMessageIds: pruning.droppedMessageIds,
            keptMessageIds: pruning.keptMessageIds,
            summary: pruning.summary,
            insertedBlocks: pruning.insertedBlocks,
            compactedPrompt: pruning.compactedPrompt,
            decisions: pruning.decisions
          }

          const detailArtifact = yield* artifactStore.putJson(
            payload.sessionId,
            "CompactionDetail",
            detailPayload,
            {
              mediaType: "application/json",
              previewText: pruning.summary ?? summarizeCompaction(
                originalMessages.length,
                compactedMessages.length,
                pruning.droppedMessageIds.length
              )
            }
          )

          const runId = `compaction:${payload.turnId}`
          yield* sessionArtifactPort.link(
            payload.sessionId,
            detailArtifact,
            "CompactionDetail",
            {
              turnId: payload.turnId,
              runId
            }
          )

          yield* compactionCheckpointPort.create({
            checkpointId: `compaction:${payload.sessionId}:${payload.turnId}` as CompactionCheckpointId,
            agentId: payload.agentId,
            sessionId: payload.sessionId,
            subroutineId: "compaction.coordinator",
            createdAt: now,
            summary: pruning.summary ?? summarizeCompaction(
              originalMessages.length,
              compactedMessages.length,
              pruning.droppedMessageIds.length
            ),
            firstKeptTurnId: null,
            firstKeptMessageId: null,
            tokensBefore: null,
            tokensAfter: null,
            detailsJson: safeJsonStringify({
              detailsArtifactId: detailArtifact.artifactId,
              decisionStrategyIds: pruning.decisions.map((decision) => decision.strategyId)
            })
          })

          yield* governancePort.writeAudit({
            auditEntryId: `audit:compaction:${payload.sessionId}:${payload.turnId}:applied` as AuditEntryId,
            agentId: payload.agentId,
            sessionId: payload.sessionId,
            decision: "Allow",
            reason: `compaction_applied:${pruning.droppedMessageIds.length}`,
            createdAt: now
          })

          yield* sessionMetricsPort.increment(payload.sessionId, {
            lastCompactionAt: now
          })

          return {
            status: "Applied",
            sessionId: payload.sessionId,
            turnId: payload.turnId,
            detailsArtifactId: detailArtifact.artifactId,
            message: summarizeCompaction(
              originalMessages.length,
              compactedMessages.length,
              pruning.droppedMessageIds.length
            )
          } satisfies CompactionWorkflowResult
        })

      return {
        run
      } satisfies CompactionCoordinatorService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
