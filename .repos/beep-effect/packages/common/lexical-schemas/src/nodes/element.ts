/**
 * Element and container node schemas for Lexical serialization.
 *
 * Element nodes are container nodes that can have children.
 * This module defines the recursive SerializedLexicalNode union.
 *
 * @example
 * ```typescript
 * import { SerializedLexicalNode } from "@beep/lexical-schemas/nodes/element";
 * ```
 *
 * @category Nodes/Element
 * @since 0.1.0
 */

import { $LexicalSchemasId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $LexicalSchemasId.create("nodes/element");

import { ElementFormatType, TextDirectionType, TextModeType } from "./base.js";
import { HeadingTagType, ListTagType, ListTypeEnum } from "./plugins/index.js";

/**
 * Main recursive union of all Lexical node types.
 *
 * This is the core discriminated union that can represent any Lexical node.
 * Uses `S.suspend` to handle the recursive nature of container nodes.
 *
 * **Node Type Discrimination:**
 * - `"text"` -> Text leaf node
 * - `"linebreak"` -> Line break leaf node
 * - `"tab"` -> Tab leaf node
 * - `"paragraph"` -> Paragraph container
 * - `"root"` -> Root container
 * - `"heading"` -> Heading container (h1-h6)
 * - `"quote"` -> Quote/blockquote container
 * - `"list"` -> List container (ordered, unordered, checkbox)
 * - `"listitem"` -> List item container
 * - `"code"` -> Code block container
 * - `"code-highlight"` -> Code highlight leaf
 * - `"link"` -> Link container
 * - `"autolink"` -> Auto-detected link container
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SerializedLexicalNode } from "@beep/lexical-schemas/nodes/element";
 *
 * const node = SerializedLexicalNode.decodeSync({
 *   type: "text",
 *   version: 1,
 *   text: "Hello",
 *   format: 0,
 *   mode: "normal",
 *   style: "",
 *   detail: 0,
 * });
 * ```
 *
 * @category Nodes/Element
 * @since 0.1.0
 */
export class SerializedLexicalNode extends S.suspend(
  (): S.Schema<SerializedLexicalNode.Type> =>
    S.Union(
      // Text node (leaf)
      S.Struct({
        type: S.tag("text"),
        version: S.Number,
        text: S.String,
        format: S.Number,
        mode: TextModeType,
        style: S.String,
        detail: S.Number,
      }),
      // Line break node (leaf)
      S.Struct({
        type: S.tag("linebreak"),
        version: S.Number,
      }),
      // Tab node (leaf)
      S.Struct({
        type: S.tag("tab"),
        version: S.Number,
        text: S.String,
        format: S.Number,
        mode: TextModeType,
        style: S.String,
        detail: S.Number,
      }),
      // Paragraph node (container)
      S.Struct({
        type: S.tag("paragraph"),
        version: S.Number,
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Root node (container)
      S.Struct({
        type: S.tag("root"),
        version: S.Number,
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Heading node (plugin: lexical-rich-text)
      S.Struct({
        type: S.tag("heading"),
        version: S.Number,
        tag: HeadingTagType,
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Quote node (plugin: lexical-rich-text)
      S.Struct({
        type: S.tag("quote"),
        version: S.Number,
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // List node (plugin: lexical-list)
      S.Struct({
        type: S.tag("list"),
        version: S.Number,
        listType: ListTypeEnum,
        tag: ListTagType,
        start: S.Number,
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // List item node (plugin: lexical-list)
      S.Struct({
        type: S.tag("listitem"),
        version: S.Number,
        value: S.Number,
        checked: S.optional(S.Boolean),
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Code block node (plugin: lexical-code)
      S.Struct({
        type: S.tag("code"),
        version: S.Number,
        language: S.NullOr(S.String),
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Code highlight node (plugin: lexical-code)
      S.Struct({
        type: S.tag("code-highlight"),
        version: S.Number,
        text: S.String,
        highlightType: S.NullOr(S.String),
      }),
      // Link node (plugin: lexical-link)
      S.Struct({
        type: S.tag("link"),
        version: S.Number,
        url: S.String,
        rel: S.optional(S.NullOr(S.String)),
        target: S.optional(S.NullOr(S.String)),
        title: S.optional(S.NullOr(S.String)),
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Auto-link node (plugin: lexical-link)
      S.Struct({
        type: S.tag("autolink"),
        version: S.Number,
        url: S.String,
        isUnlinked: S.Boolean,
        rel: S.optional(S.NullOr(S.String)),
        target: S.optional(S.NullOr(S.String)),
        title: S.optional(S.NullOr(S.String)),
        children: S.Array(SerializedLexicalNode),
        direction: TextDirectionType,
        format: ElementFormatType,
        indent: S.Number,
        textFormat: S.optional(S.Number),
        textStyle: S.optional(S.String),
      }),
      // Horizontal rule (plugin: lexical-extension)
      S.Struct({
        type: S.tag("horizontalrule"),
        version: S.Number,
      })
    )
).annotations(
  $I.annotations("SerializedLexicalNode", {
    description: "Discriminated union of all Lexical node types (recursive)",
    documentation:
      "The core recursive discriminated union that can represent any Lexical node. Uses S.suspend for recursive children references. Discriminated by the 'type' field with values like 'text', 'paragraph', 'root', 'heading', 'list', etc.",
    message: () => "Invalid Lexical node structure",
    parseIssueTitle: () => "Lexical node validation failed",
  })
) {
  static readonly decodeSync = S.decodeSync(SerializedLexicalNode);
  static readonly encodeSync = S.encodeSync(SerializedLexicalNode);
  static readonly decodeUnknownSync = S.decodeUnknownSync(SerializedLexicalNode);
}

/**
 * Namespace for SerializedLexicalNode types.
 *
 * @category Nodes/Element
 * @since 0.1.0
 */
export declare namespace SerializedLexicalNode {
  /**
   * Text node type.
   */
  type TextNode = {
    readonly type: "text";
    readonly version: number;
    readonly text: string;
    readonly format: number;
    readonly mode: "normal" | "token" | "segmented";
    readonly style: string;
    readonly detail: number;
  };

  /**
   * Line break node type.
   */
  type LineBreakNode = {
    readonly type: "linebreak";
    readonly version: number;
  };

  /**
   * Tab node type.
   */
  type TabNode = {
    readonly type: "tab";
    readonly version: number;
    readonly text: string;
    readonly format: number;
    readonly mode: "normal" | "token" | "segmented";
    readonly style: string;
    readonly detail: number;
  };

  /**
   * Paragraph node type.
   */
  type ParagraphNode = {
    readonly type: "paragraph";
    readonly version: number;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Root node type.
   */
  type RootNode = {
    readonly type: "root";
    readonly version: number;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Heading node type.
   */
  type HeadingNode = {
    readonly type: "heading";
    readonly version: number;
    readonly tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Quote node type.
   */
  type QuoteNode = {
    readonly type: "quote";
    readonly version: number;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * List node type.
   */
  type ListNode = {
    readonly type: "list";
    readonly version: number;
    readonly listType: "number" | "bullet" | "check";
    readonly tag: "ul" | "ol";
    readonly start: number;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * List item node type.
   */
  type ListItemNode = {
    readonly type: "listitem";
    readonly version: number;
    readonly value: number;
    readonly checked?: undefined | boolean;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Code block node type.
   */
  type CodeNode = {
    readonly type: "code";
    readonly version: number;
    readonly language: string | null;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Code highlight node type.
   */
  type CodeHighlightNode = {
    readonly type: "code-highlight";
    readonly version: number;
    readonly text: string;
    readonly highlightType: string | null;
  };

  /**
   * Link node type.
   */
  type LinkNode = {
    readonly type: "link";
    readonly version: number;
    readonly url: string;
    readonly rel?: undefined | string | null;
    readonly target?: undefined | string | null;
    readonly title?: undefined | string | null;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Auto-link node type.
   */
  type AutoLinkNode = {
    readonly type: "autolink";
    readonly version: number;
    readonly url: string;
    readonly isUnlinked: boolean;
    readonly rel?: undefined | string | null;
    readonly target?: undefined | string | null;
    readonly title?: undefined | string | null;
    readonly children: ReadonlyArray<Type>;
    readonly direction: "ltr" | "rtl" | null;
    readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | "";
    readonly indent: number;
    readonly textFormat?: undefined | number;
    readonly textStyle?: undefined | string;
  };

  /**
   * Horizontal rule node type.
   */
  type HorizontalRuleNode = {
    readonly type: "horizontalrule";
    readonly version: number;
  };

  /**
   * Runtime type representing any valid Lexical node.
   */
  export type Type =
    | TextNode
    | LineBreakNode
    | TabNode
    | ParagraphNode
    | RootNode
    | HeadingNode
    | QuoteNode
    | ListNode
    | ListItemNode
    | CodeNode
    | CodeHighlightNode
    | LinkNode
    | AutoLinkNode
    | HorizontalRuleNode;

  /**
   * Encoded representation (JSON wire format).
   */
  export type Encoded = typeof SerializedLexicalNode.Encoded;
}

/**
 * Serialized root node schema.
 *
 * The root node is the top-level container for all editor content.
 * This is a convenience schema for validating just the root structure.
 *
 * @category Nodes/Element
 * @since 0.1.0
 */
export const SerializedRootNode = S.Struct({
  type: S.tag("root"),
  version: S.Number,
  children: S.Array(SerializedLexicalNode),
  direction: TextDirectionType,
  format: ElementFormatType,
  indent: S.Number,
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
}).annotations(
  $I.annotations("SerializedRootNode", {
    description: "Root container node for the entire editor content",
    documentation:
      "The top-level container node that wraps all editor content. Every Lexical editor state has exactly one root node. Contains block-level children like paragraphs, headings, and lists.",
    message: () => "Invalid root node structure",
    parseIssueTitle: () => "Root node validation failed",
  })
);

/**
 * Namespace for SerializedRootNode types.
 *
 * @category Nodes/Element
 * @since 0.1.0
 */
export declare namespace SerializedRootNode {
  export type Type = typeof SerializedRootNode.Type;
  export type Encoded = typeof SerializedRootNode.Encoded;
}

/**
 * Serialized paragraph node schema.
 *
 * Paragraph nodes are the standard block-level container for text content.
 *
 * @category Nodes/Element
 * @since 0.1.0
 */
export const SerializedParagraphNode = S.Struct({
  type: S.tag("paragraph"),
  version: S.Number,
  children: S.Array(SerializedLexicalNode),
  direction: TextDirectionType,
  format: ElementFormatType,
  indent: S.Number,
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
}).annotations(
  $I.annotations("SerializedParagraphNode", {
    description: "Paragraph container node for text content",
    documentation:
      "Standard block-level container for text content. Paragraphs can contain text nodes, line breaks, tabs, and inline elements like links. They support text alignment via format and indentation via indent.",
    message: () => "Invalid paragraph node structure",
    parseIssueTitle: () => "Paragraph node validation failed",
  })
);

/**
 * Namespace for SerializedParagraphNode types.
 *
 * @category Nodes/Element
 * @since 0.1.0
 */
export declare namespace SerializedParagraphNode {
  export type Type = typeof SerializedParagraphNode.Type;
  export type Encoded = typeof SerializedParagraphNode.Encoded;
}
