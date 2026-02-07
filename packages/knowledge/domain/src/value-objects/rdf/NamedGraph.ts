import { $KnowledgeDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $KnowledgeDomainId.create("value-objects/rdf/NamedGraph");

export class NamedGraphScheme extends BS.StringLiteralKit("http", "https", "urn").annotations(
  $I.annotations("NamedGraphScheme", {
    description: "Allowed schemes for named graph identifiers",
  })
) {}

export declare namespace NamedGraphScheme {
  export type Type = typeof NamedGraphScheme.Type;
}

const URN_PATTERN = /^urn:[a-zA-Z0-9][a-zA-Z0-9-]{0,31}:\S+$/;

const extractScheme = (value: string): O.Option<string> =>
  F.pipe(
    value,
    Str.indexOf(":"),
    O.map((index) => F.pipe(value, Str.slice(0, index)))
  );

const isHttpIri = (value: string): boolean =>
  Either.try(() => new URL(value)).pipe(
    Either.match({
      onLeft: () => false,
      onRight: (url) => url.protocol === "http:" || url.protocol === "https:",
    })
  );

const isUrn = (value: string): boolean => Str.match(URN_PATTERN)(value).pipe(O.isSome);

const isValidGraphIri = (value: string): boolean => {
  const schemeOpt = extractScheme(value);
  if (O.isNone(schemeOpt)) {
    return false;
  }

  const scheme = Str.toLowerCase(schemeOpt.value);
  if (!S.is(NamedGraphScheme)(scheme)) {
    return false;
  }

  switch (scheme) {
    case "http":
    case "https":
      return isHttpIri(value);
    case "urn":
      return isUrn(value);
    default:
      return false;
  }
};

export class GraphIri extends S.NonEmptyTrimmedString.pipe(
  S.filter(isValidGraphIri, {
    message: () => "Named graph identifier must be a valid absolute HTTP(S) IRI or URN",
  }),
  S.brand("GraphIri")
).annotations(
  $I.annotations("GraphIri", {
    title: "Graph IRI",
    description: "IRI/URN used as an RDF named graph identifier",
  })
) {
  static readonly is = S.is(GraphIri);
}

export declare namespace GraphIri {
  export type Type = typeof GraphIri.Type;
  export type Encoded = typeof GraphIri.Encoded;
}

export class NamedGraph extends S.Class<NamedGraph>($I`NamedGraph`)(
  {
    iri: GraphIri,
    created: BS.DateTimeUtcFromAllAcceptable,
    quadCount: S.NonNegativeInt,
  },
  $I.annotations("NamedGraph", {
    description: "Named graph metadata with validated graph IRI/URN semantics",
  })
) {}

export declare namespace NamedGraph {
  export type Type = typeof NamedGraph.Type;
}
