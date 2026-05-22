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
 * @category errors
 * @since 0.0.0
 */
export * as Errors from "./Acp.errors.ts";

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
 * @category schemas
 * @since 0.0.0
 */
export * as Schema from "./Acp.models.ts";

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
 * @category services
 * @since 0.0.0
 */
export * as Agent from "./AcpAgent.service.ts";

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
 * @category services
 * @since 0.0.0
 */
export * as Client from "./AcpClient.service.ts";

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
 * @category protocols
 * @since 0.0.0
 */
export * as Protocol from "./AcpProtocol.service.ts";

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
 * @category protocols
 * @since 0.0.0
 */
export * as Rpc from "./AcpRpc.models.ts";

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
 * @category resources
 * @since 0.0.0
 */
export * as Terminal from "./AcpTerminal.models.ts";
