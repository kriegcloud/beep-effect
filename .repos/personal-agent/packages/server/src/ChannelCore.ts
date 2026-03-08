import { ChannelNotFound, ChannelTypeMismatch, SessionNotFound } from "@template/domain/errors"
import { CheckpointAlreadyDecided } from "@template/domain/errors"
import type { CheckpointExpired, CheckpointNotFound } from "@template/domain/errors"
import type { TurnStreamEvent } from "@template/domain/events"
import type { AgentId, ChannelId, CheckpointId, ConversationId, SessionId } from "@template/domain/ids"
import {
  type AgentState,
  type ChannelStatus,
  type ChannelSummaryRecord,
  type CheckpointRecord,
  type ContentBlock,
  type TurnRecord
} from "@template/domain/ports"
import type { ChannelCapability, ChannelType, CheckpointDecision } from "@template/domain/status"
import { Cause, DateTime, Effect, Layer, Option, ServiceMap, Stream } from "effect"
import { Sharding } from "effect/unstable/cluster"
import { SessionEntity } from "./entities/SessionEntity.js"
import { AgentConfig } from "./ai/AgentConfig.js"
import { makeToolCallId } from "./ai/ToolCallId.js"
import { ToolRegistry } from "./ai/ToolRegistry.js"
import {
  toCheckpointFailureReason,
  validateInvokeToolCheckpoint,
  validateReadMemoryCheckpoint
} from "./checkpoints/ReplayCheckpointValidator.js"
import { AgentStatePortTag, ChannelPortTag, CheckpointPortTag, SessionTurnPortTag } from "./PortTags.js"
import { TurnProcessingRuntime } from "./turn/TurnProcessingRuntime.js"
import type { ProcessTurnPayload, TurnProcessingError } from "./turn/TurnProcessingWorkflow.js"
import { TurnModelFailure } from "./turn/TurnProcessingWorkflow.js"

const toSessionId = (channelId: ChannelId): SessionId => (`session:${channelId}`) as SessionId

const toConversationId = (channelId: ChannelId): ConversationId => (`conv:${channelId}`) as ConversationId

type ReplayLifecyclePhase = "pending" | "approved" | "replaying" | "consumed" | "failed"

export class ChannelCore extends ServiceMap.Service<ChannelCore>()(
  "server/ChannelCore",
  {
    make: Effect.gen(function*() {
      const channelPort = yield* ChannelPortTag
      const agentStatePort = yield* AgentStatePortTag
      const sessionTurnPort = yield* SessionTurnPortTag
      const checkpointPort = yield* CheckpointPortTag
      const runtime = yield* TurnProcessingRuntime
      const sharding = yield* Sharding.Sharding
      const agentConfig = yield* AgentConfig
      const toolRegistry = yield* ToolRegistry

      const replayFailureStream = (
        turnId: string,
        reason: string
      ): Stream.Stream<TurnStreamEvent, TurnProcessingError> =>
        Stream.fail(
          new TurnModelFailure({
            turnId,
            reason
          })
        )

      const toInvokeToolReplayFailureStream = (params: {
        readonly turnId: string
        readonly sessionId: SessionId
        readonly createdAt: ProcessTurnPayload["createdAt"]
        readonly toolName: string
        readonly inputJson: string
        readonly outputJson: string
      }): Stream.Stream<TurnStreamEvent, TurnProcessingError> => {
        const toolCallId = makeToolCallId("toolcall", params.turnId, "replay")
        return Stream.concat(
          Stream.fromIterable([
            {
              type: "turn.started" as const,
              sequence: 1,
              turnId: params.turnId,
              sessionId: params.sessionId,
              createdAt: params.createdAt
            },
            {
              type: "tool.call" as const,
              sequence: 2,
              turnId: params.turnId,
              sessionId: params.sessionId,
              toolCallId,
              toolName: params.toolName,
              inputJson: params.inputJson
            },
            {
              type: "tool.error" as const,
              sequence: 3,
              turnId: params.turnId,
              sessionId: params.sessionId,
              toolCallId,
              toolName: params.toolName,
              outputJson: params.outputJson
            }
          ]),
          replayFailureStream(
            params.turnId,
            `checkpoint_tool_replay_failed:${params.toolName}`
          )
        )
      }

      const toConsumedTransitionFailureReason = (
        error: CheckpointNotFound | CheckpointAlreadyDecided | CheckpointExpired
      ): string => {
        switch (error._tag) {
          case "CheckpointNotFound":
            return "checkpoint_consumed_transition_failed:checkpoint_not_found"
          case "CheckpointExpired":
            return "checkpoint_consumed_transition_failed:checkpoint_expired"
          case "CheckpointAlreadyDecided":
            return `checkpoint_consumed_transition_failed:${error.currentStatus}`
        }
      }

      const toConsumedTransitionDefectReason = (defect: unknown): string =>
        `checkpoint_consumed_transition_failed:defect:${
          defect instanceof Error ? defect.message : String(defect)
        }`

      const makeReplayLifecycle = (params: {
        readonly checkpointId: CheckpointId
        readonly action: string
        readonly decidedBy: string
      }) => {
        let phase: ReplayLifecyclePhase = "pending"
        const transition = (next: ReplayLifecyclePhase, details?: {
          readonly turnId?: string
          readonly reason?: string
        }) =>
          Effect.gen(function*() {
            const from = phase
            const isValid =
              (from === "pending" && next === "approved")
              || (from === "approved" && (next === "replaying" || next === "failed"))
              || (from === "replaying" && (next === "consumed" || next === "failed"))
              || (from === "failed" && next === "failed")
              || (from === "consumed" && next === "consumed")

            if (!isValid) {
              yield* Effect.logWarning(
                {
                  event: "checkpoint_replay_phase_invalid_transition",
                  checkpointId: params.checkpointId,
                  action: params.action,
                  decidedBy: params.decidedBy,
                  from,
                  to: next,
                  ...(details?.turnId !== undefined ? { turnId: details.turnId } : {}),
                  ...(details?.reason !== undefined ? { reason: details.reason } : {})
                }
              )
            }

            phase = next
            const lifecycleEvent = {
              checkpointId: params.checkpointId,
              action: params.action,
              decidedBy: params.decidedBy,
              phase: next,
              ...(details?.turnId !== undefined ? { turnId: details.turnId } : {}),
              ...(details?.reason !== undefined ? { reason: details.reason } : {})
            } as const
            yield* Effect.logInfo(
              {
                event: "checkpoint_replay_phase",
                ...lifecycleEvent
              }
            )
          })

        return {
          transition
        } as const
      }

      const toReplayFailureReason = (error: TurnProcessingError): string => {
        if (typeof error === "object" && error !== null && "reason" in error && typeof error.reason === "string") {
          return error.reason
        }
        if (error instanceof Error && error.message.length > 0) {
          return error.message
        }
        return String(error)
      }

      const withReplayLifecycle = (params: {
        readonly stream: Stream.Stream<TurnStreamEvent, TurnProcessingError>
        readonly lifecycle: ReturnType<typeof makeReplayLifecycle>
        readonly turnId: string
      }): Stream.Stream<TurnStreamEvent, TurnProcessingError> =>
        Stream.concat(
          params.stream.pipe(
            Stream.catch((error) =>
              Stream.concat(
                Stream.fromEffect(
                  params.lifecycle.transition("failed", {
                    turnId: params.turnId,
                    reason: toReplayFailureReason(error as TurnProcessingError)
                  })
                ).pipe(Stream.drain),
                Stream.fail(error as TurnProcessingError)
              )
            )
          ),
          Stream.fromEffect(
            params.lifecycle.transition("consumed", { turnId: params.turnId })
          ).pipe(Stream.drain)
        )

      const withConsumedTransition = (params: {
        readonly checkpointId: CheckpointId
        readonly decidedBy: string
        readonly turnId: string
        readonly stream: Stream.Stream<TurnStreamEvent, TurnProcessingError>
      }): Stream.Stream<TurnStreamEvent, TurnProcessingError> =>
        Stream.concat(
          params.stream,
          Stream.fromEffect(
            DateTime.now.pipe(
              Effect.flatMap((consumedAt) =>
                checkpointPort.consumeApproved(
                  params.checkpointId,
                  params.decidedBy,
                  consumedAt
                )
              ),
              Effect.mapError((error) =>
                new TurnModelFailure({
                  turnId: params.turnId,
                  reason: toConsumedTransitionFailureReason(error)
                })
              ),
              Effect.catchCause((cause) => {
                const failure = Cause.findErrorOption(cause)
                if (Option.isSome(failure)) {
                  return Effect.fail(failure.value)
                }
                return Effect.fail(
                  new TurnModelFailure({
                    turnId: params.turnId,
                    reason: toConsumedTransitionDefectReason(Cause.pretty(cause))
                  })
                )
              })
            )
          ).pipe(Stream.drain)
        )

      const ensureAgentState = (agentId: AgentId) =>
        Effect.gen(function*() {
          const existing = yield* agentStatePort.get(agentId)
          if (existing !== null) {
            return
          }

          const profile = yield* agentConfig.getAgent(agentId as string).pipe(Effect.orDie)
          yield* agentStatePort.upsert(
            {
              agentId,
              permissionMode: "Standard",
              tokenBudget: profile.runtime.tokenBudget,
              maxToolIterations: profile.runtime.maxToolIterations,
              quotaPeriod: "Daily",
              tokensConsumed: 0,
              budgetResetAt: null
            } satisfies AgentState
          )
        })

      const initializeChannel = (params: {
        readonly channelId: ChannelId
        readonly channelType: ChannelType
        readonly agentId: AgentId
        readonly capabilities: ReadonlyArray<ChannelCapability>
        readonly attachTo?: {
          readonly sessionId: SessionId
        }
      }) =>
        Effect.gen(function*() {
          const existing = yield* channelPort.get(params.channelId)
          if (existing !== null) {
            if (existing.channelType !== params.channelType) {
              return yield* new ChannelTypeMismatch({
                channelId: params.channelId,
                existingType: existing.channelType,
                requestedType: params.channelType
              })
            }
            if (existing.agentId !== params.agentId) {
              return yield* new ChannelTypeMismatch({
                channelId: params.channelId,
                existingType: existing.agentId,
                requestedType: params.agentId
              })
            }
            yield* ensureAgentState(existing.agentId)
            return
          }

          const now = yield* DateTime.now

          yield* ensureAgentState(params.agentId)

          let sessionId: SessionId
          let conversationId: ConversationId

          if (params.attachTo !== undefined) {
            const attachedSession = yield* sessionTurnPort.getSession(params.attachTo.sessionId)
            if (attachedSession === null) {
              return yield* new SessionNotFound({ sessionId: params.attachTo.sessionId })
            }
            sessionId = attachedSession.sessionId
            conversationId = attachedSession.conversationId
          } else {
            sessionId = toSessionId(params.channelId)
            conversationId = toConversationId(params.channelId)
            const profile = yield* agentConfig.getAgent(params.agentId as string).pipe(Effect.orDie)
            yield* sessionTurnPort.startSession({
              sessionId,
              conversationId,
              tokenCapacity: profile.runtime.tokenBudget,
              tokensUsed: 0
            })
          }

          yield* channelPort.create({
            channelId: params.channelId,
            channelType: params.channelType,
            agentId: params.agentId,
            activeSessionId: sessionId,
            activeConversationId: conversationId,
            capabilities: params.capabilities,
            modelOverride: null,
            generationConfigOverride: null,
            createdAt: now
          })
        })

      const buildTurnPayload = (params: {
        readonly channelId: ChannelId
        readonly content: string
        readonly contentBlocks: ReadonlyArray<ContentBlock>
        readonly userId: string
        readonly modelOverride?: ProcessTurnPayload["modelOverride"] | undefined
        readonly generationConfigOverride?: {
          readonly temperature?: number
          readonly maxOutputTokens?: number
          readonly topP?: number
        } | undefined
      }) =>
        Effect.gen(function*() {
          const channel = yield* channelPort.get(params.channelId)
          if (channel === null) {
            return yield* new ChannelNotFound({ channelId: params.channelId })
          }

          const turnId = `turn:${crypto.randomUUID()}`
          const now = yield* DateTime.now

          // Precedence: per-request > session-level (channel) > profile default (resolved in workflow)
          const effectiveModelOverride = params.modelOverride ?? (channel.modelOverride ?? undefined)

          // Merge generation config field-by-field: request > session > (profile resolved in workflow)
          const requestGen = params.generationConfigOverride
          const sessionGen = channel.generationConfigOverride
          const effectiveGenerationConfig = (requestGen || sessionGen)
            ? { ...(sessionGen ?? {}), ...(requestGen ?? {}) }
            : undefined

          const payload: ProcessTurnPayload = {
            turnId,
            sessionId: channel.activeSessionId,
            conversationId: channel.activeConversationId,
            agentId: channel.agentId,
            userId: params.userId,
            channelId: params.channelId,
            content: params.content,
            contentBlocks: params.contentBlocks,
            createdAt: now,
            inputTokens: estimateInputTokens(params.content, params.contentBlocks),
            ...(effectiveModelOverride ? { modelOverride: effectiveModelOverride } : {}),
            ...(effectiveGenerationConfig ? { generationConfigOverride: effectiveGenerationConfig } : {})
          }

          return payload
        })

      const canUseSessionClient = typeof (sharding as { makeClient?: unknown }).makeClient === "function"

      const processTurn = (
        turnPayload: ProcessTurnPayload
      ): Stream.Stream<TurnStreamEvent, TurnProcessingError> => {
        const failWithModelFailure = (reason: string): Stream.Stream<TurnStreamEvent, TurnProcessingError> =>
          Stream.fail(
            new TurnModelFailure({
              turnId: turnPayload.turnId,
              reason
            })
          )

        // Entity.makeTestClient mock sharding does not expose makeClient.
        if (!canUseSessionClient) {
          return runtime.processTurnStream(turnPayload)
        }

        return Stream.unwrap(
          SessionEntity.client.pipe(
            Effect.map((makeSessionClient) =>
              makeSessionClient(turnPayload.sessionId).processTurn(turnPayload).pipe(
                Stream.catchTags({
                  MailboxFull: () => failWithModelFailure("session_entity_mailbox_full"),
                  AlreadyProcessingMessage: () => failWithModelFailure("session_entity_already_processing"),
                  PersistenceError: (error) =>
                    failWithModelFailure(
                      `session_entity_persistence_error: ${error.message ?? String(error)}`
                    )
                }),
                Stream.catchCause((cause) =>
                  failWithModelFailure(
                    describeSessionEntityCause("session_entity_stream_error", cause)
                  )
                )
              )
            ),
            Effect.catchCause((cause) =>
              Effect.succeed(
                failWithModelFailure(
                  describeSessionEntityCause("session_entity_client_error", cause)
                )
              )
            )
          )
        ) as Stream.Stream<TurnStreamEvent, TurnProcessingError>
      }

      const getHistory = (channelId: ChannelId) =>
        Effect.gen(function*() {
          const channel = yield* channelPort.get(channelId)
          if (channel === null) {
            return yield* new ChannelNotFound({ channelId })
          }
          return yield* sessionTurnPort.listTurns(channel.activeSessionId)
        })

      const getStatus = (channelId: ChannelId) =>
        Effect.gen(function*() {
          const channel = yield* channelPort.get(channelId)
          if (channel === null) {
            return yield* new ChannelNotFound({ channelId })
          }
          const status: ChannelStatus = {
            channelId: channel.channelId,
            channelType: channel.channelType,
            capabilities: [...channel.capabilities],
            activeSessionId: channel.activeSessionId,
            activeConversationId: channel.activeConversationId,
            modelOverride: channel.modelOverride,
            generationConfigOverride: channel.generationConfigOverride,
            createdAt: channel.createdAt
          }
          return status
        })

      const listChannels = (agentId?: AgentId) =>
        channelPort.list(agentId ? { agentId } : undefined)

      const deleteChannel = (channelId: ChannelId) =>
        Effect.gen(function*() {
          const channel = yield* channelPort.get(channelId)
          if (channel === null) {
            return yield* new ChannelNotFound({ channelId })
          }

          yield* checkpointPort.deleteByChannel(channelId)
          yield* sessionTurnPort.deleteSession(channel.activeSessionId)
          yield* channelPort.delete(channelId)
        })

      const setModelPreference = (params: {
        readonly channelId: ChannelId
        readonly modelOverride?: { readonly provider: string; readonly modelId: string } | null | undefined
        readonly generationConfigOverride?: {
          readonly temperature?: number
          readonly maxOutputTokens?: number
          readonly topP?: number
        } | null | undefined
      }) =>
        Effect.gen(function*() {
          const channel = yield* channelPort.get(params.channelId)
          if (channel === null) {
            return yield* new ChannelNotFound({ channelId: params.channelId })
          }
          const update: Record<string, unknown> = {}
          if ("modelOverride" in params) update.modelOverride = params.modelOverride ?? null
          if ("generationConfigOverride" in params) update.generationConfigOverride = params.generationConfigOverride ?? null
          yield* channelPort.updateModelPreference(params.channelId, update as any)
        })

      const listPendingCheckpoints = (agentId?: AgentId) =>
        checkpointPort.listPending(agentId)

      const getCheckpoint = (checkpointId: CheckpointId) =>
        checkpointPort.get(checkpointId)

      const decideCheckpoint = (params: {
        readonly checkpointId: CheckpointId
        readonly decision: CheckpointDecision
        readonly decidedBy: string
      }) =>
        Effect.gen(function*() {
          const now = yield* DateTime.now
          if (params.decision !== "Approved") {
            yield* checkpointPort.decidePending(
              params.checkpointId,
              params.decision,
              params.decidedBy,
              now
            )
            return { ok: true as const, kind: "ack" as const }
          }

          const decisionResult = yield* checkpointPort.decidePending(
            params.checkpointId,
            params.decision,
            params.decidedBy,
            now
          ).pipe(
            Effect.as("transitioned" as const),
            Effect.catchTag("CheckpointAlreadyDecided", (error) =>
              error.currentStatus === "Approved"
                ? Effect.succeed("already-approved" as const)
                : Effect.fail(error)
            )
          )

          if (decisionResult === "already-approved") {
            const approvedCheckpoint = yield* checkpointPort.get(params.checkpointId)
            if (approvedCheckpoint === null) {
              return {
                ok: true as const,
                kind: "stream" as const,
                stream: replayFailureStream(
                  `turn:replay:${crypto.randomUUID()}`,
                  "checkpoint_not_found_after_transition"
                )
              }
            }
            if (approvedCheckpoint.status !== "Approved") {
              return yield* new CheckpointAlreadyDecided({
                checkpointId: params.checkpointId,
                currentStatus: approvedCheckpoint.status
              })
            }
            if (approvedCheckpoint.consumedAt !== null || approvedCheckpoint.consumedBy !== null) {
              return yield* new CheckpointAlreadyDecided({
                checkpointId: params.checkpointId,
                currentStatus: "Consumed"
              })
            }
          }

          // Approved: load checkpoint and replay
          const checkpoint = yield* checkpointPort.get(params.checkpointId)
          if (checkpoint === null) {
            return {
              ok: true as const,
              kind: "stream" as const,
              stream: replayFailureStream(
                `turn:replay:${crypto.randomUUID()}`,
                "checkpoint_not_found_after_transition"
              )
            }
          }
          if (checkpoint.status !== "Approved") {
            return yield* new CheckpointAlreadyDecided({
              checkpointId: params.checkpointId,
              currentStatus: checkpoint.status
            })
          }

          const replayLifecycle = makeReplayLifecycle({
            checkpointId: params.checkpointId,
            action: checkpoint.action,
            decidedBy: params.decidedBy
          })
          yield* replayLifecycle.transition("approved")

          if (checkpoint.action === "InvokeTool") {
            const validatedInvoke = yield* validateInvokeToolCheckpoint({
              checkpointPort,
              checkpointId: params.checkpointId
            }).pipe(
              Effect.map((result) => ({ ok: true as const, result })),
              Effect.catch((failure) =>
                Effect.succeed({ ok: false as const, failure })
              )
            )

            if (!validatedInvoke.ok) {
              const failureReason = toCheckpointFailureReason(validatedInvoke.failure)
              yield* replayLifecycle.transition("failed", {
                reason: failureReason
              })
              return {
                ok: true as const,
                kind: "stream" as const,
                stream: replayFailureStream(
                  `turn:replay:${crypto.randomUUID()}`,
                  failureReason
                )
              }
            }

            const replayData = validatedInvoke.result.payload

            const toolReplay = yield* toolRegistry.executeApprovedCheckpointTool({
              checkpointId: params.checkpointId,
              payloadJson: checkpoint.payloadJson,
              agentId: checkpoint.agentId,
              sessionId: checkpoint.sessionId,
              conversationId: replayData.turnContext.conversationId as ConversationId,
              channelId: replayData.turnContext.channelId as ChannelId,
              decidedBy: params.decidedBy,
              now
            })

            if (toolReplay.isError) {
              yield* replayLifecycle.transition("failed", {
                turnId: toolReplay.turnId,
                reason: `checkpoint_tool_replay_failed:${toolReplay.toolName}`
              })
              return {
                ok: true as const,
                kind: "stream" as const,
                stream: toInvokeToolReplayFailureStream({
                  turnId: toolReplay.turnId,
                  sessionId: checkpoint.sessionId,
                  createdAt: toolReplay.createdAt,
                  toolName: toolReplay.toolName,
                  inputJson: toolReplay.inputJson,
                  outputJson: toolReplay.outputJson
                })
              }
            }

            yield* replayLifecycle.transition("replaying", { turnId: toolReplay.turnId })

            const replayPayload: ProcessTurnPayload = {
              turnId: toolReplay.turnId,
              sessionId: checkpoint.sessionId,
              conversationId: replayData.turnContext.conversationId as ConversationId,
              agentId: checkpoint.agentId,
              userId: params.decidedBy,
              channelId: checkpoint.channelId,
              content: "",
              contentBlocks: [],
              createdAt: toolReplay.createdAt,
              inputTokens: 0,
              checkpointId: params.checkpointId,
              invokeToolReplay: {
                replayPayloadVersion: toolReplay.replayPayloadVersion,
                toolName: toolReplay.toolName,
                inputJson: toolReplay.inputJson,
                outputJson: toolReplay.outputJson,
                isError: false
              }
            }

            return {
              ok: true as const,
              kind: "stream" as const,
              stream: withReplayLifecycle({
                lifecycle: replayLifecycle,
                turnId: toolReplay.turnId,
                stream: withConsumedTransition({
                  checkpointId: params.checkpointId,
                  decidedBy: params.decidedBy,
                  turnId: toolReplay.turnId,
                  stream: processTurn(replayPayload)
                })
              })
            }
          }

          if (checkpoint.action === "ReadMemory") {
            const validatedReadMemory = yield* validateReadMemoryCheckpoint({
              checkpointPort,
              checkpointId: params.checkpointId
            }).pipe(
              Effect.map((result) => ({ ok: true as const, result })),
              Effect.catch((failure) =>
                Effect.succeed({ ok: false as const, failure })
              )
            )

            if (!validatedReadMemory.ok) {
              const failureReason = toCheckpointFailureReason(validatedReadMemory.failure)
              yield* replayLifecycle.transition("failed", {
                reason: failureReason
              })
              return {
                ok: true as const,
                kind: "stream" as const,
                stream: replayFailureStream(
                  `turn:replay:${crypto.randomUUID()}`,
                  failureReason
                )
              }
            }

            const replayData = validatedReadMemory.result.payload

            const replayTurnId = `turn:replay:${crypto.randomUUID()}`
            yield* replayLifecycle.transition("replaying", { turnId: replayTurnId })
            const replayPayload: ProcessTurnPayload = {
              turnId: replayTurnId,
              sessionId: checkpoint.sessionId,
              conversationId: replayData.turnContext.conversationId,
              agentId: checkpoint.agentId,
              userId: params.decidedBy,
              channelId: checkpoint.channelId,
              content: replayData.content,
              contentBlocks: replayData.contentBlocks,
              createdAt: now,
              inputTokens: estimateInputTokens(
                replayData.content,
                replayData.contentBlocks
              ),
              checkpointId: params.checkpointId
            }

            return {
              ok: true as const,
              kind: "stream" as const,
              stream: withReplayLifecycle({
                lifecycle: replayLifecycle,
                turnId: replayTurnId,
                stream: withConsumedTransition({
                  checkpointId: params.checkpointId,
                  decidedBy: params.decidedBy,
                  turnId: replayTurnId,
                  stream: processTurn(replayPayload)
                })
              })
            }
          }

          yield* replayLifecycle.transition("failed", {
            reason: `unsupported_checkpoint_action:${checkpoint.action}`
          })
          return {
            ok: true as const,
            kind: "stream" as const,
            stream: replayFailureStream(
              `turn:replay:${crypto.randomUUID()}`,
              `unsupported_checkpoint_action:${checkpoint.action}`
            )
          }
        })

      return {
        initializeChannel,
        buildTurnPayload,
        processTurn,
        listChannels,
        deleteChannel,
        getHistory,
        getStatus,
        setModelPreference,
        listPendingCheckpoints,
        getCheckpoint,
        decideCheckpoint
      } as const
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}

export type ChannelCoreService = {
  readonly initializeChannel: (params: {
    readonly channelId: ChannelId
    readonly channelType: ChannelType
    readonly agentId: AgentId
    readonly capabilities: ReadonlyArray<ChannelCapability>
  }) => Effect.Effect<void, ChannelTypeMismatch>

  readonly buildTurnPayload: (params: {
    readonly channelId: ChannelId
    readonly content: string
    readonly contentBlocks: ReadonlyArray<ContentBlock>
    readonly userId: string
    readonly modelOverride?: { readonly provider: string; readonly modelId: string } | undefined
    readonly generationConfigOverride?: {
      readonly temperature?: number
      readonly maxOutputTokens?: number
      readonly topP?: number
    } | undefined
  }) => Effect.Effect<ProcessTurnPayload, ChannelNotFound>

  readonly processTurn: (
    turnPayload: ProcessTurnPayload
  ) => Stream.Stream<TurnStreamEvent, TurnProcessingError>

  readonly listChannels: (
    agentId?: AgentId
  ) => Effect.Effect<ReadonlyArray<ChannelSummaryRecord>>

  readonly deleteChannel: (
    channelId: ChannelId
  ) => Effect.Effect<void, ChannelNotFound>

  readonly getHistory: (
    channelId: ChannelId
  ) => Effect.Effect<ReadonlyArray<TurnRecord>, ChannelNotFound>

  readonly getStatus: (
    channelId: ChannelId
  ) => Effect.Effect<ChannelStatus, ChannelNotFound>

  readonly setModelPreference: (params: {
    readonly channelId: ChannelId
    readonly modelOverride?: { readonly provider: string; readonly modelId: string } | null | undefined
    readonly generationConfigOverride?: {
      readonly temperature?: number
      readonly maxOutputTokens?: number
      readonly topP?: number
    } | null | undefined
  }) => Effect.Effect<void, ChannelNotFound>

  readonly listPendingCheckpoints: (
    agentId?: AgentId
  ) => Effect.Effect<ReadonlyArray<CheckpointRecord>>

  readonly getCheckpoint: (
    checkpointId: CheckpointId
  ) => Effect.Effect<CheckpointRecord | null>

  readonly decideCheckpoint: (params: {
    readonly checkpointId: CheckpointId
    readonly decision: CheckpointDecision
    readonly decidedBy: string
  }) => Effect.Effect<
    | { readonly ok: true; readonly kind: "ack" }
    | { readonly ok: true; readonly kind: "stream"; readonly stream: Stream.Stream<TurnStreamEvent, TurnProcessingError> },
    CheckpointNotFound | CheckpointAlreadyDecided | CheckpointExpired
  >
}

const estimateInputTokens = (
  content: string,
  contentBlocks: ReadonlyArray<ContentBlock>
): number => {
  let estimate = estimateTextTokens(content)
  for (const block of contentBlocks) {
    switch (block.contentBlockType) {
      case "TextBlock": {
        estimate += estimateTextTokens(block.text)
        break
      }
      case "ToolUseBlock": {
        estimate += estimateTextTokens(block.toolName)
        estimate += estimateTextTokens(block.inputJson)
        break
      }
      case "ToolResultBlock": {
        estimate += estimateTextTokens(block.toolName)
        estimate += estimateTextTokens(block.outputJson)
        break
      }
      case "ImageBlock": {
        estimate += 64
        break
      }
    }
  }
  return Math.max(estimate, 1)
}

const estimateTextTokens = (text: string): number => {
  const normalized = text.trim()
  if (normalized.length === 0) {
    return 0
  }
  return Math.ceil(normalized.length / 4)
}

const describeSessionEntityCause = (
  prefix: "session_entity_stream_error" | "session_entity_client_error",
  cause: Cause.Cause<unknown>
): string => {
  const typedError = Cause.findErrorOption(cause)
  if (Option.isSome(typedError)) {
    const taggedFailure = typedError.value as Record<string, unknown>
    if (
      typeof taggedFailure === "object" &&
      taggedFailure !== null &&
      taggedFailure._tag === "TurnModelFailure" &&
      typeof taggedFailure.reason === "string" &&
      taggedFailure.reason.length > 0
    ) {
      return taggedFailure.reason
    }

    const message = extractErrorMessage(typedError.value)
    if (message.length > 0) {
      return `${prefix}: ${message}`
    }
  }

  const squashed = Cause.squash(cause)
  const squashedMessage = extractErrorMessage(squashed)
  if (squashedMessage.length > 0) {
    return `${prefix}: ${squashedMessage}`
  }

  return `${prefix}: ${Cause.pretty(cause)}`
}

const extractErrorMessage = (value: unknown): string => {
  if (typeof value === "string") {
    return value
  }
  if (value instanceof Error) {
    return value.message
  }
  if (typeof value === "object" && value !== null) {
    if ("reason" in value && typeof value.reason === "string") {
      return value.reason
    }
    if ("message" in value && typeof value.message === "string") {
      return value.message
    }
  }
  return ""
}
