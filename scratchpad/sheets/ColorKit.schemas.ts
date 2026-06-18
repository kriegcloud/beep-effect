import {$ScratchpadId} from "@beep/identity";
import {SchemaUtils} from "@beep/schema";
import type * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $ScratchpadId.create("sheets/ColorKit.schemas")

export class RgbColor extends S.TaggedClass<RgbColor>($I`RgbColor`)("rgb", {
	b: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 255,
	})),
	g: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 255,
	})),
	r: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 255,
	})),
	a: S.Finite.pipe(S.check(S.isBetween({
		minimum: 0,
		maximum: 1,
	})), SchemaUtils.withKeyDefaults(1)),
}, $I.annote("RgbColor", {
	description: "An RGB color",
})) {
}

export class HslColor extends S.TaggedClass<HslColor>($I`HslColor`)("hsl", {
	h: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 360,
	})),
	l: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 100,
	})),
	s: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 100,
	})),
	a: S.Finite.pipe(S.check(S.isBetween({
		minimum: 0,
		maximum: 1,
	})), SchemaUtils.withKeyDefaults(1)),
}, $I.annote("HslColor", {})) {
}

export class HsvColor extends S.TaggedClass<HsvColor>($I`HsvColor`)("hsv", {
	h: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 360,
	})),
	s: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 100,
	})),
	v: S.Finite.check(S.isBetween({
		minimum: 0,
		maximum: 100,
	})),
	a: S.Finite.pipe(S.check(S.isBetween({
		minimum: 0,
		maximum: 1,
	})), SchemaUtils.withKeyDefaults(1)),
}, $I.annote("HsvColor", {
	description: "An HSV color",
})) {
}

export const Color = S.Union([
	RgbColor,
	HslColor,
	HsvColor,
]).pipe(S.toTaggedUnion("_tag"), $I.annoteSchema("Color", {
	description: "A color",
}))

export type Color = typeof Color.Type;

export const RgbParen = S.Literal("rgb(");
export const RgbaParen = S.Literal("rgba(");

export const COLORS: R.ReadonlyRecord<string, ReadonlyArray<number>> = {
	aliceblue: [
		240,
		248,
		255,
	],
	antiquewhite: [
		250,
		235,
		215,
	],
	aqua: [
		0,
		255,
		255,
	],
	aquamarine: [
		127,
		255,
		212,
	],
	azure: [
		240,
		255,
		255,
	],
	beige: [
		245,
		245,
		220,
	],
	bisque: [
		255,
		228,
		196,
	],
	black: [
		0,
		0,
		0,
	],
	blanchedalmond: [
		255,
		235,
		205,
	],
	blue: [
		0,
		0,
		255,
	],
	blueviolet: [
		138,
		43,
		226,
	],
	brown: [
		165,
		42,
		42,
	],
	burlywood: [
		222,
		184,
		135,
	],
	cadetblue: [
		95,
		158,
		160,
	],
	chartreuse: [
		127,
		255,
		0,
	],
	chocolate: [
		210,
		105,
		30,
	],
	coral: [
		255,
		127,
		80,
	],
	cornflowerblue: [
		100,
		149,
		237,
	],
	cornsilk: [
		255,
		248,
		220,
	],
	crimson: [
		220,
		20,
		60,
	],
	cyan: [
		0,
		255,
		255,
	],
	darkblue: [
		0,
		0,
		139,
	],
	darkcyan: [
		0,
		139,
		139,
	],
	darkgoldenrod: [
		184,
		134,
		11,
	],
	darkgray: [
		169,
		169,
		169,
	],
	darkgreen: [
		0,
		100,
		0,
	],
	darkgrey: [
		169,
		169,
		169,
	],
	darkkhaki: [
		189,
		183,
		107,
	],
	darkmagenta: [
		139,
		0,
		139,
	],
	darkolivegreen: [
		85,
		107,
		47,
	],
	darkorange: [
		255,
		140,
		0,
	],
	darkorchid: [
		153,
		50,
		204,
	],
	darkred: [
		139,
		0,
		0,
	],
	darksalmon: [
		233,
		150,
		122,
	],
	darkseagreen: [
		143,
		188,
		143,
	],
	darkslateblue: [
		72,
		61,
		139,
	],
	darkslategray: [
		47,
		79,
		79,
	],
	darkslategrey: [
		47,
		79,
		79,
	],
	darkturquoise: [
		0,
		206,
		209,
	],
	darkviolet: [
		148,
		0,
		211,
	],
	darkyellow: [
		139,
		128,
		0,
	],
	deeppink: [
		255,
		20,
		147,
	],
	deepskyblue: [
		0,
		191,
		255,
	],
	dimgray: [
		105,
		105,
		105,
	],
	dimgrey: [
		105,
		105,
		105,
	],
	dodgerblue: [
		30,
		144,
		255,
	],
	firebrick: [
		178,
		34,
		34,
	],
	floralwhite: [
		255,
		255,
		240,
	],
	forestgreen: [
		34,
		139,
		34,
	],
	fuchsia: [
		255,
		0,
		255,
	],
	gainsboro: [
		220,
		220,
		220,
	],
	ghostwhite: [
		248,
		248,
		255,
	],
	gold: [
		255,
		215,
		0,
	],
	goldenrod: [
		218,
		165,
		32,
	],
	gray: [
		128,
		128,
		128,
	],
	green: [
		0,
		128,
		0,
	],
	greenyellow: [
		173,
		255,
		47,
	],
	grey: [
		128,
		128,
		128,
	],
	honeydew: [
		240,
		255,
		240,
	],
	hotpink: [
		255,
		105,
		180,
	],
	indianred: [
		205,
		92,
		92,
	],
	indigo: [
		75,
		0,
		130,
	],
	ivory: [
		255,
		255,
		240,
	],
	khaki: [
		240,
		230,
		140,
	],
	lavender: [
		230,
		230,
		250,
	],
	lavenderblush: [
		255,
		240,
		245,
	],
	lawngreen: [
		124,
		252,
		0,
	],
	lemonchiffon: [
		255,
		250,
		205,
	],
	lightblue: [
		173,
		216,
		230,
	],
	lightcoral: [
		240,
		128,
		128,
	],
	lightcyan: [
		224,
		255,
		255,
	],
	lightgoldenrodyellow: [
		250,
		250,
		210,
	],
	lightgray: [
		211,
		211,
		211,
	],
	lightgreen: [
		144,
		238,
		144,
	],
	lightgrey: [
		211,
		211,
		211,
	],
	lightpink: [
		255,
		182,
		193,
	],
	lightsalmon: [
		255,
		160,
		122,
	],
	lightseagreen: [
		32,
		178,
		170,
	],
	lightskyblue: [
		135,
		206,
		250,
	],
	lightslategray: [
		119,
		136,
		153,
	],
	lightslategrey: [
		119,
		136,
		153,
	],
	lightsteelblue: [
		176,
		196,
		222,
	],
	lightyellow: [
		255,
		255,
		224,
	],
	lime: [
		0,
		255,
		0,
	],
	limegreen: [
		50,
		205,
		50,
	],
	linen: [
		250,
		240,
		230,
	],
	magenta: [
		255,
		0,
		255,
	],
	maroon: [
		128,
		0,
		0,
	],
	mediumaquamarine: [
		102,
		205,
		170,
	],
	mediumblue: [
		0,
		0,
		205,
	],
	mediumorchid: [
		186,
		85,
		211,
	],
	mediumpurple: [
		147,
		112,
		219,
	],
	mediumseagreen: [
		60,
		179,
		113,
	],
	mediumslateblue: [
		123,
		104,
		238,
	],
	mediumspringgreen: [
		0,
		250,
		154,
	],
	mediumturquoise: [
		72,
		209,
		204,
	],
	mediumvioletred: [
		199,
		21,
		133,
	],
	midnightblue: [
		25,
		25,
		112,
	],
	mintcream: [
		245,
		255,
		250,
	],
	mistyrose: [
		255,
		228,
		225,
	],
	moccasin: [
		255,
		228,
		181,
	],
	navajowhite: [
		255,
		222,
		173,
	],
	navy: [
		0,
		0,
		128,
	],
	oldlace: [
		253,
		245,
		230,
	],
	olive: [
		128,
		128,
		0,
	],
	olivedrab: [
		107,
		142,
		35,
	],
	orange: [
		255,
		165,
		0,
	],
	orangered: [
		255,
		69,
		0,
	],
	orchid: [
		218,
		112,
		214,
	],
	palegoldenrod: [
		238,
		232,
		170,
	],
	palegreen: [
		152,
		251,
		152,
	],
	paleturquoise: [
		175,
		238,
		238,
	],
	palevioletred: [
		219,
		112,
		147,
	],
	papayawhip: [
		255,
		239,
		213,
	],
	peachpuff: [
		255,
		218,
		185,
	],
	peru: [
		205,
		133,
		63,
	],
	pink: [
		255,
		192,
		203,
	],
	plum: [
		221,
		160,
		221,
	],
	powderblue: [
		176,
		224,
		230,
	],
	purple: [
		128,
		0,
		128,
	],
	rebeccapurple: [
		102,
		51,
		153,
	],
	red: [
		255,
		0,
		0,
	],
	rosybrown: [
		188,
		143,
		143,
	],
	royalblue: [
		65,
		105,
		225,
	],
	saddlebrown: [
		139,
		69,
		19,
	],
	salmon: [
		250,
		128,
		114,
	],
	sandybrown: [
		244,
		164,
		96,
	],
	seagreen: [
		46,
		139,
		87,
	],
	seashell: [
		255,
		245,
		238,
	],
	sienna: [
		160,
		82,
		45,
	],
	silver: [
		192,
		192,
		192,
	],
	skyblue: [
		135,
		206,
		235,
	],
	slateblue: [
		106,
		90,
		205,
	],
	slategray: [
		112,
		128,
		144,
	],
	slategrey: [
		112,
		128,
		144,
	],
	snow: [
		255,
		255,
		250,
	],
	springgreen: [
		0,
		255,
		127,
	],
	steelblue: [
		70,
		130,
		180,
	],
	tan: [
		210,
		180,
		140,
	],
	teal: [
		0,
		128,
		128,
	],
	thistle: [
		216,
		191,
		216,
	],
	transparent: [
		255,
		255,
		255,
		0,
	],
	tomato: [
		255,
		99,
		71,
	],
	turquoise: [
		64,
		224,
		208,
	],
	violet: [
		238,
		130,
		238,
	],
	wheat: [
		245,
		222,
		179,
	],
	white: [
		255,
		255,
		255,
	],
	whitesmoke: [
		245,
		245,
		245,
	],
	yellow: [
		255,
		255,
		0,
	],
	yellowgreen: [
		154,
		205,
		50,
	],
};

export class ColorKit {
	private _color!: Color;

	private _rgbColor!: RgbColor;

	private _isValid = false;

	static mix(color1: string | Color | ColorKit, color2: string | Color | ColorKit, amount: number) {
		const normalizedAmount = Math.min(1, Math.max(0, amount));

		const rgb1 = new ColorKit(color1).toRgb();

		const rgb2 = new ColorKit(color2).toRgb();

		const alpha1 = rgb1.a ?? 1;

		const alpha2 = rgb2.a ?? 1;

		const rgba = RgbColor.make({
			r: (rgb2.r - rgb1.r) * normalizedAmount + rgb1.r,

			g: (rgb2.g - rgb1.g) * normalizedAmount + rgb1.g,

			b: (rgb2.b - rgb1.b) * normalizedAmount + rgb1.b,

			a: (alpha2 - alpha1) * normalizedAmount + alpha1,
		});

		return new ColorKit(rgba);
	}

	static getContrastRatio(foreground: string | Color | ColorKit, background: string | Color | ColorKit) {
		const lumA = new ColorKit(foreground).getLuminance();

		const lumB = new ColorKit(background).getLuminance();

		return (Math.max(lumA, lumB) + 0.05) / (Math.min(lumA, lumB) + 0.05);
	}

	constructor(color: string | Color | ColorKit | undefined) {
		if (color == null) {
			this._setNullColor();
			return;
		}

		if (color instanceof ColorKit) {
			this._color = color._color;

			this._rgbColor = color._rgbColor;

			this._isValid = color._isValid;

			return;
		}

		let colorObject: Color | undefined;

		try {
			colorObject = toColor(color);
		} catch {
			this._setNullColor();
			return;
		}

		if (colorObject == null) {
			this._setNullColor();
			return;
		}

		this._color = colorObject;

		let rgbColorObject: RgbColor | undefined;

		try {
			rgbColorObject = toRgbColor(this._color);
		} catch {
			this._setNullColor();
			return;
		}

		if (rgbColorObject == null) {
			this._setNullColor();
			return;
		}

		this._rgbColor = rgbColorObject;

		this._isValid = true;
	}

	get isValid() {
		return this._isValid;
	}

	toRgb() {
		return this._rgbColor;
	}

	toRgbString() {
		const {
			r,
			g,
			b,
			a = 1,
		} = this.toRgb();

		const useAlpha = a < 1;

		return `rgb${useAlpha
			? 'a'
			: ''}(${r},${g},${b}${useAlpha
			? `,${a}`
			: ''})`;
	}

	toString() {
		return this.toRgbString();
	}

	toHexString(allowShort?: boolean) {
		const {
			r,
			g,
			b,
			a = 1,
		} = this.toRgb();

		const useAlpha = a < 1;

		const hex = [
			pad2(Math.round(r).toString(16)),

			pad2(Math.round(g).toString(16)),

			pad2(Math.round(b).toString(16)),

			pad2(Math.round(a * 255).toString(16)),
		];

		if (allowShort) {
			if (hex[0][0] === hex[0][1] && hex[1][0] === hex[1][1] && hex[2][0] === hex[2][1] && hex[3][0] === hex[3][1]) {
				return useAlpha
					? `#${hex[0][0]}${hex[1][0]}${hex[2][0]}${hex[3][0]}`
					: `#${hex[0][0]}${hex[1][0]}${hex[2][0]}`;
			}
		}

		return useAlpha
			? `#${hex[0]}${hex[1]}${hex[2]}${hex[3]}`
			: `#${hex[0]}${hex[1]}${hex[2]}`;
	}

	toHsv() {
		return rgb2Hsv(this.toRgb());
	}

	toHsl() {
		return rgb2Hsl(this.toRgb());
	}

	lighten(amount = 10) {
		const hsl = this.toHsl();

		return new ColorKit(HslColor.make({
			h: hsl.h,
			s: hsl.s,
			l: Math.min(Math.max(hsl.l + amount, 0), 100),
			a: hsl.a,
		}));
	}

	darken(amount = 10) {
		const hsl = this.toHsl();

		return new ColorKit(HslColor.make({
			h: hsl.h,
			s: hsl.s,
			l: Math.min(Math.max(hsl.l - amount, 0), 100),
			a: hsl.a,
		}));
	}

	setAlpha(value: number) {
		return new ColorKit({
			...this._rgbColor,
			a: value,
		});
	}

	getLuminance() {
		let {
			r,
			g,
			b,
		} = this.toRgb();

		r = rgbNormalize(r);

		g = rgbNormalize(g);

		b = rgbNormalize(b);

		// Truncate at 3 digits

		return Number((0.2126 * r + 0.7152 * g + 0.0722 * b).toFixed(3));
	}

	getBrightness() {
		const {
			r,
			g,
			b,
		} = this.toRgb();

		return (r * 299 + g * 587 + b * 114) / 1000;
	}

	getAlpha() {
		return this._color.a ?? 1;
	}

	isDark() {
		return this.getBrightness() < 128;
	}

	isLight() {
		return !this.isDark();
	}

	private _setNullColor() {
		this._isValid = false;
		this._color = RgbColor.make({
			r: 0,
			g: 0,
			b: 0,
			a: 0,
		});
		this._rgbColor = RgbColor.make({
			r: 0,
			g: 0,
			b: 0,
			a: 0,
		});
	}
}

const pad2 = (v: string) => {
	return v.length === 1
		? `0${v}`
		: v;
};

const rgbNormalize = (val: number) => {
	val /= 255;

	return val <= 0.03928
		? val / 12.92
		: ((val + 0.055) / 1.055) ** 2.4;
};

const HexColorPattern = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/;

const DecimalNumberPattern = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

const parseNumberToken = (value: string): number | undefined => {
	const trimmed = value.trim();

	if (!DecimalNumberPattern.test(trimmed)) {
		return;
	}

	const parsed = Number.parseFloat(trimmed);

	return Number.isFinite(parsed)
		? parsed
		: undefined;
};

const parsePercentNumberToken = (value: string): number | undefined => {
	const trimmed = value.trim();

	return parseNumberToken(trimmed.endsWith("%")
		? trimmed.slice(0, -1)
		: trimmed);
};

const parseColorFunctionValues = (color: string, pattern: RegExp): ReadonlyArray<string> | undefined => {
	const match = pattern.exec(color);

	if (match == null) {
		return;
	}

	const body = match[1];

	if (body == null) {
		return;
	}

	const values = body.split(",");

	if (values.length < 3 || values.length > 4 || values.some((value) => value.trim().length === 0)) {
		return;
	}

	return values;
};

const parseHexChannel = (value: string, index: number, width: 1 | 2): number => {
	const token = value.slice(index * width, index * width + width);
	const channel = width === 1
		? `${token}${token}`
		: token;

	return Number.parseInt(channel, 16);
};

// eslint-disable-next-line max-lines-per-function
const toColor: (color: string | Color) => Color | undefined = (color) => {
	if (isObject(color)) {
		if ('r' in color) {
			return RgbColor.make({
				r: Math.round(color.r),

				g: Math.round(color.g),

				b: Math.round(color.b),

				a: color.a ?? 1,
			});
		}

		if ('l' in color) {
			return HslColor.make({
				h: Math.round(color.h),

				s: color.s,

				l: color.l,

				a: color.a ?? 1,
			});
		}

		return HsvColor.make({
			h: Math.round(color.h),

			s: color.s,

			v: color.v,

			a: color.a ?? 1,
		});
	}

	const parsedColor = color.trim().toLowerCase();

	if (COLORS[parsedColor]) {
		const colorArray = COLORS[parsedColor];
		return RgbColor.make({
			r: Math.round(colorArray[0]),

			g: Math.round(colorArray[1]),

			b: Math.round(colorArray[2]),

			a: colorArray[3] ?? 1,
		});
	}

	if (parsedColor.startsWith('#')) {
		return hexToColor(parsedColor);
	}

	if (parsedColor.startsWith('rgb')) {
		return rgbToColor(parsedColor);
	}

	if (parsedColor.startsWith('hsl')) {
		return hslToColor(parsedColor);
	}

	if (parsedColor.startsWith('hsv')) {
		return hsvToColor(parsedColor);
	}
};

const hexToColor: (color: string) => Color | undefined = (color) => {
	if (!HexColorPattern.test(color)) {
		return;
	}

	const parsedColor = color.substring(1);

	const channelWidth = parsedColor.length <= 4
		? 1
		: 2;

	return RgbColor.make({
		r: parseHexChannel(parsedColor, 0, channelWidth),

		g: parseHexChannel(parsedColor, 1, channelWidth),

		b: parseHexChannel(parsedColor, 2, channelWidth),

		a: parsedColor.length === 4 || parsedColor.length === 8
			? parseHexChannel(parsedColor, 3, channelWidth) / 255
			: 1,
	});
};

const rgbToColor: (color: string) => Color | undefined = (color) => {
	const values = parseColorFunctionValues(color, /^rgba?\((.*)\)$/);

	if (values == null) {
		return;
	}

	const r = parseNumberToken(values[0]);

	const g = parseNumberToken(values[1]);

	const b = parseNumberToken(values[2]);

	const a = values.length > 3
		? parseNumberToken(values[3])
		: 1;

	if (r == null || g == null || b == null || a == null) {
		return;
	}

	return RgbColor.make({
		r,

		g,

		b,

		a,
	});
};

const hslToColor: (color: string) => Color | undefined = (color) => {
	const values = parseColorFunctionValues(color, /^hsla?\((.*)\)$/);

	if (values == null) {
		return;
	}

	const h = parseNumberToken(values[0]);

	const s = parsePercentNumberToken(values[1]);

	const l = parsePercentNumberToken(values[2]);

	const a = values.length > 3
		? parseNumberToken(values[3])
		: 1;

	if (h == null || s == null || l == null || a == null) {
		return;
	}

	return HslColor.make({
		h,

		s,

		l,

		a,
	});
};

const hsvToColor: (color: string) => Color | undefined = (color) => {
	const values = parseColorFunctionValues(color, /^hsva?\((.*)\)$/);

	if (values == null) {
		return;
	}

	const h = parseNumberToken(values[0]);

	const s = parsePercentNumberToken(values[1]);

	const v = parsePercentNumberToken(values[2]);

	const a = values.length > 3
		? parseNumberToken(values[3])
		: 1;

	if (h == null || s == null || v == null || a == null) {
		return;
	}

	return HsvColor.make({
		h,

		s,

		v,

		a,
	});
};

const toRgbColor: (color: string | Color) => RgbColor | undefined = (color) => {
	const obj = toColor(color);

	if (obj == null) {
		return;
	}

	if ('r' in obj) {
		return obj;
	}

	if ('l' in obj) {
		return hsl2Rgb(obj);
	}

	return hsv2Rgb(obj);
};

const hue2Rgb = (p: number, q: number, t: number) => {
	if (t < 0) t += 1;

	if (t > 1) t -= 1;

	if (t < 1 / 6) return p + (q - p) * 6 * t;

	if (t < 1 / 2) return q;

	if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;

	return p;
};

const hsl2Rgb: (color: HslColor) => RgbColor = (color) => {
	let {
		h,
		s,
		l,
	} = color;

	h /= 360;

	s /= 100;

	l /= 100;

	let r = 0;

	let g = 0;

	let b = 0;

	if (s === 0) {
		r = g = b = l; // achromatic
	} else {
		const q = l < 0.5
			? l * (1 + s)
			: l + s - l * s;

		const p = 2 * l - q;

		r = hue2Rgb(p, q, h + 1 / 3);

		g = hue2Rgb(p, q, h);

		b = hue2Rgb(p, q, h - 1 / 3);
	}

	return RgbColor.make({
		r: Math.round(r * 255),

		g: Math.round(g * 255),

		b: Math.round(b * 255),

		a: color.a ?? 1,
	});
};

const hsv2Rgb: (color: HsvColor) => RgbColor = (color) => {
	let {
		h,
		s,
		v,
	} = color;

	h = (h / 360) * 6;

	s /= 100;

	v /= 100;

	const i = Math.floor(h);

	const f = h - i;

	const p = v * (1 - s);

	const q = v * (1 - f * s);

	const t = v * (1 - (1 - f) * s);

	const mod = i % 6;

	const r = [
		v,
		q,
		p,
		p,
		t,
		v,
	][mod];

	const g = [
		t,
		v,
		v,
		q,
		p,
		p,
	][mod];

	const b = [
		p,
		p,
		t,
		v,
		v,
		q,
	][mod];

	return RgbColor.make({
		r: r * 255,

		g: g * 255,

		b: b * 255,

		a: color.a ?? 1,
	});
};

const rgb2Hsl: (color: RgbColor) => HslColor = (color) => {
	let {
		r,
		g,
		b,
	} = color;

	r /= 255;

	g /= 255;

	b /= 255;

	const max = Math.max(r, g, b);

	const min = Math.min(r, g, b);

	const l = (max + min) / 2;

	let h: number;

	let s: number;

	if (max === min) {
		h = s = 0;
	} else {
		const d = max - min;

		s = l > 0.5
			? d / (2 - max - min)
			: d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b
					? 6
					: 0);

				break;

			case g:
				h = (b - r) / d + 2;

				break;

			default:
				h = (r - g) / d + 4;

				break;
		}

		h /= 6;
	}

	return HslColor.make({
		h: Math.round(h * 360),

		s: Math.round(s * 100),

		l: Math.round(l * 100),

		a: color.a ?? 1,
	});
};

const rgb2Hsv: (color: RgbColor) => HsvColor = (color) => {
	let {
		r,
		g,
		b,
	} = color;

	r /= 255;

	g /= 255;

	b /= 255;

	const max = Math.max(r, g, b);

	const min = Math.min(r, g, b);

	let h;

	const v = max;

	const d = max - min;

	const s = max === 0
		? 0
		: d / max;

	if (max === min) {
		h = 0; // achromatic
	} else {
		switch (max) {
			case r:
				h = (g - b) / d + (g < b
					? 6
					: 0);

				break;

			case g:
				h = (b - r) / d + 2;

				break;

			default:
				h = (r - g) / d + 4;

				break;
		}

		h /= 6;
	}

	return HsvColor.make({
		h: Math.round(h * 360),

		s: Math.round(s * 100),

		v: Math.round(v * 100),

		a: color.a ?? 1,
	});
};

const isUndefinedOrNull = (value: unknown): value is null | undefined => value == null;

const isObject = (value: unknown): value is object => !isUndefinedOrNull(value) && typeof value === 'object';

export function isBlackColor(color: string): boolean {
	// Regular expressions match different color formats.
	const hexRegex = /^#(?:0{3}|0{6})\b/;
	const rgbRegex = /^rgb\s*\(\s*0+\s*,\s*0+\s*,\s*0+\s*\)$/;
	const rgbaRegex = /^rgba\s*\(\s*0+\s*,\s*0+\s*,\s*0+\s*,\s*(1|1\.0*|0?\.\d+)\)$/;
	const hslRegex = /^hsl\s*\(\s*0*\s*,\s*0%*\s*,\s*0%*\s*\)$/;
	const hslaRegex = /^hsla\s*\(\s*0*\s*,\s*0%*\s*,\s*0%*\s*,\s*(1|1\.0*|0?\.\d+)\)$/;

	if (hexRegex.test(color)) {
		return true;
	}
	if (rgbRegex.test(color)) {
		return true;
	}

	if (rgbaRegex.test(color)) {
		return true;
	}

	if (hslRegex.test(color)) {
		return true;
	}

	return hslaRegex.test(color);
}

export function isWhiteColor(color: string): boolean {
	// Regular expressions match different color formats.
	const hexRegex = /^#(?:[Ff]{3}|[Ff]{6})\b/;
	const rgbRegex = /^rgb\s*\(\s*255\s*,\s*255\s*,\s*255\s*\)$/;
	const rgbaRegex = /^rgba\s*\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(1|1\.0*|0?\.\d+)\)$/;
	const hslRegex = /^hsl\s*\(\s*0*\s*,\s*0%*\s*,\s*100%*\s*\)$/;
	const hslaRegex = /^hsla\s*\(\s*0*\s*,\s*0%*\s*,\s*100%*\s*,\s*(1|1\.0*|0?\.\d+)\)$/;

	if (hexRegex.test(color)) {
		return true;
	}

	if (rgbRegex.test(color)) {
		return true;
	}

	if (rgbaRegex.test(color)) {
		return true;
	}

	if (hslRegex.test(color)) {
		return true;
	}

	return hslaRegex.test(color);
}
