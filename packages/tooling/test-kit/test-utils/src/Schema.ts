/**
 * Schema property-test helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as S from "effect/Schema";
import { FastCheck as fc } from "effect/testing";

/**
 * Assert that a schema-derived arbitrary only emits values accepted by the same schema without transformation.
 *
 * @param schema - Schema whose generated values must decode back to themselves.
 * @param options - Optional FastCheck tuning for the assertion.
 * @example
 * ```ts
 * import { assertSchemaArbitraryDecodesToSelf } from "@beep/test-utils"
 * import * as S from "effect/Schema"
 *
 * const Status = S.Literal("ready")
 * assertSchemaArbitraryDecodesToSelf(Status, { numRuns: 4 })
 * ```
 * @category schema
 * @since 0.0.0
 */
export const assertSchemaArbitraryDecodesToSelf = <Schema extends S.Decoder<unknown>>(
  schema: Schema,
  options?: {
    readonly numRuns?: number;
  }
): void => {
  const arbitrary = S.toArbitrary(schema);
  const decode = S.decodeUnknownSync(schema);
  const isValue = S.is(schema);

  fc.assert(
    fc.property(arbitrary, (value) => isValue(value) && Object.is(decode(value), value)),
    { numRuns: options?.numRuns ?? 50 }
  );
};
