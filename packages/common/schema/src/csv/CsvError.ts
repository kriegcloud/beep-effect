/**
 * Shared CSV domain errors.
 *
 * @module @beep/schema/csv/CsvError
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { TaggedErrorClass } from "../TaggedErrorClass.ts";

const $I = $SchemaId.create("csv/CsvError");

/**
 * Raised when CSV parsing, header validation, or formatting fails.
 *
 * @category Validation
 * @since 0.0.0
 */
export class CsvError extends TaggedErrorClass<CsvError>($I`CsvError`)(
  "CsvError",
  {
    message: S.String,
    offset: S.optionalKey(S.Number),
  },
  $I.annote("CsvError", {
    description: "Raised when CSV parsing, header validation, or formatting fails.",
  })
) {}

/**
 * Construct a {@link CsvError}.
 *
 * @category Utility
 * @since 0.0.0
 */
export const csvError = (message: string, offset?: number): CsvError =>
  P.isNumber(offset)
    ? new CsvError({
        message,
        offset,
      })
    : new CsvError({ message });
