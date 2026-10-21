/**
 * ACP generation-1 wire schemas, generated from the pinned `schema-v1.21.0` release.
 *
 * **Details**
 *
 * Generation 1 and generation 2 share most schema names with different shapes, so the two are
 * published as separate subpaths instead of one merged module: `@beep/acp/schema` is generation 2
 * (plus the `AGENT_METHODS`/`V1_AGENT_METHODS` method tables), and `@beep/acp/schema-v1` is this
 * module. Use it to encode and decode messages for peers that negotiate protocol version 1.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Generated ACP generation-1 wire schemas.
 *
 * **Example** (Validate a generation-1 InitializeRequest)
 *
 * ```ts
 * import { InitializeRequest } from "@beep/acp/schema-v1"
 * import * as S from "effect/Schema"
 *
 * const isInitializeRequest = S.is(InitializeRequest)
 * console.log(isInitializeRequest({ protocolVersion: 1, clientInfo: { name: "beep", version: "0.0.0" } }))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export * from "./_generated/schema-v1.gen.ts";
