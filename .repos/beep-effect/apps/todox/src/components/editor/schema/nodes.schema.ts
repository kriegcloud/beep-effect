import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { Editor, SerializedEditor } from "./editor.schema";
import { SerializedLexicalNode } from "./schemas";

const $I = $TodoxId.create("app/lexical/schema/nodes.schema");

export class NodeKey extends S.NonEmptyTrimmedString.pipe(S.brand("NodeKey")).annotations(
  $I.annotations("NodeKey", {
    description: "Lexical node key",
  })
) {}

export declare namespace NodeKey {
  export type Type = typeof NodeKey.Type;
  export type Encoded = typeof NodeKey.Encoded;
}

export class ImagePayload extends S.Class<ImagePayload>($I`ImagePayload`)(
  {
    caption: S.optionalWith(Editor, { as: "Option" }),

    key: S.optionalWith(NodeKey, { as: "Option" }),
    altText: S.String,
    height: S.optionalWith(S.NonNegative, { as: "Option" }),
    maxWidth: S.optionalWith(S.NonNegative, { as: "Option" }),
    showCaption: S.optionalWith(S.Boolean, { as: "Option" }),
    src: S.String,
    width: S.optionalWith(S.NonNegative, { as: "Option" }),
    captionsEnabled: S.optionalWith(S.Boolean, { as: "Option" }),
  },
  $I.annotations("ImagePayload", {
    description: "Payload for image node",
  })
) {}

export class SerializedImageNode extends SerializedLexicalNode.extend<SerializedImageNode>($I`SerializedImageNode`)(
  {
    caption: SerializedEditor,
    altText: S.String,
    height: S.optionalWith(S.NonNegative, { as: "Option" }),
    maxWidth: S.NonNegative,
    showCaption: S.Boolean,
    src: S.String,
    width: S.optionalWith(S.NonNegative, { as: "Option" }),
  },
  $I.annotations("SerializedImageNode", {
    description: "Serialized image node",
  })
) {}
