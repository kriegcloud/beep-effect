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

/**
 * Element format type as used by Lexical. Can be a string literal or a numeric value.
 * Lexical's ElementFormatType is '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
 * but serialized data also uses numeric values (0 for default).
 */
export const ElementFormatSchema = S.Union(
  S.Literal("", "left", "start", "center", "right", "end", "justify"),
  S.Number
).annotations(
  $I.annotations("ElementFormatSchema", {
    description: "Element format type — string literal or numeric",
  })
);

/**
 * Base schema for element nodes that have children (recursive tree structure).
 */
export class SerializedElementNode extends SerializedLexicalNode.extend<SerializedElementNode>(
  $I`SerializedElementNode`
)(
  {
    children: S.Array(S.suspend((): S.Schema.AnyNoContext => SerializedLexicalNode)),
    direction: S.NullOr(S.Literal("ltr", "rtl")),
    format: ElementFormatSchema,
    indent: S.Number,
    textFormat: S.optional(S.Number),
    textStyle: S.optional(S.String),
  },
  $I.annotations("SerializedElementNode", {
    description: "Base schema for element nodes with children",
  })
) {}

/**
 * Base schema for text nodes.
 */
export class SerializedTextNode extends SerializedLexicalNode.extend<SerializedTextNode>($I`SerializedTextNode`)(
  {
    text: S.String,
    format: S.Number,
    detail: S.Number,
    mode: S.Literal("normal", "token", "segmented"),
    style: S.String,
  },
  $I.annotations("SerializedTextNode", {
    description: "Base schema for text nodes",
  })
) {}

/**
 * Base schema for decorator block nodes (Tweet, YouTube, Figma, etc.)
 * These extend SerializedLexicalNode with a format field for alignment.
 */
export class SerializedDecoratorBlockNode extends SerializedLexicalNode.extend<SerializedDecoratorBlockNode>(
  $I`SerializedDecoratorBlockNode`
)(
  {
    format: S.Union(S.Literal("", "left", "start", "center", "right", "end", "justify"), S.Number),
  },
  $I.annotations("SerializedDecoratorBlockNode", {
    description: "Base schema for decorator block nodes",
  })
) {}

/**
 * Raw field groups for composing concrete node schemas.
 * Concrete node schemas use S.Struct with these fields plus a specific type literal,
 * rather than extending the base classes (which disallow overriding the `type` field).
 */
export const BaseNodeFields = {
  version: S.Number,
  state: S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { as: "Option" } as const).pipe(S.fromKey("$")),
} as const;

export const ElementNodeFields = {
  ...BaseNodeFields,
  children: S.Array(S.suspend((): S.Schema.AnyNoContext => SerializedLexicalNode)),
  direction: S.NullOr(S.Literal("ltr", "rtl")),
  format: ElementFormatSchema,
  indent: S.Number,
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
} as const;

export const TextNodeFields = {
  ...BaseNodeFields,
  text: S.String,
  format: S.Number,
  detail: S.Number,
  mode: S.Literal("normal", "token", "segmented"),
  style: S.String,
} as const;

export const DecoratorBlockNodeFields = {
  ...BaseNodeFields,
  format: S.Union(S.Literal("", "left", "start", "center", "right", "end", "justify"), S.Number),
} as const;

export class SerializedEditorState extends S.Class<SerializedEditorState>($I`SerializedEditorState`)(
  {
    root: SerializedLexicalNode,
  },
  $I.annotations("SerializedEditorState", {
    description: "SerializedEditorState",
  })
) {}
