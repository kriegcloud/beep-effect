import type * as Lexical from "./Lexical.schemas.ts";

type Equal<Actual, Expected> = (<Value>() => Value extends Actual ? 1 : 2) extends <
	Value,
>() => Value extends Expected ? 1 : 2
	? (<Value>() => Value extends Expected ? 1 : 2) extends <Value>() => Value extends Actual ? 1 : 2
		? true
		: false
	: false;

type Expect<Condition extends true> = Condition;

export type LexicalSchemaDecodedTypeAlignment = [
	Expect<Equal<typeof Lexical.ElementFormat.Type, Lexical.ElementFormat>>,
	Expect<Equal<typeof Lexical.Direction.Type, Lexical.Direction>>,
	Expect<Equal<typeof Lexical.TextMode.Type, Lexical.TextMode>>,
	Expect<Equal<typeof Lexical.BaseNode.Type, Lexical.BaseNode.Type>>,
	Expect<Equal<typeof Lexical.ElementNode.Type, Lexical.ElementNode.Type>>,
	Expect<Equal<typeof Lexical.TextBase.Type, Lexical.TextBase.Type>>,
	Expect<Equal<typeof Lexical.TextNode.Type, Lexical.TextNode.Type>>,
	Expect<Equal<typeof Lexical.TabNode.Type, Lexical.TabNode.Type>>,
	Expect<Equal<typeof Lexical.LineBreakNode.Type, Lexical.LineBreakNode.Type>>,
	Expect<Equal<typeof Lexical.RootNode.Type, Lexical.RootNode.Type>>,
	Expect<Equal<typeof Lexical.ParagraphNode.Type, Lexical.ParagraphNode.Type>>,
	Expect<Equal<typeof Lexical.HeadingNode.Type, Lexical.HeadingNode.Type>>,
	Expect<Equal<typeof Lexical.QuoteNode.Type, Lexical.QuoteNode.Type>>,
	Expect<Equal<typeof Lexical.ListNode.Type, Lexical.ListNode.Type>>,
	Expect<Equal<typeof Lexical.ListItemNode.Type, Lexical.ListItemNode.Type>>,
	Expect<Equal<typeof Lexical.LinkBase.Type, Lexical.LinkBase.Type>>,
	Expect<Equal<typeof Lexical.LinkNode.Type, Lexical.LinkNode.Type>>,
	Expect<Equal<typeof Lexical.AutoLinkNode.Type, Lexical.AutoLinkNode.Type>>,
	Expect<Equal<typeof Lexical.CodeNode.Type, Lexical.CodeNode.Type>>,
	Expect<Equal<typeof Lexical.MermaidNode.Type, Lexical.MermaidNode.Type>>,
	Expect<Equal<typeof Lexical.YouTubeNode.Type, Lexical.YouTubeNode.Type>>,
	Expect<Equal<typeof Lexical.TableCellNode.Type, Lexical.TableCellNode.Type>>,
	Expect<Equal<typeof Lexical.TableRowNode.Type, Lexical.TableRowNode.Type>>,
	Expect<Equal<typeof Lexical.TableNode.Type, Lexical.TableNode.Type>>,
	Expect<Equal<typeof Lexical.LexicalNode.Type, Lexical.LexicalNode.Type>>,
	Expect<Equal<typeof Lexical.SerializedEditorState.Type, Lexical.SerializedEditorState.Type>>,
	Expect<Equal<typeof Lexical.EditorStateFromJson.Type, Lexical.SerializedEditorState.Type>>,
];

export type LexicalSchemaEncodedTypeAlignment = [
	Expect<Equal<typeof Lexical.ElementFormat.Encoded, Lexical.ElementFormat>>,
	Expect<Equal<typeof Lexical.Direction.Encoded, Lexical.Direction>>,
	Expect<Equal<typeof Lexical.TextMode.Encoded, Lexical.TextMode>>,
	Expect<Equal<typeof Lexical.BaseNode.Encoded, Lexical.BaseNode.Encoded>>,
	Expect<Equal<typeof Lexical.ElementNode.Encoded, Lexical.ElementNode.Encoded>>,
	Expect<Equal<typeof Lexical.TextBase.Encoded, Lexical.TextBase.Encoded>>,
	Expect<Equal<typeof Lexical.TextNode.Encoded, Lexical.TextNode.Encoded>>,
	Expect<Equal<typeof Lexical.TabNode.Encoded, Lexical.TabNode.Encoded>>,
	Expect<Equal<typeof Lexical.LineBreakNode.Encoded, Lexical.LineBreakNode.Encoded>>,
	Expect<Equal<typeof Lexical.RootNode.Encoded, Lexical.RootNode.Encoded>>,
	Expect<Equal<typeof Lexical.ParagraphNode.Encoded, Lexical.ParagraphNode.Encoded>>,
	Expect<Equal<typeof Lexical.HeadingNode.Encoded, Lexical.HeadingNode.Encoded>>,
	Expect<Equal<typeof Lexical.QuoteNode.Encoded, Lexical.QuoteNode.Encoded>>,
	Expect<Equal<typeof Lexical.ListNode.Encoded, Lexical.ListNode.Encoded>>,
	Expect<Equal<typeof Lexical.ListItemNode.Encoded, Lexical.ListItemNode.Encoded>>,
	Expect<Equal<typeof Lexical.LinkBase.Encoded, Lexical.LinkBase.Encoded>>,
	Expect<Equal<typeof Lexical.LinkNode.Encoded, Lexical.LinkNode.Encoded>>,
	Expect<Equal<typeof Lexical.AutoLinkNode.Encoded, Lexical.AutoLinkNode.Encoded>>,
	Expect<Equal<typeof Lexical.CodeNode.Encoded, Lexical.CodeNode.Encoded>>,
	Expect<Equal<typeof Lexical.MermaidNode.Encoded, Lexical.MermaidNode.Encoded>>,
	Expect<Equal<typeof Lexical.YouTubeNode.Encoded, Lexical.YouTubeNode.Encoded>>,
	Expect<Equal<typeof Lexical.TableCellNode.Encoded, Lexical.TableCellNode.Encoded>>,
	Expect<Equal<typeof Lexical.TableRowNode.Encoded, Lexical.TableRowNode.Encoded>>,
	Expect<Equal<typeof Lexical.TableNode.Encoded, Lexical.TableNode.Encoded>>,
	Expect<Equal<typeof Lexical.LexicalNode.Encoded, Lexical.LexicalNode.Encoded>>,
	Expect<Equal<typeof Lexical.SerializedEditorState.Encoded, Lexical.SerializedEditorState.Encoded>>,
	Expect<Equal<typeof Lexical.EditorStateFromJson.Encoded, string>>,
];
