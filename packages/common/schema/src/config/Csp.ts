import { RegexFromString } from "@beep/schema/custom/Regex.schema";
import { Url } from "@beep/schema/custom/Url.schema";
import { stringLiteralKit } from "@beep/schema/kits/stringLiteralKit";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";

/** Single-character delimiter that terminates each directive in a CSP policy string. */
export const POLICY_DELIMITER = ";" as const;

/** Default directive value that must appear first within every directive value list. */
export const DEFAULT_VALUES = `'self'` as const;

/** Enumerates each directive name supported by the CSP schema. */
export const CSPDirectiveKit = stringLiteralKit(
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
);

const CSPDirectiveSchema = CSPDirectiveKit.Schema.annotations({
  title: "CSP Directive",
  description: "Directive name allowed in the Content Security Policy header.",
  examples: ["script-src", "style-src"] as const,
});

/** Schema class for validating supported CSP directive keys. */
export class CSPDirective extends CSPDirectiveSchema {
  static readonly Options = CSPDirectiveKit.Options;
  static readonly Enum = CSPDirectiveKit.Enum;
}

/** Template literal schema for parsing a directive segment like `script-src='self';`. */
export const CSPDirectivePart = S.TemplateLiteralParser(
  S.Literal(...CSPDirective.Options),
  "=",
  S.String,
  ";"
).annotations({
  title: "CSP Directive Segment",
  description:
    "Parses a single CSP directive segment comprising the directive name, an equal sign, one or more values, and the trailing delimiter.",
});

export declare namespace CSPDirectivePart {
  export type Type = typeof CSPDirectivePart.Type;
  export type Encoded = typeof CSPDirectivePart.Encoded;
}

/** Enumerates static directive values that may appear in a directive without URL validation. */
export const StaticDirectiveKit = stringLiteralKit(
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
);

const StaticDirectiveSchema = StaticDirectiveKit.Schema.annotations({
  title: "Static Directive Value",
  description: "Static directive values that do not require URL validation.",
  examples: ["'self'", "data:", "'unsafe-inline'"] as const,
});

/** Schema class for validating non-URL directive values. */
export class StaticDirective extends StaticDirectiveSchema {
  static readonly Options = StaticDirectiveKit.Options;
}

/** Valid directive value which can be a static keyword or a validated URL string. */
export const CSPDirectiveValue = S.Union(StaticDirective, Url).annotations({
  title: "CSP Directive Value",
  description: "Represents a single value allowed in a CSP directive: a static keyword or a URL string.",
  examples: ["'self'", Url.make("https://cdn.example.com")] as const,
});

/** Non-empty collection of directive values where the first element must be the default `'self'` keyword. */
export const CSPDirectiveValues = S.NonEmptyArray(CSPDirectiveValue).annotations({
  title: "CSP Directive Values",
  description: "A non-empty, ordered list of directive values starting with the default `'self'` keyword.",
  examples: [["'self'", Url.make("https://cdn.example.com")]] as const,
});

const CSPStruct = S.Struct({
  directives: S.Record({
    key: S.String,
    value: CSPDirectiveValues,
  }),
}).annotations({
  title: "CSP Struct",
  description:
    "Normalized representation of a CSP policy where directive names map to ordered, validated non-empty arrays of values.",
});

/** Structured representation of CSP directives keyed by their directive name. */

export declare namespace CSPStruct {
  /** Inferred runtime type of the CSP struct schema. */
  export type Type = S.Schema.Type<typeof CSPStruct>;
  /** Encoded type produced by the CSP struct schema. */
  export type Encoded = S.Schema.Encoded<typeof CSPStruct>;
}

/** Character delimiter used when splitting raw directive values captured from a CSP string. */
const VALUE_DELIMITER = "," as const;

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
const CSP_ENCODED_STRING = S.NonEmptyTrimmedString.pipe(S.pattern(CSP_STRING_REGEX)).annotations({
  title: "Encoded CSP String",
  description: "A normalized CSP string containing one or more directives separated by semicolons.",
});

/** Schema for non-empty arrays of parsed directive segments. */
class CSPDirectiveSegments extends S.NonEmptyArray(CSPDirectivePart).annotations({
  schemaId: Symbol.for("@beep/schema/config/Csp/CSPDirectiveSegments"),
  identifier: "CSPDirectiveSegments",
  title: "CSP Directive Segments",
  description: "Non-empty list of parsed directive segments extracted from a CSP string.",
}) {}

/** Tuple-like TypeScript representation of a parsed directive segment. */
type DirectivePartType = S.Schema.Type<typeof CSPDirectivePart>;
/** TypeScript alias for a validated CSP directive key. */
type DirectiveKey = S.Schema.Type<typeof CSPDirective>;
/** TypeScript alias for validated directive values associated with a directive. */
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

  // Enforce CSP conventions that require `'self'` to appear as the first directive value.
  if (A.headNonEmpty(decodedValues) !== DEFAULT_VALUES) {
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

  // Guard against out-of-order directive lists that would produce invalid headers.
  if (A.headNonEmpty(validatedValues) !== DEFAULT_VALUES) {
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
        onNone: () => ({
          ...acc,
          [directive]: values,
        }),
      })
    ),
    (directives) => S.decodeUnknownSync(CSPStruct)({ directives })
  );

/** Schema that bridges normalized CSP strings with directive segments, providing symmetric encode/decode operations. */
export const CSPString = S.transformOrFail(CSP_ENCODED_STRING, CSPDirectiveSegments, {
  strict: true,
  decode: (validatedString, _, ast, _original) =>
    Effect.try({
      try: () => {
        const rawParts = F.pipe(
          Str.split(POLICY_DELIMITER)(validatedString),
          A.map(Str.trim),
          A.filter(P.not(Str.isEmpty)),
          A.map((segment) => F.pipe(segment, Str.concat(POLICY_DELIMITER), decodeDirectivePart))
        );

        if (!A.isNonEmptyArray(rawParts)) {
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
}).annotations({
  schemaId: Symbol.for("@beep/schema/config/Csp/CSPString"),
  identifier: "CSPString",
  title: "CSP String Schema",
  description:
    "Transforms between a validated CSP string and its array of directive segments while normalizing formatting.",
});

/** Schema that transforms between directive segments and structured CSP directives. */
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
          A.fromIterable(Object.entries(validatedStruct.directives)),
          A.map(([directive, values]) =>
            buildDirectivePart(
              S.decodeUnknownSync(CSPDirective)(directive),
              S.decodeUnknownSync(CSPDirectiveValues)(values)
            )
          )
        );

        if (!A.isNonEmptyArray(directiveParts)) {
          throw new Error("CSPStruct must contain at least one directive");
        }

        return S.decodeUnknownSync(S.typeSchema(CSPDirectiveSegments))(directiveParts);
      },
      catch: (error) =>
        new ParseResult.Type(ast, cspStruct, error instanceof Error ? error.message : "Invalid CSPStruct"),
    }),
}).annotations({
  schemaId: Symbol.for("@beep/schema/config/Csp/CSPFromString"),
  identifier: "CSPFromString",
  title: "CSP Struct Schema",
  description: "Transforms between parsed CSP directive segments and the structured CSP directives record.",
  examples: [
    {
      directives: {
        "script-src": ["'self'", Url.make("https://example.com")],
      },
    },
  ] as const,
});

export declare namespace CSPFromString {
  /** Structured CSP representation produced by decoding a CSP string. */
  export type Type = typeof CSPFromString.Type;
  /** Validated CSP string produced by encoding a CSP struct. */
  export type Encoded = typeof CSPFromString.Encoded;
}

/** Renders a structured CSP directives record into a normalized header string, optionally injecting a nonce. */
export const toHeader = (directives: Csp.Type["directives"], nonce?: string) =>
  F.pipe(
    Struct.entries(directives),
    A.map(
      ([k, v]) =>
        `${k} ${A.join(" ")(v)} ${O.fromNullable(nonce).pipe(
          O.match({
            onNone: () => "",
            onSome: (nonce) => Str.concat(nonce)("nonce-"),
          })
        )}; `
    ),
    A.join(""),
    Str.replace(/\s{2,}/g, " "),
    Str.trim
  );

/** Schema class responsible for generating CSP header strings from structured directives. */
export class Csp extends CSPFromString.annotations({
  title: "CSP Header Schema",
  description:
    "Transforms a structured CSP representation into a destructive branded header string that can be sent to clients.",
}) {
  /** Constructs the encoded representation directly from a directives record. */

  /** Decodes a raw CSP string into the structured CSP representation. */
  static readonly fromString = (cspString: string): Csp.Type => F.pipe(cspString, S.decodeSync(CSPFromString));

  /** Provides a preconfigured schema config entry for reuse in configuration modules. */
  static readonly Config = (name: string) => S.Config(name, CSPFromString);

  static readonly toString = (csp: Csp.Type) => String(csp);

  static readonly toHeader = (csp: CSPFromString.Type) => toHeader(csp.directives);
}

export declare namespace Csp {
  export type Type = typeof CSPFromString.Type;
  export type Encoded = typeof CSPFromString.Encoded;
}
