import {ElementNode} from "../../Lexical.schemas.ts";
import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("ListBase")

export class ListBase extends ElementNode.extend<ListBase>($I`ListBase`)({
	type: S.tag("list").annotateKey({}),
	start: S.Finite.annotateKey({
		description: "",
	}),
}, $I.annote("ListBase", {
	description: "A list item",
})) {}

export class UnorderedList extends ListBase.extend<UnorderedList>($I`UnorderedList`)({
	tag: S.tag("ul"),
}, $I.annote("UnorderedList", {
	description: "An unordered list",
})) {}

export class OrderedList extends ListBase.extend<OrderedList>($I`OrderedList`)(
	{
		tag: S.tag("ol")
	},
	$I.annote("OrderedList", {
		description: "An ordered list",
	})
) {}


export const ListKind = S.Union([

])