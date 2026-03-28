/**
 * A primitive data type schema.
 *
 * @module @beep/schema/Primitive
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("Primitive");

/**
 * A primitive data type schema.
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
 * Type of {@link Primitive} {@inheritDoc Primitive}
 *
 * @category Validation
 * @since 0.0.0
 */
export type Primitive = typeof Primitive.Type;
