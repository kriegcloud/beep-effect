/**
 * Namespace-first public module for blockchain transaction hash schemas.
 *
 * @example
 * ```ts
 * import * as CryptoTxnHash from "@beep/schema/CryptoTxnHash"
 * import * as S from "effect/Schema"
 *
 * const decode = S.decodeUnknownOption(CryptoTxnHash.Schema)
 * console.log(decode)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
export * from "./CryptoTxnHash.schema.ts";
