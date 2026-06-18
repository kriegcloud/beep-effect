import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";
import type * as O from "effect/Option";


const $I = $ScratchpadId.create("sheets/Shape.schemas");

export class Size extends S.Class<Size>($I`Size`)({
	width: S.OptionFromOptionalKey(S.Finite),
	height: S.OptionFromOptionalKey(S.Finite),
}, $I.annote("Size", {
	description: "The size of a shape",
})) {
}

export declare namespace Size {
	export interface Type {
		readonly width: O.Option<number>,
		readonly height: O.Option<number>,
	}

	export interface Encoded {
		readonly width?: undefined | number;
		readonly height?: undefined | number;
	}
}

export class Scale extends S.Class<Scale>($I`Scale`)({
	scaleX: S.OptionFromOptionalKey(S.Finite),
	scaleY: S.OptionFromOptionalKey(S.Finite),
}, $I.annote("Scale", {
	description: "The scale of a shape",
})) {
}

export declare namespace Scale {
	export interface Type {
		readonly scaleX: O.Option<number>,
		readonly scaleY: O.Option<number>,
	}

	export interface Encoded {
		readonly scaleX?: undefined | number;
		readonly scaleY?: undefined | number;
	}
}

export class Offset extends S.Class<Offset>($I`Offset`)({
	left: S.OptionFromOptionalKey(S.Finite),
	top: S.OptionFromOptionalKey(S.Finite),
}, $I.annote("Offset", {
	description: "The offset of a shape",
})) {
}

export declare namespace Offset {
	export interface Type {
		readonly left: O.Option<number>,
		readonly top: O.Option<number>,
	}

	export interface Encoded {
		readonly left?: undefined | number;
		readonly top?: undefined | number;
	}
}

export class SrcRect extends Offset.extend<SrcRect>($I`SrcRect`)({
	right: S.OptionFromOptionalKey(S.Finite),
	bottom: S.OptionFromOptionalKey(S.Finite),
}, $I.annote("SrcRect", {
	description: "The source rectangle of a shape",
})) {
}

export declare namespace SrcRect {
	export interface Type extends Offset.Type {
		readonly right: O.Option<number>,
		readonly bottom: O.Option<number>,
	}

	export interface Encoded extends Offset.Encoded {
		readonly right?: undefined | number;
		readonly bottom?: undefined | number;
	}
}

export class GroupBaseBound extends S.Class<GroupBaseBound>($I`GroupBaseBound`)({
	left: S.Finite,
	top: S.Finite,
	width: S.Finite,
	height: S.Finite,
}, $I.annote("GroupBaseBound", {
	description: "The base bound of a group",
})) {
}

export declare namespace GroupBaseBound {
	export interface Type {
		readonly left: number;
		readonly top: number;
		readonly width: number;
		readonly height: number;
	}

	export interface Encoded extends Type {
	}
}

export class AbsoluteTransform extends S.Class<AbsoluteTransform>($I`AbsoluteTransform`)({
	...Size.fields, ...Offset.fields, ...Scale.fields,
}, $I.annote("AbsoluteTransform", {
	description: "The absolute transform of a shape",
})) {
}

export declare namespace AbsoluteTransform {
	export interface Type extends Size.Type, Offset.Type, Scale.Type {
	}

	export interface Encoded extends Size.Encoded, Offset.Encoded, Scale.Encoded {
	}
}

export class RectXYWH extends S.Class<RectXYWH>($I`RectXYWH`)({
	x: S.Finite,
	y: S.Finite,
	width: S.Finite,
	height: S.Finite,
}, $I.annote("RectXYWH", {
	description: "The rectangle of a shape",
})) {
}

export declare namespace RectXYWH {
	export interface Type {
		readonly x: number;
		readonly y: number;
		readonly width: number;
		readonly height: number;
	}

	export interface Encoded extends Type {
	}
}