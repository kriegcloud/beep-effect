/**
 * Attach static methods to a schema.
 *
 * @module @beep/schema/utils/withStatics
 * @since 0.0.0
 */
import { dual } from "effect/Function";

/**
 * Attach static methods to a schema object. Designed to be used with `.pipe()`:
 *
 * @example
 *   export const Foo = fooSchema.pipe(
 *     withStatics((schema) => ({
 *       zero: schema.makeUnsafe(0),
 *       from: Schema.decodeUnknownOption(schema),
 *     }))
 *   )
 */
export const withStatics: {
  <S extends object, M extends Record<string, unknown>>(methods: (schema: S) => M): (schema: S) => S & M;
  <S extends object, M extends Record<string, unknown>>(schema: S, methods: (schema: S) => M): S & M;
} = dual(2, <S extends object, M extends Record<string, unknown>>(schema: S, methods: (schema: S) => M): S & M =>
  Object.assign(schema, methods(schema))
);
