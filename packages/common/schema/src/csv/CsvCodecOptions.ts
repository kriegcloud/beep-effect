/**
 * High-level CSV codec options for text decode/encode flows.
 *
 * @module @beep/schema/csv/CsvCodecOptions
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { thunk0, thunkFalse, thunkNull, thunkSome, thunkSomeFalse, thunkSomeNone } from "@beep/utils";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { NonNegativeInt } from "../Int.ts";

const $I = $SchemaId.create("csv/CsvCodecOptions");

const csvCodecOptionsParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const SingleCharacterText = S.String.check(
  S.isLengthBetween(1, 1, {
    description: "A string that must contain exactly one character.",
    message: "CSV option values must be one character long",
  })
).annotate(
  $I.annote("SingleCharacterText", {
    description: "A string that must contain exactly one character.",
  })
);

/**
 * Schema-backed CSV text codec options.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class CsvCodecOptions extends S.Class<CsvCodecOptions>($I`CsvCodecOptions`)(
  {
    delimiter: SingleCharacterText.pipe(
      S.withConstructorDefault(thunkSome(",")),
      S.withDecodingDefaultKey(() => ",")
    ),
    ignoreEmpty: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefaultKey(thunkFalse)),
    quote: S.OptionFromNullOr(SingleCharacterText).pipe(
      S.withConstructorDefault(thunkSome(O.some('"'))),
      S.withDecodingDefaultKey(() => '"')
    ),
    escape: S.OptionFromNullOr(SingleCharacterText).pipe(
      S.withConstructorDefault(thunkSomeNone),
      S.withDecodingDefaultKey(thunkNull)
    ),
    comment: S.OptionFromNullOr(SingleCharacterText).pipe(
      S.withConstructorDefault(thunkSomeNone),
      S.withDecodingDefaultKey(thunkNull)
    ),
    ltrim: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefaultKey(thunkFalse)),
    rtrim: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefaultKey(thunkFalse)),
    trim: S.Boolean.pipe(S.withConstructorDefault(thunkSomeFalse), S.withDecodingDefaultKey(thunkFalse)),
    strictColumnHandling: S.Boolean.pipe(
      S.withConstructorDefault(thunkSomeFalse),
      S.withDecodingDefaultKey(thunkFalse)
    ),
    maxRows: NonNegativeInt.pipe(S.withConstructorDefault(thunkSome(0)), S.withDecodingDefaultKey(thunk0)),
    skipLines: NonNegativeInt.pipe(S.withConstructorDefault(thunkSome(0)), S.withDecodingDefaultKey(thunk0)),
    skipRows: NonNegativeInt.pipe(S.withConstructorDefault(thunkSome(0)), S.withDecodingDefaultKey(thunk0)),
  },
  $I.annote("CsvCodecOptions", {
    description: "Schema-backed CSV text codec options.",
    parseOptions: csvCodecOptionsParseOptions,
  })
) {
  get escapeChar(): O.Option<string> {
    return O.orElse(() => this.quote)(this.escape);
  }
}

/**
 * Encoded/raw constructor input for {@link CsvCodecOptions}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type CsvCodecOptionsArgs = typeof CsvCodecOptions.Encoded;

/**
 * Parse options used when normalizing raw CSV codec option input.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const CsvCodecOptionsParseOptions = csvCodecOptionsParseOptions;
