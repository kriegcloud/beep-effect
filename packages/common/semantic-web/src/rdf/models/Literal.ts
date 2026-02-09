import {$SemanticWebId} from "@beep/identity/packages";
import {ModelType} from "@beep/semantic-web/rdf/values";
import {pipe} from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SemanticWebId.create("rdf/models/Literal");

export const LiteralEncoded = S.TemplateLiteral(
  "<",
  S.String,
  ">"
).annotations(
  $I.annotations(
    "LiteralEncoded",
    {
      description: "A named node in the RDF graph encoded as a string",
    }
  )
);

export declare namespace LiteralEncoded {
  export type Type = typeof LiteralEncoded.Type;
  export type Encoded = typeof LiteralEncoded.Encoded;
}

export class Literal extends S.Class<Literal>($I`Literal`)(
  ModelType.makeKind.Literal({
    value: S.NonEmptyString,
  }),
  $I.annotations(
    "Literal",
    {
      description: "A named node in the RDF graph",
    }
  )
) {
  static readonly new = (value: string) => new Literal({value});
}

export class LiteralFromString extends S.transform(
  LiteralEncoded,
  Literal,
  {
    strict: true,
    decode: (string) => pipe(
      string,
      Str.replace(">", ""),
      Str.replace("<", ""),
      Literal.new
    ),
    encode: ({value}) => `<${value}>` as const
  }
) {
}

export declare namespace Literal {
  export type Type = typeof Literal.Type;
}