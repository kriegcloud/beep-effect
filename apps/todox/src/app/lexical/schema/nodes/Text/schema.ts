import { $TodoxId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import { SerializedLexicalNode } from "@beep/todox/app/lexical/schema/schemas";
import * as S from "effect/Schema";

const $I = $TodoxId.create("app/lexical/schema/nodes/Text/schema");

export class ModeType extends BS.StringLiteralKit("normal", "token", "segmented").annotations(
  $I.annotations("ModeType", {
    description: "Mode for TextNode",
  })
) {}

export declare namespace ModeType {
  export type Type = typeof ModeType.Type;
  export type Encoded = typeof ModeType.Encoded;
}

export const makeNodeVariant = ModeType.toTagged("mode").composer({
  detail: S.Number,
  format: S.Number,
  style: S.String,
  text: S.String,
});

export class Normal extends SerializedLexicalNode.extend<Normal>($I`NormalTextNode`)(
  makeNodeVariant.normal({}),
  $I.annotations("NormalTextNode", {
    description: "Normal text node",
  })
) {}

export class Token extends SerializedLexicalNode.extend<Token>($I`TokenTextNode`)(
  makeNodeVariant.token({}),
  $I.annotations("NormalTextNode", {
    description: "Token text node",
  })
) {}

export class Segmented extends SerializedLexicalNode.extend<Segmented>($I`SegmentedTextNode`)(
  makeNodeVariant.segmented({}),
  $I.annotations("NormalTextNode", {
    description: "Segmented text node",
  })
) {}

export class Node extends S.Union(Normal, Token, Segmented).annotations(
  $I.annotations("Node", {
    description: "Serialized text node",
  })
) {}

export declare namespace Node {
  export type Type = typeof Node.Type;
  export type Encoded = typeof Node.Encoded;
}
