import {$SemanticWebId} from "@beep/identity/packages";
import {ModelType} from "@beep/semantic-web/rdf/values";
import {pipe} from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SemanticWebId.create("rdf/models/BlankNode");

export const BlankNodeEncoded = S.TemplateLiteral(
  "<",
  S.String,
  ">"
).annotations(
  $I.annotations(
    "BlankNodeEncoded",
    {
      description: "A named node in the RDF graph encoded as a string",
    }
  )
);

export declare namespace BlankNodeEncoded {
  export type Type = typeof BlankNodeEncoded.Type;
  export type Encoded = typeof BlankNodeEncoded.Encoded;
}

export class BlankNode extends S.Class<BlankNode>($I`BlankNode`)(
  ModelType.makeKind.BlankNode({
    value: S.NonEmptyString,
  }),
  $I.annotations(
    "BlankNode",
    {
      description: "A named node in the RDF graph",
    }
  )
) {
  static readonly Equivalence = S.equivalence(BlankNode);
  static readonly new = (value: string) => new BlankNode({value});

  equals(that: BlankNode): boolean {
    return BlankNode.Equivalence(this, that);
  }
}

export class BlankNodeFromString extends S.transform(
  BlankNodeEncoded,
  BlankNode,
  {
    strict: true,
    decode: (string) => pipe(
      string,
      Str.replace(">", ""),
      Str.replace("<", ""),
      BlankNode.new
    ),
    encode: ({value}) => `<${value}>` as const
  }
) {
}

export declare namespace BlankNode {
  export type Type = typeof BlankNode.Type;
}
