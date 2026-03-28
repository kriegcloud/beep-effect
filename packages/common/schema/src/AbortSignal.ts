/**
 * AbortSignal schema.
 *
 * @module @beep/schema/AbortSignal
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("AbortSignal");
/**
 * AbortSignal type guard.
 *
 * @category Validation
 * @since 0.0.0
 * @param u
 * @returns {u is AbortSignal}
 */
export const isAbortSignal = (u: unknown): u is AbortSignal => u instanceof AbortSignal;

/**
 * AbortSignal schema.
 *
 * @category Validation
 * @since 0.0.0
 */
export const AbortSig = S.declare(isAbortSignal).pipe(
  $I.annoteSchema("AbortSig", {
    description: "An instance of an AbortSignal",
  })
);

/**
 * Type of {@link AbortSig} {@inheritDoc AbortSig}
 *
 * @category Validation
 * @since 0.0.0
 */
export type AbortSig = typeof AbortSig.Type;
