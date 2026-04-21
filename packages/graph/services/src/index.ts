/**
 * Beep Graph service framework.
 *
 * Effect Service + Layer building blocks for writing NATS-based
 * microservices. Provides typed producers, consumers, request/response
 * clients, config hot-reload, and a high-level service runner.
 *
 * @module
 * @since 0.1.0
 */

/**
 * Config push helpers for broadcasting runtime configuration updates.
 *
 * @example
 * ```ts
 * import { ConfigPush } from "@beep/graph-services";
 *
 * const module = ConfigPush;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as ConfigPush from "./ConfigPush.ts";
/**
 * High-level service runner helpers for graph daemons.
 *
 * @example
 * ```ts
 * import { ServiceRunner } from "@beep/graph-services";
 *
 * const module = ServiceRunner;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as ServiceRunner from "./ServiceRunner.ts";
/**
 * Typed NATS consumer helpers for graph services.
 *
 * @example
 * ```ts
 * import { TypedConsumer } from "@beep/graph-services";
 *
 * const module = TypedConsumer;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as TypedConsumer from "./TypedConsumer.ts";
/**
 * Typed NATS producer helpers for graph services.
 *
 * @example
 * ```ts
 * import { TypedProducer } from "@beep/graph-services";
 *
 * const module = TypedProducer;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as TypedProducer from "./TypedProducer.ts";
/**
 * Typed requestor helpers for request/response graph services.
 *
 * @example
 * ```ts
 * import { TypedRequestor } from "@beep/graph-services";
 *
 * const module = TypedRequestor;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as TypedRequestor from "./TypedRequestor.ts";
