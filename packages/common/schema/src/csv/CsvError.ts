/**
 * Shared CSV domain errors.
 *
 * @module
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { TaggedErrorClass, type TaggedErrorClassFromFields } from "../TaggedErrorClass.ts";

const $I = $SchemaId.create("csv/CsvError");
const CsvErrorFields = {
  message: S.String,
  offset: S.optionalKey(S.Number),
} satisfies S.Struct.Fields;
const CsvErrorBase: TaggedErrorClassFromFields<CsvError, "CsvError", typeof CsvErrorFields> =
  TaggedErrorClass<CsvError>($I`CsvError`)(
    "CsvError",
    CsvErrorFields,
    $I.annote("CsvError", {
      description: "Raised when CSV parsing, header validation, or formatting fails.",
    })
  );

/**
 * Raised when CSV parsing, header validation, or formatting fails.
 *
 * @category Validation
 * @since 0.0.0
 */
export class CsvError extends CsvErrorBase {}

/**
 * Construct a {@link CsvError}.
 *
 * @category Utility
 * @since 0.0.0
 */
export const csvError: {
  (message: string): CsvError;
  (offset: number): (message: string) => CsvError;
  (message: string, offset: number): CsvError;
} = dual(
  (args) => args.length === 1 && P.isNumber(args[0]),
  (message: string | number, offset?: number): CsvError | ((message: string) => CsvError) => {
    if (P.isNumber(message)) {
      return (actualMessage: string) =>
        new CsvError({
          message: actualMessage,
          offset: message,
        });
    }

    return P.isNumber(offset)
      ? new CsvError({
          message,
          offset,
        })
      : new CsvError({ message });
  }
);
