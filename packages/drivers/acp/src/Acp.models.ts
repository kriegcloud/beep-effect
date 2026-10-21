/**
 * ACP generation-2 wire schemas and the method tables of both protocol generations.
 *
 * **Details**
 *
 * The schemas are generated from the pinned `schema-v2.0.0-alpha.3` release. The method tables
 * cover generation 2 (`AGENT_METHODS`, `CLIENT_METHODS`, `PROTOCOL_VERSION`) and generation 1
 * (`V1_AGENT_METHODS`, `V1_CLIENT_METHODS`, `V1_PROTOCOL_VERSION`, from `schema-v1.21.0`).
 * Generation-1 schemas live in `@beep/acp/schema-v1`, and the normalized client surface in
 * `@beep/acp/compat`. This module has no generation-1 aliases: `LoadSessionRequest` or
 * `SessionNotification` are generation-1 names and are only exported by `@beep/acp/schema-v1`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Generated ACP method tables and protocol versions for both generations.
 *
 * **Example** (Log the initialize method and both protocol versions)
 *
 * ```ts
 * import { AGENT_METHODS, PROTOCOL_VERSION, V1_PROTOCOL_VERSION } from "@beep/acp/schema"
 *
 * console.log(AGENT_METHODS.initialize, PROTOCOL_VERSION, V1_PROTOCOL_VERSION) // "initialize" 2 1
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * from "./_generated/meta.gen.ts";
/**
 * Generated ACP generation-2 wire schemas.
 *
 * **Example** (Validate a generation-2 InitializeRequest)
 *
 * ```ts
 * import { InitializeRequest } from "@beep/acp/schema"
 * import * as S from "effect/Schema"
 *
 * const isInitializeRequest = S.is(InitializeRequest)
 * console.log(
 *   isInitializeRequest({
 *     protocolVersion: 2,
 *     info: { name: "beep", version: "0.0.0" },
 *     capabilities: { auth: { terminal: {} } }
 *   })
 * ) // true
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export * from "./_generated/schema.gen.ts";
