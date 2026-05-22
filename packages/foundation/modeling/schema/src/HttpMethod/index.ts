/**
 * Namespace-first public module for HTTP method schemas.
 *
 * @example
 * ```ts
 * import * as HttpMethod from "@beep/schema/HttpMethod"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownOption(HttpMethod.Schema)
 * console.log(decode)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
export * from "./HttpMethod.schema.ts";
