import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $TodoxId.create("lexical/schemas");

const NodeStateKey = S.Literal("$").annotations(
  $I.annotations("NodeStateKey", {
    description: "NodeStateKey",
  })
);

export declare namespace NodeStateKey {
  export type Type = typeof NodeStateKey.Type;
}

export class SerializedLexicalNode extends S.Class<SerializedLexicalNode>($I`SerializedLexicalNode`)(
  {
    type: S.String.annotations({
      description: "The type string used by the Node class",
    }),
    version: S.Number.annotations({
      description: "A numeric version for this schema, defaulting to 1, but not generally recommended for use",
    }),
    state: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { as: "Option" })
      .pipe(S.fromKey("$"))
      .annotations({
        description: "Any state persisted with the NodeState API that is not\nconfigured for flat storage",
      }),
  },
  $I.annotations("SerializedLexicalNode", {
    description: "SerializedLexicalNode",
  })
) {}

export class SerializedEditorState extends S.Class<SerializedEditorState>($I`SerializedEditorState`)(
  {
    root: SerializedLexicalNode,
  },
  $I.annotations("SerializedEditorState", {
    description: "SerializedEditorState",
  })
) {}
