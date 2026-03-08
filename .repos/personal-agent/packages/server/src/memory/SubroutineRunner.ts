import type {
  AgentId,
  AuditEntryId,
  CompactionCheckpointId,
  ConversationId,
  SessionId,
  TurnId
} from "@template/domain/ids"
import type { SubroutineToolScope } from "@template/domain/memory"
import type { AuditEntryRecord, Instant } from "@template/domain/ports"
import type { AuthorizationDecision, SubroutineTriggerType } from "@template/domain/status"
import { DateTime, Effect, Layer, Ref, Schema, ServiceMap } from "effect"
import * as Chat from "effect/unstable/ai/Chat"
import * as Prompt from "effect/unstable/ai/Prompt"
import type * as Response from "effect/unstable/ai/Response"
import { AgentConfig } from "../ai/AgentConfig.js"
import { encodeUsageToJson } from "../ai/ContentBlockCodec.js"
import { ModelRegistry } from "../ai/ModelRegistry.js"
import { applyProviderConfigOverrideToEffect, toProviderConfigOverride } from "../ai/ProviderGenerationConfig.js"
import { PromptCatalog } from "../ai/PromptCatalog.js"
import { type CheckpointSignal, ToolRegistry, type ToolRegistryService } from "../ai/ToolRegistry.js"
import {
  CompactionCheckpointPortTag,
  GovernancePortTag,
  SessionMetricsPortTag
} from "../PortTags.js"
import { makeLoopCapResponse, mergeUsage, zeroUsage } from "../turn/TurnLoopUsage.js"
import type { LoadedSubroutine } from "./SubroutineCatalog.js"
import { TraceWriter } from "./TraceWriter.js"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubroutineContext {
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly conversationId: ConversationId
  readonly turnId: TurnId | null
  readonly triggerType: SubroutineTriggerType
  readonly triggerReason: string
  readonly now: Instant
  readonly runId: string
}

export const CheckpointWriteStatus = Schema.Literals(["success", "failed", "skipped"])
export type CheckpointWriteStatus = typeof CheckpointWriteStatus.Type

export const SubroutineErrorTag = Schema.Literals([
  "model_error",
  "tool_loop_error",
  "checkpoint_error",
  "trace_error",
  "config_error",
  "unknown_error"
])
export type SubroutineErrorTag = typeof SubroutineErrorTag.Type

export const SubroutineError = Schema.Struct({
  tag: SubroutineErrorTag,
  message: Schema.String
})
export type SubroutineError = typeof SubroutineError.Type

export const SubroutineResult = Schema.Struct({
  subroutineId: Schema.String,
  runId: Schema.String,
  success: Schema.Boolean,
  iterationsUsed: Schema.Number,
  toolCallsTotal: Schema.Number,
  assistantContent: Schema.String,
  modelUsageJson: Schema.Union([Schema.String, Schema.Null]),
  checkpointWritten: CheckpointWriteStatus,
  error: Schema.Union([SubroutineError, Schema.Null])
})
export type SubroutineResult = typeof SubroutineResult.Type

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface SubroutineRunnerService {
  readonly execute: (
    subroutine: LoadedSubroutine,
    context: SubroutineContext
  ) => Effect.Effect<SubroutineResult>
}

export class SubroutineRunner extends ServiceMap.Service<SubroutineRunner>()(
  "server/memory/SubroutineRunner",
  {
    make: Effect.gen(function*() {
      const toolRegistry = yield* ToolRegistry
      const chatPersistence = yield* Chat.Persistence
      const agentConfig = yield* AgentConfig
      const modelRegistry = yield* ModelRegistry
      const promptCatalog = yield* PromptCatalog
      const governancePort = yield* GovernancePortTag
      const compactionCheckpointPort = yield* CompactionCheckpointPortTag
      const sessionMetricsPort = yield* SessionMetricsPortTag
      const traceWriter = yield* TraceWriter

      const execute: SubroutineRunnerService["execute"] = (subroutine, context) =>
        Effect.gen(function*() {
          // executionTurnId: run-scoped for tool idempotency context (prevents collisions
          // when multiple subroutines share the same originating turn)
          const executionTurnId = `turn:subexec:${context.runId}` as TurnId
          // Run-scoped synthetic channel and conversation — isolates each execution
          const syntheticChannelId = `channel:subroutine:${context.runId}`
          const syntheticConversationId = `conversation:subroutine:${context.runId}` as ConversationId
          const chatSessionKey = `subroutine:${context.runId}`

          // Audit: started
          yield* writeSubroutineAudit(
            governancePort,
            context,
            subroutine,
            "memory_subroutine_started"
          )

          // Resolve model
          const profile = yield* agentConfig.getAgent(context.agentId)
          const modelProvider = subroutine.config.model?.provider ?? profile.model.provider
          const modelId = subroutine.config.model?.modelId ?? profile.model.modelId
          const lmLayer = yield* modelRegistry.get(modelProvider, modelId)
          const promptBindings = yield* promptCatalog.getAgentBindings(context.agentId).pipe(
            Effect.orDie
          )

          // Build generation config
          const effectiveGenerationConfig = {
            temperature: profile.generation.temperature,
            maxOutputTokens: profile.generation.maxOutputTokens,
            ...(profile.generation.topP !== undefined ? { topP: profile.generation.topP } : {})
          }

          // Set up isolated chat
          const chat = yield* chatPersistence.getOrCreate(chatSessionKey)
          const currentHistory = yield* Ref.get(chat.history)
          const tierInstructionPrompt = yield* promptCatalog.get(
            promptBindings.memory.tierInstructionRefs[subroutine.config.tier]
          ).pipe(Effect.orDie)
          const withSystem = Prompt.setSystem(
            currentHistory,
            composeSubroutineSystemPrompt(tierInstructionPrompt, subroutine.prompt)
          )
          yield* Ref.set(chat.history, withSystem)

          // Build user prompt
          const userPrompt = yield* promptCatalog.render(
            promptBindings.memory.triggerEnvelopeRef,
            buildTriggerPromptTemplateVars(
              context,
              subroutine.config.id,
              subroutine.config.tier
            )
          ).pipe(Effect.orDie)

          // Run bounded tool loop
          const loopResult = yield* subroutineToolLoop({
            chat,
            toolRegistry,
            lmLayer,
            resolvedProvider: modelProvider,
            effectiveGenerationConfig,
            context: {
              agentId: context.agentId,
              sessionId: context.sessionId,
              conversationId: syntheticConversationId,
              turnId: executionTurnId,
              now: context.now,
              channelId: syntheticChannelId
            },
            userPrompt,
            maxIterations: subroutine.config.maxIterations,
            toolScope: subroutine.resolvedToolScope
          })

          // Extract assistant text
          const assistantContent = loopResult.allContentParts
            .filter((part) => part.type === "text")
            .map((part) => (part as { readonly text: string }).text)
            .join("")

          // Encode usage
          const modelUsageJson = yield* encodeUsageToJson(loopResult.usage).pipe(
            Effect.catch(() => Effect.succeed(null))
          )
          const tokenCount = totalUsageTokens(loopResult.usage)
          if (tokenCount > 0) {
            yield* sessionMetricsPort.increment(context.sessionId, {
              tokenCount
            })
          }

          // Audit: completed
          yield* writeSubroutineAudit(
            governancePort,
            context,
            subroutine,
            "memory_subroutine_completed"
          )

          // Trace: write structured run trace (fire-and-forget)
          yield* traceWriter.writeRunTrace({
            subroutine,
            context,
            contentParts: loopResult.allContentParts,
            result: {
              subroutineId: subroutine.config.id,
              runId: context.runId,
              success: true,
              iterationsUsed: loopResult.iterationsUsed,
              toolCallsTotal: loopResult.toolCallsTotal,
              assistantContent,
              modelUsageJson,
              checkpointWritten: "skipped",
              error: null
            },
            usage: loopResult.usage
          }).pipe(Effect.ignore)

          // Compaction checkpoint write — track outcome explicitly
          let checkpointWritten: CheckpointWriteStatus = "skipped"
          if (subroutine.config.writesCheckpoint === true) {
            checkpointWritten = yield* Effect.gen(function*() {
              const createdAt = yield* DateTime.now
              yield* compactionCheckpointPort.create({
                checkpointId: `compaction:${context.runId}` as CompactionCheckpointId,
                agentId: context.agentId,
                sessionId: context.sessionId,
                subroutineId: subroutine.config.id,
                createdAt,
                summary: assistantContent,
                firstKeptTurnId: null,
                firstKeptMessageId: null,
                tokensBefore: null,
                tokensAfter: null,
                detailsJson: null
              })
              return "success" as const
            }).pipe(
              Effect.catchCause((cause) =>
                Effect.gen(function*() {
                  yield* Effect.log("Compaction checkpoint write failed", {
                    subroutineId: subroutine.config.id,
                    runId: context.runId,
                    cause
                  }).pipe(Effect.annotateLogs("level", "error"))
                  return "failed" as const
                })
              )
            )
          }

          return {
            subroutineId: subroutine.config.id,
            runId: context.runId,
            success: true,
            iterationsUsed: loopResult.iterationsUsed,
            toolCallsTotal: loopResult.toolCallsTotal,
            assistantContent,
            modelUsageJson,
            checkpointWritten,
            error: null
          } satisfies SubroutineResult
        }).pipe(
          Effect.catch((error) =>
            Effect.gen(function*() {
              // Audit: failed
              yield* writeSubroutineAudit(
                governancePort,
                context,
                subroutine,
                "memory_subroutine_failed"
              ).pipe(Effect.ignore)

              const message = error instanceof Error
                ? error.message
                : typeof error === "object" && error !== null && "message" in error
                    && typeof (error as { message?: unknown }).message === "string"
                ? (error as { message: string }).message
                : String(error)

              const tag = classifySubroutineError(error)
              const typedError: SubroutineError = { tag, message }

              const failResult: SubroutineResult = {
                subroutineId: subroutine.config.id,
                runId: context.runId,
                success: false,
                iterationsUsed: 0,
                toolCallsTotal: 0,
                assistantContent: "",
                modelUsageJson: null,
                checkpointWritten: "skipped",
                error: typedError
              }

              // Trace: write structured run trace for failure (fire-and-forget)
              yield* traceWriter.writeRunTrace({
                subroutine,
                context,
                contentParts: [],
                result: failResult,
                usage: null
              }).pipe(Effect.ignore)

              return failResult
            })
          )
        )

      return { execute } satisfies SubroutineRunnerService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

const totalUsageTokens = (usage: Response.Usage): number =>
  (usage.inputTokens.total ?? 0) + (usage.outputTokens.total ?? 0)

// ---------------------------------------------------------------------------
// Error Classification
// ---------------------------------------------------------------------------

const classifySubroutineError = (error: unknown): SubroutineErrorTag => {
  const msg = error instanceof Error ? error.message : String(error)
  const lower = msg.toLowerCase()
  if (lower.includes("model") || lower.includes("api") || lower.includes("provider")) {
    return "model_error"
  }
  if (lower.includes("tool") || lower.includes("iteration") || lower.includes("loop")) {
    return "tool_loop_error"
  }
  if (lower.includes("checkpoint") || lower.includes("compaction")) {
    return "checkpoint_error"
  }
  if (lower.includes("trace")) {
    return "trace_error"
  }
  if (lower.includes("config") || lower.includes("profile") || lower.includes("subroutine")) {
    return "config_error"
  }
  return "unknown_error"
}

// ---------------------------------------------------------------------------
// Bounded Tool Loop (adapted from TurnProcessingWorkflow.processWithToolLoop)
// ---------------------------------------------------------------------------

interface SubroutineToolLoopResult {
  readonly allContentParts: ReadonlyArray<Response.Part<any>>
  readonly iterationsUsed: number
  readonly toolCallsTotal: number
  readonly usage: Response.Usage
}

const subroutineToolLoop = (params: {
  readonly chat: Chat.Persisted
  readonly toolRegistry: ToolRegistryService
  readonly lmLayer: Layer.Layer<any>
  readonly resolvedProvider: string
  readonly effectiveGenerationConfig: {
    readonly temperature?: number
    readonly maxOutputTokens?: number
    readonly topP?: number
  }
  readonly context: {
    readonly agentId: AgentId
    readonly sessionId: SessionId
    readonly conversationId: ConversationId
    readonly turnId: TurnId
    readonly now: Instant
    readonly channelId: string
  }
  readonly userPrompt: string
  readonly maxIterations: number
  readonly toolScope: SubroutineToolScope
}): Effect.Effect<SubroutineToolLoopResult, unknown, never> => {
  const checkpointSignalsRef = Ref.makeUnsafe<ReadonlyArray<CheckpointSignal>>([])

  return Effect.suspend(function loop(
    iteration = 0,
    toolCallsTotal = 0,
    allParts: ReadonlyArray<Response.Part<any>> = [],
    usage = zeroUsage()
  ): Effect.Effect<SubroutineToolLoopResult, unknown, never> {
    const currentIteration = iteration + 1

    return Effect.gen(function*() {
      const toolkitBundle = yield* params.toolRegistry.makeToolkit(
        { ...params.context, iteration },
        checkpointSignalsRef,
        params.toolScope
      )

      const generateTextEffect = params.chat.generateText({
        prompt: iteration === 0 ? params.userPrompt : Prompt.empty,
        toolkit: toolkitBundle.toolkit
      })

      // Apply generation config through shared provider utility
      const providerOverrides = toProviderConfigOverride(
        params.resolvedProvider,
        params.effectiveGenerationConfig
      )
      const configuredEffect = applyProviderConfigOverrideToEffect(
        params.resolvedProvider,
        providerOverrides,
        generateTextEffect
      )

      const response = yield* configuredEffect.pipe(
        Effect.provide(Layer.merge(toolkitBundle.handlerLayer, params.lmLayer)),
        Effect.withSpan("SubroutineRunner.generateText")
      )

      const toolCallsThisIteration = response.content.filter(
        (part: Response.Part<any>) => part.type === "tool-call"
      ).length
      const nextToolCallsTotal = toolCallsTotal + toolCallsThisIteration
      const mergedParts = [...allParts, ...response.content]
      const mergedUsage = mergeUsage(usage, response.usage)

      if (response.finishReason === "tool-calls" && currentIteration < params.maxIterations) {
        return yield* loop(
          currentIteration,
          nextToolCallsTotal,
          mergedParts,
          mergedUsage
        )
      }

      if (response.finishReason === "tool-calls") {
        const cappedResponse = makeLoopCapResponse(params.maxIterations, mergedUsage)
        const allContentParts = [...mergedParts, ...cappedResponse.content]
        return {
          allContentParts,
          iterationsUsed: currentIteration,
          toolCallsTotal: nextToolCallsTotal,
          usage: mergedUsage
        } as const
      }

      return {
        allContentParts: mergedParts,
        iterationsUsed: currentIteration,
        toolCallsTotal: nextToolCallsTotal,
        usage: mergedUsage
      } as const
    })
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type SubroutineAuditReason =
  | "memory_subroutine_started"
  | "memory_subroutine_completed"
  | "memory_subroutine_failed"

const writeSubroutineAudit = (
  governancePort: {
    readonly writeAudit: (entry: AuditEntryRecord) => Effect.Effect<void>
  },
  context: SubroutineContext,
  subroutine: LoadedSubroutine,
  reason: SubroutineAuditReason,
  decision: AuthorizationDecision = "Allow"
) =>
  governancePort.writeAudit({
    auditEntryId: `audit:subroutine:${context.runId}:${reason}` as AuditEntryId,
    agentId: context.agentId,
    sessionId: context.sessionId,
    decision,
    reason: `${reason}:${subroutine.config.id}`,
    createdAt: context.now
  })

export const buildTriggerPromptTemplateVars = (
  context: SubroutineContext,
  subroutineId: string,
  memoryTier: string
): Record<string, string> => ({
  agent_id: String(context.agentId),
  session_id: String(context.sessionId),
  conversation_id: String(context.conversationId),
  turn_id: context.turnId === null ? "" : String(context.turnId),
  trigger_type: context.triggerType,
  trigger_reason: context.triggerReason,
  triggered_at_iso: DateTime.formatIso(context.now),
  subroutine_id: subroutineId,
  memory_tier: memoryTier
})

const composeSubroutineSystemPrompt = (
  tierInstructionPrompt: string,
  subroutinePrompt: string
): string =>
  [tierInstructionPrompt.trim(), subroutinePrompt.trim()]
    .filter((part) => part.length > 0)
    .join("\n\n")
