/**
 * A primitive data type schema.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Primitive");

/**
 * Schema for JavaScript primitive types (`string | number | boolean | bigint | null | undefined`).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Primitive } from "@beep/schema/Primitive"
 *
 * S.decodeUnknownSync(Primitive)("hello")
 * S.decodeUnknownSync(Primitive)(42)
 * S.decodeUnknownSync(Primitive)(null)
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const Primitive = S.Union([S.String, S.Number, S.Boolean, S.BigInt, S.Null, S.Undefined]).pipe(
  $I.annoteSchema("Primitive", {
    description: "A primitive data type, (string | number | boolean | bigint | null | undefined )",
  })
);

/**
 * {@inheritDoc Primitive}
 *
 * @example
 * ```ts
 * import type { Primitive } from "@beep/schema/Primitive"
 *
 * const value: Primitive = "hello"
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type Primitive = typeof Primitive.Type;
