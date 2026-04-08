import { $ObservabilityId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Context, Effect, HashMap, Layer, MutableRef, Queue } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type * as DevToolsSchema from "effect/unstable/devtools/DevToolsSchema";
import * as DevToolsServer from "effect/unstable/devtools/DevToolsServer";
import * as SocketServer from "effect/unstable/socket/SocketServer";

const $I = $ObservabilityId.create("experimental/server/DevToolsRelay");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const maxSpanEvents = 200;

/**
 * Summary of the in-memory relay state.
 *
 * @example
 * ```typescript
 * import { DevToolsSnapshot } from "@beep/observability/experimental/server"
 *
 * void DevToolsSnapshot
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class DevToolsSnapshot extends S.Class<DevToolsSnapshot>($I`DevToolsSnapshot`)(
  {
    spanCount: NonNegativeInt,
    spanEventCount: NonNegativeInt,
    metricCount: NonNegativeInt,
    lastUpdatedAtMs: NonNegativeInt,
  },
  $I.annote("DevToolsSnapshot", {
    description: "Summary of the in-memory relay state.",
  })
) {}

/**
 * Service for ingesting and snapshotting devtools traffic.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { DevToolsRelayService } from "@beep/observability/experimental/server"
 *
 * const program = Effect.gen(function* () {
 *   const relay = yield* DevToolsRelayService
 *   const snapshot = yield* relay.snapshot
 *   void snapshot
 * })
 *
 * void program
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export class DevToolsRelayService extends Context.Service<
  DevToolsRelayService,
  {
    readonly ingest: (request: DevToolsSchema.Request.WithoutPing) => Effect.Effect<void>;
    readonly snapshot: Effect.Effect<DevToolsSnapshot>;
    readonly latestSpans: Effect.Effect<ReadonlyArray<DevToolsSchema.Span>>;
    readonly latestMetrics: Effect.Effect<O.Option<DevToolsSchema.MetricsSnapshot>>;
    readonly clear: Effect.Effect<void>;
    readonly address: Effect.Effect<SocketServer.Address>;
  }
>()("@beep/observability/experimental/server/DevToolsRelay/DevToolsRelayService") {}

type RelayState = {
  readonly spans: HashMap.HashMap<string, DevToolsSchema.Span>;
  readonly spanEvents: ReadonlyArray<DevToolsSchema.SpanEvent>;
  readonly metrics: O.Option<DevToolsSchema.MetricsSnapshot>;
  readonly lastUpdatedAtMs: number;
};

const emptyRelayState = (): RelayState => ({
  spans: HashMap.empty(),
  spanEvents: A.empty(),
  metrics: O.none(),
  lastUpdatedAtMs: Date.now(),
});

const toSpanKey = (span: Pick<DevToolsSchema.Span, "traceId" | "spanId">): string => `${span.traceId}:${span.spanId}`;

/**
 * Create the in-memory relay service without starting a socket server.
 *
 * @example
 * ```typescript
 * import { makeDevToolsRelayService } from "@beep/observability/experimental/server"
 *
 * void makeDevToolsRelayService
 * ```
 *
 * @since 0.0.0
 * @category constructors
 */
export const makeDevToolsRelayService: Effect.Effect<
  DevToolsRelayService["Service"],
  never,
  SocketServer.SocketServer
> = Effect.gen(function* () {
  const server = yield* SocketServer.SocketServer;
  const state = MutableRef.make<RelayState>(emptyRelayState());

  return DevToolsRelayService.of({
    ingest: (request) =>
      Effect.sync(() => {
        const current = MutableRef.get(state);
        const lastUpdatedAtMs = Date.now();
        const next: RelayState =
          request._tag === "Span"
            ? {
                ...current,
                spans: HashMap.set(current.spans, toSpanKey(request), request),
                lastUpdatedAtMs,
              }
            : request._tag === "SpanEvent"
              ? {
                  ...current,
                  spanEvents: pipeAppendLimited(current.spanEvents, request),
                  lastUpdatedAtMs,
                }
              : {
                  ...current,
                  metrics: O.some(request),
                  lastUpdatedAtMs,
                };

        MutableRef.set(state, next);
      }),
    snapshot: Effect.sync(() => {
      const current = MutableRef.get(state);
      const metricCount = O.match(current.metrics, {
        onNone: () => 0,
        onSome: (snapshot) => snapshot.metrics.length,
      });

      return new DevToolsSnapshot({
        spanCount: decodeNonNegativeInt(HashMap.size(current.spans)),
        spanEventCount: decodeNonNegativeInt(current.spanEvents.length),
        metricCount: decodeNonNegativeInt(metricCount),
        lastUpdatedAtMs: decodeNonNegativeInt(current.lastUpdatedAtMs),
      });
    }),
    latestSpans: Effect.sync(() => A.fromIterable(HashMap.values(MutableRef.get(state).spans))),
    latestMetrics: Effect.sync(() => MutableRef.get(state).metrics),
    clear: Effect.sync(() => void MutableRef.set(state, emptyRelayState())),
    address: Effect.sync(() => server.address),
  });
});

const pipeAppendLimited = <A>(values: ReadonlyArray<A>, value: A): ReadonlyArray<A> => {
  const appended = A.append(values, value);
  return appended.length <= maxSpanEvents ? appended : A.takeRight(appended, maxSpanEvents);
};

/**
 * Start a websocket relay using `DevToolsServer.run`.
 *
 * @example
 * ```typescript
 * import { layerDevToolsRelayServer } from "@beep/observability/experimental/server"
 *
 * void layerDevToolsRelayServer
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerDevToolsRelayServer: Layer.Layer<
  DevToolsRelayService,
  SocketServer.SocketServerError,
  SocketServer.SocketServer
> = Layer.effect(DevToolsRelayService, makeDevToolsRelayService).pipe(
  Layer.tap((services) => {
    const relay = Context.get(services, DevToolsRelayService);

    return DevToolsServer.run((client) =>
      Effect.gen(function* () {
        yield* client.send({ _tag: "MetricsRequest" });

        while (true) {
          const request = yield* Queue.take(client.queue);
          yield* relay.ingest(request);
        }
      })
    ).pipe(Effect.forkScoped);
  })
);
