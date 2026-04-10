/**
 * The @beep/schema/csv parser options configuration.
 *
 * @module @beep/schema/csv/parse/ParserOptions
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import { Number as Num, RegExp as Regex } from "effect";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { BuffEncoding } from "../../BufferEncoding.ts";
import { NonNegativeInt } from "../../Int.ts";
import { RegExpFromStr } from "../../RegExp.ts";
import { TaggedErrorClass, type TaggedErrorClassFromFields } from "../../TaggedErrorClass.ts";
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
const ParserOptionsErrorFields = {
  cause: S.OptionFromOptionalKey(S.DefectWithStack),
  message: S.String,
} satisfies S.Struct.Fields;
const ParserOptionsErrorBase: TaggedErrorClassFromFields<
  ParserOptionsError,
  "ParserOptionsError",
  typeof ParserOptionsErrorFields
> = TaggedErrorClass<ParserOptionsError>($I.make("ParserOptionsError"))(
  "ParserOptionsError",
  ParserOptionsErrorFields,
  $I.annote("ParserOptionsError", {
    description: "Raised when CSV parser options cannot be decoded or normalized.",
  })
);

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
export class ParserOptionsError extends ParserOptionsErrorBase {}

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
      S.withConstructorDefault(Effect.succeed(true)),
      S.withDecodingDefaultKey(Effect.succeed(true))
    ),
    delimiter: SingleCharacterText.pipe(
      S.withConstructorDefault(Effect.succeed(",")),
      S.withDecodingDefaultKey(Effect.succeed(","))
    ),
    ignoreEmpty: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    quote: S.OptionFromNullOr(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(O.some('"'))),
      S.withDecodingDefaultKey(Effect.succeed('"'))
    ),
    escape: S.OptionFromNullOr(S.String).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<string>())),
      S.withDecodingDefaultKey(Effect.succeed(null))
    ),
    comment: S.OptionFromNullOr(S.String).pipe(
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
    headers: S.OptionFromNullOr(HeaderValueInput).pipe(
      S.withConstructorDefault(Effect.succeed(O.none<HeaderValueInput>())),
      S.withDecodingDefaultKey(Effect.succeed(null))
    ),
    renameHeaders: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    strictColumnHandling: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    discardUnmappedColumns: S.Boolean.pipe(
      S.withConstructorDefault(Effect.succeed(false)),
      S.withDecodingDefaultKey(Effect.succeed(false))
    ),
    carriageReturn: S.String.pipe(
      S.withConstructorDefault(Effect.succeed("\r")),
      S.withDecodingDefaultKey(Effect.succeed("\r"))
    ),
    encoding: BuffEncoding.pipe(
      S.withConstructorDefault(Effect.succeed(BuffEncoding.Enum.utf8)),
      S.withDecodingDefaultKey(Effect.succeed(BuffEncoding.Enum.utf8))
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
