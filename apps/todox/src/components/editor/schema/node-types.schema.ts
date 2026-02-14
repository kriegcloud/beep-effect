import { $TodoxId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { SerializedEditor } from "./editor.schema";
import { SerializedImageNode } from "./nodes.schema";
import { BaseNodeFields, DecoratorBlockNodeFields, ElementNodeFields, TextNodeFields } from "./schemas";

const $I = $TodoxId.create("app/lexical/schema/node-types");

// ---------------------------------------------------------------------------
// Block Elements (element node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedRootNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("root"),
}).annotations(
  $I.annotations("SerializedRootNode", {
    description: "Root node of the editor tree",
  })
);
export type SerializedRootNode = typeof SerializedRootNode.Type;

export const SerializedParagraphNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("paragraph"),
  textFormat: S.optional(S.Number),
  textStyle: S.optional(S.String),
}).annotations(
  $I.annotations("SerializedParagraphNode", {
    description: "Paragraph block node",
  })
);
export type SerializedParagraphNode = typeof SerializedParagraphNode.Type;

export const SerializedHeadingNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("heading"),
  tag: S.Literal("h1", "h2", "h3", "h4", "h5", "h6"),
}).annotations(
  $I.annotations("SerializedHeadingNode", {
    description: "Heading block node",
  })
);
export type SerializedHeadingNode = typeof SerializedHeadingNode.Type;

export const SerializedQuoteNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("quote"),
}).annotations(
  $I.annotations("SerializedQuoteNode", {
    description: "Block quote node",
  })
);
export type SerializedQuoteNode = typeof SerializedQuoteNode.Type;

export const SerializedCodeNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("code"),
  language: S.optional(S.NullOr(S.String)),
}).annotations(
  $I.annotations("SerializedCodeNode", {
    description: "Code block node",
  })
);
export type SerializedCodeNode = typeof SerializedCodeNode.Type;

// ---------------------------------------------------------------------------
// List Elements (element node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedListNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("list"),
  listType: S.Literal("bullet", "number", "check"),
  start: S.Number,
  tag: S.Literal("ol", "ul"),
}).annotations(
  $I.annotations("SerializedListNode", {
    description: "List container node",
  })
);
export type SerializedListNode = typeof SerializedListNode.Type;

export const SerializedListItemNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("listitem"),
  checked: S.optional(S.Boolean),
  value: S.Number,
}).annotations(
  $I.annotations("SerializedListItemNode", {
    description: "List item node",
  })
);
export type SerializedListItemNode = typeof SerializedListItemNode.Type;

// ---------------------------------------------------------------------------
// Table Elements (element node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedTableNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("table"),
  colWidths: S.optional(S.Array(S.Number)),
  rowStriping: S.optional(S.Boolean),
}).annotations(
  $I.annotations("SerializedTableNode", {
    description: "Table container node",
  })
);
export type SerializedTableNode = typeof SerializedTableNode.Type;

export const SerializedTableRowNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("tablerow"),
  height: S.optional(S.Number),
}).annotations(
  $I.annotations("SerializedTableRowNode", {
    description: "Table row node",
  })
);
export type SerializedTableRowNode = typeof SerializedTableRowNode.Type;

export const SerializedTableCellNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("tablecell"),
  colSpan: S.Number,
  rowSpan: S.Number,
  headerState: S.Number,
  width: S.optional(S.Number),
  backgroundColor: S.optional(S.String),
}).annotations(
  $I.annotations("SerializedTableCellNode", {
    description: "Table cell node",
  })
);
export type SerializedTableCellNode = typeof SerializedTableCellNode.Type;

// ---------------------------------------------------------------------------
// Inline Elements (element node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedLinkNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("link"),
  url: S.String,
  rel: S.optional(S.NullOr(S.String)),
  target: S.optional(S.NullOr(S.String)),
  title: S.optional(S.NullOr(S.String)),
}).annotations(
  $I.annotations("SerializedLinkNode", {
    description: "Link inline element node",
  })
);
export type SerializedLinkNode = typeof SerializedLinkNode.Type;

export const SerializedAutoLinkNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("autolink"),
  url: S.String,
  rel: S.optional(S.NullOr(S.String)),
  target: S.optional(S.NullOr(S.String)),
  title: S.optional(S.NullOr(S.String)),
  isUnlinked: S.Boolean,
}).annotations(
  $I.annotations("SerializedAutoLinkNode", {
    description: "Auto-detected link node",
  })
);
export type SerializedAutoLinkNode = typeof SerializedAutoLinkNode.Type;

export const SerializedMarkNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("mark"),
  ids: S.Array(S.String),
}).annotations(
  $I.annotations("SerializedMarkNode", {
    description: "Mark/highlight node with comment IDs",
  })
);
export type SerializedMarkNode = typeof SerializedMarkNode.Type;

export const SerializedOverflowNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("overflow"),
}).annotations(
  $I.annotations("SerializedOverflowNode", {
    description: "Overflow node for truncated content",
  })
);
export type SerializedOverflowNode = typeof SerializedOverflowNode.Type;

// ---------------------------------------------------------------------------
// Text Variations (text node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedTextNodeTyped = S.Struct({
  ...TextNodeFields,
  type: S.Literal("text"),
}).annotations(
  $I.annotations("SerializedTextNodeTyped", {
    description: "Basic text node",
  })
);
export type SerializedTextNodeTyped = typeof SerializedTextNodeTyped.Type;

export const SerializedCodeHighlightNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("code-highlight"),
  highlightType: S.optional(S.NullOr(S.String)),
}).annotations(
  $I.annotations("SerializedCodeHighlightNode", {
    description: "Syntax-highlighted code token",
  })
);
export type SerializedCodeHighlightNode = typeof SerializedCodeHighlightNode.Type;

export const SerializedTabNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("tab"),
}).annotations(
  $I.annotations("SerializedTabNode", {
    description: "Tab character node",
  })
);
export type SerializedTabNode = typeof SerializedTabNode.Type;

export const SerializedHashtagNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("hashtag"),
}).annotations(
  $I.annotations("SerializedHashtagNode", {
    description: "Hashtag text node",
  })
);
export type SerializedHashtagNode = typeof SerializedHashtagNode.Type;

export const SerializedMentionNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("mention"),
  mentionName: S.String,
}).annotations(
  $I.annotations("SerializedMentionNode", {
    description: "Mention text node",
  })
);
export type SerializedMentionNode = typeof SerializedMentionNode.Type;

export const SerializedEmojiNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("emoji"),
  className: S.String,
}).annotations(
  $I.annotations("SerializedEmojiNode", {
    description: "Emoji text node",
  })
);
export type SerializedEmojiNode = typeof SerializedEmojiNode.Type;

export const SerializedKeywordNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("keyword"),
}).annotations(
  $I.annotations("SerializedKeywordNode", {
    description: "Keyword text node",
  })
);
export type SerializedKeywordNode = typeof SerializedKeywordNode.Type;

export const SerializedAutocompleteNode = S.Struct({
  ...TextNodeFields,
  type: S.Literal("autocomplete"),
  uuid: S.String,
}).annotations(
  $I.annotations("SerializedAutocompleteNode", {
    description: "Autocomplete suggestion node",
  })
);
export type SerializedAutocompleteNode = typeof SerializedAutocompleteNode.Type;

// ---------------------------------------------------------------------------
// Leaf Nodes (base node fields + type literal — no children, no text)
// ---------------------------------------------------------------------------

export const SerializedLineBreakNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("linebreak"),
}).annotations(
  $I.annotations("SerializedLineBreakNode", {
    description: "Line break node",
  })
);
export type SerializedLineBreakNode = typeof SerializedLineBreakNode.Type;

export const SerializedHorizontalRuleNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("horizontalrule"),
}).annotations(
  $I.annotations("SerializedHorizontalRuleNode", {
    description: "Horizontal rule node",
  })
);
export type SerializedHorizontalRuleNode = typeof SerializedHorizontalRuleNode.Type;

export const SerializedPageBreakNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("page-break"),
}).annotations(
  $I.annotations("SerializedPageBreakNode", {
    description: "Page break node",
  })
);
export type SerializedPageBreakNode = typeof SerializedPageBreakNode.Type;

// ---------------------------------------------------------------------------
// Decorator Block Nodes (decorator block fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedTweetNode = S.Struct({
  ...DecoratorBlockNodeFields,
  type: S.Literal("tweet"),
  id: S.String,
}).annotations(
  $I.annotations("SerializedTweetNode", {
    description: "Embedded tweet node",
  })
);
export type SerializedTweetNode = typeof SerializedTweetNode.Type;

export const SerializedYouTubeNode = S.Struct({
  ...DecoratorBlockNodeFields,
  type: S.Literal("youtube"),
  videoID: S.String,
}).annotations(
  $I.annotations("SerializedYouTubeNode", {
    description: "Embedded YouTube video node",
  })
);
export type SerializedYouTubeNode = typeof SerializedYouTubeNode.Type;

export const SerializedFigmaNode = S.Struct({
  ...DecoratorBlockNodeFields,
  type: S.Literal("figma"),
  documentID: S.String,
}).annotations(
  $I.annotations("SerializedFigmaNode", {
    description: "Embedded Figma document node",
  })
);
export type SerializedFigmaNode = typeof SerializedFigmaNode.Type;

// ---------------------------------------------------------------------------
// Decorator Leaf Nodes (base node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedExcalidrawNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("excalidraw"),
  data: S.String,
  width: S.optional(S.Number),
  height: S.optional(S.Number),
}).annotations(
  $I.annotations("SerializedExcalidrawNode", {
    description: "Embedded Excalidraw drawing node",
  })
);
export type SerializedExcalidrawNode = typeof SerializedExcalidrawNode.Type;

export const SerializedEquationNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("equation"),
  equation: S.String,
  inline: S.Boolean,
}).annotations(
  $I.annotations("SerializedEquationNode", {
    description: "LaTeX equation node",
  })
);
export type SerializedEquationNode = typeof SerializedEquationNode.Type;

export const SerializedStickyNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("sticky"),
  xOffset: S.Number,
  yOffset: S.Number,
  color: S.Literal("pink", "yellow"),
  caption: SerializedEditor,
}).annotations(
  $I.annotations("SerializedStickyNode", {
    description: "Sticky note node",
  })
);
export type SerializedStickyNode = typeof SerializedStickyNode.Type;

/**
 * Poll node uses Lexical's NodeState API with flat storage.
 * The `question` and `options` fields are stored at the top level of the serialized JSON.
 */
const PollOptionSchema = S.Struct({
  text: S.String,
  uid: S.String,
  votes: S.Array(S.String),
});

export const SerializedPollNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("poll"),
  question: S.String,
  options: S.Array(PollOptionSchema),
}).annotations(
  $I.annotations("SerializedPollNode", {
    description: "Interactive poll node",
  })
);
export type SerializedPollNode = typeof SerializedPollNode.Type;

/**
 * DateTime node uses Lexical's NodeState API with flat storage.
 * The `dateTime` field is stored as an ISO string at the top level.
 */
export const SerializedDateTimeNode = S.Struct({
  ...BaseNodeFields,
  type: S.Literal("datetime"),
  dateTime: S.optional(S.String),
}).annotations(
  $I.annotations("SerializedDateTimeNode", {
    description: "DateTime decorator node",
  })
);
export type SerializedDateTimeNode = typeof SerializedDateTimeNode.Type;

// ---------------------------------------------------------------------------
// Collapsible Nodes (element node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedCollapsibleContainerNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("collapsible-container"),
  open: S.Boolean,
}).annotations(
  $I.annotations("SerializedCollapsibleContainerNode", {
    description: "Collapsible container (details element)",
  })
);
export type SerializedCollapsibleContainerNode = typeof SerializedCollapsibleContainerNode.Type;

export const SerializedCollapsibleContentNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("collapsible-content"),
}).annotations(
  $I.annotations("SerializedCollapsibleContentNode", {
    description: "Content section of a collapsible",
  })
);
export type SerializedCollapsibleContentNode = typeof SerializedCollapsibleContentNode.Type;

export const SerializedCollapsibleTitleNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("collapsible-title"),
}).annotations(
  $I.annotations("SerializedCollapsibleTitleNode", {
    description: "Title/summary of a collapsible",
  })
);
export type SerializedCollapsibleTitleNode = typeof SerializedCollapsibleTitleNode.Type;

// ---------------------------------------------------------------------------
// Layout Nodes (element node fields + type literal)
// ---------------------------------------------------------------------------

export const SerializedLayoutContainerNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("layout-container"),
  templateColumns: S.String,
}).annotations(
  $I.annotations("SerializedLayoutContainerNode", {
    description: "CSS grid layout container node",
  })
);
export type SerializedLayoutContainerNode = typeof SerializedLayoutContainerNode.Type;

export const SerializedLayoutItemNode = S.Struct({
  ...ElementNodeFields,
  type: S.Literal("layout-item"),
}).annotations(
  $I.annotations("SerializedLayoutItemNode", {
    description: "Layout grid item node",
  })
);
export type SerializedLayoutItemNode = typeof SerializedLayoutItemNode.Type;

// ---------------------------------------------------------------------------
// Discriminated Union of All Node Types
// ---------------------------------------------------------------------------

export const SerializedLexicalNodeUnion = S.Union(
  // Block elements
  SerializedRootNode,
  SerializedParagraphNode,
  SerializedHeadingNode,
  SerializedQuoteNode,
  SerializedCodeNode,
  // List elements
  SerializedListNode,
  SerializedListItemNode,
  // Table elements
  SerializedTableNode,
  SerializedTableRowNode,
  SerializedTableCellNode,
  // Inline elements
  SerializedLinkNode,
  SerializedAutoLinkNode,
  SerializedMarkNode,
  SerializedOverflowNode,
  // Text variations
  SerializedTextNodeTyped,
  SerializedCodeHighlightNode,
  SerializedTabNode,
  SerializedHashtagNode,
  SerializedMentionNode,
  SerializedEmojiNode,
  SerializedKeywordNode,
  SerializedAutocompleteNode,
  // Leaf nodes
  SerializedLineBreakNode,
  SerializedHorizontalRuleNode,
  SerializedPageBreakNode,
  // Decorator block nodes
  SerializedTweetNode,
  SerializedYouTubeNode,
  SerializedFigmaNode,
  // Decorator leaf nodes
  SerializedExcalidrawNode,
  SerializedEquationNode,
  SerializedStickyNode,
  SerializedPollNode,
  SerializedDateTimeNode,
  // Media nodes (from nodes.schema.ts)
  SerializedImageNode,
  // Collapsible nodes
  SerializedCollapsibleContainerNode,
  SerializedCollapsibleContentNode,
  SerializedCollapsibleTitleNode,
  // Layout nodes
  SerializedLayoutContainerNode,
  SerializedLayoutItemNode
).annotations(
  $I.annotations("SerializedLexicalNodeUnion", {
    description: "Discriminated union of all Lexical node types",
  })
);

export type SerializedLexicalNodeUnion = typeof SerializedLexicalNodeUnion.Type;
