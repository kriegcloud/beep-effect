/**
 * High-level CSV codec options for text decode/encode flows.
 *
 * @module @beep/schema/csv/CsvCodecOptions
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as Effect from "effect/Effect";
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
      S.withConstructorDefault(Effect.succeed(",")),
      S.withDecodingDefaultKey(Effect.succeed(","))
    ),
    ignoreEmpty: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    quote: S.OptionFromNullOr(SingleCharacterText).pipe(
      S.withConstructorDefault(Effect.succeed(O.some('"'))),
      S.withDecodingDefaultKey(Effect.succeed('"'))
    ),
    escape: S.OptionFromNullOr(SingleCharacterText).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<string>())),
      S.withDecodingDefaultKey(Effect.succeed(null))
    ),
    comment: S.OptionFromNullOr(SingleCharacterText).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<string>())),
      S.withDecodingDefaultKey(Effect.succeed(null))
    ),
    ltrim: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    rtrim: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    trim: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    strictColumnHandling: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    maxRows: NonNegativeInt.pipe(
      S.withConstructorDefault(Effect.succeed(0)),
      S.withDecodingDefaultKey(Effect.succeed(0))
    ),
    skipLines: NonNegativeInt.pipe(
      S.withConstructorDefault(Effect.succeed(0)),
      S.withDecodingDefaultKey(Effect.succeed(0))
    ),
    skipRows: NonNegativeInt.pipe(
      S.withConstructorDefault(Effect.succeed(0)),
      S.withDecodingDefaultKey(Effect.succeed(0))
    ),
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
