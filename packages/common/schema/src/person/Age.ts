/**
 * @module @beep/schema/person/Age
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("person/Age");

/**
 * The age of a person in years.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Age = S.Int.check(
  S.isBetween({
    maximum: 150,
    minimum: 1,
  })
).pipe(
  S.brand("Age"),
  $I.annoteSchema("Age", {
    description: "Age in years",
  })
);

/**
 * Type for {@link Age} {@inheritDoc Age}
 *
 * @category Validation
 * @since 0.0.0
 */
export type Age = typeof Age.Type;
