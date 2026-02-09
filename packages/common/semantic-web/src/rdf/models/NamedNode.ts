import { $SemanticWebId } from "@beep/identity/packages";
import { ModelType } from "@beep/semantic-web/rdf/values";
import { pipe } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SemanticWebId.create("rdf/models/NamedNode");

export const NamedNodeEncoded = S.TemplateLiteral("<", S.String, ">").annotations(
  $I.annotations("NamedNodeEncoded", {
    description: "A named node in the RDF graph encoded as a string",
  })
);

export declare namespace NamedNodeEncoded {
  export type Type = typeof NamedNodeEncoded.Type;
  export type Encoded = typeof NamedNodeEncoded.Encoded;
}

export class NamedNode extends S.Class<NamedNode>($I`NamedNode`)(
  ModelType.makeKind.NamedNode({
    value: S.NonEmptyString,
  }),
  $I.annotations("NamedNode", {
    description: "A named node in the RDF graph",
  })
) {
  static readonly Equivalence = S.equivalence(NamedNode);
  static readonly new = (value: string) => new NamedNode({ value });

  equals(that: NamedNode): boolean {
    return NamedNode.Equivalence(this, that);
  }
}

export class NamedNodeFromString extends S.transform(NamedNodeEncoded, NamedNode, {
  strict: true,
  decode: (string) => pipe(string, Str.replace(">", ""), Str.replace("<", ""), NamedNode.new),
  encode: ({ value }) => `<${value}>` as const,
}) {}

export declare namespace NamedNode {
  export type Type = typeof NamedNode.Type;
}
