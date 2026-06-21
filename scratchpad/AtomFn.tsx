import {LiteralKit} from "@beep/schema";
import {$ScratchpadId} from "@beep/identity";
import * as S from "effect/Schema";
import {P, A} from "@beep/utils";

const $I = $ScratchpadId.create("example");

const TextDetailType = LiteralKit(
	[
		"directionless",
		"unmergable"
	]
).pipe(
	$I.annoteSchema("TextDetailType", {
		description: "The type of text detail."
	})
)

export type TextDetailType = typeof TextDetailType.Type;

export const TextModeType = LiteralKit(
	[
		'normal',
		'token',
		'segmented'
	]
).pipe($I.annoteSchema("TextModeType", {
	description: "The type of text mode."
}))

export type TextModeType = typeof TextModeType.Type;

export const TextFormatType = LiteralKit(
	[
		'bold',
		'underline',
		'strikethrough',
		'italic',
		'highlight',
		'code',
		'subscript',
		'superscript',
		'lowercase',
		'uppercase',
		'capitalize',
	]
).pipe(
	$I.annoteSchema("TextFormatType", {
		description: "The type of text format."
	})
);

export type TextFormatType = typeof TextFormatType.Type;

export const ElementFormatType = LiteralKit([
	'left',
	'start',
	'center',
	'right',
	'end',
	'justify',
	'',
]).pipe(
	$I.annoteSchema("ElementFormatType", {
		description: "The type of element format."
	})
);

export type ElementFormatType = typeof ElementFormatType.Type;

export const CAN_USE_DOM: boolean = typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined';

declare global {
	interface Document {
		documentMode?: unknown;
	}

	interface Window {
		MSStream?: unknown;
	}
}

const documentMode = CAN_USE_DOM && 'documentMode' in document
	? document.documentMode
	: null;

export const IS_APPLE: boolean = CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const IS_FIREFOX: boolean = CAN_USE_DOM && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

export const CAN_USE_BEFORE_INPUT: boolean = CAN_USE_DOM && 'InputEvent' in window && !P.isTruthy(documentMode)
	? 'getTargetRanges' in new window.InputEvent('input')
	: false;

export const IS_IOS: boolean = CAN_USE_DOM && /iPad|iPhone|iPod/.test(navigator.userAgent) && !P.isTruthy(window.MSStream);

export const IS_ANDROID: boolean = CAN_USE_DOM && /Android/.test(navigator.userAgent);

// Exclude Android — Android WebView's UA contains "Version/X.X ... Safari/537.36"
// which falsely matches the Safari regex, activating wrong composition code paths.
export const IS_SAFARI: boolean = CAN_USE_DOM && /Version\/[\d.]+.*Safari/.test(navigator.userAgent) && !IS_ANDROID;

// Keep these in case we need to use them in the future.
// export const IS_WINDOWS: boolean = CAN_USE_DOM && /Win/.test(navigator.platform);
export const IS_CHROME: boolean = CAN_USE_DOM && /^(?=.*Chrome).*/i.test(navigator.userAgent);
// export const canUseTextInputEvent: boolean = CAN_USE_DOM && 'TextEvent' in window && !documentMode;

export const IS_ANDROID_CHROME: boolean = CAN_USE_DOM && IS_ANDROID && IS_CHROME;

export const IS_APPLE_WEBKIT = CAN_USE_DOM && /AppleWebKit\/[\d.]+/.test(navigator.userAgent) && IS_APPLE && !IS_CHROME;

// DOM
export const DOM_ELEMENT_TYPE = 1 as const;
export const DOM_TEXT_TYPE = 3 as const;
export const DOM_DOCUMENT_TYPE = 9 as const;
export const DOM_DOCUMENT_FRAGMENT_TYPE = 11 as const;

// Reconciling
export const NO_DIRTY_NODES = 0 as const;
export const HAS_DIRTY_NODES = 1 as const;
export const FULL_RECONCILE = 2 as const;

// Text node modes
export const IS_NORMAL = 0 as const;
export const IS_TOKEN = 1 as const;
export const IS_SEGMENTED = 2 as const;

// Text node formatting
export const IS_BOLD = 1 << 0;
export const IS_ITALIC = 1 << 1;
export const IS_STRIKETHROUGH = 1 << 2;
export const IS_UNDERLINE = 1 << 3;
export const IS_CODE = 1 << 4;
export const IS_SUBSCRIPT = 1 << 5;
export const IS_SUPERSCRIPT = 1 << 6;
export const IS_HIGHLIGHT = 1 << 7;
export const IS_LOWERCASE = 1 << 8;
export const IS_UPPERCASE = 1 << 9;
export const IS_CAPITALIZE = 1 << 10;

export const TEXT_FORMAT_BITS = [
	IS_BOLD,
	IS_ITALIC,
	IS_STRIKETHROUGH,
	IS_UNDERLINE,
	IS_CODE,
	IS_SUBSCRIPT,
	IS_SUPERSCRIPT,
	IS_HIGHLIGHT,
	IS_LOWERCASE,
	IS_UPPERCASE,
	IS_CAPITALIZE,
] as const;

export const IS_ALL_FORMATTING = A.reduce(TEXT_FORMAT_BITS, 0, (mask, bit) => mask | bit);

const hasOnlyKnownTextFormatBits = (value: number) => (value & ~IS_ALL_FORMATTING) === 0;

export const TextFormatBit = S.Literals(TEXT_FORMAT_BITS).pipe(
	$I.annoteSchema("TextFormatBit", {
		description: "A single text-format bit flag."
	})
);

export type TextFormatBit = typeof TextFormatBit.Type;

export const TextFormatMask = S.Int.check(
	S.makeFilterGroup(
		[
			S.isGreaterThanOrEqualTo(0, {
				identifier: $I`TextFormatMaskNonNegativeCheck`,
				title: "Text Format Mask Minimum",
				description: "Text-format masks must be zero or greater.",
				message: "Expected a non-negative text-format mask.",
			}),
			S.makeFilter<number>(
				hasOnlyKnownTextFormatBits,
				{
					identifier: $I`TextFormatMaskKnownBitsCheck`,
					title: "Text Format Mask Known Bits",
					description: "Text-format masks may only contain known formatting bits.",
					message: "Expected a text-format mask containing only known formatting bits.",
				}
			),
		],
		{
			identifier: $I`TextFormatMaskChecks`,
			title: "Text Format Mask",
			description: "Checks that a numeric text-format mask is non-negative and contains only known formatting bits.",
		}
	)
).pipe(
	S.brand("TextFormatMask"),
	$I.annoteSchema("TextFormatMask", {
		description: "A text-format bitmask containing zero or more known formatting bits."
	})
);

export type TextFormatMask = typeof TextFormatMask.Type;

export const hasTextFormatBits = (bits: number) => (value: TextFormatMask): boolean => (value & bits) === bits;
export const hasTextFormatBit = (bit: TextFormatBit) => hasTextFormatBits(bit);

type TextFormatSchemaName =
	| "BoldFormat"
	| "ItalicFormat"
	| "StrikethroughFormat"
	| "UnderlineFormat"
	| "CodeFormat"
	| "SubscriptFormat"
	| "SuperscriptFormat"
	| "HighlightFormat"
	| "LowercaseFormat"
	| "UppercaseFormat"
	| "CapitalizeFormat";

const makeTextFormatSchema = <const Name extends TextFormatSchemaName>(
	name: Name,
	bit: TextFormatBit,
	description: string
) => TextFormatMask.check(
	S.makeFilter<TextFormatMask>(
		hasTextFormatBit(bit),
		{
			identifier: `${name}BitCheck`,
			title: name,
			description,
			message: `Expected the ${description.toLowerCase()}`,
		}
	)
).pipe(
	S.brand(name),
	$I.annoteSchema(name as TextFormatSchemaName, {
		description,
	})
);

export const BoldFormat = makeTextFormatSchema("BoldFormat", IS_BOLD, "A text-format mask with the bold bit set.");
export type BoldFormat = typeof BoldFormat.Type;

export const ItalicFormat = makeTextFormatSchema("ItalicFormat", IS_ITALIC, "A text-format mask with the italic bit set.");
export type ItalicFormat = typeof ItalicFormat.Type;

export const StrikethroughFormat = makeTextFormatSchema("StrikethroughFormat", IS_STRIKETHROUGH, "A text-format mask with the strikethrough bit set.");
export type StrikethroughFormat = typeof StrikethroughFormat.Type;

export const UnderlineFormat = makeTextFormatSchema("UnderlineFormat", IS_UNDERLINE, "A text-format mask with the underline bit set.");
export type UnderlineFormat = typeof UnderlineFormat.Type;

export const CodeFormat = makeTextFormatSchema("CodeFormat", IS_CODE, "A text-format mask with the code bit set.");
export type CodeFormat = typeof CodeFormat.Type;

export const SubscriptFormat = makeTextFormatSchema("SubscriptFormat", IS_SUBSCRIPT, "A text-format mask with the subscript bit set.");
export type SubscriptFormat = typeof SubscriptFormat.Type;

export const SuperscriptFormat = makeTextFormatSchema("SuperscriptFormat", IS_SUPERSCRIPT, "A text-format mask with the superscript bit set.");
export type SuperscriptFormat = typeof SuperscriptFormat.Type;

export const HighlightFormat = makeTextFormatSchema("HighlightFormat", IS_HIGHLIGHT, "A text-format mask with the highlight bit set.");
export type HighlightFormat = typeof HighlightFormat.Type;

export const LowercaseFormat = makeTextFormatSchema("LowercaseFormat", IS_LOWERCASE, "A text-format mask with the lowercase bit set.");
export type LowercaseFormat = typeof LowercaseFormat.Type;

export const UppercaseFormat = makeTextFormatSchema("UppercaseFormat", IS_UPPERCASE, "A text-format mask with the uppercase bit set.");
export type UppercaseFormat = typeof UppercaseFormat.Type;

export const CapitalizeFormat = makeTextFormatSchema("CapitalizeFormat", IS_CAPITALIZE, "A text-format mask with the capitalize bit set.");
export type CapitalizeFormat = typeof CapitalizeFormat.Type;

export const AllFormat = TextFormatMask.check(
	S.makeFilter<TextFormatMask>(
		hasTextFormatBits(IS_ALL_FORMATTING),
		{
			identifier: $I`AllFormatBitsCheck`,
			title: "All Text Format Bits",
			description: "Checks that every known text-format bit is set.",
			message: "Expected every known text-format bit to be set.",
		}
	)
).pipe(
	S.brand("AllFormat"),
	$I.annoteSchema("AllFormat", {
		description: "A text-format mask with every known formatting bit set."
	})
);

export type AllFormat = typeof AllFormat.Type;
export const isAllFormat = S.is(AllFormat);

// Text node details
export const IS_DIRECTIONLESS = 1;
export const IS_UNMERGEABLE = 1 << 1;

// Element node formatting
export const IS_ALIGN_LEFT = 1;
export const IS_ALIGN_CENTER = 2;
export const IS_ALIGN_RIGHT = 3;
export const IS_ALIGN_JUSTIFY = 4;
export const IS_ALIGN_START = 5;
export const IS_ALIGN_END = 6;

// Reconciliation
export const NON_BREAKING_SPACE = '\u00A0';
const ZERO_WIDTH_SPACE = '\u200b';

// For iOS/Safari we use a non breaking space, otherwise the cursor appears
// overlapping the composed text.
export const COMPOSITION_SUFFIX: string = IS_SAFARI || IS_IOS || IS_APPLE_WEBKIT
	? NON_BREAKING_SPACE
	: ZERO_WIDTH_SPACE;
export const DOUBLE_LINE_BREAK = '\n\n';

// For FF, we need to use a non-breaking space, or it gets composition
// in a stuck state.
export const COMPOSITION_START_CHAR: string = IS_FIREFOX
	? NON_BREAKING_SPACE
	: COMPOSITION_SUFFIX;
const RTL = '\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC';
const LTR = 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6' + '\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C' + '\uFE00-\uFE6F\uFEFD-\uFFFF';

// eslint-disable-next-line no-misleading-character-class
export const RTL_REGEX = new RegExp('^[^' + LTR + ']*[' + RTL + ']');
// eslint-disable-next-line no-misleading-character-class
export const LTR_REGEX = new RegExp('^[^' + RTL + ']*[' + LTR + ']');


export const TEXT_TYPE_TO_FORMAT: Record<TextFormatType | string, number> = {
	bold: IS_BOLD,
	capitalize: IS_CAPITALIZE,
	code: IS_CODE,
	highlight: IS_HIGHLIGHT,
	italic: IS_ITALIC,
	lowercase: IS_LOWERCASE,
	strikethrough: IS_STRIKETHROUGH,
	subscript: IS_SUBSCRIPT,
	superscript: IS_SUPERSCRIPT,
	underline: IS_UNDERLINE,
	uppercase: IS_UPPERCASE,
};

export const DETAIL_TYPE_TO_DETAIL: Record<TextDetailType | string, number> = {
	directionless: IS_DIRECTIONLESS,
	unmergeable: IS_UNMERGEABLE,
};

export const ELEMENT_TYPE_TO_FORMAT: Record<Exclude<ElementFormatType, ''>, number> = {
	center: IS_ALIGN_CENTER,
	end: IS_ALIGN_END,
	justify: IS_ALIGN_JUSTIFY,
	left: IS_ALIGN_LEFT,
	right: IS_ALIGN_RIGHT,
	start: IS_ALIGN_START,
};

export const ELEMENT_FORMAT_TO_TYPE: Record<number, ElementFormatType> = {
	[IS_ALIGN_CENTER]: 'center',
	[IS_ALIGN_END]: 'end',
	[IS_ALIGN_JUSTIFY]: 'justify',
	[IS_ALIGN_LEFT]: 'left',
	[IS_ALIGN_RIGHT]: 'right',
	[IS_ALIGN_START]: 'start',
};

export const TEXT_MODE_TO_TYPE: Record<TextModeType, 0 | 1 | 2> = {
	normal: IS_NORMAL,
	segmented: IS_SEGMENTED,
	token: IS_TOKEN,
};

export const TEXT_TYPE_TO_MODE: Record<number, TextModeType> = {
	[IS_NORMAL]: 'normal',
	[IS_SEGMENTED]: 'segmented',
	[IS_TOKEN]: 'token',
};

export const NODE_STATE_KEY = '$';
export const PROTOTYPE_CONFIG_METHOD = '$config';
// DOM
export const DomElementType = S.Literal(DOM_ELEMENT_TYPE).pipe($I.annoteSchema("DomElementType", {
	description: "DOM element type",
}));
export type DomElementType = typeof DomElementType.Type;

export const TextType = LiteralKit([
	"bold",
	"capitalize",
	"code",
	"highlight",
	"italic",
	"lowercase",
	"strikethrough",
	"subscript",
	"superscript",
	"underline",
	"uppercase",
]).pipe($I.annoteSchema("TextType", {
	description: "Text formatting options",
}));
