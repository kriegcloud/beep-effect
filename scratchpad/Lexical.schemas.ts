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
	description: "",
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
	description: "",
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
	description: "",
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
		description: "Node schema version, informational; lexical defaults to 1",
	}),
	"$": S.Record(S.String, S.Unknown).pipe(S.OptionFromOptionalKey, S.annotateKey({
		description: "NODE_STATE_KEY — arbitrary NodeState persisted with the node",
	})),
}, $I.annote("BaseNode", {
	description: "Base fields shared by every serialized lexical node",
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
		description: "Children of a lexical node",
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
		description: "Child nodes in document order (recursive)",
	}),
	direction: S.OptionFromNullOr(Direction).annotateKey({description: "Text direction, null when unset"}),
	format: ElementFormat.annotateKey({description: "Block alignment format"}),
	indent: S.Finite.annotateKey({description: "Indentation level"}),
	textFormat: S.Finite.pipe(S.OptionFromOptionalKey, S.annotateKey({
		description: "TextFormatType bitmask applied to newly inserted text",
	})),
	textStyle: S.String.pipe(S.OptionFromOptionalKey, S.annotateKey({
		description: "CSS style applied to newly inserted text",
	})),
}, $I.annote("ElementNode", {
	description: "Base fields shared by element (container) nodes",
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
	detail: S.Finite.annotateKey({description: "TextDetailType bitmask"}),
	format: S.Finite.annotateKey({description: "TextFormatType bitmask (bold=1, italic=2, ...)"}),
	mode: TextMode.annotateKey({description: "Text node mode"}),
	style: S.String.annotateKey({description: "Inline CSS style"}),
	text: S.String.annotateKey({description: "The text content"}),
}, $I.annote("TextBase", {description: "Base fields shared by text-like leaf nodes"})) {
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
			description: "",
		})
	},
	$I.annote("TextNode", {description: ""})
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

export class TabNode extends TextBase.extend<TabNode>("TabNode")({
	type: S.tag("tab").annotateKey({
		description: ""
	}),
}) {
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

export class LineBreakNode extends BaseNode.extend<LineBreakNode>($I`LineBreakNode`)({
	type: S.tag("linebreak").annotateKey({
		description: ""
	}),
}) {
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

export class RootNode extends ElementNode.extend<RootNode>("RootNode")({
	type: S.tag("root"),
}) {
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

export class ParagraphNode extends ElementNode.extend<ParagraphNode>("ParagraphNode")({
	type: S.tag("paragraph"),
}) {

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
export class HeadingNode extends ElementNode.extend<HeadingNode>("HeadingNode")({
	type: S.tag("heading"),
	tag: S.Literals([
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6",
	]),
}) {
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
export class QuoteNode extends ElementNode.extend<QuoteNode>("QuoteNode")({
	type: S.tag("quote"),
}) {

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
export class ListNode extends ElementNode.extend<ListNode>("ListNode")({
	type: S.tag("list"),
	listType: S.Literals([
		"number",
		"bullet",
		"check",
	]).annotateKey({
		description: "List semantics",
	}),
	start: S.Finite.annotateKey({description: "Starting number for ordered lists"}),
	tag: S.Literals([
		"ul",
		"ol",
	]).annotateKey({description: "HTML list tag"}),
}) {
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
export class ListItemNode extends ElementNode.extend<ListItemNode>("ListItemNode")({
	type: S.tag("listitem"),
	checked: S.OptionFromOptional(S.Boolean).annotateKey({
		description: "Checkbox state for check lists; undefined otherwise",
	}),
	value: S.Finite.annotateKey({description: "Ordinal value within the list"}),
}) {
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
export class LinkBase extends ElementNode.extend<LinkBase>("LinkBase")({
	url: S.String,
	rel: S.OptionFromOptionalNullOr(S.String),
	target: S.OptionFromOptionalNullOr(S.String),
	title: S.OptionFromOptionalNullOr(S.String),
}) {
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

export class LinkNode extends LinkBase.extend<LinkNode>("LinkNode")({
	type: S.tag("link"),
}) {
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

export class AutoLinkNode extends LinkBase.extend<AutoLinkNode>("AutoLinkNode")({
	type: S.tag("autolink"),
	isUnlinked: S.OptionFromOptionalKey(S.Boolean),
}) {
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
export class CodeNode extends ElementNode.extend<CodeNode>("CodeNode")({
	type: S.tag("code"),
	language: S.OptionFromOptionalNullOr(S.String),
	theme: S.OptionFromOptionalKey(S.String),
}) {
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
export class MermaidNode extends BaseNode.extend<MermaidNode>("MermaidNode")({
	type: S.tag("mermaid"),
	source: S.String.annotateKey({description: "Mermaid diagram source text"}),
}) {
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
export class YouTubeNode extends BaseNode.extend<YouTubeNode>("YouTubeNode")({
	type: S.tag("youtube"),
	videoID: S.String.annotateKey({description: "The 11-character YouTube video id"}),
	format: ElementFormat.annotateKey({description: "Block alignment format"}),
}) {
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
export class TableCellNode extends ElementNode.extend<TableCellNode>("TableCellNode")({
	type: S.tag("tablecell"),
	headerState: S.Finite.annotateKey({
		description: "TableCellHeaderState bitmask: 0 none, 1 row header, 2 column header, 3 both",
	}),
	colSpan: S.OptionFromOptionalKey(S.Finite),
	rowSpan: S.OptionFromOptionalKey(S.Finite),
	width: S.OptionFromOptionalKey(S.Finite),
	backgroundColor: S.OptionFromOptionalNullOr(S.String),
	verticalAlign: S.OptionFromOptionalKey(S.String),
}) {
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
export class TableRowNode extends ElementNode.extend<TableRowNode>("TableRowNode")({
	type: S.tag("tablerow"),
	height: S.OptionFromOptionalKey(S.Finite),
}) {
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
export class TableNode extends ElementNode.extend<TableNode>("TableNode")({
	type: S.tag("table"),
	colWidths: S.Finite.pipe(S.Array, S.OptionFromOptionalKey).annotateKey({
		description: ""
	}),
	rowStriping: S.OptionFromOptionalKey(S.Boolean).annotateKey({
		description: ""
	}),
	frozenColumnCount: S.OptionFromOptionalKey(S.Finite).annotateKey({
		description: ""
	}),
	frozenRowCount: S.OptionFromOptionalKey(S.Finite).annotateKey({
		description: ""
	}),
}) {
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
]).pipe(S.toTaggedUnion("type"));

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
export class SerializedEditorState extends S.Class<SerializedEditorState>("SerializedEditorState")({
	root: RootNode,
}) {
}

/** Same schema, but encoding directly to/from a JSON string (for DB storage). */
export const EditorStateFromJson = S.fromJsonString(SerializedEditorState)

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
