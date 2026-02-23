/**
 * HTML entity encoding and decoding
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Str from "effect/String";

/**
 * Common HTML entities for encoding.
 *
 * @since 0.1.0
 * @category constants
 */
const ENCODE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

/**
 * Common HTML entities for decoding.
 *
 * @since 0.1.0
 * @category constants
 */
const DECODE_MAP: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: "\u00A0",
  copy: "\u00A9",
  reg: "\u00AE",
  trade: "\u2122",
  mdash: "\u2014",
  ndash: "\u2013",
  ldquo: "\u201C",
  rdquo: "\u201D",
  lsquo: "\u2018",
  rsquo: "\u2019",
  bull: "\u2022",
  hellip: "\u2026",
  euro: "\u20AC",
  pound: "\u00A3",
  yen: "\u00A5",
  cent: "\u00A2",
};

/**
 * Pattern for matching HTML entities.
 * Matches:
 * - Named entities: &amp; &lt; etc.
 * - Decimal entities: &#65; &#8212;
 * - Hexadecimal entities: &#x41; &#X41;
 */
const ENTITY_PATTERN = /&(?:#([0-9]+)|#[xX]([0-9a-fA-F]+)|([a-zA-Z][a-zA-Z0-9]*));?/g;

/**
 * Minimum valid Unicode code point
 */
const MIN_CODE_POINT = 0;

/**
 * Maximum valid Unicode code point
 */
const MAX_CODE_POINT = 0x10ffff;

/**
 * Predicate to check if a value is a valid number (not NaN).
 */
const isNotNaN: P.Predicate<number> = P.not(Number.isNaN);

/**
 * Checks if a code point is within valid Unicode range.
 */
const isValidCodePoint = (code: number): boolean =>
  Num.greaterThanOrEqualTo(code, MIN_CODE_POINT) && Num.lessThanOrEqualTo(code, MAX_CODE_POINT);

/**
 * Attempts to convert a code point to a character safely.
 */
const codePointToChar = (code: number): O.Option<string> => O.liftThrowable(() => String.fromCodePoint(code))();

/**
 * Parses a numeric string to an integer with the given radix.
 * Uses Effect predicates for NaN checking.
 */
const parseIntSafe = (value: string, radix: number): O.Option<number> =>
  F.pipe(Number.parseInt(value, radix), O.liftPredicate(isNotNaN));

/**
 * Encodes a single character if it needs encoding.
 */
const encodeChar = (char: string): string =>
  F.pipe(
    ENCODE_MAP,
    R.get(char),
    O.getOrElse(() => char)
  );

/**
 * Encodes special HTML characters in a string.
 *
 * @example
 * ```typescript
 * import { encodeEntities } from "@beep/utils/sanitize-html/parser/entities"
 *
 * encodeEntities("<script>alert('XSS')</script>")
 * // "&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;"
 * ```
 *
 * @since 0.1.0
 * @category encoding
 */
export const encodeEntities = (str: string): string => F.pipe(str, Str.split(""), A.map(encodeChar), A.join(""));

/**
 * Encodes HTML entities, optionally including double quotes.
 *
 * @example
 * ```typescript
 * import { encodeHtml } from "@beep/utils/sanitize-html/parser/entities"
 *
 * encodeHtml("Hello <World>", false) // "Hello &lt;World&gt;"
 * encodeHtml('"quoted"', true) // "&quot;quoted&quot;"
 * ```
 *
 * @since 0.1.0
 * @category encoding
 */
export const encodeHtml = (str: string, encodeQuotes: boolean): string =>
  F.pipe(str, Str.replace(/&/g, "&amp;"), Str.replace(/</g, "&lt;"), Str.replace(/>/g, "&gt;"), (result) =>
    Match.value(encodeQuotes).pipe(
      Match.when(true, () => Str.replace(/"/g, "&quot;")(result)),
      Match.orElse(() => result)
    )
  );

/**
 * Parses decimal or hex string to code point Option.
 */
const parseEntityCodePoint = (decimal: string | undefined, hex: string | undefined): O.Option<number> =>
  Match.value({ decimal, hex }).pipe(
    Match.when({ decimal: P.isString }, ({ decimal }) => parseIntSafe(decimal, 10)),
    Match.when({ hex: P.isString }, ({ hex }) => parseIntSafe(hex, 16)),
    Match.orElse(O.none<number>)
  );

/**
 * Decodes a numeric HTML entity to its character.
 */
const decodeNumericEntity = (decimal: string | undefined, hex: string | undefined): O.Option<string> =>
  F.pipe(parseEntityCodePoint(decimal, hex), O.filter(isValidCodePoint), O.flatMap(codePointToChar));

/**
 * Decodes a named HTML entity to its character.
 */
const decodeNamedEntity = (name: string): O.Option<string> =>
  F.pipe(
    DECODE_MAP,
    R.get(name),
    O.orElse(() => R.get(Str.toLowerCase(name))(DECODE_MAP))
  );

/**
 * Entity match result for pattern matching.
 */
type EntityMatch = {
  readonly match: string;
  readonly decimal: string | undefined;
  readonly hex: string | undefined;
  readonly named: string | undefined;
};

/**
 * Resolves an entity match to its decoded character.
 */
const resolveEntity = (entity: EntityMatch): string => {
  const thunkMatch = () => entity.match;
  return Match.value(entity).pipe(
    Match.when({ decimal: P.isString }, ({ decimal }) =>
      F.pipe(decodeNumericEntity(decimal, undefined), O.getOrElse(thunkMatch))
    ),
    Match.when({ hex: P.isString }, ({ hex }) => F.pipe(decodeNumericEntity(undefined, hex), O.getOrElse(thunkMatch))),
    Match.when({ named: P.isString }, ({ named }) => F.pipe(decodeNamedEntity(named), O.getOrElse(thunkMatch))),
    Match.orElse(thunkMatch)
  );
};

/**
 * Decodes HTML entities in a string.
 *
 * @example
 * ```typescript
 * import { decodeEntities } from "@beep/utils/sanitize-html/parser/entities"
 *
 * decodeEntities("&lt;script&gt;") // "<script>"
 * decodeEntities("&#60;") // "<"
 * decodeEntities("&#x3C;") // "<"
 * decodeEntities("&amp;amp;") // "&amp;"
 * ```
 *
 * @since 0.1.0
 * @category decoding
 */
export const decodeEntities = (str: string): string =>
  str.replace(
    ENTITY_PATTERN,
    (match, decimal: string | undefined, hex: string | undefined, named: string | undefined) =>
      resolveEntity({ match, decimal, hex, named })
  );

/**
 * Strips control characters (0x00-0x1F except \t, \n, \r) from a string.
 * These characters are often used in XSS attacks to bypass filters.
 *
 * @example
 * ```typescript
 * import { stripControlChars } from "@beep/utils/sanitize-html/parser/entities"
 *
 * stripControlChars("java\0script") // "javascript"
 * stripControlChars("hello\tworld") // "hello\tworld" (tabs preserved)
 * ```
 *
 * @since 0.1.0
 * @category sanitization
 */
export const stripControlChars = (str: string): string => Str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")(str);

/**
 * Decodes entities and strips control characters for URL validation.
 * This is critical for preventing XSS via encoded javascript: URLs.
 *
 * @example
 * ```typescript
 * import { prepareForUrlValidation } from "@beep/utils/sanitize-html/parser/entities"
 *
 * prepareForUrlValidation("&#106;&#97;vascript:alert(1)")
 * // "javascript:alert(1)"
 * ```
 *
 * @since 0.1.0
 * @category sanitization
 */
export const prepareForUrlValidation = (url: string): string => F.pipe(url, decodeEntities, stripControlChars);
