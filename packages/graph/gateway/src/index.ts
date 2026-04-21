/**
 * Beep Graph HTTP gateway.
 *
 * Effect HttpApi definition with schema-first REST endpoints,
 * WebSocket protocol types, and wire format transforms.
 *
 * @module
 * @since 0.1.0
 */

/**
 * HTTP API contracts for the Beep Graph gateway.
 *
 * @example
 * ```ts
 * import { Api } from "@beep/graph-gateway";
 *
 * const module = Api;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Api from "./Api.ts";
/**
 * Gateway-specific error models and helpers.
 *
 * @example
 * ```ts
 * import { Errors } from "@beep/graph-gateway";
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
 * Telemetry helpers for tracing and observability at the gateway boundary.
 *
 * @example
 * ```ts
 * import { Telemetry } from "@beep/graph-gateway";
 *
 * const module = Telemetry;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as Telemetry from "./Telemetry.ts";
/**
 * WebSocket protocol helpers exposed by the gateway package.
 *
 * @example
 * ```ts
 * import { WebSocket } from "@beep/graph-gateway";
 *
 * const module = WebSocket;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as WebSocket from "./WebSocket.ts";
/**
 * Gateway wire-format codecs and transform helpers.
 *
 * @example
 * ```ts
 * import { WireFormat } from "@beep/graph-gateway";
 *
 * const module = WireFormat;
 * console.log(module);
 * ```
 *
 * @since 0.1.0
 * @category modules
 */
export * as WireFormat from "./WireFormat.ts";
