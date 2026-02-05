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

export class ClassIRIScheme extends BS.StringLiteralKit("http", "https", "urn", "file").annotations(
  $I.annotations("ClassIRIScheme", {
    description: "Valid IRI scheme for OWL/RDFS ontologies",
    documentation:
      "- http/https: Web-based ontologies (W3C, schema.org)\n- urn: Namespace-based identifiers (UUID, ISBN)\n- file: Local file references",
  })
) {}
export type ValidSchema = typeof ClassIRIScheme.Type;

const DISALLOWED_CHARS_PATTERN = /[<>"{}|\\^`\x00-\x1f\x7f-\x9f]/;

const INVALID_PERCENT_ENCODING = /%(?![0-9A-Fa-f]{2})/;

export const CLASS_IRI_MAX_LENGTH = 2048;

const URN_PATTERN = /^urn:[a-zA-Z0-9][a-zA-Z0-9-]{0,31}:\S+$/;

const extractScheme = (iri: string): O.Option<string> =>
  F.pipe(
    iri,
    Str.indexOf(":"),
    O.map((idx) => F.pipe(iri, Str.slice(0, idx)))
  );

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

const isValidUrn = (iri: string): boolean => Str.match(URN_PATTERN)(iri).pipe(O.isSome);

const isValidFileIri = (iri: string): boolean =>
  Either.try(() => new URL(iri)).pipe(
    Either.match({
      onLeft: thunkFalse,
      onRight: (url) => url.protocol === "file:",
    })
  );

const isValidClassIri = (value: string): boolean => {
  if (Str.length(value) > CLASS_IRI_MAX_LENGTH) {
    return false;
  }

  if (DISALLOWED_CHARS_PATTERN.test(value)) {
    return false;
  }

  if (Str.includes(" ")(value)) {
    return false;
  }

  if (INVALID_PERCENT_ENCODING.test(value)) {
    return false;
  }

  const schemeOpt = extractScheme(value);
  if (O.isNone(schemeOpt)) {
    return false;
  }

  const scheme = Str.toLowerCase(schemeOpt.value);
  if (!S.is(ClassIRIScheme)(scheme)) {
    return false;
  }

  return Match.value(scheme).pipe(
    Match.whenOr("http", "https", () => isValidHttpIri(value)),
    Match.when("urn", () => isValidUrn(value)),
    Match.when("file", () => isValidFileIri(value)),
    Match.orElse(thunkFalse)
  );
};

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
) {
  static readonly is = S.is(ClassIri);
}

export declare namespace ClassIri {
  export type Type = typeof ClassIri.Type;
  export type Encoded = typeof ClassIri.Encoded;
}
