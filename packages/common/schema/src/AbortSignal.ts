/**
 * AbortSignal schema.
 *
 * @module
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("AbortSignal");
/**
 * Type guard that checks whether a value is an `AbortSignal` instance.
 *
 * @example
 * ```ts
 * import { isAbortSignal } from "@beep/schema/AbortSignal"
 *
 * const controller = new AbortController()
 * console.log(isAbortSignal(controller.signal)) // true
 * console.log(isAbortSignal("nope")) // false
 * ```
 *
 * @param u - The value to test.
 * @returns Whether the value is an `AbortSignal`.
 * @category Validation
 * @since 0.0.0
 */
export const isAbortSignal = (u: unknown): u is AbortSignal => u instanceof AbortSignal;

/**
 * Declared schema for `AbortSignal` instances.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { AbortSig } from "@beep/schema/AbortSignal"
 *
 * const controller = new AbortController()
 * const signal = S.decodeUnknownSync(AbortSig)(controller.signal)
 * console.log(signal.aborted) // false
 * ```
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
 * {@inheritDoc AbortSig}
 *
 * @example
 * ```ts
 * import type { AbortSig } from "@beep/schema/AbortSignal"
 *
 * const handler = (signal: AbortSig) => signal.aborted
 * ```
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type AbortSig = typeof AbortSig.Type;
