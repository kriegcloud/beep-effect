import * as Clock from "effect/Clock"
import * as Deferred from "effect/Deferred"
import * as Duration from "effect/Duration"
import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as Metric from "effect/Metric"
import * as MetricBoundaries from "effect/MetricBoundaries"
import * as Option from "effect/Option"
import * as PubSub from "effect/PubSub"
import * as Queue from "effect/Queue"
import * as Schema from "effect/Schema"
import * as Scope from "effect/Scope"
import * as Stream from "effect/Stream"
import * as SynchronizedRef from "effect/SynchronizedRef"
import { AgentSdk } from "./AgentSdk.js"
import type { AgentSdkError } from "./Errors.js"
import type { QueryHandle } from "./Query.js"
import type { HookInput } from "./Schema/Hooks.js"
import type { SDKUserMessage } from "./Schema/Message.js"
import type { Options } from "./Schema/Options.js"
import { QuerySupervisorConfig } from "./QuerySupervisorConfig.js"
import type { PendingQueueStrategy } from "./QuerySupervisorConfig.js"
import { SandboxError } from "./Sandbox/SandboxError.js"
import { SandboxService } from "./Sandbox/SandboxService.js"

const CompletionStatus = Schema.Literal("success", "failure", "interrupted")

const QueryQueuedEvent = Schema.TaggedStruct("QueryQueued", {
  queryId: Schema.String,
  submittedAt: Schema.Number
})

const QueryStartedEvent = Schema.TaggedStruct("QueryStarted", {
  queryId: Schema.String,
  startedAt: Schema.Number
})

const QueryCompletedEvent = Schema.TaggedStruct("QueryCompleted", {
  queryId: Schema.String,
  completedAt: Schema.Number,
  status: CompletionStatus
})

const QueryStartFailedEvent = Schema.TaggedStruct("QueryStartFailed", {
  queryId: Schema.String,
  failedAt: Schema.Number,
  errorTag: Schema.optional(Schema.String)
})

export const QueryEvent = Schema.Union(
  QueryQueuedEvent,
  QueryStartedEvent,
  QueryCompletedEvent,
  QueryStartFailedEvent
)

export type QueryEvent = typeof QueryEvent.Type
export type QueryEventEncoded = typeof QueryEvent.Encoded

/**
 * Raised when the pending queue rejects a new submission.
 */
export class QueryQueueFullError extends Schema.TaggedError<QueryQueueFullError>()(
  "QueryQueueFullError",
  {
    message: Schema.String,
    queryId: Schema.String,
    capacity: Schema.Number,
    strategy: Schema.String
  }
) {}

/**
 * Raised when a pending query waits too long before starting.
 */
export class QueryPendingTimeoutError extends Schema.TaggedError<QueryPendingTimeoutError>()(
  "QueryPendingTimeoutError",
  {
    message: Schema.String,
    queryId: Schema.String,
    timeoutMs: Schema.Number
  }
) {}

/**
 * Raised when the submitting scope closes before a query starts.
 */
export class QueryPendingCanceledError extends Schema.TaggedError<QueryPendingCanceledError>()(
  "QueryPendingCanceledError",
  {
    message: Schema.String,
    queryId: Schema.String
  }
) {}

/**
 * Union of all query supervisor errors.
 */
export const QuerySupervisorError = Schema.Union(
  QueryQueueFullError,
  QueryPendingTimeoutError,
  QueryPendingCanceledError
)

export type QuerySupervisorError = typeof QuerySupervisorError.Type
export type QuerySupervisorErrorEncoded = typeof QuerySupervisorError.Encoded

export const QuerySupervisorStatsSchema = Schema.Struct({
  active: Schema.Number,
  pending: Schema.Number,
  concurrencyLimit: Schema.Number,
  pendingQueueCapacity: Schema.Number,
  pendingQueueStrategy: Schema.Literal("disabled", "suspend", "dropping", "sliding")
}).pipe(Schema.annotations({ identifier: "QuerySupervisorStats" }))

export type QuerySupervisorStats = typeof QuerySupervisorStatsSchema.Type
export type QuerySupervisorStatsEncoded = typeof QuerySupervisorStatsSchema.Encoded

type PendingRequest = {
  readonly queryId: string
  readonly prompt: string | AsyncIterable<SDKUserMessage>
  readonly options?: Options
  readonly submittedAt: number
  readonly deferred: Deferred.Deferred<QueryHandle, AgentSdkError | QuerySupervisorError>
  readonly scope: Scope.Scope
}

type QueryRequest = Omit<PendingRequest, "deferred">

type ActiveQuery = {
  readonly queryId: string
  readonly handle: QueryHandle
  readonly startedAt: number
}

const queryStartedMetric = Metric.counter("agent_queries_started", {
  description: "Number of started queries",
  incremental: true
})

const queryCompletedMetric = Metric.counter("agent_queries_completed", {
  description: "Number of completed queries",
  incremental: true
})

const queryFailedMetric = Metric.counter("agent_queries_failed", {
  description: "Number of failed query starts",
  incremental: true
})

const queryDurationMetric = Metric.histogram(
  "agent_query_duration_ms",
  MetricBoundaries.fromIterable([50, 100, 250, 500, 1000, 2000, 5000, 10000, 30000]),
  "Query duration in milliseconds"
)

const makeQueryId = () =>
  Effect.sync(() =>
    globalThis.crypto?.randomUUID?.() ?? `query-${Math.random().toString(36).slice(2)}`
  )

const makePendingQueue = (strategy: PendingQueueStrategy, capacity: number) => {
  switch (strategy) {
    case "dropping":
      return Queue.dropping<PendingRequest>(capacity)
    case "sliding":
      return Queue.sliding<PendingRequest>(capacity)
    default:
      return Queue.bounded<PendingRequest>(capacity)
  }
}

const makeEventBus = (strategy: PendingQueueStrategy, capacity: number) => {
  switch (strategy) {
    case "dropping":
      return PubSub.dropping<QueryEvent>(capacity)
    case "sliding":
      return PubSub.sliding<QueryEvent>(capacity)
    default:
      return PubSub.bounded<QueryEvent>(capacity)
  }
}

const exitStatus = (exit: Exit.Exit<unknown, unknown>) => {
  if (Exit.isInterrupted(exit)) return "interrupted" as const
  if (Exit.isFailure(exit)) return "failure" as const
  return "success" as const
}

const stripNonSerializableOptions = (options: Options): Options => {
  const {
    hooks,
    canUseTool,
    stderr,
    spawnClaudeCodeProcess,
    abortController,
    ...rest
  } = options
  return rest as Options
}

const toHookMatcherRegex = (matcher: string) =>
  new RegExp(`^${matcher.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*")}$`)

const hookMatcherAllowsInput = (matcher: string | undefined, input: HookInput) => {
  if (!matcher || matcher === "*") return true
  if ("tool_name" in input) {
    return toHookMatcherRegex(matcher).test(input.tool_name)
  }
  return true
}

const applySandboxHooks = (handle: QueryHandle, options?: Options): QueryHandle => {
  const hooks = options?.hooks
  if (!hooks || Object.keys(hooks).length === 0) return handle

  const baseCwd = options?.cwd ?? ""
  const basePermissionMode = options?.permissionMode

  const makeBaseInput = (sessionId: string) => ({
    session_id: sessionId,
    transcript_path: "",
    cwd: baseCwd,
    ...(basePermissionMode ? { permission_mode: basePermissionMode } : {})
  })

  const runHookEvent = (
    event: keyof NonNullable<Options["hooks"]>,
    input: HookInput,
    toolUseID?: string
  ) =>
    Effect.forEach(hooks[event] ?? [], (matcherEntry) => {
      if (!hookMatcherAllowsInput(matcherEntry.matcher, input)) {
        return Effect.void
      }
      return Effect.forEach(matcherEntry.hooks, (hook) =>
        Effect.tryPromise({
          try: () => hook(input, toolUseID, { signal: new AbortController().signal }),
          catch: () => undefined
        }).pipe(Effect.ignore), { discard: true })
    }, { discard: true })

  let sessionStarted = false
  const toolNames = new Map<string, string>()
  const preToolFired = new Set<string>()
  const completedToolUseIds = new Set<string>()

  const stream = handle.stream.pipe(
    Stream.tap((message) =>
      Effect.gen(function*() {
        if (!sessionStarted) {
          sessionStarted = true
          const input = {
            ...makeBaseInput(message.session_id),
            hook_event_name: "SessionStart",
            source: "startup",
            model: options?.model
          } as HookInput
          yield* runHookEvent("SessionStart", input).pipe(Effect.ignore)
        }

        if (message.type === "tool_progress") {
          toolNames.set(message.tool_use_id, message.tool_name)
          if (!preToolFired.has(message.tool_use_id)) {
            preToolFired.add(message.tool_use_id)
            const input = {
              ...makeBaseInput(message.session_id),
              hook_event_name: "PreToolUse",
              tool_name: message.tool_name,
              tool_input: {},
              tool_use_id: message.tool_use_id
            } as HookInput
            yield* runHookEvent("PreToolUse", input, message.tool_use_id).pipe(Effect.ignore)
          }
        }

        if (
          message.type === "user" &&
          message.parent_tool_use_id !== null &&
          message.tool_use_result !== undefined
        ) {
          const toolUseId = message.parent_tool_use_id
          completedToolUseIds.add(toolUseId)
          const input = {
            ...makeBaseInput(message.session_id),
            hook_event_name: "PostToolUse",
            tool_name: toolNames.get(toolUseId) ?? "unknown",
            tool_input: {},
            tool_response: message.tool_use_result,
            tool_use_id: toolUseId
          } as HookInput
          yield* runHookEvent("PostToolUse", input, toolUseId).pipe(Effect.ignore)
        }

        if (message.type === "result") {
          if (message.subtype !== "success") {
            const fallbackError = `Sandbox query failed with ${message.subtype}`
            const errorMessage =
              "errors" in message && message.errors.length > 0
                ? message.errors[0]!
                : fallbackError
            for (const toolUseId of preToolFired) {
              if (completedToolUseIds.has(toolUseId)) continue
              completedToolUseIds.add(toolUseId)
              const input = {
                ...makeBaseInput(message.session_id),
                hook_event_name: "PostToolUseFailure",
                tool_name: toolNames.get(toolUseId) ?? "unknown",
                tool_input: {},
                tool_use_id: toolUseId,
                error: errorMessage
              } as HookInput
              yield* runHookEvent("PostToolUseFailure", input, toolUseId).pipe(Effect.ignore)
            }

            const stopInput = {
              ...makeBaseInput(message.session_id),
              hook_event_name: "Stop",
              stop_hook_active: false
            } as HookInput
            yield* runHookEvent("Stop", stopInput).pipe(Effect.ignore)
          }

          const input = {
            ...makeBaseInput(message.session_id),
            hook_event_name: "SessionEnd",
            reason: "other"
          } as HookInput
          yield* runHookEvent("SessionEnd", input).pipe(Effect.ignore)
        }
      })
    )
  )

  return {
    ...handle,
    stream
  }
}

const makeQuerySupervisor = Effect.gen(function*() {
  const { settings } = yield* QuerySupervisorConfig
  const sdk = yield* AgentSdk
  const semaphore = yield* Effect.makeSemaphore(settings.concurrencyLimit)
  const activeRef = yield* SynchronizedRef.make(new Map<string, ActiveQuery>())
  const pendingQueue = settings.pendingQueueCapacity > 0
    ? yield* makePendingQueue(settings.pendingQueueStrategy, settings.pendingQueueCapacity)
    : undefined
  const eventBus = settings.emitEvents
    ? yield* makeEventBus(settings.eventBufferStrategy, settings.eventBufferCapacity)
    : undefined

  const publishEvent = (event: QueryEvent) =>
    eventBus
      ? PubSub.publish(eventBus, event).pipe(Effect.asVoid, Effect.ignore)
      : Effect.void

  const trackStarted = settings.metricsEnabled
    ? Metric.update(queryStartedMetric, 1)
    : Effect.void
  const trackCompleted = settings.metricsEnabled
    ? Metric.update(queryCompletedMetric, 1)
    : Effect.void
  const trackFailed = settings.metricsEnabled
    ? Metric.update(queryFailedMetric, 1)
    : Effect.void
  const trackDuration = (durationMs: number) =>
    settings.metricsEnabled
      ? Metric.update(queryDurationMetric, durationMs)
      : Effect.void

  const addActive = (active: ActiveQuery) =>
    SynchronizedRef.update(activeRef, (current) => {
      const next = new Map(current)
      next.set(active.queryId, active)
      return next
    })

  const removeActive = (queryId: string) =>
    SynchronizedRef.update(activeRef, (current) => {
      const next = new Map(current)
      next.delete(queryId)
      return next
    })

  const dispatchQuery = (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ): Effect.Effect<QueryHandle, AgentSdkError, Scope.Scope> =>
    Effect.flatMap(Effect.serviceOption(SandboxService), (sandboxOption) => {
      if (Option.isSome(sandboxOption) && sandboxOption.value.isolated) {
        if (typeof prompt !== "string") {
          return Effect.fail(
            SandboxError.make({
              message:
                "Sandbox queries only support string prompts. AsyncIterable<SDKUserMessage> cannot cross the sandbox boundary.",
              operation: "dispatchQuery",
              provider: sandboxOption.value.provider
            })
          )
        }
        return sandboxOption.value.runAgent(prompt, options ? stripNonSerializableOptions(options) : options).pipe(
          Effect.map((handle) => applySandboxHooks(handle, options)),
          Effect.mapError((error): AgentSdkError => error)
        )
      }
      return sdk.query(prompt, options).pipe(
        Effect.mapError((error): AgentSdkError => error)
      )
    })

  const startQuery = (request: QueryRequest) => {
    const effect = Effect.uninterruptibleMask((restore) =>
      Effect.gen(function*() {
        yield* restore(semaphore.take(1))
        const handle = yield* restore(
          dispatchQuery(request.prompt, request.options).pipe(Scope.extend(request.scope))
        ).pipe(
          Effect.onError(() => semaphore.release(1))
        )
        const startedAt = yield* Clock.currentTimeMillis
        yield* addActive({ queryId: request.queryId, handle, startedAt })
        yield* Scope.addFinalizerExit(request.scope, (exit) =>
          Effect.gen(function*() {
            const completedAt = yield* Clock.currentTimeMillis
            yield* removeActive(request.queryId)
            yield* semaphore.release(1)
            yield* trackCompleted
            yield* trackDuration(completedAt - startedAt)
            yield* publishEvent({
              _tag: "QueryCompleted",
              queryId: request.queryId,
              completedAt,
              status: exitStatus(exit)
            })
          }).pipe(Effect.ignore)
        )
        yield* trackStarted
        yield* publishEvent({
          _tag: "QueryStarted",
          queryId: request.queryId,
          startedAt
        })
        return handle
      })
    ).pipe(
      Effect.tapError((error) =>
        Effect.gen(function*() {
          const failedAt = yield* Clock.currentTimeMillis
          yield* trackFailed
          yield* publishEvent({
            _tag: "QueryStartFailed",
            queryId: request.queryId,
            failedAt,
            errorTag: typeof error === "object" && error !== null && "_tag" in error
              ? String((error as { _tag?: string })._tag)
              : undefined
          })
        })
      )
    )

    return settings.tracingEnabled
      ? effect.pipe(
          Effect.withSpan("agent.query", {
            attributes: { "query.id": request.queryId }
          })
        )
      : effect
  }

  const submit = Effect.fn("QuerySupervisor.submit")(function*(
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ) {
    const scope = yield* Effect.scope
    const queryId = yield* makeQueryId()
    const submittedAt = yield* Clock.currentTimeMillis
    const request: QueryRequest = options === undefined
      ? {
          queryId,
          prompt,
          submittedAt,
          scope
        }
      : {
          queryId,
          prompt,
          options,
          submittedAt,
          scope
        }

    if (!pendingQueue) {
      return yield* startQuery(request)
    }

    const deferred = yield* Deferred.make<QueryHandle, AgentSdkError | QuerySupervisorError>()
    const pending: PendingRequest = { ...request, deferred }

    yield* Scope.addFinalizer(
      scope,
      Deferred.fail(
        deferred,
        QueryPendingCanceledError.make({
          message: "Query was canceled before it started",
          queryId
        })
      ).pipe(Effect.ignore)
    )

    const offer = yield* Queue.offer(pendingQueue, pending)
    if (settings.pendingQueueStrategy === "dropping" && offer === false) {
      const error = QueryQueueFullError.make({
        message: "Pending queue is full",
        queryId,
        capacity: settings.pendingQueueCapacity,
        strategy: settings.pendingQueueStrategy
      })
      yield* Deferred.fail(deferred, error).pipe(Effect.ignore)
      return yield* error
    }

    yield* publishEvent({
      _tag: "QueryQueued",
      queryId,
      submittedAt
    })

    const awaitHandle = Deferred.await(deferred)
    if (settings.maxPendingTime) {
      const timeoutMs = Duration.toMillis(settings.maxPendingTime)
      const timeoutError = QueryPendingTimeoutError.make({
        message: "Query did not start within maxPendingTime",
        queryId,
        timeoutMs
      })
      return yield* awaitHandle.pipe(
        Effect.timeoutFail({
          onTimeout: () => timeoutError,
          duration: settings.maxPendingTime
        }),
        Effect.tapError((error) =>
          typeof error === "object" &&
            error !== null &&
            "_tag" in error &&
            (error as { _tag?: string })._tag === "QueryPendingTimeoutError"
            ? Deferred.fail(deferred, timeoutError).pipe(Effect.ignore)
            : Effect.void
        )
      )
    }

    return yield* awaitHandle
  })

  const submitStream = (prompt: string | AsyncIterable<SDKUserMessage>, options?: Options) =>
    Stream.unwrapScoped(
      submit(prompt, options).pipe(Effect.map((handle) => handle.stream))
    )

  const stats = Effect.gen(function*() {
    const active = yield* SynchronizedRef.get(activeRef).pipe(
      Effect.map((current) => current.size)
    )
    const pending = pendingQueue
      ? Math.max(0, yield* Queue.size(pendingQueue))
      : 0
    return {
      active,
      pending,
      concurrencyLimit: settings.concurrencyLimit,
      pendingQueueCapacity: pendingQueue ? settings.pendingQueueCapacity : 0,
      pendingQueueStrategy: pendingQueue ? settings.pendingQueueStrategy : "disabled"
    } satisfies QuerySupervisorStats
  })

  const interruptAll = Effect.gen(function*() {
    const active = yield* SynchronizedRef.get(activeRef)
    const handles = Array.from(active.values()).map((entry) => entry.handle)
    yield* Effect.forEach(
      handles,
      (handle) =>
        Effect.all([handle.closeInput, handle.interrupt], {
          concurrency: "unbounded",
          discard: true
        }).pipe(Effect.ignore),
      { concurrency: "unbounded", discard: true }
    )
  })

  const events = eventBus
    ? Stream.unwrapScoped(
        Effect.map(PubSub.subscribe(eventBus), (queue) => Stream.fromQueue(queue))
      )
    : Stream.empty

  if (pendingQueue) {
    yield* Effect.forkScoped(
      Effect.forever(
        Effect.gen(function*() {
          const pending = yield* Queue.take(pendingQueue)
          const done = yield* Deferred.isDone(pending.deferred)
          if (done) return
          const exit = yield* Effect.exit(startQuery(pending))
          const completed = yield* Deferred.done(pending.deferred, exit)
          if (!completed && Exit.isSuccess(exit)) {
            yield* exit.value.interrupt.pipe(Effect.ignore)
          }
        })
      ).pipe(Effect.catchAllCause(() => Effect.void))
    )
  }

  yield* Effect.addFinalizer(() =>
    Effect.all([
      interruptAll.pipe(Effect.ignore),
      pendingQueue ? Queue.shutdown(pendingQueue).pipe(Effect.ignore) : Effect.void,
      eventBus ? PubSub.shutdown(eventBus).pipe(Effect.ignore) : Effect.void
    ], {
      concurrency: "unbounded",
      discard: true
    })
  )

  return {
    submit,
    submitStream,
    stats,
    interruptAll,
    events
  }
})

/**
 * Supervisor for running Claude Agent SDK queries with concurrency limits.
 */
export class QuerySupervisor extends Effect.Service<QuerySupervisor>()(
  "@effect/claude-agent-sdk/QuerySupervisor",
  {
    scoped: makeQuerySupervisor
  }
) {
  /**
   * Build the QuerySupervisor service using QuerySupervisorConfig.
   */
  static readonly layer = QuerySupervisor.Default

  /**
   * Convenience layer that wires QuerySupervisorConfig from defaults.
   */
  static readonly layerDefault = QuerySupervisor.layer.pipe(
    Layer.provide(QuerySupervisorConfig.layer),
    Layer.provide(AgentSdk.layerDefault)
  )

  /**
   * Convenience layer that reads QuerySupervisorConfig from environment variables.
   */
  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    QuerySupervisor.layer.pipe(
      Layer.provide(QuerySupervisorConfig.layerFromEnv(prefix)),
      Layer.provide(AgentSdk.layerDefaultFromEnv(prefix))
    )
}
