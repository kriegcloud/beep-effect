import * as Context from "effect/Context"
import * as Clock from "effect/Clock"
import * as Deferred from "effect/Deferred"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import * as Schedule from "effect/Schedule"
import * as Stream from "effect/Stream"
import type * as Scope from "effect/Scope"
import { AgentRuntimeConfig, type AgentRuntimeSettings } from "./AgentRuntimeConfig.js"
import type { AgentSdkError } from "./Errors.js"
import { withAuditLogging, wrapPermissionHooks, type AuditLoggingOptions } from "./Hooks/Audit.js"
import { withHooks } from "./Hooks/utils.js"
import { mergeOptions } from "./internal/options.js"
import type { QueryHandle } from "./Query.js"
import { QuerySupervisor } from "./QuerySupervisor.js"
import type {
  QueryEvent,
  QuerySupervisorError,
  QuerySupervisorStats
} from "./QuerySupervisor.js"
import type { SDKMessage, SDKUserMessage } from "./Schema/Message.js"
import type { Options } from "./Schema/Options.js"
import { ArtifactRecord, type ChatEventSource } from "./Schema/Storage.js"
import type { RecorderOptions } from "./Storage/ChatHistory.js"
import { ArtifactStore } from "./Storage/ArtifactStore.js"
import { AuditEventStore } from "./Storage/AuditEventStore.js"
import { ChatHistoryStore } from "./Storage/ChatHistoryStore.js"
import { StorageConfig } from "./Storage/StorageConfig.js"
import { SessionIndexStore } from "./Storage/SessionIndexStore.js"
import { layerAuditEventStore } from "./Sync/SyncAuditEventStore.js"

type ChatHistoryStoreService = Context.Tag.Service<typeof ChatHistoryStore>

const decorateHandle = (
  handle: QueryHandle,
  settings: AgentRuntimeSettings
) =>
  Effect.gen(function*() {
    let stream = handle.stream

    if (settings.firstMessageTimeout) {
      const firstMessage = yield* Deferred.make<void>()
      stream = stream.pipe(
        Stream.tap(() => Deferred.succeed(firstMessage, undefined).pipe(Effect.ignore)),
        Stream.ensuring(Deferred.succeed(firstMessage, undefined).pipe(Effect.ignore))
      )

      yield* Effect.forkScoped(
        Deferred.await(firstMessage).pipe(
          Effect.timeoutOption(settings.firstMessageTimeout),
          Effect.flatMap((result) =>
            Option.isNone(result)
              ? handle.interrupt.pipe(Effect.ignore)
              : Effect.void
          ),
          Effect.asVoid
        )
      )
    }

    if (settings.queryTimeout) {
      yield* Effect.forkScoped(
        Effect.sleep(settings.queryTimeout).pipe(
          Effect.zipRight(handle.interrupt.pipe(Effect.ignore))
        )
      )
    }

    return {
      ...handle,
      stream
    }
  })

const applyRetry = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
  settings: AgentRuntimeSettings
) =>
  settings.retryMaxRetries > 0
    ? effect.pipe(
        Effect.retry(
          Schedule.exponential(settings.retryBaseDelay).pipe(
            Schedule.compose(Schedule.recurs(settings.retryMaxRetries))
          )
        )
      )
    : effect

export type PersistenceLayers = {
  readonly runtime?: Layer.Layer<AgentRuntime, unknown, never>
  readonly chatHistory?: Layer.Layer<ChatHistoryStore, unknown, never>
  readonly artifacts?: Layer.Layer<ArtifactStore, unknown, never>
  readonly auditLog?: Layer.Layer<AuditEventStore, unknown, never>
  readonly sessionIndex?: Layer.Layer<SessionIndexStore, unknown, never>
  readonly storageConfig?: Layer.Layer<StorageConfig, unknown, never>
}

export type PersistenceOptions = {
  readonly layers?: PersistenceLayers
  readonly history?: RecorderOptions
  readonly audit?: AuditLoggingOptions
}

const makeArtifactId = () =>
  globalThis.crypto?.randomUUID?.() ?? `artifact-${Math.random().toString(36).slice(2)}`

const resolveToolResultContent = (value: unknown) => {
  if (typeof value === "string") {
    return { content: value, contentType: "text/plain" }
  }
  try {
    return { content: JSON.stringify(value), contentType: "application/json" }
  } catch {
    return { content: String(value), contentType: "text/plain" }
  }
}

const recordHandleWithStore = Effect.fn("AgentRuntime.recordHandleWithStore")(function*(
  handle: QueryHandle,
  store: ChatHistoryStoreService,
  options?: RecorderOptions
) {
  const sessionId = options?.sessionId
  const outputSource = options?.source ?? "sdk"
  const inputSource = options?.inputSource ?? "external"
  const recordOutput = options?.recordOutput ?? true
  const recordInput = options?.recordInput ?? false
  const strict = options?.strict ?? false

  const recordMessage = (message: SDKMessage, source: ChatEventSource) => {
    const resolvedSessionId = sessionId ?? message.session_id
    const effect = store.appendMessage(resolvedSessionId, message, { source }).pipe(Effect.asVoid)
    return strict ? effect.pipe(Effect.orDie) : effect.pipe(Effect.catchAll(() => Effect.void))
  }

  const recordMessages = (messages: ReadonlyArray<SDKUserMessage>, source: ChatEventSource) => {
    if (messages.length === 0) return Effect.void
    const resolvedSessionId = sessionId ?? messages[0]?.session_id
    if (!resolvedSessionId) return Effect.void
    const effect = store.appendMessages(resolvedSessionId, messages, { source }).pipe(Effect.asVoid)
    return strict ? effect.pipe(Effect.orDie) : effect.pipe(Effect.catchAll(() => Effect.void))
  }

  let stream = handle.stream
  if (recordOutput) {
    const [userStream, recordStream] = yield* Stream.broadcast(handle.stream, 2, 64)
    stream = userStream
    yield* Effect.forkScoped(
      Stream.runForEach(recordStream, (message) =>
        recordMessage(message, outputSource)
      )
    )
  }

  const send = recordInput
    ? Effect.fn("AgentRuntime.sendWithHistory")((message: SDKUserMessage) =>
        handle.send(message).pipe(
          Effect.tap(() => recordMessage(message, inputSource))
        )
      )
    : handle.send

  const sendAll = recordInput
    ? Effect.fn("AgentRuntime.sendAllWithHistory")((messages: Iterable<SDKUserMessage>) => {
        const batch = Array.from(messages)
        return handle.sendAll(batch).pipe(
          Effect.tap(() => recordMessages(batch, inputSource))
        )
      })
    : handle.sendAll

  const sendForked = recordInput
    ? Effect.fn("AgentRuntime.sendForkedWithHistory")((message: SDKUserMessage) =>
        Effect.forkScoped(send(message)).pipe(Effect.asVoid)
      )
    : handle.sendForked

  return {
    ...handle,
    stream,
    send,
    sendAll,
    sendForked
  }
})

/**
 * AgentRuntime composes AgentSdk, QuerySupervisor, and runtime policies.
 */
export class AgentRuntime extends Context.Tag("@effect/claude-agent-sdk/AgentRuntime")<
  AgentRuntime,
  {
    readonly query: (
      prompt: string | AsyncIterable<SDKUserMessage>,
      options?: Options
    ) => Effect.Effect<QueryHandle, AgentSdkError | QuerySupervisorError, Scope.Scope>
    readonly queryRaw: (
      prompt: string | AsyncIterable<SDKUserMessage>,
      options?: Options
    ) => Effect.Effect<QueryHandle, AgentSdkError | QuerySupervisorError, Scope.Scope>
    readonly stream: (
      prompt: string | AsyncIterable<SDKUserMessage>,
      options?: Options
    ) => Stream.Stream<SDKMessage, AgentSdkError | QuerySupervisorError>
    readonly stats: Effect.Effect<QuerySupervisorStats>
    readonly interruptAll: Effect.Effect<void, AgentSdkError>
    readonly events: Stream.Stream<QueryEvent>
  }
>() {
  /**
   * Build the AgentRuntime service using AgentRuntimeConfig.
   */
  static readonly layer = Layer.effect(
    AgentRuntime,
    Effect.gen(function*() {
      const { settings } = yield* AgentRuntimeConfig
      const supervisor = yield* QuerySupervisor

      const runQuery = (prompt: string | AsyncIterable<SDKUserMessage>, options?: Options) => {
        const merged = mergeOptions(settings.defaultOptions, options)
        return applyRetry(
          supervisor.submit(prompt, merged),
          settings
        )
      }

      const query = Effect.fn("AgentRuntime.query")(function*(
        prompt: string | AsyncIterable<SDKUserMessage>,
        options?: Options
      ) {
        const handle = yield* runQuery(prompt, options)
        return yield* decorateHandle(handle, settings)
      })

      const queryRaw = Effect.fn("AgentRuntime.queryRaw")(function*(
        prompt: string | AsyncIterable<SDKUserMessage>,
        options?: Options
      ) {
        return yield* runQuery(prompt, options)
      })

      const stream = (prompt: string | AsyncIterable<SDKUserMessage>, options?: Options) =>
        Stream.unwrapScoped(
          query(prompt, options).pipe(Effect.map((handle) => handle.stream))
        )

      return AgentRuntime.of({
        query,
        queryRaw,
        stream,
        stats: supervisor.stats,
        interruptAll: supervisor.interruptAll,
        events: supervisor.events
      })
    })
  )

  /**
   * Convenience layer that wires AgentRuntimeConfig from defaults.
   */
  static readonly layerDefault = AgentRuntime.layer.pipe(
    Layer.provide(AgentRuntimeConfig.layer),
    Layer.provide(QuerySupervisor.layerDefault)
  )

  /**
   * Convenience layer that reads AgentRuntimeConfig from environment variables.
   */
  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    AgentRuntime.layer.pipe(
      Layer.provide(AgentRuntimeConfig.layerFromEnv(prefix)),
      Layer.provide(QuerySupervisor.layerDefaultFromEnv(prefix))
    )

  /**
   * Convenience layer that composes runtime + storage layers with persistence wiring.
   */
  static readonly layerWithPersistence = (options?: PersistenceOptions) => {
    const runtimeLayer = options?.layers?.runtime ?? AgentRuntime.layerDefault
    const chatHistoryLayer = options?.layers?.chatHistory ?? ChatHistoryStore.layerMemory
    const artifactLayer = options?.layers?.artifacts ?? ArtifactStore.layerMemory
    const auditLayer = options?.layers?.auditLog ?? AuditEventStore.layerMemory
    const sessionIndexLayer = options?.layers?.sessionIndex ?? SessionIndexStore.layerMemory
    const storageConfigLayer = options?.layers?.storageConfig ?? StorageConfig.layer
    const syncAuditLayer = layerAuditEventStore.pipe(Layer.provide(auditLayer))

    const layer = Layer.effect(
      AgentRuntime,
      Effect.gen(function*() {
        const runtime = yield* AgentRuntime
        const { settings } = yield* StorageConfig
        const chatHistoryStore = yield* ChatHistoryStore
        const artifactStore = yield* ArtifactStore
        const auditStore = yield* AuditEventStore

        const auditHooks = settings.enabled.auditLog
          ? yield* withAuditLogging("", options?.audit)
          : undefined

        const withAudit = Effect.fn("AgentRuntime.withAuditOptions")(function*(
          opts?: Options
        ) {
          if (!settings.enabled.auditLog) return opts
          const base = opts ?? {}
          let hooks = base.hooks
          if (hooks && (options?.audit?.logPermissionDecisions ?? true)) {
            hooks = yield* wrapPermissionHooks(hooks, "", options?.audit).pipe(
              Effect.provideService(AuditEventStore, auditStore)
            )
          }
          const merged = auditHooks
            ? withHooks({ ...base, hooks }, auditHooks)
            : { ...base, hooks }
          return merged
        })

        const persistArtifact = (message: SDKMessage) =>
          message.type === "user" && message.tool_use_result !== undefined
            ? Effect.gen(function*() {
                if (!settings.enabled.artifacts) return
                const { content, contentType } = resolveToolResultContent(message.tool_use_result)
                const createdAt = yield* Clock.currentTimeMillis
                const sizeBytes = new TextEncoder().encode(content).length
                const record = ArtifactRecord.make({
                  id: makeArtifactId(),
                  sessionId: message.session_id,
                  kind: "tool_result",
                  toolUseId: message.parent_tool_use_id ?? undefined,
                  contentType,
                  encoding: "utf8",
                  content,
                  sizeBytes,
                  createdAt
                })
                yield* artifactStore.put(record)
              }).pipe(Effect.catchAll(() => Effect.void))
            : Effect.void

        const decorate = (handle: QueryHandle) =>
          Effect.gen(function*() {
            let decorated = handle

            if (settings.enabled.chatHistory) {
              decorated = yield* recordHandleWithStore(
                decorated,
                chatHistoryStore,
                options?.history
              )
            }

            if (settings.enabled.artifacts) {
              decorated = {
                ...decorated,
                stream: decorated.stream.pipe(Stream.tap(persistArtifact))
              }
            }

            return decorated
          })

        const query = Effect.fn("AgentRuntime.queryWithPersistence")(
          function*(prompt: string | AsyncIterable<SDKUserMessage>, opts?: Options) {
            const handle = yield* runtime.query(prompt, yield* withAudit(opts))
            return yield* decorate(handle)
          }
        )

        const queryRaw = Effect.fn("AgentRuntime.queryRawWithPersistence")(
          function*(prompt: string | AsyncIterable<SDKUserMessage>, opts?: Options) {
            const handle = yield* runtime.queryRaw(prompt, yield* withAudit(opts))
            return yield* decorate(handle)
          }
        )

        const stream = (prompt: string | AsyncIterable<SDKUserMessage>, opts?: Options) =>
          Stream.unwrapScoped(
            query(prompt, opts).pipe(Effect.map((handle) => handle.stream))
          )

        return AgentRuntime.of({
          query,
          queryRaw,
          stream,
          stats: runtime.stats,
          interruptAll: runtime.interruptAll,
          events: runtime.events
        })
      })
    )

    return layer.pipe(
      Layer.provide(runtimeLayer),
      Layer.provide(chatHistoryLayer),
      Layer.provide(artifactLayer),
      Layer.provide(auditLayer),
      Layer.provide(sessionIndexLayer),
      Layer.provide(storageConfigLayer),
      Layer.provide(syncAuditLayer)
    )
  }

}
