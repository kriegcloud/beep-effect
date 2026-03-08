import { DateTime, Effect, Layer, Option, Ref, Schema, Stream } from "effect"
import * as Chat from "effect/unstable/ai/Chat"
import * as LanguageModel from "effect/unstable/ai/LanguageModel"
import * as Prompt from "effect/unstable/ai/Prompt"
import * as Response from "effect/unstable/ai/Response"
import * as Activity from "effect/unstable/workflow/Activity"
import * as Workflow from "effect/unstable/workflow/Workflow"
import {
  DEFAULT_MAX_TOOL_ITERATIONS,
  MAX_TOOL_ITERATIONS_CAP,
  TURN_LOOP_TIMEOUT_SECONDS
} from "@template/domain/system-defaults"
import {
  ContextWindowExceeded,
  SessionNotFound,
  TokenBudgetExceeded
} from "../../../domain/src/errors.js"
import type {
  AgentId,
  AuditEntryId,
  ChannelId,
  CheckpointId,
  ConversationId,
  MessageId,
  PolicyId,
  SessionId,
  TurnId
} from "../../../domain/src/ids.js"
import {
  CHECKPOINT_REPLAY_PAYLOAD_VERSION,
  type AuditEntryRecord,
  type ContentBlock,
  ContentBlock as ContentBlockSchema,
  type Instant,
  type TurnRecord
} from "../../../domain/src/ports.js"
import {
  CheckpointAction,
  ModelFinishReason,
  TurnAuditReasonCode
} from "../../../domain/src/status.js"
import { AgentConfig } from "../ai/AgentConfig.js"
import {
  encodeFinishReason,
  encodePartsToContentBlocks,
  encodeUsageToJson
} from "../ai/ContentBlockCodec.js"
import { ModelRegistry } from "../ai/ModelRegistry.js"
import { normalizeProviderModelFailureReason, isProviderCreditExhaustedReason } from "../ai/ProviderErrorNormalization.js"
import { sanitizeInitialPromptForProvider, sanitizePromptForProvider } from "../ai/ProviderPromptPolicy.js"
import { applyProviderConfigOverrideToStream, toProviderConfigOverride } from "../ai/ProviderGenerationConfig.js"
import { PromptCatalog } from "../ai/PromptCatalog.js"
import { makeToolCallId } from "../ai/ToolCallId.js"
import {
  RequiresApprovalToolFailure,
  ToolRegistry,
  type ToolRegistryService,
  type CheckpointSignal
} from "../ai/ToolRegistry.js"
import { makeCheckpointPayloadHash } from "../checkpoints/ReplayHash.js"
import {
  toCheckpointFailureReason,
  validateInvokeToolCheckpoint,
  validateReadMemoryCheckpoint
} from "../checkpoints/ReplayCheckpointValidator.js"
import {
  AgentStatePortTag,
  CheckpointPortTag,
  GovernancePortTag,
  MemoryPortTag,
  SessionMetricsPortTag,
  SessionTurnPortTag
} from "../PortTags.js"
import {
  decodeJsonStringOption,
  encodeUnknownJsonEffect,
  encodeUnknownJsonSync
} from "../json/JsonStringCodecs.js"
import { isRecoveredToolErrorOutput } from "./RecoveredToolError.js"
import { injectMemoriesIntoSystemPrompt } from "./MemoryInjector.js"
import { PostCommitWorkflow } from "./PostCommitWorkflow.js"
import { ProcessTurnPayloadSchema } from "./TurnPayloadSchemas.js"
import type { InvokeToolReplayExecution } from "./TurnPayloadSchemas.js"
import { makeLoopCapResponse, mergeUsage, zeroUsage } from "./TurnLoopUsage.js"
import {
  findPendingToolCallIdForReplay,
  parseReplayInputJson,
  parseReplayOutputJson
} from "./replay/TurnReplayHelpers.js"
import {
  emitTurnLiveEvent,
  TurnEventEmitterTag,
  type LiveTurnStreamEvent
} from "./TurnEventEmitter.js"

export const ProcessTurnPayload = ProcessTurnPayloadSchema
export type ProcessTurnPayload = typeof ProcessTurnPayload.Type

const TurnIterationStats = Schema.Struct({
  iteration: Schema.Number,
  finishReason: ModelFinishReason,
  toolCallsThisIteration: Schema.Number,
  toolCallsTotal: Schema.Number
})
type TurnIterationStats = typeof TurnIterationStats.Type

export const ProcessTurnResult = Schema.Struct({
  turnId: Schema.String,
  accepted: Schema.Boolean,
  auditReasonCode: TurnAuditReasonCode,
  assistantContent: Schema.String,
  assistantContentBlocks: Schema.Array(ContentBlockSchema),
  iterationsUsed: Schema.Number,
  toolCallsTotal: Schema.Number,
  iterationStats: Schema.Array(TurnIterationStats),
  modelFinishReason: Schema.Union([ModelFinishReason, Schema.Null]),
  modelUsageJson: Schema.Union([Schema.String, Schema.Null]),
  checkpointId: Schema.optionalKey(Schema.String),
  checkpointAction: Schema.optionalKey(CheckpointAction),
  checkpointReason: Schema.optionalKey(Schema.String)
})
export type ProcessTurnResult = typeof ProcessTurnResult.Type

interface ToolLoopResult {
  readonly finalResponse: LanguageModel.GenerateTextResponse<any>
  readonly allContentParts: ReadonlyArray<Response.Part<any>>
  readonly iterationsUsed: number
  readonly toolCallsTotal: number
  readonly iterationStats: ReadonlyArray<TurnIterationStats>
  readonly usage: Response.Usage
}

export class TurnPolicyDenied extends Schema.ErrorClass<TurnPolicyDenied>(
  "TurnPolicyDenied"
)({
  _tag: Schema.tag("TurnPolicyDenied"),
  turnId: Schema.String,
  reason: Schema.String
}) {}

export class TurnModelFailure extends Schema.ErrorClass<TurnModelFailure>(
  "TurnModelFailure"
)({
  _tag: Schema.tag("TurnModelFailure"),
  turnId: Schema.String,
  reason: Schema.String
}) {}

export const TurnProcessingError = Schema.Union([
  TurnPolicyDenied,
  TurnModelFailure,
  TokenBudgetExceeded,
  SessionNotFound,
  ContextWindowExceeded
])
export type TurnProcessingError = typeof TurnProcessingError.Type

const PolicyDecisionSchema = Schema.Struct({
  decision: Schema.Literals(["Allow", "Deny", "RequireApproval"]),
  policyId: Schema.Union([Schema.String, Schema.Null]),
  toolDefinitionId: Schema.Union([Schema.String, Schema.Null]),
  reason: Schema.String
})

const PersistTurnError = Schema.Union([SessionNotFound, ContextWindowExceeded])
const encodeUnknownJson = encodeUnknownJsonEffect

export const inferToolChoice = (
  rawUserContent: string
): { readonly toolChoice: { readonly tool: "shell_execute" } } | {} => {
  const normalized = rawUserContent.trim().toLowerCase()
  if (normalized.length === 0) return {}

  if (
    normalized.startsWith("run ")
    || normalized.startsWith("execute ")
    || /^ls(\s|$)/.test(normalized)
    || /^pwd(\s|$)/.test(normalized)
    || /^cat(\s|$)/.test(normalized)
    || /^echo(\s|$)/.test(normalized)
  ) {
    return { toolChoice: { tool: "shell_execute" } }
  }

  return {}
}

export const TurnProcessingWorkflow = Workflow.make({
  name: "TurnProcessingWorkflow",
  payload: ProcessTurnPayload,
  success: ProcessTurnResult,
  error: TurnProcessingError,
  idempotencyKey: (payload) => payload.turnId
})

export const layer = TurnProcessingWorkflow.toLayer(
  Effect.fn("TurnProcessingWorkflow.execute")(function*(payload, _executionId: string) {
    const agentStatePort = yield* AgentStatePortTag
    const sessionTurnPort = yield* SessionTurnPortTag
    const sessionMetricsPort = yield* SessionMetricsPortTag
    const governancePort = yield* GovernancePortTag
    const toolRegistry = yield* ToolRegistry
    const chatPersistence = yield* Chat.Persistence
    const agentConfig = yield* AgentConfig
    const promptCatalog = yield* PromptCatalog
    const modelRegistry = yield* ModelRegistry
    const checkpointPort = yield* CheckpointPortTag
    const memoryPort = yield* MemoryPortTag

    const invokeToolReplay = payload.invokeToolReplay

    if (invokeToolReplay !== undefined) {
      if (payload.checkpointId === undefined) {
        return yield* new TurnPolicyDenied({
          turnId: payload.turnId,
          reason: "checkpoint_not_provided_for_invoke_tool_replay"
        })
      }

      const validatedInvokeCheckpoint = yield* validateInvokeToolCheckpoint({
        checkpointPort,
        checkpointId: payload.checkpointId as CheckpointId,
        expectedTurnContext: {
          agentId: payload.agentId,
          sessionId: payload.sessionId,
          conversationId: payload.conversationId,
          channelId: payload.channelId
        },
        expectedToolName: invokeToolReplay.toolName,
        expectedInputJson: invokeToolReplay.inputJson
      }).pipe(
        Effect.mapError((failure) =>
          new TurnPolicyDenied({
            turnId: payload.turnId,
            reason: toCheckpointFailureReason(failure)
          })
        )
      )

      if (
        validatedInvokeCheckpoint.payload.replayPayloadVersion !== invokeToolReplay.replayPayloadVersion
        || validatedInvokeCheckpoint.payload.toolName !== invokeToolReplay.toolName
        || validatedInvokeCheckpoint.payload.inputJson !== invokeToolReplay.inputJson
      ) {
        return yield* new TurnPolicyDenied({
          turnId: payload.turnId,
          reason: "checkpoint_payload_mismatch"
        })
      }
    }

    if (invokeToolReplay === undefined) {
      const policy = yield* Activity.make({
        name: "EvaluatePolicy",
        success: PolicyDecisionSchema,
        execute: governancePort.evaluatePolicy({
          agentId: payload.agentId as AgentId,
          sessionId: payload.sessionId as SessionId,
          action: "ReadMemory"
        })
      })

      if (policy.decision === "Deny") {
        yield* writeAuditEntry(
          governancePort,
          payload,
          "Deny",
          "turn_processing_policy_denied"
        )
        return yield* new TurnPolicyDenied({
          turnId: payload.turnId,
          reason: policy.reason
        })
      }

      if (policy.decision === "RequireApproval") {
        if (payload.checkpointId !== undefined) {
          // Replay path: validate approved checkpoint
          yield* validateReadMemoryCheckpoint({
            checkpointPort,
            checkpointId: payload.checkpointId as CheckpointId,
            expectedTurnContext: {
              agentId: payload.agentId,
              sessionId: payload.sessionId,
              conversationId: payload.conversationId,
              channelId: payload.channelId
            },
            expectedContent: payload.content,
            expectedContentBlocks: payload.contentBlocks
          }).pipe(
            Effect.mapError((failure) =>
              new TurnPolicyDenied({
                turnId: payload.turnId,
                reason: toCheckpointFailureReason(failure)
              })
            )
          )
          // Checkpoint valid — bypass the gate and continue processing.
        } else {
          // First run: create a Pending checkpoint and return non-accepted result.
          const replayPayload = {
            replayPayloadVersion: CHECKPOINT_REPLAY_PAYLOAD_VERSION,
            kind: "ReadMemory",
            content: payload.content,
            contentBlocks: payload.contentBlocks,
            turnContext: {
              agentId: payload.agentId,
              sessionId: payload.sessionId,
              conversationId: payload.conversationId,
              channelId: payload.channelId,
              turnId: payload.turnId,
              createdAt: DateTime.formatIso(payload.createdAt)
            }
          } as const
          const checkpointPayload = encodeUnknownJsonSync(replayPayload)
          const newCheckpointId = (`checkpoint:${crypto.randomUUID()}`) as CheckpointId
          yield* checkpointPort.create({
            checkpointId: newCheckpointId,
            agentId: payload.agentId as AgentId,
            sessionId: payload.sessionId as SessionId,
            channelId: payload.channelId as ChannelId,
            turnId: payload.turnId,
            action: "ReadMemory",
            policyId: policy.policyId as PolicyId | null,
            reason: policy.reason,
            payloadJson: checkpointPayload,
            payloadHash: yield* makeCheckpointPayloadHash("ReadMemory", replayPayload),
            status: "Pending",
            requestedAt: payload.createdAt,
            decidedAt: null,
            decidedBy: null,
            consumedAt: null,
            consumedBy: null,
            expiresAt: null
          })
          yield* writeAuditEntry(
            governancePort,
            payload,
            "RequireApproval",
            "turn_processing_checkpoint_required"
          )
          return {
            turnId: payload.turnId,
            accepted: false,
            auditReasonCode: "turn_processing_checkpoint_required",
            assistantContent: "",
            assistantContentBlocks: [],
            iterationsUsed: 0,
            toolCallsTotal: 0,
            iterationStats: [],
            modelFinishReason: null,
            modelUsageJson: null,
            checkpointId: newCheckpointId,
            checkpointAction: "ReadMemory",
            checkpointReason: policy.reason
          } satisfies ProcessTurnResult
        }
      }

      yield* Activity.make({
        name: "CheckTokenBudget",
        error: TokenBudgetExceeded,
        execute: agentStatePort.consumeTokenBudget(
          payload.agentId as AgentId,
          payload.inputTokens,
          payload.createdAt
        )
      }).asEffect().pipe(
        Effect.catchTag("TokenBudgetExceeded", (error) =>
          writeAuditEntry(
            governancePort,
            payload,
            "Deny",
            "turn_processing_token_budget_exceeded"
          ).pipe(
            Effect.andThen(Effect.fail(error))
          ))
      )

      yield* Activity.make({
        name: "PersistUserTurn",
        error: PersistTurnError,
        execute: Effect.gen(function*() {
          yield* Activity.idempotencyKey("PersistUserTurn")
          yield* sessionTurnPort.updateContextWindow(
            payload.sessionId as SessionId,
            payload.inputTokens
          )
          yield* sessionTurnPort.appendTurn(makeUserTurn(payload))
        })
      }).asEffect()
    }

    const replayToolCallId = makeToolCallId("toolcall", payload.turnId, "replay")
    const replayPrefixContentBlocks =
      invokeToolReplay === undefined
        ? []
        : toInvokeToolReplayContentBlocks(replayToolCallId, invokeToolReplay)

    const maxToolIterations = yield* agentStatePort.get(payload.agentId as AgentId).pipe(
      Effect.map((state) => Math.min(Math.max(state?.maxToolIterations ?? DEFAULT_MAX_TOOL_ITERATIONS, 1), MAX_TOOL_ITERATIONS_CAP))
    )

    const checkpointSignalsRef = yield* Ref.make<ReadonlyArray<CheckpointSignal>>([])

    const modelOutcome = yield* Effect.gen(function*() {
      // Resolve agent profile and model layer
      const profile = yield* agentConfig.getAgent(payload.agentId)
      const promptBindings = yield* promptCatalog.getAgentBindings(payload.agentId).pipe(
        Effect.orDie
      )

      // Resolve model: per-request override > agent profile default
      const modelProvider = payload.modelOverride?.provider ?? profile.model.provider
      const modelId = payload.modelOverride?.modelId ?? profile.model.modelId
      const lmLayer = yield* modelRegistry.get(modelProvider, modelId)

      // Build effective generation config: profile baseline + overrides
      const effectiveGenerationConfig = {
        temperature: payload.generationConfigOverride?.temperature ?? profile.generation.temperature,
        maxOutputTokens: payload.generationConfigOverride?.maxOutputTokens ?? profile.generation.maxOutputTokens,
        ...(payload.generationConfigOverride?.topP !== undefined
          ? { topP: payload.generationConfigOverride.topP }
          : profile.generation.topP !== undefined
          ? { topP: profile.generation.topP }
          : {})
      }

      const chat = yield* chatPersistence.getOrCreate(payload.sessionId)
      const turnEventEmitter = yield* Effect.serviceOption(TurnEventEmitterTag)
      const emitLiveEvent = (event: LiveTurnStreamEvent) =>
        Option.isSome(turnEventEmitter)
          ? turnEventEmitter.value.emit(event)
          : emitTurnLiveEvent(payload.turnId, event)

      const baseSystemPrompt = yield* promptCatalog.get(
        promptBindings.turn.systemPromptRef
      ).pipe(Effect.orDie)

      const enrichedSystemPrompt = yield* (
        invokeToolReplay === undefined
          ? injectMemoriesIntoSystemPrompt({
            baseSystemPrompt,
            memoryPort,
            agentId: payload.agentId as AgentId,
            profile
          })
          : Effect.succeed(baseSystemPrompt)
      )

      const currentHistory = yield* Ref.get(chat.history)
      const withSystem = Prompt.setSystem(currentHistory, enrichedSystemPrompt)
      yield* Ref.set(chat.history, withSystem)

      if (invokeToolReplay !== undefined) {
        if (invokeToolReplay.isError) {
          return yield* new TurnModelFailure({
            turnId: payload.turnId,
            reason: `checkpoint_tool_replay_failed:${invokeToolReplay.toolName}`
          })
        }

        const replayInput = parseReplayInputJson(invokeToolReplay.inputJson)
        if (Option.isNone(replayInput)) {
          return yield* new TurnModelFailure({
            turnId: payload.turnId,
            reason: "checkpoint_payload_invalid_invoke_tool_input_json"
          })
        }

        const replayOutput = parseReplayOutputJson(invokeToolReplay.outputJson)
        yield* appendInvokeToolReplayToHistory({
          chat,
          toolCallId: replayToolCallId,
          toolName: invokeToolReplay.toolName,
          input: replayInput.value,
          output: replayOutput
        })
      }

      const initialPrompt = yield* (
        invokeToolReplay === undefined
          ? Effect.succeed(toPromptText(payload.content, payload.contentBlocks))
          : promptCatalog.get(promptBindings.turn.replayContinuationRef).pipe(
            Effect.orDie
          )
      )

      const loopResultOption = yield* processWithToolLoop({
        chat,
        toolRegistry,
        lmLayer,
        resolvedProvider: modelProvider,
        effectiveGenerationConfig,
        context: {
          agentId: payload.agentId as AgentId,
          sessionId: payload.sessionId as SessionId,
          conversationId: payload.conversationId as ConversationId,
          turnId: payload.turnId as TurnId,
          now: payload.createdAt,
          channelId: payload.channelId,
          userId: payload.userId,
          recoverToolErrors: true,
          ...(payload.checkpointId !== undefined && invokeToolReplay === undefined
            ? {
              checkpointId: payload.checkpointId,
              checkpointAction: "ReadMemory" as const
            }
            : {})
        },
        rawUserContent: invokeToolReplay === undefined ? payload.content : "",
        initialPrompt,
        maxIterations: maxToolIterations,
        checkpointSignalsRef,
        emitLiveEvent
      }).pipe(
        Effect.timeoutOption(`${TURN_LOOP_TIMEOUT_SECONDS} seconds`)
      )

      if (Option.isNone(loopResultOption)) {
        return yield* new TurnModelFailure({
          turnId: payload.turnId,
          reason: "tool_loop_timeout"
        })
      }

      return { _outcome: "success" as const, result: loopResultOption.value }
    }).pipe(
      Effect.mapError((error) =>
        isRequiresApprovalToolFailure(error)
          ? error
          : toTurnModelFailure(payload.turnId, error)
      ),
      Effect.catchTag(
        "RequiresApprovalToolFailure",
        (error) =>
          Ref.get(checkpointSignalsRef).pipe(
            Effect.flatMap((signals) => {
              if (signals.length > 0) {
                return Effect.succeed({
                  _outcome: "checkpoint" as const,
                  signals
                })
              }
              // No signals despite RequiresApproval — treat as model error
              return failWithAuditedModelFailure(
                governancePort,
                payload,
                error
              )
            })
          )
      ),
      Effect.catchTag(
        "TurnModelFailure",
        (error) =>
          failWithAuditedModelFailure(
            governancePort,
            payload,
            error
          )
      )
    )

    // Tool governance checkpoint — return early with checkpoint result
    if (modelOutcome._outcome === "checkpoint") {
      const firstSignal = modelOutcome.signals[0]!
      yield* writeAuditEntry(
        governancePort,
        payload,
        "RequireApproval",
        "turn_processing_checkpoint_required"
      )
      // Reconstruct the blocked tool call as a ToolUseBlock so the UI can
      // display it in the Tools pane while the checkpoint is pending.
      const checkpointToolCallId = makeToolCallId("toolcall", payload.turnId, "checkpoint")
      const checkpointContentBlocks: ReadonlyArray<ContentBlock> = [
        ...replayPrefixContentBlocks,
        {
          contentBlockType: "ToolUseBlock" as const,
          toolCallId: checkpointToolCallId,
          toolName: firstSignal.toolName,
          inputJson: firstSignal.inputJson
        }
      ]
      return {
        turnId: payload.turnId,
        accepted: false,
        auditReasonCode: "turn_processing_checkpoint_required",
        assistantContent: "",
        assistantContentBlocks: checkpointContentBlocks,
        iterationsUsed: 0,
        toolCallsTotal: 1,
        iterationStats: [],
        modelFinishReason: null,
        modelUsageJson: null,
        checkpointId: firstSignal.checkpointId,
        checkpointAction: firstSignal.action,
        checkpointReason: firstSignal.reason
      } satisfies ProcessTurnResult
    }

    const modelResult = modelOutcome.result

    const assistantResult = yield* Effect.gen(function*() {
      const assistantContent = modelResult.finalResponse.text
      const generatedAssistantContentBlocks = yield* encodePartsToContentBlocks(modelResult.allContentParts)
      const assistantContentBlocks = [
        ...replayPrefixContentBlocks,
        ...generatedAssistantContentBlocks
      ]
      const modelUsageJson = yield* encodeUsageToJson(modelResult.usage)
      return {
        assistantContent,
        assistantContentBlocks,
        modelUsageJson,
        iterationsUsed: modelResult.iterationsUsed,
        toolCallsTotal: modelResult.toolCallsTotal,
        iterationStats: modelResult.iterationStats
      } as const
    }).pipe(
      Effect.catch((error) =>
        failWithAuditedModelFailure(
          governancePort,
          payload,
          new TurnModelFailure({
            turnId: payload.turnId,
            reason: `encoding_error: ${toModelFailureMessage(error)}`
          })
        )
      )
    )

    const invariantViolation = validateToolBlockPairing(assistantResult.assistantContentBlocks)
    if (Option.isSome(invariantViolation)) {
      yield* writeAuditEntry(
        governancePort,
        payload,
        "Deny",
        "turn_processing_model_error"
      )
      return yield* new TurnModelFailure({
        turnId: payload.turnId,
        reason: `transcript_invariant_violation:${invariantViolation.value}`
      })
    }

    const modelFinishReason = encodeFinishReason(modelResult.finalResponse.finishReason)

    if (invokeToolReplay !== undefined) {
      yield* Activity.make({
        name: "PersistReplayToolTurn",
        execute: sessionTurnPort.appendTurn(
          makeReplayToolTurn(payload, replayPrefixContentBlocks)
        )
      }).asEffect()
    }

    // 7b: Tool-loop signal drain — check if any tool required approval during the loop
    const checkpointSignals = yield* Ref.get(checkpointSignalsRef)
    if (checkpointSignals.length > 0) {
      const firstSignal = checkpointSignals[0]
      yield* Effect.logInfo({
        event: "checkpoint_late_signal_short_circuit",
        turnId: payload.turnId,
        checkpointId: firstSignal.checkpointId,
        action: firstSignal.action,
        iterationsUsed: assistantResult.iterationsUsed,
        toolCallsTotal: assistantResult.toolCallsTotal
      })
      yield* writeAuditEntry(
        governancePort,
        payload,
        "RequireApproval",
        "turn_processing_checkpoint_required"
      )
      return {
        turnId: payload.turnId,
        accepted: false,
        auditReasonCode: "turn_processing_checkpoint_required",
        assistantContent: assistantResult.assistantContent,
        assistantContentBlocks: assistantResult.assistantContentBlocks,
        iterationsUsed: assistantResult.iterationsUsed,
        toolCallsTotal: assistantResult.toolCallsTotal,
        iterationStats: assistantResult.iterationStats,
        modelFinishReason,
        modelUsageJson: assistantResult.modelUsageJson,
        checkpointId: firstSignal.checkpointId,
        checkpointAction: firstSignal.action,
        checkpointReason: firstSignal.reason
      } satisfies ProcessTurnResult
    }

    const assistantTurn = makeAssistantTurn(payload, {
      assistantContent: assistantResult.assistantContent,
      assistantContentBlocks: invokeToolReplay === undefined
        ? assistantResult.assistantContentBlocks
        : assistantResult.assistantContentBlocks.slice(replayPrefixContentBlocks.length),
      modelFinishReason,
      modelUsageJson: assistantResult.modelUsageJson
    })

    yield* Activity.make({
      name: "PersistAssistantTurn",
      error: PersistTurnError,
      execute: sessionTurnPort.appendTurn(assistantTurn)
    }).asEffect()

    const tokenCountDelta = extractTotalTokensFromUsageJson(
      assistantResult.modelUsageJson
    )
    if (tokenCountDelta > 0) {
      yield* Activity.make({
        name: "IncrementSessionMetricsAfterTurn",
        execute: sessionMetricsPort.increment(payload.sessionId as SessionId, {
          tokenCount: tokenCountDelta
        })
      }).asEffect().pipe(
        Effect.catchCause((cause) =>
          Effect.logWarning("turn_processing_metrics_increment_failed", {
            turnId: payload.turnId,
            sessionId: payload.sessionId,
            cause
          })
        )
      )
    }

    yield* Activity.make({
      name: "DispatchPostCommitWorkflow",
      execute: PostCommitWorkflow.execute(
        {
          turnId: payload.turnId as TurnId,
          agentId: payload.agentId as AgentId,
          sessionId: payload.sessionId as SessionId,
          conversationId: payload.conversationId as ConversationId
        },
        { discard: true }
      ).pipe(
        Effect.tap((executionId) =>
          Effect.log("post_commit_workflow_dispatched", {
            turnId: payload.turnId,
            executionId
          })
        ),
        Effect.asVoid
      )
    }).asEffect()

    yield* writeAuditEntry(
      governancePort,
      payload,
      "Allow",
      "turn_processing_accepted"
    )

    return {
      turnId: payload.turnId,
      accepted: true,
      auditReasonCode: "turn_processing_accepted",
      assistantContent: assistantResult.assistantContent,
      assistantContentBlocks: assistantResult.assistantContentBlocks,
      iterationsUsed: assistantResult.iterationsUsed,
      toolCallsTotal: assistantResult.toolCallsTotal,
      iterationStats: assistantResult.iterationStats,
      modelFinishReason,
      modelUsageJson: assistantResult.modelUsageJson
    } as const
  })
)

const toInvokeToolReplayContentBlocks = (
  toolCallId: string,
  replay: InvokeToolReplayExecution
): ReadonlyArray<ContentBlock> => [
  {
    contentBlockType: "ToolUseBlock",
    toolCallId,
    toolName: replay.toolName,
    inputJson: replay.inputJson
  },
  {
    contentBlockType: "ToolResultBlock",
    toolCallId,
    toolName: replay.toolName,
    outputJson: replay.outputJson,
    isError: replay.isError
  }
]

const validateToolBlockPairing = (
  contentBlocks: ReadonlyArray<ContentBlock>
): Option.Option<string> => {
  const toolUses = new Map<string, string>()
  const toolResults = new Map<string, string>()

  for (const block of contentBlocks) {
    if (block.contentBlockType === "ToolUseBlock") {
      if (toolUses.has(block.toolCallId)) {
        return Option.some(`duplicate_tool_use:${block.toolCallId}`)
      }
      toolUses.set(block.toolCallId, block.toolName)
      continue
    }

    if (block.contentBlockType === "ToolResultBlock") {
      if (toolResults.has(block.toolCallId)) {
        return Option.some(`duplicate_tool_result:${block.toolCallId}`)
      }
      toolResults.set(block.toolCallId, block.toolName)
      continue
    }
  }

  for (const [toolCallId, toolName] of toolUses) {
    if (!toolResults.has(toolCallId)) {
      return Option.some(`missing_tool_result:${toolName}:${toolCallId}`)
    }
  }

  for (const [toolCallId, toolName] of toolResults) {
    if (!toolUses.has(toolCallId)) {
      return Option.some(`orphan_tool_result:${toolName}:${toolCallId}`)
    }
  }

  return Option.none()
}

const appendInvokeToolReplayToHistory = (params: {
  readonly chat: Chat.Persisted
  readonly toolCallId: string
  readonly toolName: string
  readonly input: Record<string, unknown>
  readonly output: unknown
}) =>
  Ref.update(params.chat.history, (history) => {
    const pendingToolCallId = findPendingToolCallIdForReplay(history, {
      toolName: params.toolName,
      input: params.input
    })
    const replayToolCallId = Option.getOrElse(
      pendingToolCallId,
      () => params.toolCallId
    )

    const alreadyInjected = history.content.some(
      (message) =>
        message.role === "tool"
        && message.content.some(
          (part) => part.type === "tool-result" && part.id === replayToolCallId
        )
    )

    if (alreadyInjected) {
      return history
    }

    if (Option.isSome(pendingToolCallId)) {
      return Prompt.concat(
        history,
        Prompt.fromMessages([
          Prompt.toolMessage({
            content: [
              Prompt.makePart("tool-result", {
                id: replayToolCallId,
                name: params.toolName,
                isFailure: false,
                result: params.output
              })
            ]
          })
        ])
      )
    }

    return Prompt.concat(
      history,
      Prompt.fromMessages([
        Prompt.assistantMessage({
          content: [
            Prompt.makePart("tool-call", {
              id: replayToolCallId,
              name: params.toolName,
              params: params.input,
              providerExecuted: false
            })
          ]
        }),
        Prompt.toolMessage({
          content: [
            Prompt.makePart("tool-result", {
              id: replayToolCallId,
              name: params.toolName,
              isFailure: false,
              result: params.output
            })
          ]
        })
      ])
    )
  })

const processWithToolLoop = Effect.fn("TurnProcessingWorkflow.processWithToolLoop")(function*(
  params: {
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
      readonly checkpointId?: string
      readonly checkpointAction?: CheckpointAction
      readonly userId?: string
      readonly recoverToolErrors?: boolean
    }
    readonly rawUserContent: string
    readonly initialPrompt: Prompt.RawInput
    readonly maxIterations: number
    readonly checkpointSignalsRef: Ref.Ref<ReadonlyArray<CheckpointSignal>>
    readonly emitLiveEvent: (event: LiveTurnStreamEvent) => Effect.Effect<void>
  }
) {
  return yield* Effect.suspend(function loop(
    iteration = 0,
    toolCallsTotal = 0,
    allParts: ReadonlyArray<Response.Part<any>> = [],
    usage = zeroUsage(),
    iterationStats: ReadonlyArray<TurnIterationStats> = []
  ): Effect.Effect<ToolLoopResult, unknown, never> {
    const currentIteration = iteration + 1

    return Effect.gen(function*() {
      yield* Ref.update(
        params.chat.history,
        (prompt) => sanitizePromptForProvider(params.resolvedProvider, prompt)
      )

      const promptForIteration: Prompt.RawInput = iteration === 0
        ? sanitizeInitialPromptForProvider(params.resolvedProvider, params.initialPrompt)
        : Prompt.empty

      const toolkitBundle = yield* params.toolRegistry.makeToolkit(
        { ...params.context, iteration },
        params.checkpointSignalsRef
      )

      const streamText = params.chat.streamText({
        prompt: promptForIteration,
        toolkit: toolkitBundle.toolkit,
        ...(iteration === 0
          ? inferToolChoice(params.rawUserContent)
          : {})
      })

      const providerOverrides = toProviderConfigOverride(
        params.resolvedProvider,
        params.effectiveGenerationConfig
      )
      const configuredStream = applyProviderConfigOverrideToStream(
        params.resolvedProvider,
        providerOverrides,
        streamText
      )

      const partsForIteration: Array<Response.Part<any>> = []
      const activeTextDeltas = new Map<string, string>()
      let finishReason: Response.FinishReason = "unknown"
      let finishUsage = zeroUsage()

      yield* configuredStream.pipe(
        Stream.provide(Layer.merge(toolkitBundle.handlerLayer, params.lmLayer)),
        Stream.runForEach((part) =>
          Effect.gen(function*() {
            switch (part.type) {
              case "text-start": {
                activeTextDeltas.set(part.id, "")
                break
              }
              case "text-delta": {
                const previous = activeTextDeltas.get(part.id) ?? ""
                activeTextDeltas.set(part.id, `${previous}${part.delta}`)
                yield* params.emitLiveEvent({
                  type: "assistant.delta",
                  turnId: params.context.turnId,
                  sessionId: params.context.sessionId,
                  delta: part.delta
                })
                break
              }
              case "text-end": {
                const text = activeTextDeltas.get(part.id)
                if (text !== undefined) {
                  partsForIteration.push(
                    Response.makePart("text", { text })
                  )
                  activeTextDeltas.delete(part.id)
                }
                break
              }
              case "tool-call": {
                partsForIteration.push(part as Response.Part<any>)
                const inputJson = yield* encodeUnknownJson(part.params)
                yield* params.emitLiveEvent({
                  type: "tool.call",
                  turnId: params.context.turnId,
                  sessionId: params.context.sessionId,
                  toolCallId: part.id,
                  toolName: part.name,
                  inputJson
                })
                break
              }
              case "tool-result": {
                if (part.preliminary === true) {
                  break
                }
                partsForIteration.push(part as Response.Part<any>)
                const outputJson = yield* encodeUnknownJson(part.result)
                if (part.isFailure || isRecoveredToolErrorOutput(outputJson)) {
                  yield* params.emitLiveEvent({
                    type: "tool.error",
                    turnId: params.context.turnId,
                    sessionId: params.context.sessionId,
                    toolCallId: part.id,
                    toolName: part.name,
                    outputJson
                  })
                  break
                }
                yield* params.emitLiveEvent({
                  type: "tool.result",
                  turnId: params.context.turnId,
                  sessionId: params.context.sessionId,
                  toolCallId: part.id,
                  toolName: part.name,
                  outputJson,
                  isError: false
                })
                break
              }
              case "finish": {
                finishReason = part.reason
                finishUsage = part.usage
                break
              }
              case "error": {
                return yield* Effect.fail(part.error)
              }
              default:
                break
            }
          })),
        Effect.withSpan("TurnProcessing.streamText")
      )

      for (const text of activeTextDeltas.values()) {
        partsForIteration.push(Response.makePart("text", { text }))
      }

      partsForIteration.push(Response.makePart("finish", {
        reason: finishReason,
        usage: finishUsage,
        response: undefined
      }))

      const response = new LanguageModel.GenerateTextResponse(partsForIteration)

      const toolCallsThisIteration = response.content.filter((part) => part.type === "tool-call").length
      const nextToolCallsTotal = toolCallsTotal + toolCallsThisIteration
      const mergedParts = [...allParts, ...response.content]
      const mergedUsage = mergeUsage(usage, response.usage)
      const mergedIterationStats = [...iterationStats, {
        iteration: currentIteration,
        finishReason: encodeFinishReason(response.finishReason),
        toolCallsThisIteration,
        toolCallsTotal: nextToolCallsTotal
      }]

      yield* params.emitLiveEvent({
        type: "iteration.completed",
        turnId: params.context.turnId,
        sessionId: params.context.sessionId,
        iteration: currentIteration,
        finishReason: encodeFinishReason(response.finishReason),
        toolCallsThisIteration,
        toolCallsTotal: nextToolCallsTotal
      })

      if (response.finishReason === "tool-calls" && currentIteration < params.maxIterations) {
        return yield* loop(
          currentIteration,
          nextToolCallsTotal,
          mergedParts,
          mergedUsage,
          mergedIterationStats
        )
      }

      if (response.finishReason === "tool-calls") {
        const cappedResponse = makeLoopCapResponse(params.maxIterations, mergedUsage)
        const allContentParts = [...mergedParts, ...cappedResponse.content]
        return {
          finalResponse: cappedResponse,
          allContentParts,
          iterationsUsed: currentIteration,
          toolCallsTotal: nextToolCallsTotal,
          iterationStats: mergedIterationStats,
          usage: mergedUsage
        } as const
      }

      return {
        finalResponse: response,
        allContentParts: mergedParts,
        iterationsUsed: currentIteration,
        toolCallsTotal: nextToolCallsTotal,
        iterationStats: mergedIterationStats,
        usage: mergedUsage
      } as const
    })
  })
  })

const writeAuditEntry = (
  governancePort: {
    readonly writeAudit: (entry: AuditEntryRecord) => Effect.Effect<void>
  },
  payload: ProcessTurnPayload,
  decision: AuditEntryRecord["decision"],
  reasonCode: TurnAuditReasonCode
) =>
  Activity.make({
    name: "WriteAudit",
    execute: Effect.gen(function*() {
      const idempotencyKey = yield* Activity.idempotencyKey(`WriteAudit:${reasonCode}`)
      const auditEntryId = (`audit:${idempotencyKey}`) as AuditEntryId
      yield* governancePort.writeAudit({
        auditEntryId,
        agentId: payload.agentId as AgentId,
        sessionId: payload.sessionId as SessionId,
        decision,
        reason: reasonCode,
        createdAt: payload.createdAt
      })
    })
  }).asEffect()

export const makeUserTurn = (payload: ProcessTurnPayload): TurnRecord => ({
  turnId: payload.turnId as TurnId,
  sessionId: payload.sessionId as SessionId,
  conversationId: payload.conversationId as ConversationId,
  turnIndex: 0,
  participantRole: "UserRole" as const,
  participantAgentId: payload.agentId as AgentId,
  message: {
    messageId: (`message:${payload.turnId}:user`) as MessageId,
    role: "UserRole" as const,
    content: payload.content,
    contentBlocks: payload.contentBlocks.length > 0
      ? payload.contentBlocks
      : [{ contentBlockType: "TextBlock" as const, text: payload.content }]
  },
  modelFinishReason: null,
  modelUsageJson: null,
  createdAt: payload.createdAt
})

export const makeReplayToolTurn = (
  payload: ProcessTurnPayload,
  replayContentBlocks: ReadonlyArray<ContentBlock>
): TurnRecord => ({
  turnId: (`${payload.turnId}:replay-tool`) as TurnId,
  sessionId: payload.sessionId as SessionId,
  conversationId: payload.conversationId as ConversationId,
  turnIndex: 0,
  participantRole: "AssistantRole" as const,
  participantAgentId: payload.agentId as AgentId,
  message: {
    messageId: (`message:${payload.turnId}:replay-tool`) as MessageId,
    role: "AssistantRole" as const,
    content: "",
    contentBlocks: replayContentBlocks
  },
  modelFinishReason: "tool-calls",
  modelUsageJson: null,
  createdAt: payload.createdAt
})

export const makeAssistantTurn = (
  payload: ProcessTurnPayload,
  details: {
    readonly assistantContent: string
    readonly assistantContentBlocks: ReadonlyArray<ContentBlock>
    readonly modelFinishReason: ModelFinishReason
    readonly modelUsageJson: string
  }
): TurnRecord => ({
  turnId: (`${payload.turnId}:assistant`) as TurnId,
  sessionId: payload.sessionId as SessionId,
  conversationId: payload.conversationId as ConversationId,
  turnIndex: 0,
  participantRole: "AssistantRole" as const,
  participantAgentId: payload.agentId as AgentId,
  message: {
    messageId: (`message:${payload.turnId}:assistant`) as MessageId,
    role: "AssistantRole" as const,
    content: details.assistantContent,
    contentBlocks: details.assistantContentBlocks
  },
  modelFinishReason: details.modelFinishReason,
  modelUsageJson: details.modelUsageJson,
  createdAt: payload.createdAt
})

export const toPromptText = (
  fallback: string,
  contentBlocks: ReadonlyArray<ContentBlock>
): string => {
  const textFromBlocks = contentBlocks
    .filter((block) => block.contentBlockType === "TextBlock")
    .map((block) => block.text)
    .join("\n")
    .trim()

  return textFromBlocks.length > 0 ? textFromBlocks : fallback
}

export const toTurnModelFailure = (
  turnId: string,
  error: unknown
): TurnModelFailure =>
  error instanceof TurnModelFailure
    ? new TurnModelFailure({
      turnId: error.turnId,
      reason: normalizeModelFailureReason(error.reason)
    })
    : new TurnModelFailure({
      turnId,
      reason: normalizeModelFailureReason(toModelFailureMessage(error))
    })

export const isRequiresApprovalToolFailure = (
  error: unknown
): error is RequiresApprovalToolFailure =>
  error instanceof RequiresApprovalToolFailure

const failWithAuditedModelFailure = Effect.fn("TurnProcessingWorkflow.failWithAuditedModelFailure")(function*(
  governancePort: {
    readonly writeAudit: (entry: AuditEntryRecord) => Effect.Effect<void>
  },
  payload: ProcessTurnPayload,
  error: unknown
) {
  const modelFailure = toTurnModelFailure(payload.turnId, error)

  yield* writeAuditEntry(
    governancePort,
    payload,
    "Deny",
    toModelFailureAuditReason(modelFailure.reason)
  )

  return yield* modelFailure
})

export const toModelFailureMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "object" && error !== null) {
    if ("reason" in error && typeof error.reason === "string" && error.reason.length > 0) {
      return error.reason
    }
    if ("message" in error && typeof error.message === "string" && error.message.length > 0) {
      return error.message
    }
  }
  return String(error)
}

export const toModelFailureAuditReason = (
  reason: string
): TurnAuditReasonCode =>
  isProviderCreditExhaustedReason(reason)
    ? "turn_processing_provider_credit_exhausted"
    : "turn_processing_model_error"

export const normalizeModelFailureReason = normalizeProviderModelFailureReason

const ModelUsageTotalsJson = Schema.Struct({
  inputTokens: Schema.optional(
    Schema.Struct({
      total: Schema.optional(Schema.Number)
    })
  ),
  outputTokens: Schema.optional(
    Schema.Struct({
      total: Schema.optional(Schema.Number)
    })
  )
})
const decodeModelUsageTotals = decodeJsonStringOption(ModelUsageTotalsJson)

export const extractTotalTokensFromUsageJson = (modelUsageJson: string | null): number => {
  if (modelUsageJson === null) {
    return 0
  }
  const parsed = Option.getOrUndefined(decodeModelUsageTotals(modelUsageJson))
  if (parsed === undefined) {
    return 0
  }

  const inputTotal = parsed.inputTokens?.total ?? 0
  const outputTotal = parsed.outputTokens?.total ?? 0
  return Number.isFinite(inputTotal + outputTotal)
    ? Math.max(0, Math.floor(inputTotal + outputTotal))
    : 0
}
