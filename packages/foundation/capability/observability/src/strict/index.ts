/**
 * Strict-tier OTLP export: a serializer gate that turns every trace, metric
 * and log batch into shape-only JSON, an egress client that never sends, and
 * the layer that wires them under Effect's `Otlp.layer`.
 *
 * **Details**
 *
 * This entrypoint imports only the catalog kernel, `effect/observability`
 * and `effect/http`, so a host can use it without pulling the
 * OpenTelemetry SDK into its bundle.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * @category layers
 * @since 0.0.0
 */
export * from "./StrictGate.layer.ts";
/**
 * @category models
 * @since 0.0.0
 */
export * from "./StrictGate.schemas.ts";
/**
 * @category services
 * @since 0.0.0
 */
export * from "./StrictGate.service.ts";
/**
 * @category errors
 * @since 0.0.0
 */
export * from "./StrictSpool.errors.ts";
/**
 * @category layers
 * @since 0.0.0
 */
export * from "./StrictSpool.layer.ts";
/**
 * @category models
 * @since 0.0.0
 */
export * from "./StrictSpool.schemas.ts";
/**
 * @category services
 * @since 0.0.0
 */
export * from "./StrictSpool.service.ts";
/**
 * @category combinators
 * @since 0.0.0
 */
export * from "./StrictTier.behavior.ts";
/**
 * @category models
 * @since 0.0.0
 */
export * from "./StrictTier.schemas.ts";
