/**
 * Configuration service for NATS connectivity.
 *
 * Provides a `NatsConfig` context service that carries connection parameters
 * (URL, reconnection policy) needed by downstream NATS client layers.
 *
 * Two pre-built layers are attached:
 * - `NatsConfig.layer` -- reads from environment variables
 * - `NatsConfig.layerLocal` -- zero-config local development defaults
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { NatsConfig } from "@beep/graph-messaging/NatsConfig"
 *
 * const program = Effect.gen(function* () {
 *   const config = yield* NatsConfig
 *   yield* Effect.log(`Connecting to NATS at ${config.url}`)
 * })
 *
 * // Run with env-var configuration
 * program.pipe(Effect.provide(NatsConfig.layer))
 *
 * // Run with local development defaults
 * program.pipe(Effect.provide(NatsConfig.layerLocal))
 * ```
 *
 * @since 0.0.0
 * @module @beep/graph-messaging/NatsConfig
 */
import { Config, Context, Effect, Layer } from "effect";
import * as S from "effect/Schema";

// ---------------------------------------------------------------------------
// Config data schema
// ---------------------------------------------------------------------------

/**
 * Typed data carrier for NATS connection configuration.
 *
 * @since 0.0.0
 * @category models
 */
export class NatsConfigData extends S.Class<NatsConfigData>("@beep/graph-messaging/NatsConfigData")({
  /** NATS server URL (e.g. `"nats://localhost:4222"`). */
  url: S.String,
  /** Maximum number of automatic reconnection attempts before giving up. */
  maxReconnects: S.Number,
  /** Delay in milliseconds between reconnection attempts. */
  reconnectDelayMs: S.Number,
}) {}

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

/** @internal */
const defaults = {
  url: "nats://localhost:4222",
  maxReconnects: 10,
  reconnectDelayMs: 2000,
} as const satisfies typeof NatsConfigData.Encoded;

// ---------------------------------------------------------------------------
// Context service
// ---------------------------------------------------------------------------

/**
 * Context service providing NATS connection configuration.
 *
 * Yield this tag inside `Effect.gen` to access connection parameters
 * without hard-coding them in infrastructure code.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import { NatsConfig } from "@beep/graph-messaging/NatsConfig"
 *
 * const program = Effect.gen(function* () {
 *   const { url, maxReconnects } = yield* NatsConfig
 *   yield* Effect.log(`NATS url=${url} maxReconnects=${maxReconnects}`)
 * })
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class NatsConfig extends Context.Service<NatsConfig, NatsConfigData>()("@beep/graph-messaging/NatsConfig") {
  // -------------------------------------------------------------------------
  // Config loading
  // -------------------------------------------------------------------------

  /**
   * Loads NATS configuration from environment variables.
   *
   * | Env var                     | Field              | Default                    |
   * | --------------------------- | ------------------ | -------------------------- |
   * | `NATS_URL`                  | `url`              | `"nats://localhost:4222"`  |
   * | `NATS_MAX_RECONNECTS`       | `maxReconnects`    | `10`                       |
   * | `NATS_RECONNECT_DELAY_MS`   | `reconnectDelayMs` | `2000`                     |
   *
   * @since 0.0.0
   * @category configuration
   */
  static readonly config = Config.all({
    url: Config.string("NATS_URL").pipe(Config.withDefault(defaults.url)),
    maxReconnects: Config.int("NATS_MAX_RECONNECTS").pipe(Config.withDefault(defaults.maxReconnects)),
    reconnectDelayMs: Config.int("NATS_RECONNECT_DELAY_MS").pipe(Config.withDefault(defaults.reconnectDelayMs)),
  });

  // -------------------------------------------------------------------------
  // Layers
  // -------------------------------------------------------------------------

  /**
   * Layer that resolves `NatsConfig` from environment variables.
   *
   * Falls back to sensible defaults when variables are absent, so the layer
   * never fails in practice. `Config.ConfigError` is kept in the error
   * channel for callers that care about strictness.
   *
   * @since 0.0.0
   * @category layers
   */
  static readonly layer: Layer.Layer<NatsConfig, Config.ConfigError> = Layer.effect(
    NatsConfig,
    Effect.gen(function* () {
      const resolved = yield* NatsConfig.config;
      return NatsConfig.of(new NatsConfigData(resolved));
    })
  );

  /**
   * Layer that provides local development defaults without reading any
   * environment variables.
   *
   * Useful for REPL sessions, integration tests, and local `docker-compose`
   * setups where the NATS server is available on `localhost:4222`.
   *
   * @since 0.0.0
   * @category layers
   */
  static readonly layerLocal: Layer.Layer<NatsConfig> = Layer.succeed(
    NatsConfig,
    NatsConfig.of(new NatsConfigData(defaults))
  );
}
