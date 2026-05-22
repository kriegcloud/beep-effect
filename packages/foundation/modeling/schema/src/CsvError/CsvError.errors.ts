/**
 * Shared CSV domain errors.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { TaggedErrorClass, type TaggedErrorClassFromFields } from "../TaggedErrorClass/index.ts";

const $I = $SchemaId.create("CsvError");
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
 * @category validation
 * @since 0.0.0
 */
export class CsvError extends CsvErrorBase {}

/**
 * Construct a {@link CsvError}.
 *
 * @category utilities
 * @since 0.0.0
 */
export const csvError: {
  (message: string): CsvError;
  (offset: number): (message: string) => CsvError;
  (message: string, offset: number): CsvError;
} = dual(
  (args) => args.length === 2 || P.isString(args[0]),
  (message: string, offset?: number): CsvError =>
    P.isNumber(offset)
      ? new CsvError({
          message,
          offset,
        })
      : new CsvError({ message })
);

/**
 * Public aliases for concise namespace roles.
 *
 * @category schemas
 * @since 0.0.0
 */
export { CsvError as Error, csvError as make };
