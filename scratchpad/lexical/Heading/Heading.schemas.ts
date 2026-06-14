import {$ScratchpadId} from "@beep/identity";

import * as S from "effect/Schema";
import {LiteralKit, SchemaUtils} from "@beep/schema";
import {ElementNode} from "../../Lexical.schemas.ts";

const $I = $ScratchpadId.create("lexical/Heading/Heading.schemas");

export const HeadingTag = LiteralKit(
	[
		"h1",
		"h2",
		"h3",
		"h4",
		"h5",
		"h6"
	]
).pipe(
	$I.annoteSchema("HeadingTag", {
		description: "tag name of a heading element"
	})
)

export type HeadingTag = typeof HeadingTag.Type;

export class HeadingBase extends ElementNode.extend<HeadingBase>($I`HeadingBase`)({
	type: S.tag("heading").annotateKey({
		description: "Lexical discriminator for rich-text heading elements.",
	}),
}, $I.annote("HeadingBase", {
	description: "base properties of a heading element",
})) {
}

export declare namespace HeadingBase {
	export interface Type extends ElementNode.Type {
		readonly type: "heading";
	}
	
	export interface Encoded extends ElementNode.Encoded {
		readonly type: "heading";
	}
}

export class H1 extends HeadingBase.extend<H1>($I`H1`)(
	{
		tag: S.tag("h1").annotateKey({
			description: "",
		})
	},
	$I.annote("H1", {
		description: "",
	})
) {}

export declare namespace H1 {
	export interface Type extends HeadingBase.Type {
		readonly tag: "h1";
	}

	export interface Encoded extends HeadingBase.Encoded {
		readonly tag: "h1";
	}
}

export class H2 extends HeadingBase.extend<H2>($I`H2`)(
	{
		tag: S.tag("h2").annotateKey({
			description: "",
		})
	},
	$I.annote("H2", {
		description: "base properties of a heading element",
	})
) {}

export declare namespace H2 {
	export interface Type extends HeadingBase.Type {
		readonly tag: "h2";
	}

	export interface Encoded extends HeadingBase.Encoded {
		readonly tag: "h2";
	}
}

export class H3 extends HeadingBase.extend<H3>($I`H3`)(
	{
		tag: S.tag("h3").annotateKey({
			description: "",
		})
	},
	$I.annote("H3", {
		description: "",
	})
) {}

export declare namespace H3 {
	export interface Type extends HeadingBase.Type {
		readonly tag: "h3";
	}

	export interface Encoded extends HeadingBase.Encoded {
		readonly tag: "h3";
	}
}

export class H4 extends HeadingBase.extend<H4>($I`H4`)(
	{
		tag: S.tag("h4").annotateKey({
			description: "",
		})
	},
	$I.annote("H4", {
		description: "",
	})
) {}

export declare namespace H4 {
	export interface Type extends HeadingBase.Type {
		readonly tag: "h4";
	}

	export interface Encoded extends HeadingBase.Encoded {
		readonly tag: "h4";
	}
}

export class H5 extends HeadingBase.extend<H5>($I`H5`)(
	{
		tag: S.tag("h5").annotateKey({
			description: "",
		})
	},
	$I.annote("H5", {
		description: "",
	})
) {}

export declare namespace H5 {
	export interface Type extends HeadingBase.Type {
		readonly tag: "h5";
	}

	export interface Encoded extends HeadingBase.Encoded {
		readonly tag: "h5";
	}
}

export class H6 extends HeadingBase.extend<H6>($I`H6`)(
	{
		tag: S.tag("h6").annotateKey({
			description: "",
		})
	},
	$I.annote("H6", {
		description: "",
	})
) {}

export declare namespace H6 {
	export interface Type extends HeadingBase.Type {
		readonly tag: "h6";
	}
	
	export interface Encoded extends HeadingBase.Encoded {
		readonly tag: "h6";
	}
}


export const Heading = S.Union(
	[
		H1,
		H2,
		H3,
		H4,
		H5,
		H6,
	]
).pipe(
	S.toTaggedUnion("tag"),
	SchemaUtils.withStatics(() => ({
		H1,
		H2,
		H3,
		H4,
		H5,
		H6,
	})),
	$I.annoteSchema("Heading", {
		description: "",
	})
)

export type Heading = typeof Heading.Type;

export declare namespace Heading {
	export type Encoded =
		| H1.Encoded
		| H2.Encoded
		| H3.Encoded
		| H4.Encoded
		| H5.Encoded
		| H6.Encoded

	export type H1 = typeof H1.Type
	export type H2 = typeof H2.Type
	export type H3 = typeof H3.Type
	export type H4 = typeof H4.Type
	export type H5 = typeof H5.Type
	export type H6 = typeof H6.Type

	export namespace H1 {
		export type Encoded = typeof H1.Encoded
	}

	export namespace H2 {
		export type Encoded = typeof H2.Encoded
	}

	export namespace H3 {
		export type Encoded = typeof H3.Encoded
	}

	export namespace H4 {
		export type Encoded = typeof H4.Encoded
	}

	export namespace H5 {
		export type Encoded = typeof H5.Encoded
	}

	export namespace H6 {
		export type Encoded = typeof H6.Encoded
	}
}


