/**
 * Product-neutral Effect driver for the Agent Client Protocol.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version for `@beep/acp`.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/acp"
 *
 * console.log(VERSION)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Agent-side ACP service exports.
 *
 * @example
 * ```ts
 * import { Agent } from "@beep/acp"
 *
 * const layer = Agent.layer
 * void layer
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Agent from "./agent.ts";

/**
 * Client-side ACP service exports.
 *
 * @example
 * ```ts
 * import { Client } from "@beep/acp"
 *
 * const service = Client.AcpClient
 * void service
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Client from "./client.ts";

/**
 * ACP driver error exports.
 *
 * @example
 * ```ts
 * import { Errors } from "@beep/acp"
 *
 * const error = Errors.AcpRequestError.methodNotFound("x/test")
 * console.log(error.code)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Errors from "./errors.ts";

/**
 * ACP transport protocol exports.
 *
 * @example
 * ```ts
 * import { Protocol } from "@beep/acp"
 *
 * const make = Protocol.makeAcpPatchedProtocol
 * void make
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Protocol from "./protocol.ts";

/**
 * ACP RPC descriptor exports.
 *
 * @example
 * ```ts
 * import { Rpc } from "@beep/acp"
 *
 * const group = Rpc.AgentRpcs
 * void group
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Rpc from "./rpc.ts";

/**
 * Generated ACP schema exports.
 *
 * @example
 * ```ts
 * import { Schema } from "@beep/acp"
 *
 * console.log(Schema.PROTOCOL_VERSION)
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Schema from "./schema.ts";

/**
 * ACP terminal handle exports.
 *
 * @example
 * ```ts
 * import { Terminal } from "@beep/acp"
 *
 * const make = Terminal.makeTerminal
 * void make
 * ```
 *
 * @category exports
 * @since 0.0.0
 */
export * as Terminal from "./terminal.ts";
