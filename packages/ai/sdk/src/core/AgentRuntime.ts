import * as Clock from "effect/Clock";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Schedule from "effect/Schedule";
import * as ServiceMap from "effect/ServiceMap";
import * as Stream from "effect/Stream";
import { AgentRuntimeConfig, type AgentRuntimeSettings } from "./AgentRuntimeConfig.js";
import type { AgentSdkError } from "./Errors.js";
import { type AuditLoggingOptions, withAuditLogging, wrapPermissionHooks } from "./Hooks/Audit.js";
import { withHooks } from "./Hooks/utils.js";
import { mergeOptions } from "./internal/options.js";
import type { QueryHandle } from "./Query.js";
import { QuerySupervisor } from "./QuerySupervisor.js";
import type { SDKMessage, SDKUserMessage } from "./Schema/Message.js";
import type { Options } from "./Schema/Options.js";
import { ArtifactRecord, type ChatEventSource } from "./Schema/Storage.js";
import type { RecorderOptions } from "./Storage/index.js";
import {
  ArtifactStore,
  AuditEventStore,
  ChatHistoryStore,
  layersFileSystemBunJournaledWithSyncWebSocket,
  SessionIndexStore,
  StorageConfig,
  type StorageSyncLayerOptions,
} from "./Storage/index.js";
import { layerAuditEventStore } from "./Sync/index.js";

type ChatHistoryStoreService = ServiceMap.Service.Shape<typeof ChatHistoryStore>;

const decorateHandle = (handle: QueryHandle, settings: AgentRuntimeSettings) =>
  Effect.gen(function* () {
    let stream = handle.stream;

    if (settings.firstMessageTimeout) {
      const firstMessage = yield* Deferred.make<void>();
      stream = stream.pipe(
        Stream.tap(() => Deferred.succeed(firstMessage, undefined).pipe(Effect.ignore)),
        Stream.ensuring(Deferred.succeed(firstMessage, undefined).pipe(Effect.ignore))
      );

      yield* Effect.forkScoped(
        Deferred.await(firstMessage).pipe(
          Effect.timeoutOption(settings.firstMessageTimeout),
          Effect.flatMap((result) => (Option.isNone(result) ? handle.interrupt.pipe(Effect.ignore) : Effect.void)),
          Effect.asVoid
        )
      );
    }

    if (settings.queryTimeout) {
      yield* Effect.forkScoped(
        Effect.sleep(settings.queryTimeout).pipe(Effect.andThen(handle.interrupt.pipe(Effect.ignore)))
      );
    }

    return {
      ...handle,
      stream,
    };
  });

const applyRetry = <A, E, R>(effect: Effect.Effect<A, E, R>, settings: AgentRuntimeSettings) =>
  settings.retryMaxRetries > 0
    ? effect.pipe(
        Effect.retry(
          Schedule.exponential(settings.retryBaseDelay).pipe(
            Schedule.compose(Schedule.recurs(settings.retryMaxRetries))
          )
        )
      )
    : effect;

/**
 * @since 0.0.0
 */
export type PersistenceLayers = {
  readonly runtime?: Layer.Layer<AgentRuntime, unknown, unknown>;
  readonly chatHistory?: Layer.Layer<ChatHistoryStore, unknown, unknown>;
  readonly artifacts?: Layer.Layer<ArtifactStore, unknown, unknown>;
  readonly auditLog?: Layer.Layer<AuditEventStore, unknown, unknown>;
  readonly sessionIndex?: Layer.Layer<SessionIndexStore, unknown, unknown>;
  readonly storageConfig?: Layer.Layer<StorageConfig, unknown, unknown>;
};

/**
 * @since 0.0.0
 */
export type PersistenceOptions = {
  readonly layers?: PersistenceLayers;
  readonly history?: RecorderOptions;
  readonly audit?: AuditLoggingOptions;
};

/**
 * @since 0.0.0
 */
export type RemoteSyncOptions = StorageSyncLayerOptions & {
  readonly url: string;
  readonly provider?: "bun" | "cloudflare";
  readonly layers?: PersistenceLayers;
  readonly history?: RecorderOptions;
  readonly audit?: AuditLoggingOptions;
};

const makeArtifactId = () => globalThis.crypto?.randomUUID?.() ?? `artifact-${Math.random().toString(36).slice(2)}`;

const resolveToolResultContent = (value: unknown) => {
  if (typeof value === "string") {
    return { content: value, contentType: "text/plain" };
  }
  try {
    return { content: JSON.stringify(value), contentType: "application/json" };
  } catch {
    return { content: String(value), contentType: "text/plain" };
  }
};

const recordHandleWithStore = Effect.fn("AgentRuntime.recordHandleWithStore")(function* (
  handle: QueryHandle,
  store: ChatHistoryStoreService,
  options?: RecorderOptions
) {
  const sessionId = options?.sessionId;
  const outputSource = options?.source ?? "sdk";
  const inputSource = options?.inputSource ?? "external";
  const recordOutput = options?.recordOutput ?? true;
  const recordInput = options?.recordInput ?? false;
  const strict = options?.strict ?? false;

  const recordMessage = (message: SDKMessage, source: ChatEventSource) => {
    const resolvedSessionId = sessionId ?? message.session_id;
    const effect = store.appendMessage(resolvedSessionId, message, { source }).pipe(Effect.asVoid);
    return strict ? effect.pipe(Effect.orDie) : effect.pipe(Effect.catchCause(() => Effect.void));
  };

  const recordMessages = (messages: ReadonlyArray<SDKUserMessage>, source: ChatEventSource) => {
    if (messages.length === 0) return Effect.void;
    const resolvedSessionId = sessionId ?? messages[0]?.session_id;
    if (!resolvedSessionId) return Effect.void;
    const effect = store.appendMessages(resolvedSessionId, messages, { source }).pipe(Effect.asVoid);
    return strict ? effect.pipe(Effect.orDie) : effect.pipe(Effect.catchCause(() => Effect.void));
  };

  const withOutputRecording = (stream: Stream.Stream<SDKMessage, AgentSdkError>) =>
    recordOutput ? stream.pipe(Stream.tap((message) => recordMessage(message, outputSource))) : stream;

  const stream = withOutputRecording(handle.stream);

  const send = recordInput
    ? Effect.fn("AgentRuntime.sendWithHistory")((message: SDKUserMessage) =>
        handle.send(message).pipe(Effect.tap(() => recordMessage(message, inputSource)))
      )
    : handle.send;

  const sendAll = recordInput
    ? Effect.fn("AgentRuntime.sendAllWithHistory")((messages: Iterable<SDKUserMessage>) => {
        const batch = Array.from(messages);
        return handle.sendAll(batch).pipe(Effect.tap(() => recordMessages(batch, inputSource)));
      })
    : handle.sendAll;

  const sendForked = recordInput
    ? Effect.fn("AgentRuntime.sendForkedWithHistory")((message: SDKUserMessage) =>
        Effect.forkScoped(send(message)).pipe(Effect.asVoid)
      )
    : handle.sendForked;

  return {
    ...handle,
    stream,
    send,
    sendAll,
    sendForked,
  };
});

const makeAgentRuntime = Effect.gen(function* () {
  const { settings } = yield* AgentRuntimeConfig;
  const supervisor = yield* QuerySupervisor;

  const runQuery = (prompt: string | AsyncIterable<SDKUserMessage>, options?: Options) => {
    const merged = mergeOptions(settings.defaultOptions, options);
    return applyRetry(supervisor.submit(prompt, merged), settings);
  };

  const query = Effect.fn("AgentRuntime.query")(function* (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ) {
    const handle = yield* runQuery(prompt, options);
    return yield* decorateHandle(handle, settings);
  });

  const queryRaw = Effect.fn("AgentRuntime.queryRaw")(function* (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ) {
    return yield* runQuery(prompt, options);
  });

  const stream = (prompt: string | AsyncIterable<SDKUserMessage>, options?: Options) =>
    Stream.unwrap(query(prompt, options).pipe(Effect.map((handle) => handle.stream)));

  return {
    query,
    queryRaw,
    stream,
    stats: supervisor.stats,
    interruptAll: supervisor.interruptAll,
    events: supervisor.events,
  };
});

/**
 * AgentRuntime composes AgentSdk, QuerySupervisor, and runtime policies.
 */
/**
 * @since 0.0.0
 */
export class AgentRuntime extends ServiceMap.Service<AgentRuntime, Effect.Success<typeof makeAgentRuntime>>()(
  "@effect/claude-agent-sdk/AgentRuntime"
) {
  /**
   * Build the AgentRuntime service using AgentRuntimeConfig.
   */
  static readonly layer = Layer.effect(AgentRuntime, makeAgentRuntime);

  /**
   * Convenience layer that wires AgentRuntimeConfig from defaults.
   */
  static readonly layerDefault = AgentRuntime.layer.pipe(
    Layer.provide(AgentRuntimeConfig.layer),
    Layer.provide(QuerySupervisor.layerDefault)
  );

  /**
   * Convenience layer that reads AgentRuntimeConfig from environment variables.
   */
  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    AgentRuntime.layer.pipe(
      Layer.provide(AgentRuntimeConfig.layerFromEnv(prefix)),
      Layer.provide(QuerySupervisor.layerDefaultFromEnv(prefix))
    );

  /**
   * Convenience layer that composes runtime + storage layers with persistence wiring.
   */
  static readonly layerWithPersistence = (options?: PersistenceOptions) => {
    const runtimeLayer = options?.layers?.runtime ?? AgentRuntime.layerDefault;
    const chatHistoryLayer = options?.layers?.chatHistory ?? ChatHistoryStore.layerMemory;
    const artifactLayer = options?.layers?.artifacts ?? ArtifactStore.layerMemory;
    const auditLayer = options?.layers?.auditLog ?? AuditEventStore.layerMemory;
    const sessionIndexLayer = options?.layers?.sessionIndex ?? SessionIndexStore.layerMemory;
    const storageConfigLayer = options?.layers?.storageConfig ?? StorageConfig.layer;
    const syncAuditLayer = layerAuditEventStore.pipe(Layer.provide(auditLayer));

    const layer = Layer.effect(
      AgentRuntime,
      Effect.gen(function* () {
        const runtime = yield* AgentRuntime;
        const { settings } = yield* StorageConfig;
        const chatHistoryStore = yield* ChatHistoryStore;
        const artifactStore = yield* ArtifactStore;
        const auditStore = yield* AuditEventStore;

        const auditHooks = settings.enabled.auditLog ? yield* withAuditLogging("", options?.audit) : undefined;

        const withAudit = Effect.fn("AgentRuntime.withAuditOptions")(function* (opts?: Options) {
          if (!settings.enabled.auditLog) return opts;
          const base = opts ?? {};
          let hooks = base.hooks;
          if (hooks && (options?.audit?.logPermissionDecisions ?? true)) {
            hooks = yield* wrapPermissionHooks(hooks, "", options?.audit).pipe(
              Effect.provideService(AuditEventStore, auditStore)
            );
          }
          return auditHooks
            ? withHooks(
                {
                  ...base,
                  hooks,
                },
                auditHooks
              )
            : {
                ...base,
                hooks,
              };
        });

        const persistArtifact = (message: SDKMessage) =>
          message.type === "user" && message.tool_use_result !== undefined
            ? Effect.gen(function* () {
                if (!settings.enabled.artifacts) return;
                const { content, contentType } = resolveToolResultContent(message.tool_use_result);
                const createdAt = yield* Clock.currentTimeMillis;
                const sizeBytes = new TextEncoder().encode(content).length;
                const record = ArtifactRecord.make({
                  id: makeArtifactId(),
                  sessionId: message.session_id,
                  kind: "tool_result",
                  toolUseId: message.parent_tool_use_id ?? undefined,
                  contentType,
                  encoding: "utf8",
                  content,
                  sizeBytes,
                  createdAt,
                });
                yield* artifactStore.put(record);
              }).pipe(Effect.catch(() => Effect.void))
            : Effect.void;

        const decorate = (handle: QueryHandle) =>
          Effect.gen(function* () {
            let decorated = handle;

            if (settings.enabled.chatHistory) {
              decorated = yield* recordHandleWithStore(decorated, chatHistoryStore, options?.history);
            }

            if (settings.enabled.artifacts) {
              decorated = {
                ...decorated,
                stream: decorated.stream.pipe(Stream.tap(persistArtifact)),
              };
            }

            return decorated;
          });

        const query = Effect.fn("AgentRuntime.queryWithPersistence")(function* (
          prompt: string | AsyncIterable<SDKUserMessage>,
          opts?: Options
        ) {
          const handle = yield* runtime.query(prompt, yield* withAudit(opts));
          return yield* decorate(handle);
        });

        const queryRaw = Effect.fn("AgentRuntime.queryRawWithPersistence")(function* (
          prompt: string | AsyncIterable<SDKUserMessage>,
          opts?: Options
        ) {
          const handle = yield* runtime.queryRaw(prompt, yield* withAudit(opts));
          return yield* decorate(handle);
        });

        const stream = (prompt: string | AsyncIterable<SDKUserMessage>, opts?: Options) =>
          Stream.unwrap(query(prompt, opts).pipe(Effect.map((handle) => handle.stream)));

        return AgentRuntime.of({
          query,
          queryRaw,
          stream,
          stats: runtime.stats,
          interruptAll: runtime.interruptAll,
          events: runtime.events,
        });
      })
    );

    return layer.pipe(
      Layer.provide(runtimeLayer),
      Layer.provide(chatHistoryLayer),
      Layer.provide(artifactLayer),
      Layer.provide(auditLayer),
      Layer.provide(sessionIndexLayer),
      Layer.provide(storageConfigLayer),
      Layer.provide(syncAuditLayer)
    );
  };

  /**
   * Convenience layer that wires journaled storage with remote sync over WebSocket.
   */
  static readonly layerWithRemoteSync = (options: RemoteSyncOptions) => {
    const provider = options.provider ?? "cloudflare";
    const disablePing = options.disablePing ?? provider === "cloudflare";
    const syncLayers = layersFileSystemBunJournaledWithSyncWebSocket(options.url, {
      disablePing,
      ...(options.directory !== undefined ? { directory: options.directory } : {}),
      ...(options.syncInterval !== undefined ? { syncInterval: options.syncInterval } : {}),
      ...(options.syncChatHistory !== undefined ? { syncChatHistory: options.syncChatHistory } : {}),
      ...(options.syncArtifacts !== undefined ? { syncArtifacts: options.syncArtifacts } : {}),
      ...(options.exposeSync !== undefined ? { exposeSync: options.exposeSync } : {}),
      ...(options.conflictPolicy !== undefined ? { conflictPolicy: options.conflictPolicy } : {}),
    });
    const layers: PersistenceLayers = {
      runtime: options.layers?.runtime ?? AgentRuntime.layerDefault,
      chatHistory: options.layers?.chatHistory ?? syncLayers.chatHistory,
      artifacts: options.layers?.artifacts ?? syncLayers.artifacts,
      auditLog: options.layers?.auditLog ?? syncLayers.auditLog,
      sessionIndex: options.layers?.sessionIndex ?? syncLayers.sessionIndex,
      storageConfig: options.layers?.storageConfig ?? StorageConfig.layer,
    };
    const runtimeLayer = AgentRuntime.layerWithPersistence({
      layers,
      ...(options.history !== undefined ? { history: options.history } : {}),
      ...(options.audit !== undefined ? { audit: options.audit } : {}),
    });

    return syncLayers.sync ? Layer.merge(runtimeLayer, syncLayers.sync) : runtimeLayer;
  };
}
