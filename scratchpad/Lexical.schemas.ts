import {A, Str} from "@beep/utils";
import * as S from "effect/Schema";
import {$ScratchpadId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";
import type * as O from "effect/Option";
import type * as R from "effect/Record";


const $I = $ScratchpadId.create("Lexical.schemas");

/**
 * `ElementFormatType` from lexical
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ElementFormat = LiteralKit([
	"left",
	"start",
	"center",
	"right",
	"end",
	"justify",
	"",
]).pipe($I.annoteSchema("ElementFormat", {
	description:
		"Lexical element alignment token used by block-level nodes; the empty string preserves Lexical's default alignment sentinel.",
}));

/**
 * Companion type for {@link ElementFormat}
 *
 * @example
 * ```ts
 *
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ElementFormat = typeof ElementFormat.Type;

/**
 * `DirectionType` from lexical
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Direction = LiteralKit([
	"ltr",
	"rtl",
]).pipe($I.annoteSchema("Direction", {
	description: "Lexical text direction token for left-to-right and right-to-left element layout.",
}));

/**
 * Companion type for {@link Direction}
 *
 * @example
 * ```ts
 *
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Direction = typeof Direction.Type;


/**
 * `TextModeType` from lexical
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const TextMode = LiteralKit([
	"normal",
	"token",
	"segmented",
]).pipe($I.annoteSchema("TextMode", {
	description: "Lexical text node editability mode: normal text, indivisible token text, or segmented text.",
}));

/**
 * Companion type for {@link TextMode}
 *
 * @example
 * ```ts
 *
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TextMode = typeof TextMode.Type;


/**
 * Mirrors {@link `SerializedLexicalNode`}. The `type` discriminant is added by each
 * concrete subclass via `S.tag(...)`. `"$"` is `NODE_STATE_KEY`.
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BaseNode extends S.Class<BaseNode>($I`BaseNode`)({
	version: S.Finite.annotateKey({
		description: "Serialized Lexical node schema version; Lexical currently writes version 1 for built-in nodes.",
	}),
	"$": S.Record(S.String, S.Unknown).pipe(S.OptionFromOptionalKey, S.annotateKey({
		description:
			"Optional NODE_STATE_KEY payload containing arbitrary persisted Lexical NodeState values keyed by state name.",
	})),
}, $I.annote("BaseNode", {
	description: "Schema base for every serialized Lexical node, including versioning and optional NodeState metadata.",
})) {
}

export declare namespace BaseNode {
	export interface Type {
		readonly version: number,
		readonly "$": O.Option<R.ReadonlyRecord<string, unknown>>
	}

	export interface Encoded {
		readonly version: number,
		readonly "$"?: R.ReadonlyRecord<string, unknown>
	}
}

/**
 * `children` is mutually recursive with the union of all node schemas, so we
 * tie the knot with `S.suspend`. The annotation must only mention the
 * hand-written namespace types — referencing the classes here would make
 * every class's base expression circular.
 */
const NodeChildren = S.Array(S.suspend((): S.Codec<LexicalNode.Type, LexicalNode.Encoded> => LexicalNode))
	.pipe($I.annoteSchema("NodeChildren", {
		description: "Ordered recursive child node list for serialized Lexical element nodes.",
	}));

/**
 * Mirrors {@link SerializedElementNode}.
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ElementNode extends BaseNode.extend<ElementNode>($I`ElementNode`)({
	children: NodeChildren.annotateKey({
		description: "Child nodes in document order, recursively decoded through the LexicalNode tagged union.",
	}),
	direction: S.OptionFromNullOr(Direction).annotateKey({
		description: "Optional text direction decoded from Lexical's nullable direction field.",
	}),
	format: ElementFormat.annotateKey({description: "Block alignment format token applied to the element."}),
	indent: S.Finite.annotateKey({description: "Lexical indentation depth for nested block layout."}),
	textFormat: S.Finite.pipe(S.OptionFromOptionalKey, S.annotateKey({
		description: "Optional TextFormatType bitmask applied to newly inserted text within the element.",
	})),
	textStyle: S.String.pipe(S.OptionFromOptionalKey, S.annotateKey({
		description: "Optional CSS declaration string applied to newly inserted text within the element.",
	})),
}, $I.annote("ElementNode", {
	description: "Base schema for serialized Lexical container nodes that own ordered child nodes.",
})) {
}

/**
 * Companion namespace for {@link ElementNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ElementNode {
	/**
	 *  Companion Decoded type for {@link ElementNode}.
	 *
	 *  @category models
	 *  @since 0.0.0
	 */
	export interface Type extends BaseNode.Type {
		readonly children: ReadonlyArray<LexicalNode.Type>
		readonly direction: O.Option<Direction>
		readonly format: ElementFormat
		readonly indent: number
		readonly textFormat: O.Option<number>
		readonly textStyle: O.Option<string>
	}

	/**
	 *  Companion Encoded type for {@link ElementNode}.
	 *
	 *  @category models
	 *  @since 0.0.0
	 */
	export interface Encoded extends BaseNode.Encoded {
		readonly children: ReadonlyArray<LexicalNode.Encoded>
		readonly direction: null | Direction
		readonly format: ElementFormat
		readonly indent: number
		readonly textFormat?: number
		readonly textStyle?: string
	}
}

/**
 * Mirrors `SerializedTextNode` minus the discriminant. Tags can only be
 * introduced on concrete classes (overriding a parent's `S.tag` literal in
 * `.extend` would intersect `{type: "tab"} & {type: "text"}` into `never`),
 * so lexical's `TabNode extends TextNode` becomes two siblings of TextBase.
 *
 * @example
 * ```ts
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextBase extends BaseNode.extend<TextBase>($I`TextBase`)({
	detail: S.Finite.annotateKey({description: "TextDetailType bitmask for directionless, composing, and token details."}),
	format: S.Finite.annotateKey({description: "TextFormatType bitmask for inline marks such as bold, italic, and code."}),
	mode: TextMode.annotateKey({description: "Lexical editing mode for this text node."}),
	style: S.String.annotateKey({description: "Inline CSS declaration string serialized on the text node."}),
	text: S.String.annotateKey({description: "Plain text payload stored by the Lexical text node."}),
}, $I.annote("TextBase", {description: "Base schema for serialized Lexical text-like leaf nodes."})) {
}

/**
 * Companion namespace for {@link TextBase}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TextBase {
	/**
	 *  Companion Decoded type for {@link TextBase}.
	 *
	 *  @category models
	 *  @since 0.0.0
	 */
	export interface Type extends BaseNode.Type {
		readonly detail: number
		readonly format: number
		readonly mode: TextMode
		readonly style: string
		readonly text: string
	}

	/**
	 *  Companion Encoded type for {@link ElementNode}.
	 *
	 *  @category models
	 *  @since 0.0.0
	 */
	export interface Encoded extends BaseNode.Encoded {
		readonly detail: number
		readonly format: number
		readonly mode: TextMode
		readonly style: string
		readonly text: string
	}
}

export class TextNode extends TextBase.extend<TextNode>($I`TextNode`)(
	{
		type: S.tag("text").annotateKey({
			description: "Lexical discriminator for ordinary text leaf nodes.",
		})
	},
	$I.annote("TextNode", {description: "Serialized Lexical TextNode carrying editable plain text content."})
) {
	static readonly toText = (e: TextNode.Type) => e.text
}

export declare namespace TextNode {
	export interface Type extends TextBase.Type {
		readonly type: "text"
	}

	export interface Encoded extends TextBase.Encoded {
		readonly type: "text"
	}
}

export class TabNode extends TextBase.extend<TabNode>($I`TabNode`)(
	{
		type: S.tag("tab").annotateKey({
			description: "Lexical discriminator for tab text leaf nodes.",
		}),
	},
	$I.annote("TabNode", {description: "Serialized Lexical TabNode represented as a text-like leaf."})
) {
	static readonly toText = (e: TabNode.Type) => e.text
}

export declare namespace TabNode {
	export interface Type extends TextBase.Type {
		readonly type: "tab"
	}

	export interface Encoded extends TextBase.Encoded {
		readonly type: "tab"
	}
}

export class LineBreakNode extends BaseNode.extend<LineBreakNode>($I`LineBreakNode`)(
	{
		type: S.tag("linebreak").annotateKey({
			description: "Lexical discriminator for explicit line break leaf nodes.",
		}),
	},
	$I.annote("LineBreakNode", {description: "Serialized Lexical LineBreakNode that contributes a newline to plain text."})
) {
	static readonly toText = (_e: LineBreakNode.Type) => "\n"
}

export declare namespace LineBreakNode {
	export interface Type extends BaseNode.Type {
		readonly type: "linebreak"
	}

	export interface Encoded extends BaseNode.Encoded {
		readonly type: "linebreak"
	}
}


// ---------------------------------------------------------------------------
// Element nodes
// ---------------------------------------------------------------------------

export class RootNode extends ElementNode.extend<RootNode>($I`RootNode`)(
	{
		type: S.tag("root").annotateKey({
			description: "Lexical discriminator for the editor state's root element.",
		}),
	},
	$I.annote("RootNode", {description: "Serialized Lexical RootNode at the top of an editor state tree."})
) {
	static readonly toText = (e: RootNode.Type) => childText(e.children)
}

export declare namespace RootNode {
	export interface Type extends ElementNode.Type {
		readonly type: "root"
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "root"
	}
}

export class ParagraphNode extends ElementNode.extend<ParagraphNode>($I`ParagraphNode`)(
	{
		type: S.tag("paragraph").annotateKey({
			description: "Lexical discriminator for paragraph block elements.",
		}),
	},
	$I.annote("ParagraphNode", {description: "Serialized Lexical ParagraphNode containing inline and decorator children."})
) {
	static readonly toText = (e: ParagraphNode.Type) => `${childText(e.children)}\n`
}

export declare namespace ParagraphNode {
	export interface Type extends ElementNode.Type {
		readonly type: "paragraph"
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "paragraph"
	}
}

/** @lexical/rich-text */
export class HeadingNode extends ElementNode.extend<HeadingNode>($I`HeadingNode`)(
	{
		type: S.tag("heading").annotateKey({
			description: "Lexical discriminator for rich-text heading elements.",
		}),
		tag: S.Literals([
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
		]).annotateKey({
			description: "HTML heading level tag serialized by Lexical for this heading node.",
		}),
	},
	$I.annote("HeadingNode", {description: "Serialized @lexical/rich-text HeadingNode with an h1 through h6 level."})
) {
	static readonly toText = (e: HeadingNode.Type) => `${childText(e.children)}\n`
}

export declare namespace HeadingNode {
	export interface Type extends ElementNode.Type {
		readonly type: "heading"
		readonly tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "heading"
		readonly tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
	}
}

/** @lexical/rich-text */
export class QuoteNode extends ElementNode.extend<QuoteNode>($I`QuoteNode`)(
	{
		type: S.tag("quote").annotateKey({
			description: "Lexical discriminator for rich-text quote block elements.",
		}),
	},
	$I.annote("QuoteNode", {description: "Serialized @lexical/rich-text QuoteNode containing quoted block children."})
) {
	static readonly toText = (e: QuoteNode.Type) => `${childText(e.children)}\n`
}

export declare namespace QuoteNode {
	export interface Type extends ElementNode.Type {
		readonly type: "quote"
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "quote"
	}
}

/** @lexical/list */
export class ListNode extends ElementNode.extend<ListNode>($I`ListNode`)(
	{
		type: S.tag("list").annotateKey({
			description: "Lexical discriminator for list container elements.",
		}),
		listType: S.Literals([
			"number",
			"bullet",
			"check",
		]).annotateKey({
			description: "Lexical list semantics: ordered number list, unordered bullet list, or check list.",
		}),
		start: S.Finite.annotateKey({description: "Starting ordinal for ordered lists."}),
		tag: S.Literals([
			"ul",
			"ol",
		]).annotateKey({description: "Rendered HTML list tag associated with the Lexical list."}),
	},
	$I.annote("ListNode", {description: "Serialized @lexical/list ListNode containing list item children."})
) {
	static readonly toText = (e: ListNode.Type) => `${childText(e.children)}\n`
}

export declare namespace ListNode {
	export interface Type extends ElementNode.Type {
		readonly type: "list"
		readonly listType: "number" | "bullet" | "check"
		readonly start: number
		readonly tag: "ul" | "ol"
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "list"
		readonly listType: "number" | "bullet" | "check"
		readonly start: number
		readonly tag: "ul" | "ol"
	}
}

/** @lexical/list — `checked` is `boolean | undefined` in lexical */
export class ListItemNode extends ElementNode.extend<ListItemNode>($I`ListItemNode`)(
	{
		type: S.tag("listitem").annotateKey({
			description: "Lexical discriminator for list item elements.",
		}),
		checked: S.OptionFromOptional(S.Boolean).annotateKey({
			description: "Optional checkbox state for check-list items; absent for ordinary bullet or numbered items.",
		}),
		value: S.Finite.annotateKey({description: "Ordinal value of the item within its parent list."}),
	},
	$I.annote("ListItemNode", {description: "Serialized @lexical/list ListItemNode with optional check-list state."})
) {
	static readonly toText = (e: ListItemNode.Type) => `- ${childText(e.children)}\n`
}

export declare namespace ListItemNode {
	export interface Type extends ElementNode.Type {
		readonly type: "listitem"
		readonly checked: O.Option<boolean>
		readonly value: number
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "listitem"
		readonly checked?: boolean | undefined
		readonly value: number
	}
}

/** @lexical/link — shared, untagged base (lexical: AutoLinkNode extends LinkNode) */
export class LinkBase extends ElementNode.extend<LinkBase>($I`LinkBase`)(
	{
		url: S.String.annotateKey({description: "Destination URL serialized by the Lexical link node."}),
		rel: S.OptionFromOptionalNullOr(S.String).annotateKey({
			description: "Optional HTML rel attribute decoded from omitted, undefined, or null link metadata.",
		}),
		target: S.OptionFromOptionalNullOr(S.String).annotateKey({
			description: "Optional HTML target attribute decoded from omitted, undefined, or null link metadata.",
		}),
		title: S.OptionFromOptionalNullOr(S.String).annotateKey({
			description: "Optional HTML title attribute decoded from omitted, undefined, or null link metadata.",
		}),
	},
	$I.annote("LinkBase", {description: "Shared serialized field schema for Lexical link and autolink element nodes."})
) {
}

export declare namespace LinkBase {
	export interface Type extends ElementNode.Type {
		readonly url: string
		readonly rel: O.Option<string>
		readonly target: O.Option<string>
		readonly title: O.Option<string>
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly url: string
		readonly rel?: string | null | undefined
		readonly target?: string | null | undefined
		readonly title?: string | null | undefined
	}
}

export class LinkNode extends LinkBase.extend<LinkNode>($I`LinkNode`)(
	{
		type: S.tag("link").annotateKey({
			description: "Lexical discriminator for standard link elements.",
		}),
	},
	$I.annote("LinkNode", {description: "Serialized @lexical/link LinkNode with URL and optional HTML link attributes."})
) {
	static readonly toText = (e: LinkNode.Type) => childText(e.children)
}

export declare namespace LinkNode {
	export interface Type extends LinkBase.Type {
		readonly type: "link"
	}

	export interface Encoded extends LinkBase.Encoded {
		readonly type: "link"
	}
}

export class AutoLinkNode extends LinkBase.extend<AutoLinkNode>($I`AutoLinkNode`)(
	{
		type: S.tag("autolink").annotateKey({
			description: "Lexical discriminator for automatically detected link elements.",
		}),
		isUnlinked: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: "Optional Lexical flag indicating the autolink was manually unlinked by the user.",
		}),
	},
	$I.annote("AutoLinkNode", {description: "Serialized @lexical/link AutoLinkNode with optional unlink state."})
) {
	static readonly toText = (e: AutoLinkNode.Type) => childText(e.children)
}

export declare namespace AutoLinkNode {
	export interface Type extends LinkBase.Type {
		readonly type: "autolink"
		readonly isUnlinked: O.Option<boolean>
	}

	export interface Encoded extends LinkBase.Encoded {
		readonly type: "autolink"
		readonly isUnlinked?: boolean
	}
}

/** @lexical/code — `language: string | null | undefined` */
export class CodeNode extends ElementNode.extend<CodeNode>($I`CodeNode`)(
	{
		type: S.tag("code").annotateKey({
			description: "Lexical discriminator for code block elements.",
		}),
		language: S.OptionFromOptionalNullOr(S.String).annotateKey({
			description: "Optional code language decoded from omitted, undefined, or null Lexical code metadata.",
		}),
		theme: S.OptionFromOptionalKey(S.String).annotateKey({
			description: "Optional code theme identifier written by code-highlighting integrations.",
		}),
	},
	$I.annote("CodeNode", {description: "Serialized @lexical/code CodeNode containing code block children and metadata."})
) {
	static readonly toText = (e: CodeNode.Type) => "```\n" + childText(e.children) + "\n```\n"
}

export declare namespace CodeNode {
	export interface Type extends ElementNode.Type {
		readonly type: "code"
		readonly language: O.Option<string>
		readonly theme: O.Option<string>
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "code"
		readonly language?: string | null | undefined
		readonly theme?: string
	}
}

/**
 * Custom DecoratorNode (src/nodes/MermaidNode.tsx) — we own this serialized
 * shape; modeled on the lexical playground's EquationNode.
 */
export class MermaidNode extends BaseNode.extend<MermaidNode>($I`MermaidNode`)(
	{
		type: S.tag("mermaid").annotateKey({
			description: "Custom discriminator for serialized Mermaid diagram decorator nodes.",
		}),
		source: S.String.annotateKey({description: "Mermaid diagram source text stored in the decorator node."}),
	},
	$I.annote("MermaidNode", {description: "Custom serialized decorator node for Mermaid diagram source blocks."})
) {
	static readonly toText = (e: MermaidNode.Type) => "```mermaid\n" + e.source + "\n```\n"
}

export declare namespace MermaidNode {
	export interface Type extends BaseNode.Type {
		readonly type: "mermaid"
		readonly source: string
	}

	export interface Encoded extends BaseNode.Encoded {
		readonly type: "mermaid"
		readonly source: string
	}
}

/**
 * Custom DecoratorBlockNode (src/nodes/YouTubeNode.tsx) — mirrors the lexical
 * playground's SerializedYouTubeNode (DecoratorBlockNode adds `format`).
 */
export class YouTubeNode extends BaseNode.extend<YouTubeNode>($I`YouTubeNode`)(
	{
		type: S.tag("youtube").annotateKey({
			description: "Custom discriminator for serialized YouTube embed decorator nodes.",
		}),
		videoID: S.String.annotateKey({description: "The 11-character YouTube video id for the embedded video."}),
		format: ElementFormat.annotateKey({description: "Block alignment token applied to the embedded video."}),
	},
	$I.annote("YouTubeNode", {description: "Custom serialized decorator block node for YouTube video embeds."})
) {
	static readonly toText = (e: YouTubeNode.Type) => `https://www.youtube.com/watch?v=${e.videoID}\n`
}

export declare namespace YouTubeNode {
	export interface Type extends BaseNode.Type {
		readonly type: "youtube"
		readonly videoID: string
		readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | ""
	}

	export interface Encoded extends BaseNode.Encoded {
		readonly type: "youtube"
		readonly videoID: string
		readonly format: "left" | "start" | "center" | "right" | "end" | "justify" | ""
	}
}

/** @lexical/table — mirrors SerializedTableCellNode (headerState: 0..3 bitmask) */
export class TableCellNode extends ElementNode.extend<TableCellNode>($I`TableCellNode`)(
	{
		type: S.tag("tablecell").annotateKey({
			description: "Lexical discriminator for table cell elements.",
		}),
		headerState: S.Finite.annotateKey({
			description: "TableCellHeaderState bitmask: 0 none, 1 row header, 2 column header, 3 both.",
		}),
		colSpan: S.OptionFromOptionalKey(S.Finite).annotateKey({
			description: "Optional number of columns spanned by this table cell.",
		}),
		rowSpan: S.OptionFromOptionalKey(S.Finite).annotateKey({
			description: "Optional number of rows spanned by this table cell.",
		}),
		width: S.OptionFromOptionalKey(S.Finite).annotateKey({
			description: "Optional rendered width for this table cell.",
		}),
		backgroundColor: S.OptionFromOptionalNullOr(S.String).annotateKey({
			description: "Optional cell background color decoded from omitted, undefined, or null table metadata.",
		}),
		verticalAlign: S.OptionFromOptionalKey(S.String).annotateKey({
			description: "Optional CSS vertical-align value for table cell content.",
		}),
	},
	$I.annote("TableCellNode", {description: "Serialized @lexical/table TableCellNode with span and styling metadata."})
) {
	static readonly toText = (e: TableCellNode.Type) => childText(e.children)
}

export declare namespace TableCellNode {
	export interface Type extends ElementNode.Type {
		readonly type: "tablecell"
		readonly headerState: number
		readonly colSpan: O.Option<number>
		readonly rowSpan: O.Option<number>
		readonly width: O.Option<number>
		readonly backgroundColor: O.Option<string>
		readonly verticalAlign: O.Option<string>
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "tablecell"
		readonly headerState: number
		readonly colSpan?: number
		readonly rowSpan?: number
		readonly width?: number
		readonly backgroundColor?: string | null | undefined
		readonly verticalAlign?: string
	}
}

/** @lexical/table — mirrors SerializedTableRowNode */
export class TableRowNode extends ElementNode.extend<TableRowNode>($I`TableRowNode`)(
	{
		type: S.tag("tablerow").annotateKey({
			description: "Lexical discriminator for table row elements.",
		}),
		height: S.OptionFromOptionalKey(S.Finite).annotateKey({
			description: "Optional rendered height for the table row.",
		}),
	},
	$I.annote("TableRowNode", {description: "Serialized @lexical/table TableRowNode containing table cell children."})
) {
	static readonly toText = (e: TableRowNode.Type) => `${childText(e.children)}\n`
}

export declare namespace TableRowNode {
	export interface Type extends ElementNode.Type {
		readonly type: "tablerow"
		readonly height: O.Option<number>
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "tablerow"
		readonly height?: number
	}
}

/** @lexical/table — mirrors SerializedTableNode */
export class TableNode extends ElementNode.extend<TableNode>($I`TableNode`)(
	{
		type: S.tag("table").annotateKey({
			description: "Lexical discriminator for table elements.",
		}),
		colWidths: S.Finite.pipe(S.Array, S.OptionFromOptionalKey).annotateKey({
			description: "Optional ordered column width list for table layout preservation.",
		}),
		rowStriping: S.OptionFromOptionalKey(S.Boolean).annotateKey({
			description: "Optional flag indicating alternating row striping should be rendered.",
		}),
		frozenColumnCount: S.OptionFromOptionalKey(S.Finite).annotateKey({
			description: "Optional number of frozen leading columns in the table view.",
		}),
		frozenRowCount: S.OptionFromOptionalKey(S.Finite).annotateKey({
			description: "Optional number of frozen leading rows in the table view.",
		}),
	},
	$I.annote("TableNode", {description: "Serialized @lexical/table TableNode with layout preservation metadata."})
) {
	static readonly toText = (e: TableNode.Type) => `${childText(e.children)}\n`
}

export declare namespace TableNode {
	export interface Type extends ElementNode.Type {
		readonly type: "table"
		readonly colWidths: O.Option<ReadonlyArray<number>>
		readonly rowStriping: O.Option<boolean>
		readonly frozenColumnCount: O.Option<number>
		readonly frozenRowCount: O.Option<number>
	}

	export interface Encoded extends ElementNode.Encoded {
		readonly type: "table"
		readonly colWidths?: ReadonlyArray<number>
		readonly rowStriping?: boolean
		readonly frozenColumnCount?: number
		readonly frozenRowCount?: number
	}
}

// ---------------------------------------------------------------------------
// The tagged union, discriminated by lexical's own `type` key
// ---------------------------------------------------------------------------

export const LexicalNode = S.Union([
	// leaves
	TextNode,
	TabNode,
	LineBreakNode,
	// elements
	RootNode,
	ParagraphNode,
	HeadingNode,
	QuoteNode,
	ListNode,
	ListItemNode,
	LinkNode,
	AutoLinkNode,
	CodeNode,
	MermaidNode,
	YouTubeNode,
	TableNode,
	TableRowNode,
	TableCellNode,
]).pipe(
	S.toTaggedUnion("type"),
	$I.annoteSchema("LexicalNode", {
		description: "Tagged union of all supported serialized Lexical node variants keyed by the `type` discriminator.",
	}),
);

export declare namespace LexicalNode {
	export type Type =
		| TextNode.Type
		| TabNode.Type
		| LineBreakNode.Type
		| RootNode.Type
		| ParagraphNode.Type
		| HeadingNode.Type
		| QuoteNode.Type
		| ListNode.Type
		| ListItemNode.Type
		| LinkNode.Type
		| AutoLinkNode.Type
		| CodeNode.Type
		| MermaidNode.Type
		| YouTubeNode.Type
		| TableNode.Type
		| TableRowNode.Type
		| TableCellNode.Type

	export type Encoded =
		| TextNode.Encoded
		| TabNode.Encoded
		| LineBreakNode.Encoded
		| RootNode.Encoded
		| ParagraphNode.Encoded
		| HeadingNode.Encoded
		| QuoteNode.Encoded
		| ListNode.Encoded
		| ListItemNode.Encoded
		| LinkNode.Encoded
		| AutoLinkNode.Encoded
		| CodeNode.Encoded
		| MermaidNode.Encoded
		| YouTubeNode.Encoded
		| TableNode.Encoded
		| TableRowNode.Encoded
		| TableCellNode.Encoded
}
// ---------------------------------------------------------------------------
// The editor state envelope
// ---------------------------------------------------------------------------

/** Mirrors `SerializedEditorState`. */
export class SerializedEditorState extends S.Class<SerializedEditorState>($I`SerializedEditorState`)({
	root: RootNode.annotateKey({
		description: "Root node of the serialized Lexical editor state tree.",
	}),
}, $I.annote("SerializedEditorState", {
	description: "Serialized Lexical editor state envelope containing the root node tree.",
})) {
}

export declare namespace SerializedEditorState {
	export interface Type {
		readonly root: RootNode.Type
	}

	export interface Encoded {
		readonly root: RootNode.Encoded
	}
}

/** Same schema, but encoding directly to/from a JSON string (for DB storage). */
export const EditorStateFromJson = S.fromJsonString(SerializedEditorState).pipe($I.annoteSchema("EditorStateFromJson", {
	description: "JSON string codec for persisted serialized Lexical editor state payloads.",
}))

// ---------------------------------------------------------------------------
// Plain-text extraction (prompt construction)
// ---------------------------------------------------------------------------

const childText = (children: ReadonlyArray<LexicalNode.Type>): string => A.join(A.map(children, nodeToPlainText), "")

export const nodeToPlainText = LexicalNode.match({
	text: TextNode.toText,
	tab: TabNode.toText,
	linebreak: LineBreakNode.toText,
	root: RootNode.toText,
	paragraph: ParagraphNode.toText,
	heading: HeadingNode.toText,
	quote: QuoteNode.toText,
	list: ListNode.toText,
	listitem: ListItemNode.toText,
	link: LinkNode.toText,
	autolink: AutoLinkNode.toText,
	code: CodeNode.toText,
	mermaid: MermaidNode.toText,
	youtube: YouTubeNode.toText,
	table: TableNode.toText,
	tablerow: TableRowNode.toText,
	tablecell: TableCellNode.toText,
})

export const editorStateToPlainText = (state: SerializedEditorState): string => Str.trim(nodeToPlainText(state.root))
