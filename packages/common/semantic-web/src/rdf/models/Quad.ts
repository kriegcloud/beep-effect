import {$SemanticWebId} from "@beep/identity/packages";
import {ModelType} from "@beep/semantic-web/rdf/values";
import {pipe} from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SemanticWebId.create("rdf/models/Quad");

export const QuadEncoded = S.TemplateLiteral(
  "<",
  S.String,
  ">"
).annotations(
  $I.annotations(
    "QuadEncoded",
    {
      description: "A named node in the RDF graph encoded as a string",
    }
  )
);

export declare namespace QuadEncoded {
  export type Type = typeof QuadEncoded.Type;
  export type Encoded = typeof QuadEncoded.Encoded;
}

export class Quad extends S.Class<Quad>($I`Quad`)(
  ModelType.makeKind.Quad({
    value: S.NonEmptyString,
  }),
  $I.annotations(
    "Quad",
    {
      description: "A named node in the RDF graph",
    }
  )
) {
  static readonly Equivalence = S.equivalence(Quad);
  static readonly new = (value: string) => new Quad({value});

  equals(that: Quad): boolean {
    return Quad.Equivalence(this, that);
  }
}

export class QuadFromString extends S.transform(
  QuadEncoded,
  Quad,
  {
    strict: true,
    decode: (string) => pipe(
      string,
      Str.replace(">", ""),
      Str.replace("<", ""),
      Quad.new
    ),
    encode: ({value}) => `<${value}>` as const
  }
) {
}

export declare namespace Quad {
  export type Type = typeof Quad.Type;
}
