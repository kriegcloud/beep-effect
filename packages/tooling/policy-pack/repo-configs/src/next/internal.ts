/**
 * Internal helpers shared by Next.js config schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

/**
 * Convert a raw schema issue into the public SchemaError boundary type.
 *
 * @internal
 * @param cause - Schema issue reported by an Effect schema decoder.
 * @returns Schema error suitable for Result and decoding boundaries.
 * @category utilities
 * @since 0.0.0
 */
export const schemaIssueToError = (cause: S.SchemaError["issue"]): S.SchemaError => new S.SchemaError(cause);

/**
 * Guard unknown values that must be callable plugin/config hooks.
 *
 * @internal
 * @param value - Unknown value to test for callability.
 * @returns Whether the value is a JavaScript function.
 * @category predicates
 * @since 0.0.0
 */
export const isFunctionValue = <A extends Function>(value: unknown): value is A => P.isFunction(value);
