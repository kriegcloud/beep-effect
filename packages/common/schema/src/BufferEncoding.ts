/**
 * A schema module for BufferEncoding string literal's
 *
 * @module @beep/schema/BufferEncoding
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import { LiteralKit } from "./LiteralKit.ts";

const $I = $SchemaId.create("BufferEncoding");

/**
 * Schema for Node.js `BufferEncoding` string literals (`"utf8"`, `"hex"`, `"base64"`, etc.).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { BuffEncoding } from "@beep/schema/BufferEncoding"
 *
 * const encoding = S.decodeUnknownSync(BuffEncoding)("utf8")
 * console.log(encoding) // "utf8"
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const BuffEncoding = LiteralKit([
  "ascii",
  "utf8",
  "utf-8",
  "utf16le",
  "utf-16le",
  "ucs2",
  "ucs-2",
  "base64",
  "base64url",
  "latin1",
  "binary",
  "hex",
]).pipe(
  $I.annoteSchema("BuffEncoding", {
    description: "A BufferEncoding string literal",
  })
);

/**
 * Type of {@link BuffEncoding}. {@inheritDoc BuffEncoding}
 *
 * @example
 * ```ts
 * import type { BufferEncoding } from "@beep/schema/BufferEncoding"
 *
 * const enc: BufferEncoding = "hex"
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type BufferEncoding = typeof BuffEncoding.Type;
