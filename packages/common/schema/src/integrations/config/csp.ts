/**
 * Content Security Policy schema helpers.
 *
 * Provides a typed DSL for parsing, validating, and rendering CSP directives backed by Effect schemas.
 *
 * @example
 * import { Csp } from "@beep/schema/integrations/config/csp";
 *
 * const parsed = Csp.fromString("default-src='self';");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import { StringLiteralKit } from "../../derived/kits/string-literal-kit";
import { RegexFromString } from "../../internal/regex/regex";
import { Url } from "../../primitives/network/url";

const $I = $SchemaId.create("integrations/config/csp");

/**
 * Single-character delimiter that terminates each directive in a CSP policy string.
 *
 * @example
 * import { POLICY_DELIMITER } from "@beep/schema/integrations/config/csp";
 *
 * console.log(POLICY_DELIMITER); // ;
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const POLICY_DELIMITER = ";" as const;

/**
 * Default directive value that must appear first within every directive value list.
 *
 * @example
 * import { DEFAULT_VALUES } from "@beep/schema/integrations/config/csp";
 *
 * console.log(DEFAULT_VALUES); // 'self'
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const DEFAULT_VALUES = `'self'` as const;

/** Character delimiter used when splitting raw directive values captured from a CSP string. */
const VALUE_DELIMITER = "," as const;

/**
 * Literal kit enumerating supported CSP directive names.
 *
 * @example
 * import { CSPDirectiveKit } from "@beep/schema/integrations/config/csp";
 *
 * const directives = CSPDirectiveKit.Options;
 *
 * @category Integrations/Config
 * @since 0.1.0
 */

const CSPDirective = StringLiteralKit(
  "default-src",
  "base-uri",
  "form-action",
  "script-src",
  "worker-src",
  "style-src",
  "font-src",
  "style-src-elem",
  "script-src-elem",
  "connect-src",
  "media-src",
  "frame-ancestors",
  "img-src",
  "frame-src",
  {
    enumMapping: [
      ["default-src", "DEFAULT_SRC"],
      ["base-uri", "BASE_URI"],
      ["form-action", "FORM_ACTION"],
      ["script-src", "SCRIPT_SRC"],
      ["worker-src", "WORKER_SRC"],
      ["style-src", "STYLE_SRC"],
      ["font-src", "FONT_SRC"],
      ["style-src-elem", "STYLE_SRC_ELEM"],
      ["script-src-elem", "SCRIPT_SRC_ELEM"],
      ["connect-src", "CONNECT_SRC"],
      ["media-src", "MEDIA_SRC"],
      ["frame-ancestors", "FRAME_ANCESTORS"],
      ["img-src", "IMG_SRC"],
      ["frame-src", "FRAME_SRC"],
    ],
  }
).annotations(
  $I.annotations("CSPDirectiveSchema", {
    description: "Directive name allowed in the Content Security Policy header.",
  })
);

/**
 * Template literal schema for parsing a directive segment like `script-src='self';`.
 *
 * @example
 * import { CSPDirectivePart } from "@beep/schema/integrations/config/csp";
 * import * as S from "effect/Schema";
 *
 * const part = S.decodeSync(CSPDirectivePart)("script-src='self';");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const CSPDirectivePart = S.TemplateLiteralParser(
  S.Literal(...CSPDirective.Options),
  "=",
  S.String,
  POLICY_DELIMITER
).annotations(
  $I.annotations("CSPDirectivePart", {
    description:
      "Parses a single CSP directive segment comprising the directive name, an equal sign, one or more values, and the trailing delimiter.",
  })
);

/**
 * Namespace exposing runtime and encoded types for {@link CSPDirectivePart}.
 *
 * @example
 * import type { CSPDirectivePart } from "@beep/schema/integrations/config/csp";
 *
 * type Part = CSPDirectivePart.Type;
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export declare namespace CSPDirectivePart {
  /**
   * Runtime type parsed from a CSP directive part.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Type = typeof CSPDirectivePart.Type;
  /**
   * Encoded string accepted by {@link CSPDirectivePart}.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Encoded = typeof CSPDirectivePart.Encoded;
}

const StaticDirective = StringLiteralKit(
  `'self'`,
  `'none'`,
  `data:`,
  `blob:`,
  `'unsafe-inline'`,
  `ws:`,
  `wss:`,
  "http://localhost:*",
  "https://localhost:*",
  "http://127.0.0.1:*",
  "https://127.0.0.1:*"
).annotations(
  $I.annotations("StaticDirectiveSchema", {
    title: "Static Directive Value",
    description: "Static directive values that do not require URL validation.",
  })
);

/**
 * Valid directive value which can be a static keyword or a validated URL string.
 *
 * @example
 * import { CSPDirectiveValue } from "@beep/schema/integrations/config/csp";
 * import * as S from "effect/Schema";
 *
 * const parsed = S.decodeSync(CSPDirectiveValue)("https://example.com");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const CSPDirectiveValue = S.Union(StaticDirective, Url).annotations(
  $I.annotations("CSPDirectiveValue", {
    description: "Represents a single value allowed in a CSP directive: a static keyword or a URL string.",
  })
);

/**
 * Non-empty collection of directive values where the first element must be the default `'self'` keyword.
 *
 * @example
 * import { CSPDirectiveValues } from "@beep/schema/integrations/config/csp";
 * import * as S from "effect/Schema";
 *
 * const values = S.decodeSync(CSPDirectiveValues)(["'self'", "https://example.com"]);
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const CSPDirectiveValues = S.NonEmptyArray(CSPDirectiveValue).annotations(
  $I.annotations("CSPDirectiveValues", {
    description: "A non-empty, ordered list of directive values starting with the default `'self'` keyword.",
  })
);

/**
 * Structured representation of CSP directives keyed by their directive name.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { CSPStruct } from "@beep/schema/integrations/config/csp";
 *
 * const struct = S.decodeSync(CSPStruct)({ directives: { "default-src": ["'self'"] } });
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const CSPStruct = S.Struct({
  directives: S.Record({
    key: S.String,
    value: CSPDirectiveValues,
  }),
}).annotations(
  $I.annotations("CSPStruct", {
    title: "CSP Struct",
    description:
      "Normalized representation of a CSP policy where directive names map to ordered, validated non-empty arrays of values.",
  })
);

/**
 * Namespace exposing runtime and encoded types for {@link CSPStruct}.
 *
 * @example
 * import type { CSPStruct } from "@beep/schema/integrations/config/csp";
 *
 * type Struct = CSPStruct.Type;
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export declare namespace CSPStruct {
  /**
   * Inferred runtime type of the CSP struct schema.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof CSPStruct>;
  /**
   * Encoded type produced by the CSP struct schema.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof CSPStruct>;
}

/** Regex excerpt capturing any supported directive name. */
const CSP_DIRECTIVE_NAMES_PATTERN = `(?:${A.join("|")(CSPDirective.Options)})`;
/** Regex excerpt capturing allowed static directive values. */
const CSP_STATIC_DIRECTIVE_VALUE_PATTERN = `(?:${A.join("|")(StaticDirective.Options)})`;
/** Regex excerpt capturing values that must satisfy URL semantics. */
const CSP_URL_VALUE_PATTERN = "(?:[^,;]+)";
/** Regex excerpt capturing the union of static and URL directive values. */
const CSP_DIRECTIVE_VALUE_PATTERN = `(?:${CSP_STATIC_DIRECTIVE_VALUE_PATTERN}|${CSP_URL_VALUE_PATTERN})`;
/** Full directive pattern capturing the directive name, optional whitespace, values, and trailing delimiter. */
const CSP_DIRECTIVE_PATTERN = `${CSP_DIRECTIVE_NAMES_PATTERN}=\\s*${CSP_DIRECTIVE_VALUE_PATTERN}(?:\\s*,\\s*${CSP_DIRECTIVE_VALUE_PATTERN})*${POLICY_DELIMITER}`;
/** Complete CSP policy pattern requiring one or more valid directive segments. */
const CSP_STRING_PATTERN = `^(?:${CSP_DIRECTIVE_PATTERN})+$`;

/** Compiled regular expression validating normalized CSP policy strings. */
const CSP_STRING_REGEX = RegexFromString.make(CSP_STRING_PATTERN);

/** Schema that ensures CSP strings are non-empty, trimmed, and match the compiled CSP regex. */
const CSP_ENCODED_STRING = S.NonEmptyTrimmedString.pipe(S.pattern(CSP_STRING_REGEX)).annotations(
  $I.annotations("CSP_ENCODED_STRING", {
    title: "Encoded CSP String",
    description: "A normalized CSP string containing one or more directives separated by semicolons.",
  })
);

/** Schema for non-empty arrays of parsed directive segments. */
class CSPDirectiveSegments extends S.NonEmptyArray(CSPDirectivePart).annotations(
  $I.annotations("CSPDirectiveSegments", {
    title: "CSP Directive Segments",
    description: "Non-empty list of parsed directive segments extracted from a CSP string.",
  })
) {}

type DirectivePartType = S.Schema.Type<typeof CSPDirectivePart>;
type DirectiveKey = S.Schema.Type<typeof CSPDirective>;
type DirectiveValuesType = S.Schema.Type<typeof CSPDirectiveValues>;

const decodeDirective = S.decodeUnknownSync(CSPDirective);
const decodeDirectivePart = S.decodeUnknownSync(CSPDirectivePart);
const encodeDirectivePart = S.encodeSync(CSPDirectivePart);
const decodeDirectiveValues = S.decodeUnknownSync(CSPDirectiveValues);
const decodeDirectiveValuesType = S.decodeUnknownSync(S.typeSchema(CSPDirectiveValues));
const decodeDirectiveSegmentsEncoded = S.decodeUnknownSync(S.encodedSchema(CSPDirectiveSegments));

/** Parses and validates directive values from a raw comma-delimited string, enforcing the `'self'` prefix. */
const parseDirectiveValues = (directive: DirectiveKey, rawValues: string): DirectiveValuesType => {
  const splitValues = F.pipe(
    rawValues,
    Str.trim,
    Str.split(VALUE_DELIMITER),
    A.map(Str.trim),
    A.filter(P.not(Str.isEmpty))
  );

  const decodedValues = decodeDirectiveValues(splitValues);

  if (O.isNone(A.head(decodedValues)) || A.headNonEmpty(decodedValues) !== DEFAULT_VALUES) {
    throw new Error(`Directive ${directive} must start with ${DEFAULT_VALUES}`);
  }

  return decodedValues;
};

/** Extracts the directive key and its associated values from a decoded directive part. */
const parseDirectivePart = (parts: DirectivePartType): readonly [DirectiveKey, DirectiveValuesType] => {
  const directive = decodeDirective(parts[0]);
  const values = parseDirectiveValues(directive, parts[2]);
  return [directive, values] as const;
};

/** Rebuilds a directive segment from validated directive values, ensuring canonical formatting. */
const buildDirectivePart = (directive: DirectiveKey, values: DirectiveValuesType): DirectivePartType => {
  const validatedValues = decodeDirectiveValuesType(values);

  if (O.isNone(A.head(validatedValues)) || A.headNonEmpty(validatedValues) !== DEFAULT_VALUES) {
    throw new Error(`Directive ${directive} must start with ${DEFAULT_VALUES}`);
  }

  const valueSegment = A.join(VALUE_DELIMITER)(validatedValues);

  return [directive, "=", valueSegment, POLICY_DELIMITER] as const;
};

const directivePartsToRecord = (entries: ReadonlyArray<readonly [DirectiveKey, DirectiveValuesType]>) =>
  F.pipe(
    entries,
    A.reduce({} as Record<DirectiveKey, DirectiveValuesType>, (acc, [directive, values]) =>
      O.match(O.fromNullable(acc[directive]), {
        onSome: () => {
          throw new Error(`Duplicate CSP directive detected: ${directive}`);
        },
        onNone: () => R.set(acc, directive, values),
      })
    ),
    (directives) => S.decodeUnknownSync(CSPStruct)({ directives })
  );

/**
 * Schema that bridges normalized CSP strings with directive segments, providing symmetric encode/decode operations.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { CSPString } from "@beep/schema/integrations/config/csp";
 *
 * const segments = S.decodeSync(CSPString)("default-src='self';");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const CSPString = S.transformOrFail(CSP_ENCODED_STRING, CSPDirectiveSegments, {
  strict: true,
  decode: (validatedString, _, ast) =>
    Effect.try({
      try: () => {
        const rawParts = F.pipe(
          Str.split(POLICY_DELIMITER)(validatedString),
          A.map(Str.trim),
          A.filter(P.not(Str.isEmpty)),
          A.map((segment) => F.pipe(segment, Str.concat(POLICY_DELIMITER), decodeDirectivePart))
        );

        if (O.isNone(A.head(rawParts))) {
          throw new Error("CSP string must contain at least one directive");
        }

        const entries = F.pipe(rawParts, A.map(parseDirectivePart));
        const normalizedParts = F.pipe(
          entries,
          A.map(([directive, values]) => buildDirectivePart(directive, values))
        );

        const encodedSegments = F.pipe(
          normalizedParts,
          A.map((part) => encodeDirectivePart(part))
        );

        return decodeDirectiveSegmentsEncoded(encodedSegments);
      },
      catch: (error) =>
        new ParseResult.Type(
          ast,
          validatedString,
          error instanceof Error ? error.message : "Invalid CSPDirectiveValues"
        ),
    }),
  encode: (_directiveStrings, _, ast, directivePartsParsed) =>
    Effect.try({
      try: () => {
        const entries = F.pipe(directivePartsParsed, A.map(parseDirectivePart));
        const normalizedString = F.pipe(
          entries,
          A.map(([directive, values]) => buildDirectivePart(directive, values)),
          A.map((part) => encodeDirectivePart(part)),
          A.join("")
        );

        return S.decodeUnknownSync(CSP_ENCODED_STRING)(normalizedString);
      },
      catch: (error) =>
        new ParseResult.Type(
          ast,
          directivePartsParsed,
          error instanceof Error ? error.message : "Invalid CSPDirectiveValues"
        ),
    }),
}).annotations(
  $I.annotations("CSPString", {
    title: "CSP String Schema",
    description:
      "Transforms between a validated CSP string and its array of directive segments while normalizing formatting.",
  })
);

/**
 * Schema that transforms between directive segments and structured CSP directives.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { CSPFromString } from "@beep/schema/integrations/config/csp";
 *
 * const struct = S.decodeSync(CSPFromString)("default-src='self';");
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const CSPFromString = S.transformOrFail(CSPString, CSPStruct, {
  strict: true,
  decode: (directiveParts, _, ast) =>
    Effect.try({
      try: () => {
        const entries = F.pipe(directiveParts, A.map(parseDirectivePart));
        return directivePartsToRecord(entries);
      },
      catch: (error) =>
        new ParseResult.Type(ast, directiveParts, error instanceof Error ? error.message : "Invalid CSPStruct"),
    }),
  encode: (cspStruct, _, ast) =>
    Effect.try({
      try: () => {
        const validatedStruct = S.decodeUnknownSync(CSPStruct)(cspStruct);

        const directiveParts = F.pipe(
          Struct.entries(validatedStruct.directives),
          A.fromIterable,
          A.map(([directive, values]) =>
            buildDirectivePart(
              S.decodeUnknownSync(CSPDirective)(directive),
              S.decodeUnknownSync(CSPDirectiveValues)(values)
            )
          )
        );

        if (O.isNone(A.head(directiveParts))) {
          throw new Error("CSPStruct must contain at least one directive");
        }

        return S.decodeUnknownSync(S.typeSchema(CSPDirectiveSegments))(directiveParts);
      },
      catch: (error) =>
        new ParseResult.Type(ast, cspStruct, error instanceof Error ? error.message : "Invalid CSPStruct"),
    }),
}).annotations(
  $I.annotations("CSPFromString", {
    description: "Transforms between parsed CSP directive segments and the structured CSP directives record.",
  })
);

/**
 * Namespace exposing runtime and encoded types for {@link CSPFromString}.
 *
 * @example
 * import type { CSPFromString } from "@beep/schema/integrations/config/csp";
 *
 * type Struct = CSPFromString.Type;
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export declare namespace CSPFromString {
  /**
   * Structured CSP representation produced by decoding a CSP string.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Type = typeof CSPFromString.Type;
  /**
   * Validated CSP string produced by encoding a CSP struct.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Encoded = typeof CSPFromString.Encoded;
}

/**
 * Renders a structured CSP directives record into a normalized header string, optionally injecting a nonce.
 *
 * @example
 * import { toHeader } from "@beep/schema/integrations/config/csp";
 *
 * const header = toHeader({ "script-src": ["'self'"] });
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export const toHeader = (directives: CSPStruct.Type["directives"], nonce?: string) =>
  F.pipe(
    Struct.entries(directives),
    A.fromIterable,
    A.map(
      ([directive, values]) =>
        `${directive} ${A.join(" ")(values)} ${F.pipe(
          nonce,
          O.fromNullable,
          O.match({
            onNone: () => "",
            onSome: (value) => Str.concat(value)("nonce-"),
          })
        )}; `
    ),
    A.join(""),
    Str.replace(/\s{2,}/g, " "),
    Str.trim
  );

/**
 * Schema class responsible for generating CSP header strings from structured directives.
 *
 * @example
 * import { Csp } from "@beep/schema/integrations/config/csp";
 *
 * const header = Csp.toHeader(Csp.fromString("default-src='self';"));
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export class Csp extends CSPFromString.annotations(
  $I.annotations("Csp", {
    title: "CSP Header Schema",
    description:
      "Transforms a structured CSP representation into a destructive branded header string that can be sent to clients.",
  })
) {
  /** Decodes a raw CSP string into the structured CSP representation. */
  static readonly fromString = (cspString: string): Csp.Type => F.pipe(cspString, S.decodeSync(CSPFromString));

  /** Provides a preconfigured schema config entry for reuse in configuration modules. */
  static readonly Config = (name: string) => S.Config(name, CSPFromString);

  static override readonly toString = (csp: Csp.Type) => String(csp);

  static readonly toHeader = (csp: CSPFromString.Type) => toHeader(csp.directives);
}

/**
 * Namespace exposing runtime and encoded types for {@link Csp}.
 *
 * @example
 * import type { Csp } from "@beep/schema/integrations/config/csp";
 *
 * type Header = Csp.Encoded;
 *
 * @category Integrations/Config
 * @since 0.1.0
 */
export declare namespace Csp {
  /**
   * Structured CSP representation produced by {@link Csp}.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Type = typeof CSPFromString.Type;
  /**
   * Validated CSP string produced by {@link Csp}.
   *
   * @category Integrations/Config
   * @since 0.1.0
   */
  export type Encoded = typeof CSPFromString.Encoded;
}
