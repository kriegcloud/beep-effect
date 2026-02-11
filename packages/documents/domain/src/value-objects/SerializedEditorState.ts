import { $DocumentsDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $DocumentsDomainId.create("value-objects/SerializedEditorState");

// ---------------------------------------------------------------------------
// SerializedLexicalNodeEnvelope — base node
// ---------------------------------------------------------------------------

const baseNodeFields = {
  type: S.String,
  version: S.Number,
  $: S.optional(S.Record({ key: S.String, value: S.Unknown })),
};

export interface SerializedLexicalNodeEnvelopeFrom {
  readonly type: string;
  readonly version: number;
  readonly $?: { readonly [x: string]: unknown } | undefined;
}

export const SerializedLexicalNodeEnvelope: S.Schema<
  SerializedLexicalNodeEnvelopeFrom,
  SerializedLexicalNodeEnvelopeFrom
> = S.suspend(() => _SerializedLexicalNodeEnvelope).annotations(
  $I.annotations("SerializedLexicalNodeEnvelope", {
    description: "Base Lexical node envelope: type, version, optional $ state",
  })
);

const _SerializedLexicalNodeEnvelope = S.Struct(baseNodeFields);

export declare namespace SerializedLexicalNodeEnvelope {
  export type Type = typeof _SerializedLexicalNodeEnvelope.Type;
  export type Encoded = typeof _SerializedLexicalNodeEnvelope.Encoded;
}

// ---------------------------------------------------------------------------
// SerializedTextNodeEnvelope — text leaf node
// ---------------------------------------------------------------------------

export const SerializedTextNodeEnvelope = S.Struct({
  ...baseNodeFields,
  text: S.String,
  format: S.Number,
  detail: S.Number,
  mode: S.Literal("normal", "token", "segmented"),
  style: S.String,
}).annotations(
  $I.annotations("SerializedTextNodeEnvelope", {
    description: "Text node envelope: text content with bitmask formatting",
  })
);

export declare namespace SerializedTextNodeEnvelope {
  export type Type = typeof SerializedTextNodeEnvelope.Type;
  export type Encoded = typeof SerializedTextNodeEnvelope.Encoded;
}

// ---------------------------------------------------------------------------
// ElementFormatType — string literal OR numeric format
// ---------------------------------------------------------------------------

const ElementFormatType = S.Union(S.Literal("", "left", "start", "center", "right", "end", "justify"), S.Number);

// ---------------------------------------------------------------------------
// SerializedElementNodeEnvelope — element node with recursive children
// ---------------------------------------------------------------------------

const elementNodeFields = {
  ...baseNodeFields,
  direction: S.NullOr(S.Literal("ltr", "rtl")),
  format: ElementFormatType,
  indent: S.Number,
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
};

export interface SerializedElementNodeEnvelopeType {
  readonly type: string;
  readonly version: number;
  readonly $?: { readonly [x: string]: unknown } | undefined;
  readonly children: ReadonlyArray<SerializedLexicalNodeEnvelopeFrom>;
  readonly direction: "ltr" | "rtl" | null;
  readonly format: "" | "left" | "start" | "center" | "right" | "end" | "justify" | number;
  readonly indent: number;
  readonly textFormat?: number | undefined;
  readonly textStyle?: string | undefined;
}

export const SerializedElementNodeEnvelope: S.Schema<
  SerializedElementNodeEnvelopeType,
  SerializedElementNodeEnvelopeType
> = S.Struct({
  ...elementNodeFields,
  children: S.Array(S.suspend((): S.Schema<SerializedLexicalNodeEnvelopeFrom> => SerializedLexicalNodeEnvelope)),
}).annotations(
  $I.annotations("SerializedElementNodeEnvelope", {
    description: "Element node envelope: recursive children with direction and format",
  })
);

export declare namespace SerializedElementNodeEnvelope {
  export type Type = SerializedElementNodeEnvelopeType;
  export type Encoded = SerializedElementNodeEnvelopeType;
}

// ---------------------------------------------------------------------------
// SerializedRootNodeEnvelope — root element (type = "root")
// ---------------------------------------------------------------------------

export const SerializedRootNodeEnvelope = S.Struct({
  ...elementNodeFields,
  type: S.Literal("root"),
  children: S.Array(S.suspend((): S.Schema<SerializedLexicalNodeEnvelopeFrom> => SerializedLexicalNodeEnvelope)),
}).annotations(
  $I.annotations("SerializedRootNodeEnvelope", {
    description: "Root node envelope: top-level element with type='root'",
  })
);

export declare namespace SerializedRootNodeEnvelope {
  export type Type = typeof SerializedRootNodeEnvelope.Type;
  export type Encoded = typeof SerializedRootNodeEnvelope.Encoded;
}

// ---------------------------------------------------------------------------
// SerializedEditorStateEnvelope — top-level { root: ... }
// ---------------------------------------------------------------------------

export const SerializedEditorStateEnvelope = S.Struct({
  root: SerializedRootNodeEnvelope,
}).annotations(
  $I.annotations("SerializedEditorStateEnvelope", {
    description: "Lexical editor state envelope: wraps the root node",
  })
);

export declare namespace SerializedEditorStateEnvelope {
  export type Type = typeof SerializedEditorStateEnvelope.Type;
  export type Encoded = typeof SerializedEditorStateEnvelope.Encoded;
}
