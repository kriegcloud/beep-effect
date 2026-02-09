import { $SemanticWebId } from "@beep/identity/packages";
import { ModelType } from "@beep/semantic-web/rdf/values";
import * as S from "effect/Schema";

const $I = $SemanticWebId.create("rdf/models/Quad");

export const QuadEncoded = S.TemplateLiteral("<", S.String, ">").annotations(
  $I.annotations("QuadEncoded", {
    description: "A named node in the RDF graph encoded as a string",
  })
);

export declare namespace QuadEncoded {
  export type Type = typeof QuadEncoded.Type;
  export type Encoded = typeof QuadEncoded.Encoded;
}

export class Quad extends S.Class<Quad>($I`Quad`)(
  ModelType.makeKind.Quad({
    value: S.String.pipe(S.optionalWith({ default: () => "" })),
    subject: S.Unknown,
    predicate: S.Unknown,
    object: S.Unknown,
    graph: S.Unknown,
  }),
  $I.annotations("Quad", {
    description: "A named node in the RDF graph",
  })
) {
  static readonly Equivalence = S.equivalence(Quad);
  static readonly new = (subject: unknown, predicate: unknown, object: unknown, graph: unknown) =>
    new Quad({
      subject,
      predicate,
      object,
      graph,
    });

  equals(that: Quad): boolean {
    return Quad.Equivalence(this, that);
  }
}

export declare namespace Quad {
  export type Type = typeof Quad.Type;
}
