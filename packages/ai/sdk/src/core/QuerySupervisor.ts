import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import {
  Clock,
  Deferred,
  Duration,
  Effect,
  Exit,
  HashMap,
  Layer,
  Match,
  Metric,
  MutableHashMap,
  MutableHashSet,
  PubSub,
  Queue,
  Random,
  Scope,
  Semaphore,
  ServiceMap,
  Stream,
  SynchronizedRef,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { AgentSdk } from "./AgentSdk.js";
import type { AgentSdkError } from "./Errors.js";
import { utcFromMillis } from "./internal/dateTime.js";
import type { QueryHandle } from "./Query.js";
import type { PendingQueueStrategy } from "./QuerySupervisorConfig.js";
import { QuerySupervisorConfig } from "./QuerySupervisorConfig.js";
import {
  QueryPendingCanceledError as QueryPendingCanceledError_,
  QueryPendingTimeoutError as QueryPendingTimeoutError_,
  QueryQueueFullError as QueryQueueFullError_,
  QuerySupervisorError as QuerySupervisorErrorSchema,
  type QuerySupervisorError as QuerySupervisorErrorType,
} from "./QuerySupervisorError.js";
import { SandboxError } from "./Sandbox/SandboxError.js";
import { SandboxService } from "./Sandbox/SandboxService.js";
import type { HookInput } from "./Schema/Hooks.js";
import type { SDKUserMessage } from "./Schema/Message.js";
import type { Options } from "./Schema/Options.js";

const $I = $AiSdkId.create("core/QuerySupervisor");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const QuerySupervisorError = QuerySupervisorErrorSchema;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QuerySupervisorError = QuerySupervisorErrorType;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QuerySupervisorErrorEncoded = typeof QuerySupervisorErrorSchema.Encoded;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryPendingCanceledError = QueryPendingCanceledError_;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryPendingTimeoutError = QueryPendingTimeoutError_;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryQueueFullError = QueryQueueFullError_;

const CompletionStatus = LiteralKit(["success", "failure", "interrupted"]);

const QueryQueuedEvent = S.TaggedStruct("QueryQueued", {
  queryId: S.String,
  submittedAt: S.DateTimeUtcFromMillis,
});

const QueryStartedEvent = S.TaggedStruct("QueryStarted", {
  queryId: S.String,
  startedAt: S.DateTimeUtcFromMillis,
});

const QueryCompletedEvent = S.TaggedStruct("QueryCompleted", {
  queryId: S.String,
  completedAt: S.DateTimeUtcFromMillis,
  status: CompletionStatus,
});

const QueryStartFailedEvent = S.TaggedStruct("QueryStartFailed", {
  queryId: S.String,
  failedAt: S.DateTimeUtcFromMillis,
  errorTag: S.optional(S.String),
});

/**
 * @since 0.0.0
 * @category DomainModel
 */
export const QueryEvent = S.Union([QueryQueuedEvent, QueryStartedEvent, QueryCompletedEvent, QueryStartFailedEvent]);

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QueryEvent = typeof QueryEvent.Type;
/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QueryEventEncoded = typeof QueryEvent.Encoded;

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class QuerySupervisorStats extends S.Class<QuerySupervisorStats>($I`QuerySupervisorStats`)(
  {
    active: S.Number,
    pending: S.Number,
    concurrencyLimit: S.Number,
    pendingQueueCapacity: S.Number,
    pendingQueueStrategy: LiteralKit(["disabled", "suspend", "dropping", "sliding"]),
  },
  {
    identifier: "QuerySupervisorStats",
  }
) {}

/**
 * @since 0.0.0
 * @category DomainModel
 */
export type QuerySupervisorStatsEncoded = typeof QuerySupervisorStats.Encoded;

type PendingRequest = {
  readonly queryId: string;
  readonly prompt: string | AsyncIterable<SDKUserMessage>;
  readonly options?: Options;
  readonly submittedAt: number;
  readonly deferred: Deferred.Deferred<QueryHandle, AgentSdkError | QuerySupervisorErrorType>;
  readonly scope: Scope.Scope;
};

type QueryRequest = Omit<PendingRequest, "deferred">;

type ActiveQuery = {
  readonly queryId: string;
  readonly handle: QueryHandle;
  readonly startedAt: number;
};

const queryStartedMetric = Metric.counter("agent_queries_started", {
  description: "Number of started queries",
  incremental: true,
});

const queryCompletedMetric = Metric.counter("agent_queries_completed", {
  description: "Number of completed queries",
  incremental: true,
});

const queryFailedMetric = Metric.counter("agent_queries_failed", {
  description: "Number of failed query starts",
  incremental: true,
});

const queryDurationMetric = Metric.histogram("agent_query_duration_ms", {
  description: "Query duration in milliseconds",
  boundaries: Metric.boundariesFromIterable([50, 100, 250, 500, 1000, 2000, 5000, 10000, 30000]),
});

const makeQueryId = Effect.fn("QuerySupervisor.makeQueryId")(() =>
  Random.nextUUIDv4.pipe(Effect.map((uuid) => `query-${uuid}`))
);

const makePendingQueue = (strategy: PendingQueueStrategy, capacity: number) => {
  return Match.value(strategy).pipe(
    Match.when("dropping", () => Queue.dropping<PendingRequest>(capacity)),
    Match.when("sliding", () => Queue.sliding<PendingRequest>(capacity)),
    Match.orElse(() => Queue.bounded<PendingRequest>(capacity))
  );
};

const makeEventBus = (strategy: PendingQueueStrategy, capacity: number) => {
  return Match.value(strategy).pipe(
    Match.when("dropping", () => PubSub.dropping<QueryEvent>(capacity)),
    Match.when("sliding", () => PubSub.sliding<QueryEvent>(capacity)),
    Match.orElse(() => PubSub.bounded<QueryEvent>(capacity))
  );
};

const exitStatus = (exit: Exit.Exit<unknown, unknown>): "success" | "failure" | "interrupted" => {
  if (Exit.hasInterrupts(exit)) return "interrupted";
  if (Exit.isFailure(exit)) return "failure";
  return "success";
};

const stripNonSerializableOptions = (options: Options): Options => {
  const {
    hooks: _hooks,
    canUseTool: _canUseTool,
    stderr: _stderr,
    spawnClaudeCodeProcess: _spawnClaudeCodeProcess,
    abortController: _abortController,
    ...rest
  } = options;
  return rest;
};

const extractErrorTag = (error: unknown): string | undefined => {
  if (P.hasProperty(error, "_tag")) {
    const tag = error._tag;
    if (P.isString(tag)) {
      return tag;
    }
  }
  return undefined;
};

const toHookMatcherRegex = (matcher: string) =>
  new RegExp(`^${matcher.replace(/[.+^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*")}$`);

const hookMatcherAllowsInput = (matcher: string | undefined, input: HookInput) => {
  if (!matcher || matcher === "*") return true;
  if ("tool_name" in input) {
    return toHookMatcherRegex(matcher).test(input.tool_name);
  }
  return true;
};

const applySandboxHooks = (handle: QueryHandle, options?: Options): QueryHandle => {
  const hooks = options?.hooks;
  if (!hooks || R.keys(hooks).length === 0) return handle;

  const baseCwd = options?.cwd ?? "";
  const basePermissionMode = options?.permissionMode;

  const makeBaseInput = (sessionId: string) => ({
    session_id: sessionId,
    transcript_path: "",
    cwd: baseCwd,
    ...(basePermissionMode ? { permission_mode: basePermissionMode } : {}),
  });

  const runHookEvent = (event: keyof NonNullable<Options["hooks"]>, input: HookInput, toolUseID?: string) =>
    Effect.forEach(
      hooks[event] ?? [],
      (matcherEntry) => {
        if (!hookMatcherAllowsInput(matcherEntry.matcher, input)) {
          return Effect.void;
        }
        return Effect.forEach(
          matcherEntry.hooks,
          (hook) =>
            Effect.tryPromise({
              try: () => hook(input, toolUseID, { signal: new AbortController().signal }),
              catch: () => undefined,
            }).pipe(Effect.ignore),
          { discard: true }
        );
      },
      { discard: true }
    );

  let sessionStarted = false;
  let sessionId: string | undefined;
  let sessionEnded = false;
  let stopFired = false;
  const toolNames = MutableHashMap.empty<string, string>();
  const preToolFired = MutableHashSet.empty<string>();
  const completedToolUseIds = MutableHashSet.empty<string>();

  const firePostToolUseFailures = (resolvedSessionId: string, errorMessage: string, isInterrupt?: boolean) =>
    Effect.gen(function* () {
      for (const toolUseId of preToolFired) {
        if (MutableHashSet.has(completedToolUseIds, toolUseId)) continue;
        MutableHashSet.add(completedToolUseIds, toolUseId);
        const input: HookInput = {
          ...makeBaseInput(resolvedSessionId),
          hook_event_name: "PostToolUseFailure",
          tool_name: O.getOrElse(MutableHashMap.get(toolNames, toolUseId), () => "unknown"),
          tool_input: {},
          tool_use_id: toolUseId,
          error: errorMessage,
          ...(isInterrupt ? { is_interrupt: true } : {}),
        };
        yield* runHookEvent("PostToolUseFailure", input, toolUseId).pipe(Effect.ignore);
      }
    });

  const fireStop = (resolvedSessionId: string) =>
    stopFired
      ? Effect.void
      : Effect.gen(function* () {
          stopFired = true;
          const stopInput: HookInput = {
            ...makeBaseInput(resolvedSessionId),
            hook_event_name: "Stop",
            stop_hook_active: false,
          };
          yield* runHookEvent("Stop", stopInput).pipe(Effect.ignore);
        });

  const fireSessionEnd = (resolvedSessionId: string) =>
    sessionEnded
      ? Effect.void
      : Effect.gen(function* () {
          sessionEnded = true;
          const input: HookInput = {
            ...makeBaseInput(resolvedSessionId),
            hook_event_name: "SessionEnd",
            reason: "other",
          };
          yield* runHookEvent("SessionEnd", input).pipe(Effect.ignore);
        });

  const stream = handle.stream.pipe(
    Stream.tap((message) =>
      Effect.gen(function* () {
        sessionId = message.session_id;
        if (!sessionStarted) {
          sessionStarted = true;
          const input: HookInput = {
            ...makeBaseInput(message.session_id),
            hook_event_name: "SessionStart",
            source: "startup",
            model: options?.model,
          };
          yield* runHookEvent("SessionStart", input).pipe(Effect.ignore);
        }

        if (message.type === "tool_progress") {
          MutableHashMap.set(toolNames, message.tool_use_id, message.tool_name);
          if (!MutableHashSet.has(preToolFired, message.tool_use_id)) {
            MutableHashSet.add(preToolFired, message.tool_use_id);
            const input: HookInput = {
              ...makeBaseInput(message.session_id),
              hook_event_name: "PreToolUse",
              tool_name: message.tool_name,
              tool_input: {},
              tool_use_id: message.tool_use_id,
            };
            yield* runHookEvent("PreToolUse", input, message.tool_use_id).pipe(Effect.ignore);
          }
        }

        if (message.type === "user" && message.parent_tool_use_id !== null && message.tool_use_result !== undefined) {
          const toolUseId = message.parent_tool_use_id;
          MutableHashSet.add(completedToolUseIds, toolUseId);
          const input: HookInput = {
            ...makeBaseInput(message.session_id),
            hook_event_name: "PostToolUse",
            tool_name: O.getOrElse(MutableHashMap.get(toolNames, toolUseId), () => "unknown"),
            tool_input: {},
            tool_response: message.tool_use_result,
            tool_use_id: toolUseId,
          };
          yield* runHookEvent("PostToolUse", input, toolUseId).pipe(Effect.ignore);
        }

        if (message.type === "result") {
          if (message.subtype !== "success") {
            const fallbackError = `Sandbox query failed with ${message.subtype}`;
            const firstError = "errors" in message ? message.errors[0] : undefined;
            const errorMessage = firstError ?? fallbackError;
            yield* firePostToolUseFailures(message.session_id, errorMessage);
            yield* fireStop(message.session_id);
          }

          yield* fireSessionEnd(message.session_id);
        }
      })
    ),
    Stream.onExit((exit) =>
      Effect.gen(function* () {
        if (!sessionStarted || sessionEnded) return;
        const resolvedSessionId = sessionId ?? "sandbox-session";
        if (Exit.isFailure(exit)) {
          const interrupted = Exit.hasInterrupts(exit);
          const errorMessage = interrupted
            ? "Sandbox query interrupted before emitting result"
            : "Sandbox query terminated before emitting result";
          yield* firePostToolUseFailures(resolvedSessionId, errorMessage, interrupted);
          yield* fireStop(resolvedSessionId);
        }
        yield* fireSessionEnd(resolvedSessionId);
      }).pipe(Effect.ignore)
    )
  );

  return {
    ...handle,
    stream,
  };
};

const makeQuerySupervisor = Effect.gen(function* () {
  const { settings } = yield* QuerySupervisorConfig;
  const sdk = yield* AgentSdk;
  const semaphore = yield* Semaphore.make(settings.concurrencyLimit);
  const activeRef = yield* SynchronizedRef.make(HashMap.empty<string, ActiveQuery>());
  const pendingQueue =
    settings.pendingQueueCapacity > 0
      ? yield* makePendingQueue(settings.pendingQueueStrategy, settings.pendingQueueCapacity)
      : undefined;
  const eventBus = settings.emitEvents
    ? yield* makeEventBus(settings.eventBufferStrategy, settings.eventBufferCapacity)
    : undefined;

  const publishEvent = (event: QueryEvent) =>
    eventBus ? PubSub.publish(eventBus, event).pipe(Effect.asVoid, Effect.ignore) : Effect.void;

  const trackStarted = settings.metricsEnabled ? Metric.update(queryStartedMetric, 1) : Effect.void;
  const trackCompleted = settings.metricsEnabled ? Metric.update(queryCompletedMetric, 1) : Effect.void;
  const trackFailed = settings.metricsEnabled ? Metric.update(queryFailedMetric, 1) : Effect.void;
  const trackDuration = (durationMs: number) =>
    settings.metricsEnabled ? Metric.update(queryDurationMetric, durationMs) : Effect.void;

  const addActive = (active: ActiveQuery) =>
    SynchronizedRef.update(activeRef, (current) => HashMap.set(current, active.queryId, active));

  const removeActive = (queryId: string) =>
    SynchronizedRef.update(activeRef, (current) => HashMap.remove(current, queryId));

  const dispatchQuery = (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ): Effect.Effect<QueryHandle, AgentSdkError, Scope.Scope> =>
    Effect.flatMap(Effect.serviceOption(SandboxService), (sandboxOption) => {
      if (O.isSome(sandboxOption) && sandboxOption.value.isolated) {
        if (!P.isString(prompt)) {
          return Effect.fail(
            SandboxError.make({
              message:
                "Sandbox queries only support string prompts. AsyncIterable<SDKUserMessage> cannot cross the sandbox boundary.",
              operation: "dispatchQuery",
              provider: sandboxOption.value.provider,
            })
          );
        }
        return sandboxOption.value.runAgent(prompt, options ? stripNonSerializableOptions(options) : options).pipe(
          Effect.map((handle) => applySandboxHooks(handle, options)),
          Effect.mapError((error): AgentSdkError => error)
        );
      }
      return sdk.query(prompt, options).pipe(Effect.mapError((error): AgentSdkError => error));
    });

  const startQuery = (request: QueryRequest): Effect.Effect<QueryHandle, AgentSdkError> => {
    const effect = Effect.uninterruptibleMask((restore) =>
      Effect.gen(function* () {
        yield* restore(semaphore.take(1));
        const handle = yield* restore(
          dispatchQuery(request.prompt, request.options).pipe(Scope.provide(request.scope))
        ).pipe(Effect.onError(() => semaphore.release(1)));
        const startedAt = yield* Clock.currentTimeMillis;
        yield* addActive({ queryId: request.queryId, handle, startedAt });
        yield* Scope.addFinalizerExit(request.scope, (exit) =>
          Effect.gen(function* () {
            const completedAt = yield* Clock.currentTimeMillis;
            yield* removeActive(request.queryId);
            yield* semaphore.release(1);
            yield* trackCompleted;
            yield* trackDuration(completedAt - startedAt);
            yield* publishEvent({
              _tag: "QueryCompleted",
              queryId: request.queryId,
              completedAt: utcFromMillis(completedAt),
              status: exitStatus(exit),
            });
          }).pipe(Effect.ignore)
        );
        yield* trackStarted;
        yield* publishEvent({
          _tag: "QueryStarted",
          queryId: request.queryId,
          startedAt: utcFromMillis(startedAt),
        });
        return handle;
      })
    ).pipe(
      Effect.tapError((error) =>
        Effect.gen(function* () {
          const failedAt = yield* Clock.currentTimeMillis;
          yield* trackFailed;
          yield* publishEvent({
            _tag: "QueryStartFailed",
            queryId: request.queryId,
            failedAt: utcFromMillis(failedAt),
            errorTag: extractErrorTag(error),
          });
        })
      )
    );

    return settings.tracingEnabled
      ? effect.pipe(
          Effect.withSpan("agent.query", {
            attributes: { "query.id": request.queryId },
          })
        )
      : effect;
  };

  const submit = Effect.fn("QuerySupervisor.submit")(function* (
    prompt: string | AsyncIterable<SDKUserMessage>,
    options?: Options
  ) {
    const scope = yield* Effect.scope;
    const queryId = yield* makeQueryId();
    const submittedAt = yield* Clock.currentTimeMillis;
    const request: QueryRequest =
      options === undefined
        ? {
            queryId,
            prompt,
            submittedAt,
            scope,
          }
        : {
            queryId,
            prompt,
            options,
            submittedAt,
            scope,
          };

    if (!pendingQueue) {
      return yield* startQuery(request);
    }

    const deferred = yield* Deferred.make<QueryHandle, AgentSdkError | QuerySupervisorErrorType>();
    const pending: PendingRequest = { ...request, deferred };

    yield* Scope.addFinalizer(
      scope,
      Deferred.fail(
        deferred,
        new QueryPendingCanceledError({
          message: "Query was canceled before it started",
          queryId,
        })
      ).pipe(Effect.ignore)
    );

    const offer = yield* Queue.offer(pendingQueue, pending);
    if (settings.pendingQueueStrategy === "dropping" && !offer) {
      const error = new QueryQueueFullError({
        message: "Pending queue is full",
        queryId,
        capacity: settings.pendingQueueCapacity,
        strategy: settings.pendingQueueStrategy,
      });
      yield* Deferred.fail(deferred, error).pipe(Effect.ignore);
      return yield* error;
    }

    yield* publishEvent({
      _tag: "QueryQueued",
      queryId,
      submittedAt: utcFromMillis(submittedAt),
    });

    const awaitHandle = Deferred.await(deferred);
    if (settings.maxPendingTime) {
      const timeoutMs = Duration.toMillis(settings.maxPendingTime);
      const timeoutError = new QueryPendingTimeoutError({
        message: "Query did not start within maxPendingTime",
        queryId,
        timeoutMs,
      });
      return yield* awaitHandle.pipe(
        Effect.timeoutOrElse({
          duration: settings.maxPendingTime,
          onTimeout: () =>
            Deferred.fail(deferred, timeoutError).pipe(Effect.ignore, Effect.andThen(Effect.fail(timeoutError))),
        })
      );
    }

    return yield* awaitHandle;
  });

  const submitStream = (prompt: string | AsyncIterable<SDKUserMessage>, options?: Options) =>
    Stream.unwrap(submit(prompt, options).pipe(Effect.map((handle) => handle.stream)));

  const stats = Effect.gen(function* () {
    const active = yield* SynchronizedRef.get(activeRef).pipe(Effect.map((current) => HashMap.size(current)));
    const pending = pendingQueue ? Math.max(0, yield* Queue.size(pendingQueue)) : 0;
    return new QuerySupervisorStats({
      active,
      pending,
      concurrencyLimit: settings.concurrencyLimit,
      pendingQueueCapacity: pendingQueue ? settings.pendingQueueCapacity : 0,
      pendingQueueStrategy: pendingQueue ? settings.pendingQueueStrategy : "disabled",
    });
  });

  const interruptAll = Effect.gen(function* () {
    const active = yield* SynchronizedRef.get(activeRef);
    const handles = A.map(A.fromIterable(HashMap.values(active)), (entry) => entry.handle);
    yield* Effect.forEach(
      handles,
      (handle) =>
        Effect.all([handle.closeInput, handle.interrupt], {
          concurrency: "unbounded",
          discard: true,
        }).pipe(Effect.ignore),
      { concurrency: "unbounded", discard: true }
    );
  });

  const events = eventBus ? Stream.fromPubSub(eventBus) : Stream.empty;

  if (pendingQueue) {
    yield* Effect.forkScoped(
      Effect.forever(
        Effect.gen(function* () {
          const pending = yield* Queue.take(pendingQueue);
          const done = yield* Deferred.isDone(pending.deferred);
          if (done) return;
          const exit = yield* Effect.exit(startQuery(pending));
          const completed = yield* Deferred.done(pending.deferred, exit);
          if (!completed && Exit.isSuccess(exit)) {
            yield* exit.value.interrupt.pipe(Effect.ignore);
          }
        })
      ).pipe(Effect.catchCause(() => Effect.void))
    );
  }

  yield* Effect.addFinalizer(() =>
    Effect.all(
      [
        interruptAll.pipe(Effect.ignore),
        pendingQueue ? Queue.shutdown(pendingQueue).pipe(Effect.ignore) : Effect.void,
        eventBus ? PubSub.shutdown(eventBus).pipe(Effect.ignore) : Effect.void,
      ],
      {
        concurrency: "unbounded",
        discard: true,
      }
    )
  );

  return {
    submit,
    submitStream,
    stats,
    interruptAll,
    events,
  };
});

/**
 * @since 0.0.0
 * @category PortContract
 */
export interface QuerySupervisorShape extends Effect.Success<typeof makeQuerySupervisor> {}

/**
 * Supervisor for running Claude Agent SDK queries with concurrency limits.
 */
/**
 * @since 0.0.0
 * @category PortContract
 */
export class QuerySupervisor extends ServiceMap.Service<QuerySupervisor, QuerySupervisorShape>()($I`QuerySupervisor`) {
  /**
   * Build the QuerySupervisor service using QuerySupervisorConfig.
   */
  static readonly layer = Layer.effect(QuerySupervisor, makeQuerySupervisor);

  /**
   * Convenience layer that wires QuerySupervisorConfig from defaults.
   */
  static readonly layerDefault = QuerySupervisor.layer.pipe(
    Layer.provide(QuerySupervisorConfig.layer),
    Layer.provide(AgentSdk.layerDefault)
  );

  /**
   * Convenience layer that reads QuerySupervisorConfig from environment variables.
   */
  static readonly layerDefaultFromEnv = (prefix = "AGENTSDK") =>
    QuerySupervisor.layer.pipe(
      Layer.provide(QuerySupervisorConfig.layerFromEnv(prefix)),
      Layer.provide(AgentSdk.layerDefaultFromEnv(prefix))
    );
}
