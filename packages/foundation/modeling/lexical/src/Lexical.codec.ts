/**
 * Md ↔ Lexical codecs over the canonical `@beep/md` AST.
 *
 * The supported round-trip profile and its documented degradations live in
 * the package README ("Lossiness profile"). In short: md-core blocks
 * (paragraph, heading, code, list, quote with a single paragraph, inline
 * strong/em/del/code/link/br) and `artifact-ref` round-trip; Lexical-only
 * presentation state (alignment, indent, direction, underline and other
 * non-md format bits, inline styles, NodeState) is dropped on the way to Md.
 *
 * @packageDocumentation \@beep/lexical-schema/Lexical.codec
 * @since 0.0.0
 */

import * as Md from "@beep/md/Md.model";
import {A, O, Str, dual} from "@beep/utils";
import {Effect, Match, pipe} from "effect";
import {
	ArtifactRefNode,
	CodeNode,
	HeadingNode,
	LexicalNode,
	LineBreakNode,
	LinkNode,
	ListItemNode,
	ListNode,
	nodeToPlainText,
	ParagraphNode,
	QuoteNode,
	RootNode,
	SerializedEditorState,
	TextNode,
} from "./Lexical.model.ts";
import type * as S from "effect/Schema";

// Lexical TextFormatType bitmask flags with an Md equivalent (see README for
// the dropped remainder: underline=8, highlight, sub/superscript, casing).
const IS_BOLD = 1;
const IS_ITALIC = 2;
const IS_STRIKETHROUGH = 4;
const IS_CODE = 16;

/**
 * URI scheme that round-trips {@link ArtifactRefNode} through the Md AST as a
 * paragraph wrapping a single link.
 *
 * @example
 * ```ts
 * import { ARTIFACT_URI_PREFIX } from "@beep/lexical-schema/Lexical.codec"
 *
 * console.log(ARTIFACT_URI_PREFIX) // "artifact://"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const ARTIFACT_URI_PREFIX = "artifact://";

const elementDefaults = {
	version: 1,
	$: O.none<Record<string, unknown>>(),
	direction: O.none<"ltr" | "rtl">(),
	format: "" as const,
	indent: 0,
	textFormat: O.none<number>(),
	textStyle: O.none<string>(),
};

const leafDefaults = {
	version: 1,
	$: O.none<Record<string, unknown>>(),
};

const textLeaf: {
	(text: string, format: number): Effect.Effect<TextNode, S.SchemaError>
	(format: number): (text: string) => Effect.Effect<TextNode, S.SchemaError>
} = dual(2, (text: string, format: number): Effect.Effect<TextNode, S.SchemaError> => TextNode.makeEffect({
	...leafDefaults,
	detail: 0,
	format,
	mode: "normal",
	style: "",
	text,
}));

const lineBreak = () => LineBreakNode.makeEffect({...leafDefaults});

const mdInlineText = Match.type<Md.Inline>().pipe(Match.tagsExhaustive({
	text: (node) => node.value,
	rawMarkdown: (node) => node.value,
	rawHtml: (node) => node.value,
	strong: (node) => mdInlinesText(node.children),
	em: (node) => mdInlinesText(node.children),
	del: (node) => mdInlinesText(node.children),
	code: (node) => node.value,
	a: (node) => mdInlinesText(node.children),
	img: (node) => node.alt,
	br: () => "\n",
}));

const mdInlinesText = (inlines: ReadonlyArray<Md.Inline>): string => pipe(inlines, A.map(mdInlineText), A.join(""));


const mdBlockText = (block: Md.Block): string => Match.value(block).pipe(Match.tagsExhaustive({
	h1: (node) => mdInlinesText(node.children),
	h2: (node) => mdInlinesText(node.children),
	h3: (node) => mdInlinesText(node.children),
	h4: (node) => mdInlinesText(node.children),
	h5: (node) => mdInlinesText(node.children),
	h6: (node) => mdInlinesText(node.children),
	p: (node) => mdInlinesText(node.children),
	blockquote: (node) => A.join(A.map(node.children, mdBlockText), "\n"),
	pre: (node) => node.value,
	ul: (node) => A.join(A.map(node.children, (item) => mdInlinesText(item.children)), "\n"),
	ol: (node) => A.join(A.map(node.children, (item) => mdInlinesText(item.children)), "\n"),
	li: (node) => mdInlinesText(node.children),
	taskList: (node) => A.join(A.map(node.children, (item) => mdInlinesText(item.children)), "\n"),
	hr: () => "---",
}));

const inlinesToLexical = (
	inlines: ReadonlyArray<Md.Inline>,
	format: number,
): Effect.Effect<ReadonlyArray<LexicalNode.Type>, S.SchemaError> => Effect.map(Effect.forEach(
	inlines,
	(inline) => inlineToLexical(inline, format),
), A.flatten);

const inlineToLexical = (
	inline: Md.Inline,
	format: number,
): Effect.Effect<ReadonlyArray<LexicalNode.Type>, S.SchemaError> => Match.value(inline).pipe(Match.tagsExhaustive({
	text: (node) => Effect.map(
		textLeaf(node.value, format),
		A.of<LexicalNode.Type>,
	), // Trusted raw runs have no Lexical equivalent; they degrade to plain
	// text runs (README "Lossiness profile").
	rawMarkdown: (node) => Effect.map(textLeaf(node.value, format), A.of<LexicalNode.Type>),
	rawHtml: (node) => Effect.map(textLeaf(node.value, format), A.of<LexicalNode.Type>),
	strong: (node) => inlinesToLexical(node.children, format | IS_BOLD),
	em: (node) => inlinesToLexical(node.children, format | IS_ITALIC),
	del: (node) => inlinesToLexical(node.children, format | IS_STRIKETHROUGH),
	code: (node) => Effect.map(textLeaf(node.value, format | IS_CODE), A.of<LexicalNode.Type>),
	a: (node) => Effect.flatMap(inlinesToLexical(node.children, format), (children) => Effect.map(LinkNode.makeEffect({
		...elementDefaults,
		url: node.href,
		rel: O.none(),
		target: O.none(),
		title: O.none(),
		children,
	}), A.of<LexicalNode.Type>)), // Images degrade to links so the destination survives (README).
	img: (node) => Effect.flatMap(textLeaf(node.alt, format), (alt) => Effect.map(LinkNode.makeEffect({
		...elementDefaults,
		url: node.src,
		rel: O.none(),
		target: O.none(),
		title: O.none(),
		children: [alt],
	}), A.of<LexicalNode.Type>)),
	br: () => Effect.map(lineBreak(), A.of<LexicalNode.Type>),
}));

const headingToLexical = (
	tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6",
	children: ReadonlyArray<Md.Inline>,
): Effect.Effect<LexicalNode.Type, S.SchemaError> => Effect.flatMap(
	inlinesToLexical(children, 0),
	(inlines) => HeadingNode.makeEffect({
		...elementDefaults,
		tag,
		children: inlines,
	}),
);

const listItemsToLexical = (items: ReadonlyArray<{
	readonly children: ReadonlyArray<Md.Inline>;
	readonly checked?: boolean
}>): Effect.Effect<ReadonlyArray<LexicalNode.Type>, S.SchemaError> => Effect.forEach(
	items,
	(item, index) => Effect.flatMap(inlinesToLexical(item.children, 0), (children) => ListItemNode.makeEffect({
		...elementDefaults,
		checked: O.fromUndefinedOr(item.checked),
		value: index + 1,
		children,
	})),
);

const quoteChildToInlines = (block: Md.Block): Effect.Effect<ReadonlyArray<LexicalNode.Type>, S.SchemaError> => block._tag === "p"
	? inlinesToLexical(block.children, 0)
	: Effect.map(textLeaf(mdBlockText(block), 0), A.of<LexicalNode.Type>);

const paragraphArtifactRef = (block: Md.P): O.Option<{
	readonly artifactId: string;
	readonly label: O.Option<string>
}> => {
	const child = block.children.length === 1
		? block.children[0]
		: undefined;
	if (child === undefined || child._tag !== "a" || !Str.startsWith(ARTIFACT_URI_PREFIX)(child.href)) {
		return O.none();
	}
	const artifactId = Str.slice(ARTIFACT_URI_PREFIX.length)(child.href);
	const label = mdInlinesText(child.children);
	return O.some({
		artifactId,
		label: label === artifactId
			? O.none()
			: O.some(label),
	});
};

/**
 * Lift one Md block into its serialized Lexical node.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { P, Text } from "@beep/md/Md.model"
 * import { blockToLexical } from "@beep/lexical-schema/Lexical.codec"
 *
 * const node = Effect.runSync(blockToLexical(P.make({ children: [Text.make({ value: "Hello" })] })))
 * console.log(node.type) // "paragraph"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const blockToLexical = Match.type<Md.Block>().pipe(Match.tagsExhaustive({
	h1: (node) => headingToLexical("h1", node.children),
	h2: (node) => headingToLexical("h2", node.children),
	h3: (node) => headingToLexical("h3", node.children),
	h4: (node) => headingToLexical("h4", node.children),
	h5: (node) => headingToLexical("h5", node.children),
	h6: (node) => headingToLexical("h6", node.children),
	p: (node) => O.match(paragraphArtifactRef(node), {
		onNone: () => Effect.flatMap(
			inlinesToLexical(node.children, 0),
			(children) => ParagraphNode.makeEffect({
				...elementDefaults,
				children,
			}),
		),
		onSome: (ref) => ArtifactRefNode.makeEffect({
			...leafDefaults,
			artifactId: ref.artifactId,
			label: ref.label,
		}),
	}),
	blockquote: Effect.fn(function* (node: Md.BlockQuote) {
		const runs = yield* Effect.forEach(node.children, quoteChildToInlines);
		const children: Array<LexicalNode.Type> = [];
		for (const [index, run] of runs.entries()) {
			if (index > 0) children.push(yield* lineBreak());
			children.push(...run);
		}
		return yield* QuoteNode.makeEffect({
			...elementDefaults,
			children,
		});
	}),
	pre: (node) => Effect.flatMap(Effect.map(Effect.forEach(
		Str.split(node.value, "\n"),
		(line, index) => index === 0
			? Effect.map(textLeaf(line, 0), A.of<LexicalNode.Type>)
			: Effect.zipWith(
				lineBreak(),
				textLeaf(line, 0),
				(brk, text) => [
					brk,
					text,
				] as ReadonlyArray<LexicalNode.Type>,
			),
	), A.flatten), (children) => CodeNode.makeEffect({
		...elementDefaults,
		language: node.language,
		theme: O.none(),
		children,
	})),
	ul: (node) => Effect.flatMap(
		listItemsToLexical(node.children),
		(children) => ListNode.makeEffect({
			...elementDefaults,
			listType: "bullet",
			start: 1,
			tag: "ul",
			children,
		}),
	),
	ol: (node) => Effect.flatMap(
		listItemsToLexical(node.children),
		(children) => ListNode.makeEffect({
			...elementDefaults,
			listType: "number",
			start: 1,
			tag: "ol",
			children,
		}),
	), // A bare list item has no Lexical block equivalent; it degrades to a
	// paragraph (README "Lossiness profile").
	li: (node) => Effect.flatMap(
		inlinesToLexical(node.children, 0),
		(children) => ParagraphNode.makeEffect({
			...elementDefaults,
			children,
		}),
	),
	taskList: (node) => Effect.flatMap(
		listItemsToLexical(A.map(
			node.children,
			(item) => ({
				children: item.children,
				checked: item.checked,
			}),
		)),
		(children) => ListNode.makeEffect({
			...elementDefaults,
			listType: "check",
			start: 1,
			tag: "ul",
			children,
		}),
	), // Thematic breaks are outside the v1 node scope; they degrade to a
	// literal "---" paragraph (README "Lossiness profile").
	hr: () => Effect.flatMap(
		textLeaf("---", 0),
		(text) => ParagraphNode.makeEffect({
			...elementDefaults,
			children: [text],
		}),
	),
}));

/**
 * Lift a full Md document into a serialized Lexical editor state.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { Document, P, Text } from "@beep/md/Md.model"
 * import { documentToEditorState } from "@beep/lexical-schema/Lexical.codec"
 *
 * const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] })
 * const state = Effect.runSync(documentToEditorState(document))
 * console.log(state.root.children.length) // 1
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const documentToEditorState = (document: Md.Document): Effect.Effect<SerializedEditorState, S.SchemaError> => Effect.flatMap(
	Effect.forEach(document.children, blockToLexical),
	(children) => Effect.flatMap(RootNode.makeEffect({
		...elementDefaults,
		children,
	}), (root) => SerializedEditorState.makeEffect({root})),
);

const wrapMarks = (base: Md.Inline, format: number): Md.Inline => {
	let inline = base;
	if ((format & IS_STRIKETHROUGH) !== 0) inline = Md.Del.make({children: [inline]});
	if ((format & IS_ITALIC) !== 0) inline = Md.Em.make({children: [inline]});
	if ((format & IS_BOLD) !== 0) inline = Md.Strong.make({children: [inline]});
	return inline;
};

const textRunToInlines = (children: ReadonlyArray<LexicalNode.Type>): ReadonlyArray<Md.Inline> => A.map(
	children,
	inlineNodeToMd,
);

const inlineNodeToMd: (node: LexicalNode.Type) => Md.Inline = LexicalNode.match({
	text: (node) => wrapMarks((node.format & IS_CODE) !== 0
		? Md.Code.make({value: node.text})
		: Md.Text.make({value: node.text}), node.format),
	tab: () => Md.Text.make({value: "\t"}),
	linebreak: () => Md.Br.make({}),
	link: (node) => Md.A.make({
		href: node.url,
		children: textRunToInlines(node.children),
	}),
	"artifact-ref": (node) => Md.A.make({
		href: `${ARTIFACT_URI_PREFIX}${node.artifactId}`,
		children: [Md.Text.make({value: O.getOrElse(node.label, () => node.artifactId)})],
	}), // Element nodes have no inline Md equivalent; they degrade to their plain
	// text (README "Lossiness profile").
	root: (node) => Md.Text.make({value: nodeToPlainText(node)}),
	paragraph: (node) => Md.Text.make({value: nodeToPlainText(node)}),
	heading: (node) => Md.Text.make({value: nodeToPlainText(node)}),
	quote: (node) => Md.Text.make({value: nodeToPlainText(node)}),
	list: (node) => Md.Text.make({value: nodeToPlainText(node)}),
	listitem: (node) => Md.Text.make({value: nodeToPlainText(node)}),
	code: (node) => Md.Text.make({value: nodeToPlainText(node)}),
});

const codeChildText: (node: LexicalNode.Type) => string = LexicalNode.match({
	text: (node) => node.text,
	tab: () => "\t",
	linebreak: () => "\n",
	"artifact-ref": nodeToPlainText,
	root: nodeToPlainText,
	paragraph: nodeToPlainText,
	heading: nodeToPlainText,
	quote: nodeToPlainText,
	list: nodeToPlainText,
	listitem: nodeToPlainText,
	link: nodeToPlainText,
	code: nodeToPlainText,
});

const isListNode = (node: LexicalNode.Type): node is ListNode.Type => node.type === "list";

// Nested lists flatten into the parent list level (README "Lossiness
// profile") — `@beep/md` list items hold inline content only.
const collectListItems = (list: ListNode.Type): ReadonlyArray<{
	readonly checked: O.Option<boolean>;
	readonly inlines: ReadonlyArray<Md.Inline>
}> => A.flatMap(
	list.children,
	(child) => child.type === "listitem"
		? A.match(A.filter(child.children, isListNode), {
			onEmpty: () => [
				{
					checked: child.checked,
					inlines: textRunToInlines(child.children),
				} as const,
			],
			onNonEmpty: (nested) => {
				const own = A.filter(child.children, (node) => !isListNode(node));
				const head = own.length === 0
					? []
					: [
						{
							checked: child.checked,
							inlines: textRunToInlines(own),
						} as const,
					];
				return A.appendAll(head, A.flatMap(nested, collectListItems));
			},
		})
		: isListNode(child)
			? collectListItems(child)
			: [
				{
					checked: O.none<boolean>(),
					inlines: [inlineNodeToMd(child)],
				} as const,
			],
);

const listToBlock = (node: ListNode.Type): Md.Block => {
	const items = collectListItems(node);
	if (node.listType === "check") {
		return Md.TaskList.make({
			children: A.map(
				items,
				(item) => Md.TaskItem.make({
					checked: O.getOrElse(item.checked, () => false),
					children: item.inlines,
				}),
			),
		});
	}
	const children = A.map(items, (item) => Md.Li.make({children: item.inlines}));
	return node.listType === "number"
		? Md.Ol.make({children})
		: Md.Ul.make({children});
};

const headingConstructors = {
	h1: Md.H1,
	h2: Md.H2,
	h3: Md.H3,
	h4: Md.H4,
	h5: Md.H5,
	h6: Md.H6,
} as const;

/**
 * Project one serialized Lexical node onto Md blocks.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LexicalNode } from "@beep/lexical-schema/Lexical.model"
 * import { nodeToBlocks } from "@beep/lexical-schema/Lexical.codec"
 *
 * const node = S.decodeUnknownSync(LexicalNode)({
 *   type: "artifact-ref", version: 1, artifactId: "artifact-123"
 * })
 * console.log(nodeToBlocks(node)[0]?._tag) // "p"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const nodeToBlocks: (node: LexicalNode.Type) => ReadonlyArray<Md.Block> = LexicalNode.match({
	root: (node) => A.flatMap(node.children, nodeToBlocks),
	paragraph: (node) => [Md.P.make({children: textRunToInlines(node.children)})],
	heading: (node) => [headingConstructors[node.tag].make({children: textRunToInlines(node.children)})],
	quote: (node) => [
		Md.BlockQuote.make({children: [Md.P.make({children: textRunToInlines(node.children)})]}),
	],
	code: (node) => [
		Md.Pre.make({
			value: A.join(A.map(node.children, codeChildText), ""),
			language: node.language,
		}),
	],
	list: (node) => [listToBlock(node)],
	listitem: (node) => [Md.P.make({children: textRunToInlines(node.children)})],
	"artifact-ref": (node) => [Md.P.make({children: [inlineNodeToMd(node)]})], // Loose leaves outside an element wrap into a paragraph.
	text: (node) => [Md.P.make({children: [inlineNodeToMd(node)]})],
	tab: (node) => [Md.P.make({children: [inlineNodeToMd(node)]})],
	linebreak: (node) => [Md.P.make({children: [inlineNodeToMd(node)]})],
	link: (node) => [Md.P.make({children: [inlineNodeToMd(node)]})],
});

/**
 * Project a serialized Lexical editor state onto the canonical Md document
 * AST, applying the documented lossiness profile.
 *
 * @example
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { Document, P, Text } from "@beep/md/Md.model"
 * import { documentToEditorState, editorStateToDocument } from "@beep/lexical-schema/Lexical.codec"
 *
 * const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] })
 * const state = Effect.runSync(documentToEditorState(document))
 * console.log(editorStateToDocument(state).children[0]?._tag) // "p"
 * ```
 *
 * @category combinators
 * @since 0.0.0
 */
export const editorStateToDocument = (state: SerializedEditorState.Type): Md.Document => Md.Document.make({
	children: A.flatMap(
		state.root.children,
		nodeToBlocks,
	),
});
