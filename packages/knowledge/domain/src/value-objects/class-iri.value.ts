/**
 * ClassIri value object
 *
 * Validated IRI (Internationalized Resource Identifier) for OWL/RDFS classes.
 * Enforces RFC 3987 IRI syntax with OWL 2 restrictions for absolute IRIs.
 *
 * Validates:
 * - Valid scheme (http, https, urn, file)
 * - Absolute IRI (not relative)
 * - No disallowed characters (<, >, ", {, }, |, \, ^, `, whitespace)
 * - Valid percent-encoding (% followed by two hex digits)
 * - Maximum 2048 characters (practical HTTP limit)
 *
 * @module knowledge-domain/value-objects/ClassIri
 * @since 0.1.0
 */
import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { thunkFalse } from "@beep/utils";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeDomainId.create("value-objects/ClassIri");

/**
 * Valid IRI schemes for OWL/RDFS ontologies.
 *
 * - http/https: Web-based ontologies (W3C, schema.org)
 * - urn: Namespace-based identifiers (UUID, ISBN)
 * - file: Local file references
 */
export class ClassIRIScheme extends BS.StringLiteralKit("http", "https", "urn", "file").annotations(
  $I.annotations("ClassIRIScheme", {
    description: "Valid IRI scheme for OWL/RDFS ontologies",
    documentation:
      "- http/https: Web-based ontologies (W3C, schema.org)\n- urn: Namespace-based identifiers (UUID, ISBN)\n- file: Local file references",
  })
) {}
export type ValidSchema = typeof ClassIRIScheme.Type;
/**
 * Characters disallowed in IRIs per RFC 3987.
 * Includes control characters and delimiter conflicts.
 */
const DISALLOWED_CHARS_PATTERN = /[<>"{}|\\^`\x00-\x1f\x7f-\x9f]/;

/**
 * Invalid percent-encoding pattern.
 * A % must be followed by exactly two hexadecimal digits.
 */
const INVALID_PERCENT_ENCODING = /%(?![0-9A-Fa-f]{2})/;

/**
 * Maximum IRI length (practical HTTP/browser limit).
 */
export const CLASS_IRI_MAX_LENGTH = 2048;

/**
 * URN format validation per RFC 2141.
 * Pattern: urn:<NID>:<NSS>
 */
const URN_PATTERN = /^urn:[a-zA-Z0-9][a-zA-Z0-9-]{0,31}:\S+$/;

/**
 * Extracts the scheme from an IRI string.
 *
 * @internal
 */
const extractScheme = (iri: string): O.Option<string> =>
  F.pipe(
    iri,
    Str.indexOf(":"),
    O.map((idx) => F.pipe(iri, Str.slice(0, idx)))
  );

/**
 * Validates an HTTP/HTTPS IRI using the URL constructor.
 *
 * @internal
 */
const isValidHttpIri = (iri: string): boolean =>
  Either.try(() => new URL(iri)).pipe(
    Either.match({
      onLeft: thunkFalse,
      onRight: (url) => url.protocol === "http:" || url.protocol === "https:",
    })
  );

export class HttpIRI extends S.declare(
  (u: unknown): u is string =>
    P.or(P.isString, S.is(BS.CustomURL))(u) &&
    Match.value(u).pipe(
      Match.when(S.is(BS.CustomURL), (u) => isValidHttpIri(u.toString())),
      Match.when(P.isString, isValidHttpIri),
      Match.orElse(thunkFalse)
    )
).annotations(
  $I.annotations("HttpIRI", {
    description: "A valid HTTP/HTTPS IRI",
  })
) {}

export declare namespace HttpIRI {
  export type Type = typeof HttpIRI.Type;
  export type Encoded = typeof HttpIRI.Encoded;
}

/**
 * Validates a URN according to RFC 2141.
 *
 * @internal
 */
const isValidUrn = (iri: string): boolean => URN_PATTERN.test(iri);

/**
 * Validates a file:// URI.
 *
 * @internal
 */
const isValidFileIri = (iri: string): boolean =>
  Either.try(() => new URL(iri)).pipe(
    Either.match({
      onLeft: thunkFalse,
      onRight: (url) => url.protocol === "file:",
    })
  );

/**
 * Core IRI validation predicate.
 *
 * Validates:
 * 1. Non-empty string
 * 2. Within length limit
 * 3. No disallowed characters
 * 4. Valid percent-encoding
 * 5. Valid scheme from allowlist
 * 6. Scheme-specific validation (URL parsing for http/https/file, RFC 2141 for urn)
 *
 * @internal
 */
const isValidClassIri = (value: string): boolean => {
  // Length check
  if (Str.length(value) > CLASS_IRI_MAX_LENGTH) {
    return false;
  }

  // Disallowed characters check
  if (DISALLOWED_CHARS_PATTERN.test(value)) {
    return false;
  }

  // Whitespace check (trimming already handled, but verify no internal spaces)
  if (Str.includes(" ")(value)) {
    return false;
  }

  // Invalid percent-encoding check
  if (INVALID_PERCENT_ENCODING.test(value)) {
    return false;
  }

  // Extract and validate scheme
  const schemeOpt = extractScheme(value);
  if (O.isNone(schemeOpt)) {
    return false;
  }

  const scheme = Str.toLowerCase(schemeOpt.value);
  if (!S.is(ClassIRIScheme)(scheme)) {
    return false;
  }

  // Scheme-specific validation
  return Match.value(scheme).pipe(
    Match.whenOr("http", "https", () => isValidHttpIri(value)),
    Match.when("urn", () => isValidUrn(value)),
    Match.when("file", () => isValidFileIri(value)),
    Match.orElse(thunkFalse)
  );
};

/**
 * ClassIri - Validated IRI for OWL/RDFS class identifiers
 *
 * A branded string type that guarantees the value is a valid absolute IRI
 * suitable for identifying OWL/RDFS classes in ontologies.
 *
 * Supports common ontology IRI patterns:
 * - `http://www.w3.org/2002/07/owl#Class` (W3C OWL)
 * - `https://schema.org/Person` (Schema.org)
 * - `http://xmlns.com/foaf/0.1/Person` (FOAF)
 * - `urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf4` (URN)
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { ClassIri, makeClassIri, isClassIri } from "@beep/knowledge-domain/value-objects";
 *
 * // Valid IRIs
 * const owl = S.decodeSync(ClassIri)("http://www.w3.org/2002/07/owl#Class");
 * const schema = S.decodeSync(ClassIri)("https://schema.org/Person");
 *
 * // Using helpers
 * const iri = makeClassIri("https://schema.org/Person");
 * if (isClassIri(value)) { ... }
 *
 * // Invalid - will throw
 * S.decodeSync(ClassIri)("not-a-valid-iri"); // Error: Invalid IRI
 * S.decodeSync(ClassIri)("javascript:alert(1)"); // Error: Invalid scheme
 * ```
 *
 * @since 0.1.0
 * @category value-objects
 */
export class ClassIri extends S.Trimmed.pipe(
  S.nonEmptyString({
    message: () => "IRI must be a non-empty string",
  }),
  S.filter(isValidClassIri, {
    message: () =>
      `Invalid OWL/RDFS class IRI: must be an absolute IRI with scheme (${A.join(", ")(ClassIRIScheme.Options)})`,
  }),
  S.brand("ClassIri")
).annotations(
  $I.annotations("ClassIri", {
    title: "Class IRI",
    description: "Validated IRI (Internationalized Resource Identifier) for OWL/RDFS class definitions",
    jsonSchema: {
      type: "string",
      format: "iri",
      maxLength: CLASS_IRI_MAX_LENGTH,
      examples: [
        "http://www.w3.org/2002/07/owl#Class",
        "https://schema.org/Person",
        "http://xmlns.com/foaf/0.1/Person",
        "http://purl.org/dc/terms/Agent",
      ],
    },
  })
) {}

/**
 * Namespace for ClassIri type exports.
 *
 * @since 0.1.0
 * @category value-objects
 */
export declare namespace ClassIri {
  /**
   * Runtime type for validated ClassIri values.
   *
   * @example
   * ```typescript
   * const processClass = (iri: ClassIri.Type) => { ... };
   * ```
   */
  export type Type = typeof ClassIri.Type;

  /**
   * Encoded representation (string input).
   */
  export type Encoded = typeof ClassIri.Encoded;
}

/**
 * Creates a ClassIri from a string, throwing on invalid input.
 *
 * @example
 * ```typescript
 * const iri = makeClassIri("https://schema.org/Person");
 * ```
 *
 * @since 0.1.0
 * @category value-objects
 */
export const makeClassIri = S.decodeUnknownSync(ClassIri);

/**
 * Type guard for ClassIri values.
 *
 * @example
 * ```typescript
 * if (isClassIri(value)) {
 *   // value is typed as ClassIri.Type
 * }
 * ```
 *
 * @since 0.1.0
 * @category value-objects
 */
export const isClassIri = S.is(ClassIri);
