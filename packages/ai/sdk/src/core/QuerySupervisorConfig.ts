import { Config, Duration, Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { layerConfigFromEnv } from "./internal/config.js";

/**
 * @since 0.0.0
 */
export const PendingQueueStrategy = S.Literals(["suspend", "dropping", "sliding"]);

/**
 * @since 0.0.0
 */
export type PendingQueueStrategy = typeof PendingQueueStrategy.Type;

/**
 * @since 0.0.0
 */
export type QuerySupervisorSettings = {
  readonly concurrencyLimit: number;
  readonly pendingQueueCapacity: number;
  readonly pendingQueueStrategy: PendingQueueStrategy;
  readonly maxPendingTime: Duration.Duration | undefined;
  readonly emitEvents: boolean;
  readonly eventBufferCapacity: number;
  readonly eventBufferStrategy: PendingQueueStrategy;
  readonly metricsEnabled: boolean;
  readonly tracingEnabled: boolean;
};

const defaultSettings: QuerySupervisorSettings = {
  concurrencyLimit: 4,
  pendingQueueCapacity: 64,
  pendingQueueStrategy: "suspend",
  maxPendingTime: Duration.seconds(30),
  emitEvents: false,
  eventBufferCapacity: 256,
  eventBufferStrategy: "sliding",
  metricsEnabled: false,
  tracingEnabled: false,
};

const resolveSettings = (overrides?: Partial<QuerySupervisorSettings>): QuerySupervisorSettings => {
  const merged = {
    ...defaultSettings,
    ...overrides,
  };
  return {
    ...merged,
    concurrencyLimit: Math.max(1, merged.concurrencyLimit),
    pendingQueueCapacity: Math.max(0, merged.pendingQueueCapacity),
    eventBufferCapacity: Math.max(1, merged.eventBufferCapacity),
  };
};

const makeQuerySupervisorConfig = Effect.gen(function* () {
  const concurrencyLimit = yield* Config.option(Config.int("CONCURRENCY_LIMIT"));
  const pendingQueueCapacity = yield* Config.option(Config.int("PENDING_QUEUE_CAPACITY"));
  const pendingQueueStrategy = yield* Config.option(Config.schema(PendingQueueStrategy, "PENDING_QUEUE_STRATEGY"));
  const maxPendingTime = yield* Config.option(Config.duration("MAX_PENDING_TIME"));
  const emitEvents = yield* Config.option(Config.boolean("EMIT_EVENTS"));
  const eventBufferCapacity = yield* Config.option(Config.int("EVENT_BUFFER_CAPACITY"));
  const eventBufferStrategy = yield* Config.option(Config.schema(PendingQueueStrategy, "EVENT_BUFFER_STRATEGY"));
  const metricsEnabled = yield* Config.option(Config.boolean("METRICS_ENABLED"));
  const tracingEnabled = yield* Config.option(Config.boolean("TRACING_ENABLED"));

  const settings: QuerySupervisorSettings = {
    concurrencyLimit: Math.max(
      1,
      O.getOrElse(concurrencyLimit, () => defaultSettings.concurrencyLimit)
    ),
    pendingQueueCapacity: Math.max(
      0,
      O.getOrElse(pendingQueueCapacity, () => defaultSettings.pendingQueueCapacity)
    ),
    pendingQueueStrategy: O.getOrElse(pendingQueueStrategy, () => defaultSettings.pendingQueueStrategy),
    maxPendingTime: O.getOrElse(maxPendingTime, () => defaultSettings.maxPendingTime),
    emitEvents: O.getOrElse(emitEvents, () => defaultSettings.emitEvents),
    eventBufferCapacity: Math.max(
      1,
      O.getOrElse(eventBufferCapacity, () => defaultSettings.eventBufferCapacity)
    ),
    eventBufferStrategy: O.getOrElse(eventBufferStrategy, () => defaultSettings.eventBufferStrategy),
    metricsEnabled: O.getOrElse(metricsEnabled, () => defaultSettings.metricsEnabled),
    tracingEnabled: O.getOrElse(tracingEnabled, () => defaultSettings.tracingEnabled),
  };

  return { settings };
});

/**
 * @since 0.0.0
 */
export class QuerySupervisorConfig extends ServiceMap.Service<
  QuerySupervisorConfig,
  {
    settings: QuerySupervisorSettings;
  }
>()("@effect/claude-agent-sdk/QuerySupervisorConfig") {
  /**
   * Build QuerySupervisorConfig by reading configuration from environment variables.
   */
  static readonly layerFromEnv = (prefix = "AGENTSDK") =>
    QuerySupervisorConfig.layer.pipe(Layer.provide(layerConfigFromEnv(prefix)));

  /**
   * Default configuration layer for QuerySupervisor.
   */
  static readonly layer = Layer.effect(QuerySupervisorConfig, makeQuerySupervisorConfig);

  /**
   * Build QuerySupervisorConfig with explicit overrides applied to defaults.
   */
  static readonly layerWith = (overrides?: Partial<QuerySupervisorSettings>) =>
    Layer.effect(
      QuerySupervisorConfig,
      Effect.succeed({
        settings: resolveSettings(overrides),
      })
    );
}
