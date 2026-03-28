/**
 * The @beep/schema/csv parser options configuration.
 *
 * @module @beep/schema/csv/parse/ParserOptions
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { RegExp as Regex } from "effect";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { BuffEncoding } from "../../BufferEncoding.ts";
import { NonNegativeInt } from "../../Int.ts";
import { RegExpFromStr } from "../../RegExp.ts";
import { TaggedErrorClass } from "../../TaggedErrorClass.ts";
import { HeaderArray, HeaderTransformFunction } from "./types.ts";

const $I = $SchemaId.create("csv/parse/ParserOptions");

const parserOptionsParseOptions = {
  exact: true as const,
  onExcessProperty: "error" as const,
};

const SingleCharacterText = S.String.check(
  S.isLengthBetween(1, 1, {
    description: "A string that must contain exactly one character.",
    message: "delimiter option must be one character long",
  })
).annotate(
  $I.annote("SingleCharacterText", {
    description: "A string that must contain exactly one character.",
  })
);

const decodeRegExpSync = S.decodeSync(RegExpFromStr);

/**
 * A parser header configuration input.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const HeaderValueInput = S.Union([S.Boolean, HeaderArray, HeaderTransformFunction]).pipe(
  $I.annoteSchema("HeaderValueInput", {
    description: "A parser header configuration input.",
  })
);

/**
 * Type of {@link HeaderValueInput} {@inheritDoc HeaderValueInput}
 *
 * @category Configuration
 * @since 0.0.0
 */
export type HeaderValueInput = typeof HeaderValueInput.Type;

/**
 * A parser options configuration error.
 *
 * @category Validation
 * @since 0.0.0
 */
export class ParserOptionsError extends TaggedErrorClass<ParserOptionsError>($I`ParserOptionsError`)(
  "ParserOptionsError",
  {
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
    message: S.String,
  },
  $I.annote("ParserOptionsError", {
    description: "Raised when CSV parser options cannot be decoded or normalized.",
  })
) {}

const toParserOptionsError = (fallbackMessage: string, cause?: unknown): ParserOptionsError =>
  new ParserOptionsError({
    cause: P.isError(cause) ? O.some(cause) : O.none(),
    message: P.isError(cause) ? cause.message : fallbackMessage,
  });

const buildNextTokenRegExp = (escapedDelimiter: string): globalThis.RegExp => {
  try {
    return decodeRegExpSync(`([^\\s]|\\r\\n|\\n|\\r|${escapedDelimiter})`);
  } catch (cause) {
    throw toParserOptionsError("Failed to build parser next-token regular expression.", cause);
  }
};

/**
 * Schema-backed CSV parser options.
 *
 * Derived runtime fields from the original implementation such as
 * `escapedDelimiter`, `escapeChar`, `supportsComments`, `limitRows`, and
 * `NEXT_TOKEN_REGEXP` are exposed as getters so the schema stays focused on the
 * true input/configuration surface.
 *
 * @category Configuration
 * @since 0.0.0
 */
export class ParserOptions extends S.Class<ParserOptions>($I`ParserOptions`)(
  {
    objectMode: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(true)),
      S.withDecodingDefaultKey(() => true)
    ),
    delimiter: SingleCharacterText.pipe(
      S.withConstructorDefault(() => O.some(",")),
      S.withDecodingDefaultKey(() => ",")
    ),
    ignoreEmpty: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    quote: S.OptionFromNullOr(S.String).pipe(
      S.withConstructorDefault(() => O.some(O.some('"'))),
      S.withDecodingDefaultKey(() => '"')
    ),
    escape: S.OptionFromNullOr(S.String).pipe(
      S.withConstructorDefault(() => O.some(O.none<string>())),
      S.withDecodingDefaultKey(() => null)
    ),
    comment: S.OptionFromNullOr(S.String).pipe(
      S.withConstructorDefault(() => O.some(O.none<string>())),
      S.withDecodingDefaultKey(() => null)
    ),
    ltrim: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    rtrim: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    trim: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    headers: S.OptionFromNullOr(HeaderValueInput).pipe(
      S.withConstructorDefault(() => O.some(O.none<HeaderValueInput>())),
      S.withDecodingDefaultKey(() => null)
    ),
    renameHeaders: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    strictColumnHandling: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    discardUnmappedColumns: S.Boolean.pipe(
      S.withConstructorDefault(() => O.some(false)),
      S.withDecodingDefaultKey(() => false)
    ),
    carriageReturn: S.String.pipe(
      S.withConstructorDefault(() => O.some("\r")),
      S.withDecodingDefaultKey(() => "\r")
    ),
    encoding: BuffEncoding.pipe(
      S.withConstructorDefault(() => O.some(BuffEncoding.Enum.utf8)),
      S.withDecodingDefaultKey(BuffEncoding.thunk.utf8)
    ),
    maxRows: NonNegativeInt.pipe(
      S.withConstructorDefault(() => O.some(0)),
      S.withDecodingDefaultKey(() => 0)
    ),
    skipLines: NonNegativeInt.pipe(
      S.withConstructorDefault(() => O.some(0)),
      S.withDecodingDefaultKey(() => 0)
    ),
    skipRows: NonNegativeInt.pipe(
      S.withConstructorDefault(() => O.some(0)),
      S.withDecodingDefaultKey(() => 0)
    ),
  },
  $I.annote("ParserOptions", {
    description: "Schema-backed CSV parser options.",
    parseOptions: parserOptionsParseOptions,
  })
) {
  /**
   * Decode raw parser option input into a normalized {@link ParserOptions}
   * instance.
   */
  static readonly new = (input?: ParserOptionsArgs): ParserOptions => {
    try {
      return decodeParserOptionsUnknownSync(input ?? {}, parserOptionsParseOptions);
    } catch (cause) {
      throw toParserOptionsError("Failed to decode parser options.", cause);
    }
  };

  get escapedDelimiter(): string {
    return Regex.escape(this.delimiter);
  }

  get escapeChar(): O.Option<string> {
    return O.orElse(() => this.quote)(this.escape);
  }

  get supportsComments(): boolean {
    return O.isSome(this.comment);
  }

  get limitRows(): boolean {
    return Num.isGreaterThan(0)(this.maxRows);
  }

  get NEXT_TOKEN_REGEXP(): globalThis.RegExp {
    return buildNextTokenRegExp(this.escapedDelimiter);
  }
}

const decodeParserOptionsUnknownSync = S.decodeUnknownSync(ParserOptions);

/**
 * Encoded/raw constructor input for {@link ParserOptions}.
 *
 * @category Configuration
 * @since 0.0.0
 */
export type ParserOptionsArgs = typeof ParserOptions.Encoded;
