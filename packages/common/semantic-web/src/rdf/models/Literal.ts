import { $SemanticWebId } from "@beep/identity/packages";
import { LanguageDirection, ModelType } from "@beep/semantic-web/rdf/values";
import * as S from "effect/Schema";

import { NamedNode } from "./NamedNode";

const $I = $SemanticWebId.create("rdf/models/Literal");

export const LiteralEncoded = S.TemplateLiteral("<", S.String, ">").annotations(
  $I.annotations("LiteralEncoded", {
    description: "A named node in the RDF graph encoded as a string",
  })
);

export declare namespace LiteralEncoded {
  export type Type = typeof LiteralEncoded.Type;
  export type Encoded = typeof LiteralEncoded.Encoded;
}

export class Literal extends S.Class<Literal>($I`Literal`)(
  ModelType.makeKind.Literal({
    value: S.NonEmptyString,
    language: S.NonEmptyString,
    datatype: NamedNode,
    direction: LanguageDirection,
  }),
  $I.annotations("Literal", {
    description: "A named node in the RDF graph",
  })
) {
  static readonly Equivalence = S.equivalence(Literal);
  static readonly new = (
    value: string,
    language: string,
    datatype: NamedNode,
    direction: LanguageDirection.Type = LanguageDirection.Enum[""]
  ) =>
    new Literal({
      value,
      language,
      datatype,
      direction,
    });

  equals(that: Literal): boolean {
    return Literal.Equivalence(this, that);
  }
}
