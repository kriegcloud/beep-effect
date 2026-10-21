/**
 * Product-neutral Effect driver for the Agent Client Protocol.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * ACP driver error exports.
 *
 * **Example** (Create method not found error)
 *
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
 * Generated ACP generation-2 schema and method metadata exports.
 *
 * **Example** (Log both protocol versions)
 *
 * ```ts
 * import { Schema } from "@beep/acp"
 *
 * console.log(Schema.PROTOCOL_VERSION, Schema.V1_PROTOCOL_VERSION)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export * as Schema from "./Acp.models.ts";
/**
 * Agent-side ACP service exports.
 *
 * **Example** (Access agent service layer)
 *
 * ```ts
 * import { Agent } from "@beep/acp"
 *
 * const layer = Agent.layer
 * console.log(layer)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as Agent from "./AcpAgent.service.ts";
/**
 * Client-side ACP service exports.
 *
 * **Example** (Access ACP client service)
 *
 * ```ts
 * import { Client } from "@beep/acp"
 *
 * const service = Client.AcpClient
 * console.log(service)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export * as Client from "./AcpClient.service.ts";
/**
 * Normalized ACP compatibility exports shared by protocol generations 1 and 2.
 *
 * **Example** (Access the compatibility namespace)
 *
 * ```ts
 * import { Compat } from "@beep/acp"
 *
 * console.log(Compat)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export * as Compat from "./AcpCompat.models.ts";
/**
 * ACP JSON text codec exports.
 *
 * **Example** (Read a JSON text with an escaped key)
 *
 * ```ts
 * import { Json } from "@beep/acp"
 * import * as Result from "effect/Result"
 *
 * console.log(Result.isSuccess(Json.readJsonText('{"\\n":true}')))
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export * as Json from "./AcpJson.codec.ts";
/**
 * ACP transport protocol exports.
 *
 * **Example** (Create patched ACP protocol)
 *
 * ```ts
 * import { Protocol } from "@beep/acp"
 *
 * const make = Protocol.makeAcpPatchedProtocol
 * console.log(make)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export * as Protocol from "./AcpProtocol.service.ts";
/**
 * ACP RPC descriptor exports.
 *
 * **Example** (Access agent RPC group)
 *
 * ```ts
 * import { Rpc } from "@beep/acp"
 *
 * const group = Rpc.AgentRpcs
 * console.log(group)
 * ```
 *
 * @category protocols
 * @since 0.0.0
 */
export * as Rpc from "./AcpRpc.models.ts";
/**
 * Generated ACP generation-1 schema exports.
 *
 * **Example** (Check a generation-1 command input)
 *
 * ```ts
 * import { SchemaV1 } from "@beep/acp"
 * import * as S from "effect/Schema"
 *
 * const isCommand = S.is(SchemaV1.AvailableCommand)
 * console.log(isCommand({ name: "plan", description: "Make a plan", input: { hint: "Task" } }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export * as SchemaV1 from "./AcpV1.models.ts";
