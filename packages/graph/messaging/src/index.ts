/**
 * Beep Graph NATS messaging primitives.
 *
 * Effect-based wrappers for NATS JetStream pub/sub with type-safe
 * request/response, streaming, and automatic lifecycle management.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Error types emitted by the graph messaging layer.
 *
 * @example
 * ```ts
 * import { Errors } from "@beep/graph-messaging";
 *
 * const module = Errors;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Errors from "./Errors.ts";
/**
 * NATS client lifecycle helpers and service definitions.
 *
 * @example
 * ```ts
 * import { NatsClient } from "@beep/graph-messaging";
 *
 * const module = NatsClient;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as NatsClient from "./NatsClient.ts";
/**
 * Configuration schema and environment helpers for graph messaging.
 *
 * @example
 * ```ts
 * import { NatsConfig } from "@beep/graph-messaging";
 *
 * const module = NatsConfig;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as NatsConfig from "./NatsConfig.ts";
/**
 * Typed request/response helpers built on top of NATS messaging.
 *
 * @example
 * ```ts
 * import { RequestResponse } from "@beep/graph-messaging";
 *
 * const module = RequestResponse;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as RequestResponse from "./RequestResponse.ts";
/**
 * Response routing helpers for multiplexed graph messaging flows.
 *
 * @example
 * ```ts
 * import { ResponseRouter } from "@beep/graph-messaging";
 *
 * const module = ResponseRouter;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as ResponseRouter from "./ResponseRouter.ts";
