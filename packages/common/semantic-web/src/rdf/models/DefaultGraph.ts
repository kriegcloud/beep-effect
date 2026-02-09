import {$SemanticWebId} from "@beep/identity/packages";
import {ModelType} from "@beep/semantic-web/rdf/values";
import {pipe} from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SemanticWebId.create("rdf/model");

export const DefaultGraphEncoded = S.TemplateLiteral(
  "<",
  S.String,
  ">"
).annotations(
  $I.annotations(
    "DefaultGraphEncoded",
    {
      description: "A named node in the RDF graph encoded as a string",
    }
  )
);

export declare namespace DefaultGraphEncoded {
  export type Type = typeof DefaultGraphEncoded.Type;
  export type Encoded = typeof DefaultGraphEncoded.Encoded;
}

export class DefaultGraph extends S.Class<DefaultGraph>($I`DefaultGraph`)(
  ModelType.makeKind.DefaultGraph({
    value: S.NonEmptyString,
  }),
  $I.annotations(
    "DefaultGraph",
    {
      description: "A named node in the RDF graph",
    }
  )
) {
  static readonly Equivalence = S.equivalence(DefaultGraph);
  static readonly new = (value: string) => new DefaultGraph({value});

  equals(that: DefaultGraph): boolean {
    return DefaultGraph.Equivalence(this, that);
  }
}

export class DefaultGraphFromString extends S.transform(
  DefaultGraphEncoded,
  DefaultGraph,
  {
    strict: true,
    decode: (string) => pipe(
      string,
      Str.replace(">", ""),
      Str.replace("<", ""),
      DefaultGraph.new
    ),
    encode: ({value}) => `<${value}>` as const
  }
) {
}

export declare namespace DefaultGraph {
  export type Type = typeof DefaultGraph.Type;
}
