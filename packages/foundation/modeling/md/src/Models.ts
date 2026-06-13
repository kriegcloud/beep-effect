/**
 * Schema-first Markdown document AST models.
 *
 * @packageDocumentation \@beep/md/Md.model
 * @since 0.0.0
 */

import {$MdId} from "@beep/identity";
import * as S from "effect/Schema";

const $I = $MdId.create("Md.model");

export const InlineChildren = S.Array(S.suspend((): S.Codec<Inline.Type, Inline.Encoded> => Inline));

declare namespace InlineChildren {
	export type Type = ReadonlyArray<Inline.Type>;

	export type Encoded = ReadonlyArray<Inline.Encoded>;
}

export class Text extends S.TaggedClass<Text>($I`Text`)("text", {
	value: S.String,
}, $I.annote("Text", {
	description: "Plain escaped inline text.",
})) {
}

export declare namespace Text {
	export interface Type {
		readonly _tag: "text";
		readonly value: string;
	}

	export interface Encoded extends Type {
	}
}

export class RawMarkdown extends S.TaggedClass<RawMarkdown>($I`RawMarkdown`)("rawMarkdown", {
	value: S.String,
}, $I.annote("RawMarkdown", {
	description: "Trusted raw Markdown inline content.",
})) {
}

export declare namespace RawMarkdown {
	export interface Type {
		readonly _tag: "rawMarkdown";
		readonly value: string;
	}

	export interface Encoded extends Type {
	}
}

export class RawHtml extends S.TaggedClass<RawHtml>($I`RawHtml`)("rawHtml", {
	value: S.String,
}, $I.annote("RawHtml", {
	description: "Raw HTML inline content for adapters that opt into trusted HTML rendering. The built-in HTML adapter escapes this value by default.",
})) {
}

export declare namespace RawHtml {
	export interface Type {
		readonly _tag: "rawHtml";
		readonly value: string;
	}

	export interface Encoded extends Type {
	}
}

export class Strong extends S.TaggedClass<Strong>($I`Strong`)("strong", {
	value: S.Array(Text),
}, $I.annote("Strong", {
	description: "Strong inline content.",
})) {
}

export declare namespace Strong {
	export interface Type {
		readonly _tag: "strong";
		readonly value: ReadonlyArray<Text.Encoded>;
	}

	export interface Encoded extends Type {
	}
}

export class Em extends S.TaggedClass<Em>($I`Em`)("em", {
	children: InlineChildren,
}, $I.annote("Em", {
	description: "Emphasized inline content.",
})) {
}

export declare namespace Em {
	export interface Type {
		readonly _tag: "em";
		readonly children: InlineChildren.Type;
	}

	export interface Encoded {
		readonly _tag: "em";
		readonly children: InlineChildren.Encoded;
	}
}

export class Del extends S.TaggedClass<Del>($I`Del`)("del", {
	children: InlineChildren,
}, $I.annote("Del", {
	description: "Deleted inline content.",
})) {
}

export declare namespace Del {
	export interface Type {
		readonly _tag: "del";
		readonly children: InlineChildren.Type;
	}

	export interface Encoded {
		readonly _tag: "del";
		readonly children: InlineChildren.Encoded;
	}
}

export class Code extends S.TaggedClass<Code>($I`Code`)("code", {
	value: S.String,
}, $I.annote("Code", {
	description: "Inline code span.",
})) {
}

export declare namespace Code {
	export interface Type {
		readonly _tag: "code";
		readonly value: string;
	}

	export interface Encoded extends Type {
	}
}

export class A extends S.TaggedClass<A>($I`A`)("a", {
	href: S.String,
	children: InlineChildren,
}, $I.annote("A", {
	description: "Inline Hyperlink.",
})) {
}

export declare namespace A {
	export interface Type {
		readonly _tag: "a";
		readonly children: InlineChildren.Type;
		readonly href: string;
	}

	export interface Encoded {
		readonly _tag: "a";
		readonly children: InlineChildren.Encoded;
		readonly href: string;
	}
}

export class Img extends S.TaggedClass<Img>($I`Img`)("img", {
	src: S.String,
	alt: S.String,
}, $I.annote("Img", {
	description: "Inline image.",
})) {
}

export declare namespace Img {
	export interface Type {
		readonly _tag: "img";
		readonly alt: string;
		readonly src: string;
	}

	export interface Encoded extends Type {
	}
}

export class Br extends S.TaggedClass<Br>($I`Br`)("br", {}, $I.annote("Br", {
	description: "Line break.",
})) {
}

export declare namespace Br {
	export interface Type {
		readonly _tag: "br";
	}

	export interface Encoded extends Type {
	}
}

export const Inline = S.Union([
	Text,
	RawMarkdown,
	RawHtml,
	Strong,
	Em,
	Del,
	Code,
	A,
	Img,
	Br,
]).pipe(S.toTaggedUnion("_tag"), $I.annoteSchema("Inline", {
	description: "Discriminated union of inline Markdown AST nodes.",
}));

export type Inline = typeof Inline.Type;

export declare namespace Inline {
	export type Type =
		| Text.Type
		| RawMarkdown.Type
		| RawHtml.Type
		| Strong.Type
		| Em.Type
		| Del.Type
		| Code.Type
		| A.Type
		| Img.Type
		| Br.Type;

	export type Encoded =
		| Text.Encoded
		| RawMarkdown.Encoded
		| RawHtml.Encoded
		| Strong.Encoded
		| Em.Encoded
		| Del.Encoded
		| Code.Encoded
		| A.Encoded
		| Img.Encoded
		| Br.Encoded;
}


/**
 * Paragraph block.
 *
 * @example
 * ```ts
 * import { P, Text } from "@beep/md/Md.model"
 *
 * const node = P.make({ children: [Text.make({ value: "Hello" })] })
 * console.log(node._tag) // "p"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class P extends S.TaggedClass<P>($I`P`)("p", {
	children: InlineChildren,
}, $I.annote("P", {
	description: "Paragraph block.",
})) {}

export declare namespace P {
	export interface Type {
		readonly _tag: "p";
		readonly children: InlineChildren.Type;
	}

	export interface Encoded {
		readonly _tag: "p";
		readonly children: InlineChildren.Encoded;
	}
}