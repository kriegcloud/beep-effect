/**
 * Namespace-first public module for HTTP status schemas.
 *
 * @example
 * ```ts
 * import * as HttpStatus from "@beep/schema/HttpStatus"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownOption(HttpStatus.Schema)
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
export * from "./HttpStatus.schema.ts";
