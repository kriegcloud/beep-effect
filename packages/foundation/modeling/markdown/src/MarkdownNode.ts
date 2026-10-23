/**
 * The mdast-shaped core syntax tree: {@link Point} and {@link Position}, the
 * 26 core node schemas (CommonMark, the GFM extensions, frontmatter and the
 * root), the mdast content unions and the literal domains.
 *
 * **Details**
 *
 * Node `type` strings and field names match the mdast specification
 * (https://github.com/syntax-tree/mdast) exactly. Every node is a branded
 * plain-data `S.Opaque` value: construct with `X.make` (it validates and
 * copies nested nodes, and `position` defaults to `Position.synthetic`),
 * narrow with the structural `S.is` guards or the `type` discriminator.
 *
 * **Gotchas**
 *
 * The MDX node schemas live in `@beep/markdown/MarkdownMdx`, but only the
 * export surface is separate: the content unions here ({@link FlowContent},
 * {@link PhrasingContent}, {@link MarkdownNode}) still include the MDX nodes,
 * so this module's closure loads their schemas (D-43, option M3).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
  /**
   * Blockquote — a section quoted from somewhere else.
   *
   * @category models
   * @since 0.0.0
   */
  Blockquote,
  /**
   * Break — a hard line break.
   *
   * @category models
   * @since 0.0.0
   */
  Break,
  /**
   * The two ways CommonMark spells a hard line break: a trailing backslash or two-or-more trailing spaces.
   *
   * @category schemas
   * @since 0.0.0
   */
  BreakStyle,
  /**
   * The three bullet characters an unordered list may use.
   *
   * @category schemas
   * @since 0.0.0
   */
  BulletChar,
  /**
   * Code — a code block, fenced or indented.
   *
   * @category models
   * @since 0.0.0
   */
  Code,
  /**
   * Definition — a link reference definition (`[ref]: /url "title"`).
   *
   * @category models
   * @since 0.0.0
   */
  Definition,
  /**
   * Delete — GFM strikethrough (`~~foo~~`). Content that is no longer accurate or relevant.
   *
   * @category models
   * @since 0.0.0
   */
  Delete,
  /**
   * Emphasis — `*foo*` or `_foo_`.
   *
   * @category models
   * @since 0.0.0
   */
  Emphasis,
  /**
   * The two characters emphasis and strong emphasis may be marked with.
   *
   * @category schemas
   * @since 0.0.0
   */
  EmphasisChar,
  /**
   * The two fence characters a fenced code block may use.
   *
   * @category schemas
   * @since 0.0.0
   */
  FenceChar,
  /**
   * The union of every node that may appear where mdast expects **flow** content — the sections of a
   * document.
   *
   * @category schemas
   * @since 0.0.0
   */
  FlowContent,
  /**
   * FootnoteDefinition — a GFM footnote definition (`[^alpha]: bravo.`), the content a {@link
   * FootnoteReference} points at.
   *
   * @category models
   * @since 0.0.0
   */
  FootnoteDefinition,
  /**
   * FootnoteReference — a GFM footnote marker (`[^alpha]`), associating this point in the text with a {@link
   * FootnoteDefinition} by identifier.
   *
   * @category models
   * @since 0.0.0
   */
  FootnoteReference,
  /**
   * Frontmatter — the raw, fidelity-preserving capture of a document's metadata block. `value` is the source
   * text between the fences, exactly as written (never inline-parsed, never decoded); `format` records which
   * fence captured it. The position spans the whole block including both fence lines.
   *
   * @category models
   * @since 0.0.0
   */
  Frontmatter,
  /**
   * The union of every node that may appear where mdast expects **frontmatter** content — a one-member union,
   * kept because mdast names the category (its member there is `Yaml`; ours is the format-agnostic capture).
   *
   * @category schemas
   * @since 0.0.0
   */
  FrontmatterContent,
  /**
   * The frontmatter formats the capture recognizes, keyed by their opening fence: `---` is yaml, `+++` is
   * toml and `---json` is json.
   *
   * @category schemas
   * @since 0.0.0
   */
  FrontmatterFormat,
  /**
   * Heading — an ATX or setext heading of depth 1 to 6.
   *
   * @category models
   * @since 0.0.0
   */
  Heading,
  /**
   * The six legal ATX/setext heading depths.
   *
   * @category schemas
   * @since 0.0.0
   */
  HeadingDepth,
  /**
   * The two ways CommonMark spells a heading: `atx` (`# Title`) and `setext` (a title underlined with `=` or
   * `-`).
   *
   * @category schemas
   * @since 0.0.0
   */
  HeadingStyle,
  /**
   * Html — a fragment of raw HTML, kept verbatim. Used for both HTML blocks (flow) and inline raw HTML
   * (phrasing); the same node type serves both, as mdast specifies.
   *
   * @category models
   * @since 0.0.0
   */
  Html,
  /**
   * Image — an inline image (`![alt](url "title")`).
   *
   * @category models
   * @since 0.0.0
   */
  Image,
  /**
   * ImageReference — an image referring to a {@link Definition} by identifier (`![alt][ref]`).
   *
   * @category models
   * @since 0.0.0
   */
  ImageReference,
  /**
   * InlineCode — a code span: `foo` written between backtick fences in the source. `value` holds the span's
   * content with the backtick fence stripped and the spec's space-stripping applied.
   *
   * @category models
   * @since 0.0.0
   */
  InlineCode,
  /**
   * Link — an inline link (`[text](url "title")`), including autolinks.
   *
   * @category models
   * @since 0.0.0
   */
  Link,
  /**
   * LinkReference — a link referring to a {@link Definition} by identifier (`[text][ref]`).
   *
   * @category models
   * @since 0.0.0
   */
  LinkReference,
  /**
   * List — an ordered or unordered list.
   *
   * @category models
   * @since 0.0.0
   */
  List,
  /**
   * The union of every node that may appear where mdast expects **list** content. A one-member union, kept
   * because mdast names the category and later dialects widen it — and a real `Schema.Union`, as documented
   * on `RowContent`.
   *
   * @category schemas
   * @since 0.0.0
   */
  ListContent,
  /**
   * The two delimiters an ordered list marker may use (`1.` or `1)`).
   *
   * @category schemas
   * @since 0.0.0
   */
  ListDelimiter,
  /**
   * ListItem — one item of a {@link List}.
   *
   * @category models
   * @since 0.0.0
   */
  ListItem,
  /**
   * A schema matching any node in the tree.
   *
   * @category schemas
   * @since 0.0.0
   */
  MarkdownNode,
  /**
   * Every `type` discriminator the node vocabulary defines: the 26 core tags (root and frontmatter included)
   * and the 8 MDX tags, three of which are the JSX attribute carriers that never appear in a `children`
   * array.
   *
   * @category schemas
   * @since 0.0.0
   */
  MarkdownNodeKind,
  /**
   * Paragraph — a run of phrasing content.
   *
   * @category models
   * @since 0.0.0
   */
  Paragraph,
  /**
   * The union of every node that may appear where mdast expects **phrasing** content — the text of a document
   * and its markup.
   *
   * @category schemas
   * @since 0.0.0
   */
  PhrasingContent,
  /**
   * A single point in a source document: 1-based `line` and `column`, 0-based `offset`.
   *
   * @category models
   * @since 0.0.0
   */
  Point,
  /**
   * The source span of a node: `start` inclusive, `end` exclusive.
   *
   * @category models
   * @since 0.0.0
   */
  Position,
  /**
   * The explicitness of a reference, per mdast's `referenceType` enum.
   *
   * @category schemas
   * @since 0.0.0
   */
  ReferenceType,
  /**
   * Root — a whole document, and the only node that is never a child.
   *
   * @category models
   * @since 0.0.0
   */
  Root,
  /**
   * The union of every node that may appear where mdast expects **row** content — the cells in a {@link
   * TableRow}. A one-member union, kept because mdast names the category.
   *
   * @category schemas
   * @since 0.0.0
   */
  RowContent,
  /**
   * Strong — `**foo**` or `__foo__`.
   *
   * @category models
   * @since 0.0.0
   */
  Strong,
  /**
   * Table — GFM two-dimensional data.
   *
   * @category models
   * @since 0.0.0
   */
  Table,
  /**
   * The three alignments a GFM table column may declare. A `null` entry in a {@link Table}'s `align` array
   * means the column carries no alignment.
   *
   * @category schemas
   * @since 0.0.0
   */
  TableAlign,
  /**
   * TableCell — one cell of a {@link TableRow}: a header cell if its grandparent {@link Table}'s first row, a
   * data cell otherwise.
   *
   * @category models
   * @since 0.0.0
   */
  TableCell,
  /**
   * The union of every node that may appear where mdast expects **table** content — the rows in a {@link
   * Table}. A one-member union, kept because mdast names the category — and a real `Schema.Union`, as
   * documented on `RowContent`.
   *
   * @category schemas
   * @since 0.0.0
   */
  TableContent,
  /**
   * TableRow — one row of a {@link Table}: the labels of the columns if it is the table's first row, a data
   * row otherwise.
   *
   * @category models
   * @since 0.0.0
   */
  TableRow,
  /**
   * Text — a run of literal characters, with entity references and backslash escapes already resolved into
   * `value`.
   *
   * @category models
   * @since 0.0.0
   */
  Text,
  /**
   * ThematicBreak — a horizontal rule (`---`, `***`, `___`).
   *
   * @category models
   * @since 0.0.0
   */
  ThematicBreak,
  /**
   * The three characters a thematic break may be drawn with.
   *
   * @category schemas
   * @since 0.0.0
   */
  ThematicBreakChar,
} from "./internal/nodes.ts";
export type {
  /**
   * The encoded (wire) shape of {@link FlowContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  FlowContentEncoded,
  /**
   * The encoded (wire) shape of {@link FrontmatterContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  FrontmatterContentEncoded,
  /**
   * The encoded (wire) shape of {@link ListContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  ListContentEncoded,
  /**
   * The encoded (wire) shape of {@link MarkdownNode}.
   *
   * @category type-level
   * @since 0.0.0
   */
  MarkdownNodeEncoded,
  /**
   * The node whose `type` tag is `T` — how a type-string selector narrows its result
   * (`MarkdownNodeOfType<"heading">` is {@link Heading}).
   *
   * @category type-level
   * @since 0.0.0
   */
  MarkdownNodeOfType,
  /**
   * The union of every node `type` tag this package produces — the selector vocabulary of
   * `MarkdownDocument.find`/`findAll`.
   *
   * @category type-level
   * @since 0.0.0
   */
  MarkdownNodeType,
  /**
   * The encoded (wire) shape of {@link PhrasingContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  PhrasingContentEncoded,
  /**
   * The encoded (wire) shape of {@link RowContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  RowContentEncoded,
  /**
   * The encoded (wire) shape of {@link TableContent}.
   *
   * @category type-level
   * @since 0.0.0
   */
  TableContentEncoded,
} from "./internal/nodes.ts";
