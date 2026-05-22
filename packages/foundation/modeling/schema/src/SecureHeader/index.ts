/**
 * Namespace-first public module for secure HTTP header name schemas.
 *
 * @example
 * ```ts
 * import * as SecureHeader from "@beep/schema/SecureHeader"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownOption(SecureHeader.Schema)
 * console.log(decode)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
/**
 * Public schema module export.
 *
 * @category schemas
 * @since 0.0.0
 */
export * from "./SecureHeader.schema.ts";
