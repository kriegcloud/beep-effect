import {
  DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS,
  DEFAULT_SUBROUTINE_QUEUE_CAPACITY
} from "@template/domain/system-defaults"
import type { AgentId, AuditEntryId, ConversationId, SessionId, TurnId } from "@template/domain/ids"
import type { SubroutineTriggerType } from "@template/domain/status"
import type { AuditEntryRecord, Instant } from "@template/domain/ports"
import type { AuthorizationDecision } from "@template/domain/status"
import { DateTime, Deferred, Effect, Layer, Queue, Ref, Semaphore, ServiceMap } from "effect"
import { GovernancePortTag } from "../PortTags.js"
import { RuntimeSupervisor } from "../runtime/RuntimeSupervisor.js"
import { SubroutineCatalog } from "./SubroutineCatalog.js"
import { SubroutineRunner, type SubroutineContext } from "./SubroutineRunner.js"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DispatchRequest {
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly conversationId: ConversationId
  readonly subroutineId: string
  readonly turnId: TurnId | null
  readonly triggerType: SubroutineTriggerType
  readonly triggerReason: string
  readonly enqueuedAt: Instant
  readonly idempotencyKey?: string
}

export interface EnqueueResult {
  readonly accepted: boolean
  readonly reason: "dispatched" | "deduped" | "queue_full" | "unknown_subroutine"
  readonly runId: string | null
}

export interface SubroutineExecutionOutcome {
  readonly accepted: boolean
  readonly subroutineId: string
  readonly runId: string | null
  readonly success: boolean
  readonly errorTag: string | null
  readonly reason: "completed" | "deduped" | "queue_full" | "unknown_subroutine" | "already_in_flight"
}

interface DedupeEntry {
  readonly acceptedAt: Instant
  readonly expiresAt?: Instant
  readonly windowSeconds?: number
}

/** Internal queue item — DispatchRequest + generated runId */
interface QueuedDispatch extends DispatchRequest {
  readonly runId: string
  readonly completion?: Deferred.Deferred<SubroutineExecutionOutcome>
}

// ---------------------------------------------------------------------------
// Pure Functions (exported for testing)
// ---------------------------------------------------------------------------

export const makeDedupeKey = (request: DispatchRequest): string => {
  if (request.idempotencyKey !== undefined && request.idempotencyKey.trim().length > 0) {
    return `idempotency::${request.idempotencyKey.trim()}`
  }
  if (request.triggerType === "PostTurn" && request.turnId !== null) {
    return `${request.sessionId}::${request.subroutineId}::${request.turnId}`
  }
  return `${request.sessionId}::${request.subroutineId}`
}

export const isDuplicate = (
  dedupeMap: ReadonlyMap<string, DedupeEntry>,
  key: string,
  now: Instant,
  windowSeconds: number
): boolean => {
  const entry = dedupeMap.get(key)
  if (!entry) return false
  const elapsedMs = DateTime.toEpochMillis(now) - DateTime.toEpochMillis(entry.acceptedAt)
  return elapsedMs < windowSeconds * 1000
}

const isDuplicateUsingEntryWindow = (
  dedupeMap: ReadonlyMap<string, DedupeEntry>,
  key: string,
  now: Instant,
  fallbackWindowSeconds: number
): boolean => {
  const entry = dedupeMap.get(key)
  if (!entry) return false
  const effectiveWindowSeconds = entry.windowSeconds ?? fallbackWindowSeconds
  const elapsedMs = DateTime.toEpochMillis(now) - DateTime.toEpochMillis(entry.acceptedAt)
  return elapsedMs < effectiveWindowSeconds * 1000
}

export const makeSerializationKey = (sessionId: string, subroutineId: string): string =>
  `${sessionId}::${subroutineId}`

// ---------------------------------------------------------------------------
// Audit Helper
// ---------------------------------------------------------------------------

type ControlPlaneAuditReason =
  | "memory_subroutine_dispatched"
  | "memory_subroutine_skipped"

const writeControlPlaneAudit = (
  governancePort: {
    readonly writeAudit: (entry: AuditEntryRecord) => Effect.Effect<void>
  },
  request: DispatchRequest,
  reason: ControlPlaneAuditReason,
  decision: AuthorizationDecision = "Allow"
) =>
  governancePort.writeAudit({
    auditEntryId: `audit:controlplane:${request.subroutineId}:${reason}:${crypto.randomUUID()}` as AuditEntryId,
    agentId: request.agentId,
    sessionId: request.sessionId,
    decision,
    reason: `${reason}:${request.subroutineId}`,
    createdAt: request.enqueuedAt
  })

// ---------------------------------------------------------------------------
// Types: TriggerContext
// ---------------------------------------------------------------------------

export interface TriggerContext {
  readonly agentId: AgentId
  readonly sessionId: SessionId
  readonly conversationId: ConversationId
  readonly turnId: TurnId | null
  readonly now: Instant
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export interface SubroutineControlPlaneService {
  readonly enqueue: (request: DispatchRequest) => Effect.Effect<EnqueueResult>
  readonly execute: (request: DispatchRequest) => Effect.Effect<SubroutineExecutionOutcome>
  readonly dispatchByTrigger: (
    triggerType: SubroutineTriggerType,
    context: TriggerContext
  ) => Effect.Effect<ReadonlyArray<EnqueueResult>>
  readonly snapshot: () => Effect.Effect<SubroutineControlPlaneSnapshot>
}

export interface SubroutineControlPlaneSnapshot {
  readonly queueDepth: number
  readonly inFlightCount: number
  readonly dedupeEntries: number
  readonly lastWorkerError: string | null
}

export class SubroutineControlPlane extends ServiceMap.Service<SubroutineControlPlane>()(
  "server/memory/SubroutineControlPlane",
  {
    make: Effect.gen(function*() {
      const runner = yield* SubroutineRunner
      const catalog = yield* SubroutineCatalog
      const governancePort = yield* GovernancePortTag
      const runtimeSupervisor = yield* RuntimeSupervisor

      const queue = yield* Queue.dropping<QueuedDispatch>(DEFAULT_SUBROUTINE_QUEUE_CAPACITY)
      const dedupeState = yield* Ref.make(new Map<string, DedupeEntry>())
      const inFlight = yield* Ref.make(new Set<string>())
      const lastWorkerErrorRef = yield* Ref.make<string | null>(null)
      const enqueueLock = yield* Semaphore.make(1)

      const enqueueInternal = (
        request: DispatchRequest,
        completion?: Deferred.Deferred<SubroutineExecutionOutcome>
      ): Effect.Effect<EnqueueResult> =>
        Effect.gen(function*() {
          const lookupResult = yield* catalog.getById(request.subroutineId).pipe(
            Effect.map((loaded) => ({ found: true as const, loaded })),
            Effect.catchTag("SubroutineNotFound", () =>
              Effect.succeed({ found: false as const, loaded: null as never })
            )
          )
          if (!lookupResult.found) {
            return { accepted: false, reason: "unknown_subroutine", runId: null } satisfies EnqueueResult
          }

          const loaded = lookupResult.loaded
          const windowSeconds = loaded.config.dedupeWindowSeconds ?? DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS

          const enqueueResult = yield* enqueueLock.withPermits(1)(
            Effect.gen(function*() {
              const dedupeKey = makeDedupeKey(request)
              const currentDedupeMap = yield* Ref.get(dedupeState)
              if (isDuplicateUsingEntryWindow(currentDedupeMap, dedupeKey, request.enqueuedAt, windowSeconds)) {
                return { accepted: false, reason: "deduped", runId: null } satisfies EnqueueResult
              }

              const runId = crypto.randomUUID()
              yield* Ref.update(dedupeState, (map) => {
                const next = new Map(map)
                next.set(dedupeKey, {
                  acceptedAt: request.enqueuedAt,
                  expiresAt: DateTime.add(request.enqueuedAt, {
                    seconds: Math.max(windowSeconds, 1)
                  }),
                  windowSeconds
                })
                return next
              })

              const nowMs = DateTime.toEpochMillis(request.enqueuedAt)
              yield* Ref.update(dedupeState, (map) => {
                const next = new Map<string, DedupeEntry>()
                for (const [k, v] of map) {
                  const fallbackWindowSeconds = v.windowSeconds ?? DEFAULT_SUBROUTINE_DEDUPE_WINDOW_SECONDS
                  const expiry = v.expiresAt
                    ?? DateTime.add(v.acceptedAt, { seconds: Math.max(fallbackWindowSeconds, 1) })
                  if (DateTime.toEpochMillis(expiry) > nowMs) {
                    next.set(k, v)
                  }
                }
                return next
              })

              const offered = yield* Queue.offer(queue, {
                ...request,
                runId,
                ...(completion !== undefined ? { completion } : {})
              })
              if (!offered) {
                yield* Ref.update(dedupeState, (map) => {
                  const next = new Map(map)
                  next.delete(dedupeKey)
                  return next
                })
                return { accepted: false, reason: "queue_full", runId: null } satisfies EnqueueResult
              }

              return { accepted: true, reason: "dispatched", runId } satisfies EnqueueResult
            })
          )

          if (enqueueResult.reason === "deduped") {
            yield* writeControlPlaneAudit(governancePort, request, "memory_subroutine_skipped").pipe(
              Effect.ignore
            )
            return enqueueResult
          }

          if (!enqueueResult.accepted) {
            return enqueueResult
          }

          yield* writeControlPlaneAudit(governancePort, request, "memory_subroutine_dispatched").pipe(
            Effect.ignore
          )
          return enqueueResult
        })

      const toImmediateExecutionOutcome = (
        request: DispatchRequest,
        result: EnqueueResult
      ): SubroutineExecutionOutcome => ({
        accepted: false,
        subroutineId: request.subroutineId,
        runId: result.runId,
        success: false,
        errorTag: null,
        reason: result.reason === "dispatched" ? "queue_full" : result.reason
      })

      const enqueue: SubroutineControlPlaneService["enqueue"] = (request) =>
        enqueueInternal(request)

      const execute: SubroutineControlPlaneService["execute"] = (request) =>
        Effect.gen(function*() {
          const completion = yield* Deferred.make<SubroutineExecutionOutcome>()
          const enqueueResult = yield* enqueueInternal(request, completion)
          if (!enqueueResult.accepted) {
            return toImmediateExecutionOutcome(request, enqueueResult)
          }
          return yield* Deferred.await(completion)
        })

      const completeAwaitingDispatch = (
        item: QueuedDispatch,
        outcome: SubroutineExecutionOutcome
      ): Effect.Effect<void> =>
        item.completion === undefined
          ? Effect.void
          : Deferred.succeed(item.completion, outcome).pipe(Effect.asVoid, Effect.ignore)

      const finalizeExecutionOutcome = (
        item: QueuedDispatch,
        params: {
          readonly accepted: boolean
          readonly success: boolean
          readonly errorTag: string | null
          readonly reason: SubroutineExecutionOutcome["reason"]
        }
      ): SubroutineExecutionOutcome => ({
        accepted: params.accepted,
        subroutineId: item.subroutineId,
        runId: item.runId,
        success: params.success,
        errorTag: params.errorTag,
        reason: params.reason
      })

      const processOne = (item: QueuedDispatch) =>
        Effect.gen(function*() {
          const serKey = makeSerializationKey(item.sessionId, item.subroutineId)

          const alreadyInFlight = yield* Ref.get(inFlight).pipe(
            Effect.map((set) => set.has(serKey))
          )
          if (alreadyInFlight) {
            yield* Effect.log("SubroutineControlPlane: skipping in-flight duplicate", {
              sessionId: item.sessionId,
              subroutineId: item.subroutineId
            })
            const outcome = finalizeExecutionOutcome(item, {
              accepted: false,
              success: false,
              errorTag: "already_in_flight",
              reason: "already_in_flight"
            })
            yield* completeAwaitingDispatch(item, outcome)
            return
          }

          yield* Ref.update(inFlight, (set) => {
            const next = new Set(set)
            next.add(serKey)
            return next
          })

          yield* Effect.gen(function*() {
            const outcome = yield* Effect.gen(function*() {
              const loaded = yield* catalog.getById(item.subroutineId).pipe(
                Effect.catchTag("SubroutineNotFound", () =>
                  Effect.log("SubroutineControlPlane: subroutine not found at execution time", {
                    subroutineId: item.subroutineId
                  }).pipe(Effect.as(null))
                )
              )
              if (!loaded) {
                return finalizeExecutionOutcome(item, {
                  accepted: false,
                  success: false,
                  errorTag: "unknown_subroutine",
                  reason: "unknown_subroutine"
                })
              }

              const context: SubroutineContext = {
                agentId: item.agentId,
                sessionId: item.sessionId,
                conversationId: item.conversationId,
                turnId: item.turnId,
                triggerType: item.triggerType,
                triggerReason: item.triggerReason,
                now: item.enqueuedAt,
                runId: item.runId
              }

              const result = yield* runner.execute(loaded, context)
              yield* Effect.log("SubroutineControlPlane processOne completed", {
                subroutineId: result.subroutineId,
                runId: result.runId,
                success: result.success,
                checkpointWritten: result.checkpointWritten,
                errorTag: result.error?.tag ?? null
              })

              return finalizeExecutionOutcome(item, {
                accepted: true,
                success: result.success,
                errorTag: result.error?.tag ?? null,
                reason: "completed"
              })
            }).pipe(
              Effect.catchCause((cause) =>
                Effect.gen(function*() {
                  yield* Effect.logError("SubroutineControlPlane processOne failed", {
                    subroutineId: item.subroutineId,
                    cause
                  })
                  return finalizeExecutionOutcome(item, {
                    accepted: true,
                    success: false,
                    errorTag: "unknown_error",
                    reason: "completed"
                  })
                })
              )
            )

            yield* completeAwaitingDispatch(item, outcome)
          }).pipe(
            Effect.ensuring(
              Ref.update(inFlight, (set) => {
                const next = new Set(set)
                next.delete(serKey)
                return next
              })
            )
          )
        })

      // 4c. Worker loop
      const workerLoop = Effect.forever(
        Effect.gen(function*() {
          const item = yield* Queue.take(queue)
          yield* processOne(item)
          yield* Ref.set(lastWorkerErrorRef, null)
        }).pipe(
          Effect.catchCause((cause) =>
            Effect.gen(function*() {
              yield* Ref.set(lastWorkerErrorRef, String(cause))
              yield* Effect.logError("SubroutineControlPlane worker error", { cause })
            })
          )
        )
      )

      // 4d. dispatchByTrigger — catalog lookup + batch enqueue
      const dispatchByTrigger: SubroutineControlPlaneService["dispatchByTrigger"] = (
        triggerType,
        context
      ) =>
        Effect.gen(function*() {
          const subroutines = yield* catalog.getByTrigger(context.agentId, triggerType)
          if (subroutines.length === 0) return [] as ReadonlyArray<EnqueueResult>

          const results: Array<EnqueueResult> = []
          for (const sub of subroutines) {
            const result = yield* enqueue({
              agentId: context.agentId,
              sessionId: context.sessionId,
              conversationId: context.conversationId,
              subroutineId: sub.config.id,
              turnId: context.turnId,
              triggerType,
              triggerReason: `${triggerType} trigger`,
              enqueuedAt: context.now
            })
            results.push(result)
          }
          return results
        })

      const snapshot: SubroutineControlPlaneService["snapshot"] = () =>
        Effect.gen(function*() {
          const queueDepth = yield* Queue.size(queue)
          const inFlightCount = yield* Ref.get(inFlight).pipe(
            Effect.map((set) => set.size)
          )
          const dedupeEntries = yield* Ref.get(dedupeState).pipe(
            Effect.map((map) => map.size)
          )
          const lastWorkerError = yield* Ref.get(lastWorkerErrorRef)

          return {
            queueDepth,
            inFlightCount,
            dedupeEntries,
            lastWorkerError
          } satisfies SubroutineControlPlaneSnapshot
        })

      // Start worker under lifecycle ownership
      const started = yield* runtimeSupervisor.start(
        "runtime.subroutine.control-plane.worker",
        workerLoop,
        { required: true }
      )
      if (!started) {
        return yield* Effect.die(
          new Error("required runtime loop already registered: runtime.subroutine.control-plane.worker")
        )
      }

      return { enqueue, execute, dispatchByTrigger, snapshot } satisfies SubroutineControlPlaneService
    })
  }
) {
  static layer = Layer.effect(this, this.make)
}
