/**
 * Lexical constant schemas mirrored from the upstream Lexical source.
 *
 * @module @beep/editor/Domain/LexicalConstants
 * @since 0.0.0
 */
import { $EditorId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $EditorId.create("Domain/LexicalConstants");

const nonBreakingSpaceValue = "\u00A0" as const;
const zeroWidthSpaceValue = "\u200b" as const;
const rtlValue = "\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC" as const;
const ltrValue =
  "A-Za-z\u00C0-\u00D6\u00D8-\u00F6" +
  "\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C" +
  "\uFE00-\uFE6F\uFEFD-\uFFFF";
const rtlRegexValue = new RegExp(`^[^${ltrValue}]*[${rtlValue}]`);
const ltrRegexValue = new RegExp(`^[^${rtlValue}]*[${ltrValue}]`);

const textFormatTypeBase = LiteralKit([
  "bold",
  "underline",
  "strikethrough",
  "italic",
  "highlight",
  "code",
  "subscript",
  "superscript",
  "lowercase",
  "uppercase",
  "capitalize",
] as const);

const textDetailTypeBase = LiteralKit(["directionless", "unmergeable"] as const);

const textModeTypeBase = LiteralKit(["normal", "token", "segmented"] as const);

const elementFormatTypeBase = LiteralKit(["left", "start", "center", "right", "end", "justify", ""] as const);

const nonEmptyElementFormatTypeBase = LiteralKit(
  elementFormatTypeBase.pickOptions(["left", "start", "center", "right", "end", "justify"] as const)
);

const exactRTLRegex = S.makeFilter(
  (value: RegExp) => value.source === rtlRegexValue.source && value.flags === rtlRegexValue.flags,
  {
    identifier: $I.make("RTLRegexExact"),
    title: "RTL Regex Exact Match",
    description: "Ensures a RegExp matches Lexical's RTL detection pattern exactly.",
    message: "Expected the exact Lexical RTL regular expression.",
  }
);

const exactLTRRegex = S.makeFilter(
  (value: RegExp) => value.source === ltrRegexValue.source && value.flags === ltrRegexValue.flags,
  {
    identifier: $I.make("LTRRegexExact"),
    title: "LTR Regex Exact Match",
    description: "Ensures a RegExp matches Lexical's LTR detection pattern exactly.",
    message: "Expected the exact Lexical LTR regular expression.",
  }
);

//------------------------------------------------------------------------------
// Text and element literal domains
//------------------------------------------------------------------------------

export const TextFormatType = textFormatTypeBase.pipe(
  $I.annoteSchema("TextFormatType", {
    description: "Schema for Lexical text format names.",
  })
);

export type TextFormatType = typeof TextFormatType.Type;

export const TextDetailType = textDetailTypeBase.pipe(
  $I.annoteSchema("TextDetailType", {
    description: "Schema for Lexical text detail names.",
  })
);

export type TextDetailType = typeof TextDetailType.Type;

export const TextModeType = textModeTypeBase.pipe(
  $I.annoteSchema("TextModeType", {
    description: "Schema for Lexical text mode names.",
  }),

);

export type TextModeType = typeof TextModeType.Type;

export const ElementFormatType = elementFormatTypeBase.pipe(
  $I.annoteSchema("ElementFormatType", {
    description: "Schema for Lexical element format names.",
  }),

);

export type ElementFormatType = typeof ElementFormatType.Type;

const NonEmptyElementFormatType = nonEmptyElementFormatTypeBase.pipe(
  $I.annoteSchema("NonEmptyElementFormatType", {
    description: "Internal schema for non-empty Lexical element format names.",
  }),

);

//------------------------------------------------------------------------------
// DOM
//------------------------------------------------------------------------------

export const DOMElementType = S.Literal(1).pipe(
  $I.annoteSchema("DOMElementType", {
    description: "Schema for DOM element type.",
  })
);

export type DOMElementType = typeof DOMElementType.Type;

export const DOMTextType = S.Literal(3).pipe(
  $I.annoteSchema("DOMTextType", {
    description: "Schema for DOM text type.",
  })
);

export type DOMTextType = typeof DOMTextType.Type;

export const DOMDocumentType = S.Literal(9).pipe(
  $I.annoteSchema("DOMDocumentType", {
    description: "Schema for DOM document type.",
  })
);

export type DOMDocumentType = typeof DOMDocumentType.Type;

export const DOMDocumentFragmentType = S.Literal(11).pipe(
  $I.annoteSchema("DOMDocumentFragmentType", {
    description: "Schema for DOM document fragment type.",
  })
);

export type DOMDocumentFragmentType = typeof DOMDocumentFragmentType.Type;

//------------------------------------------------------------------------------
// Reconciling
//------------------------------------------------------------------------------

export const NoDirtyNodes = S.Literal(0).pipe(
  $I.annoteSchema("NoDirtyNodes", {
    description: "Schema for the Lexical no-dirty-nodes flag.",
  })
);

export type NoDirtyNodes = typeof NoDirtyNodes.Type;

export const HasDirtyNodes = S.Literal(1).pipe(
  $I.annoteSchema("HasDirtyNodes", {
    description: "Schema for the Lexical has-dirty-nodes flag.",
  })
);

export type HasDirtyNodes = typeof HasDirtyNodes.Type;

export const FullReconcile = S.Literal(2).pipe(
  $I.annoteSchema("FullReconcile", {
    description: "Schema for the Lexical full-reconcile flag.",
  })
);

export type FullReconcile = typeof FullReconcile.Type;

//------------------------------------------------------------------------------
// Text node modes
//------------------------------------------------------------------------------

export const IsNormal = S.Literal(0).pipe(
  $I.annoteSchema("IsNormal", {
    description: "Schema for the Lexical normal text-mode flag.",
  })
);

export type IsNormal = typeof IsNormal.Type;

export const IsToken = S.Literal(1).pipe(
  $I.annoteSchema("IsToken", {
    description: "Schema for the Lexical token text-mode flag.",
  })
);

export type IsToken = typeof IsToken.Type;

export const IsSegmented = S.Literal(2).pipe(
  $I.annoteSchema("IsSegmented", {
    description: "Schema for the Lexical segmented text-mode flag.",
  })
);

export type IsSegmented = typeof IsSegmented.Type;

//------------------------------------------------------------------------------
// Text node formatting
//------------------------------------------------------------------------------

export const IsBold = S.Literal(1).pipe(
  $I.annoteSchema("IsBold", {
    description: "Schema for the Lexical bold formatting flag.",
  })
);

export type IsBold = typeof IsBold.Type;

export const IsItalic = S.Literal(1 << 1).pipe(
  $I.annoteSchema("IsItalic", {
    description: "Schema for the Lexical italic formatting flag.",
  })
);

export type IsItalic = typeof IsItalic.Type;

export const IsStrikethrough = S.Literal(1 << 2).pipe(
  $I.annoteSchema("IsStrikethrough", {
    description: "Schema for the Lexical strikethrough formatting flag.",
  })
);

export type IsStrikethrough = typeof IsStrikethrough.Type;

export const IsUnderline = S.Literal(1 << 3).pipe(
  $I.annoteSchema("IsUnderline", {
    description: "Schema for the Lexical underline formatting flag.",
  })
);

export type IsUnderline = typeof IsUnderline.Type;

export const IsCode = S.Literal(1 << 4).pipe(
  $I.annoteSchema("IsCode", {
    description: "Schema for the Lexical code formatting flag.",
  })
);

export type IsCode = typeof IsCode.Type;

export const IsSubscript = S.Literal(1 << 5).pipe(
  $I.annoteSchema("IsSubscript", {
    description: "Schema for the Lexical subscript formatting flag.",
  })
);

export type IsSubscript = typeof IsSubscript.Type;

export const IsSuperscript = S.Literal(1 << 6).pipe(
  $I.annoteSchema("IsSuperscript", {
    description: "Schema for the Lexical superscript formatting flag.",
  })
);

export type IsSuperscript = typeof IsSuperscript.Type;

export const IsHighlight = S.Literal(1 << 7).pipe(
  $I.annoteSchema("IsHighlight", {
    description: "Schema for the Lexical highlight formatting flag.",
  })
);

export type IsHighlight = typeof IsHighlight.Type;

export const IsLowercase = S.Literal(1 << 8).pipe(
  $I.annoteSchema("IsLowercase", {
    description: "Schema for the Lexical lowercase formatting flag.",
  })
);

export type IsLowercase = typeof IsLowercase.Type;

export const IsUppercase = S.Literal(1 << 9).pipe(
  $I.annoteSchema("IsUppercase", {
    description: "Schema for the Lexical uppercase formatting flag.",
  })
);

export type IsUppercase = typeof IsUppercase.Type;

export const IsCapitalize = S.Literal(1 << 10).pipe(
  $I.annoteSchema("IsCapitalize", {
    description: "Schema for the Lexical capitalize formatting flag.",
  })
);

export type IsCapitalize = typeof IsCapitalize.Type;

export const IsAllFormatting = S.Literal((1 << 11) - 1).pipe(
  $I.annoteSchema("IsAllFormatting", {
    description: "Schema for the Lexical all-formatting bitmask.",
  })
);

export type IsAllFormatting = typeof IsAllFormatting.Type;

//------------------------------------------------------------------------------
// Text node details
//------------------------------------------------------------------------------

export const IsDirectionless = S.Literal(1).pipe(
  $I.annoteSchema("IsDirectionless", {
    description: "Schema for the Lexical directionless detail flag.",
  })
);

export type IsDirectionless = typeof IsDirectionless.Type;

export const IsUnmergeable = S.Literal(1 << 1).pipe(
  $I.annoteSchema("IsUnmergeable", {
    description: "Schema for the Lexical unmergeable detail flag.",
  })
);

export type IsUnmergeable = typeof IsUnmergeable.Type;

//------------------------------------------------------------------------------
// Element node formatting
//------------------------------------------------------------------------------

export const IsAlignLeft = S.Literal(1).pipe(
  $I.annoteSchema("IsAlignLeft", {
    description: "Schema for the Lexical left alignment flag.",
  })
);

export type IsAlignLeft = typeof IsAlignLeft.Type;

export const IsAlignCenter = S.Literal(2).pipe(
  $I.annoteSchema("IsAlignCenter", {
    description: "Schema for the Lexical center alignment flag.",
  })
);

export type IsAlignCenter = typeof IsAlignCenter.Type;

export const IsAlignRight = S.Literal(3).pipe(
  $I.annoteSchema("IsAlignRight", {
    description: "Schema for the Lexical right alignment flag.",
  })
);

export type IsAlignRight = typeof IsAlignRight.Type;

export const IsAlignJustify = S.Literal(4).pipe(
  $I.annoteSchema("IsAlignJustify", {
    description: "Schema for the Lexical justify alignment flag.",
  })
);

export type IsAlignJustify = typeof IsAlignJustify.Type;

export const IsAlignStart = S.Literal(5).pipe(
  $I.annoteSchema("IsAlignStart", {
    description: "Schema for the Lexical start alignment flag.",
  })
);

export type IsAlignStart = typeof IsAlignStart.Type;

export const IsAlignEnd = S.Literal(6).pipe(
  $I.annoteSchema("IsAlignEnd", {
    description: "Schema for the Lexical end alignment flag.",
  })
);

export type IsAlignEnd = typeof IsAlignEnd.Type;

//------------------------------------------------------------------------------
// Reconciliation strings and regexes
//------------------------------------------------------------------------------

export const NonBreakingSpace = S.Literal(nonBreakingSpaceValue).pipe(
  $I.annoteSchema("NonBreakingSpace", {
    description: "Schema for Lexical's non-breaking space constant.",
  })
);

export type NonBreakingSpace = typeof NonBreakingSpace.Type;

const ZeroWidthSpace = S.Literal(zeroWidthSpaceValue).pipe(
  $I.annoteSchema("ZeroWidthSpace", {
    description: "Internal schema for Lexical's zero-width space constant.",
  })
);

export const DoubleLineBreak = S.Literal("\n\n").pipe(
  $I.annoteSchema("DoubleLineBreak", {
    description: "Schema for Lexical's double line-break constant.",
  })
);

export type DoubleLineBreak = typeof DoubleLineBreak.Type;

const CompositionCharacter = S.Union([NonBreakingSpace, ZeroWidthSpace]).pipe(
  $I.annoteSchema("CompositionCharacter", {
    description: "Internal schema for Lexical composition helper characters.",
  })
);

export const CompositionSuffix = CompositionCharacter.pipe(
  $I.annoteSchema("CompositionSuffix", {
    description: "Schema for the possible Lexical composition suffix characters.",
  })
);

export type CompositionSuffix = typeof CompositionSuffix.Type;

export const CompositionStartChar = CompositionCharacter.pipe(
  $I.annoteSchema("CompositionStartChar", {
    description: "Schema for the possible Lexical composition start characters.",
  })
);

export type CompositionStartChar = typeof CompositionStartChar.Type;

const RTL = S.Literal(rtlValue).pipe(
  $I.annoteSchema("RTL", {
    description: "Internal schema for Lexical's RTL character range literal.",
  })
);

const LTR = S.Literal(ltrValue).pipe(
  $I.annoteSchema("LTR", {
    description: "Internal schema for Lexical's LTR character range literal.",
  })
);

export const RTLRegex = S.RegExp.check(exactRTLRegex).pipe(
  $I.annoteSchema("RTLRegex", {
    description: "Schema for Lexical's RTL detection regular expression.",
  })
);

export type RTLRegex = typeof RTLRegex.Type;

export const LTRRegex = S.RegExp.check(exactLTRRegex).pipe(
  $I.annoteSchema("LTRRegex", {
    description: "Schema for Lexical's LTR detection regular expression.",
  })
);

export type LTRRegex = typeof LTRRegex.Type;

//------------------------------------------------------------------------------
// Lookup tables
//------------------------------------------------------------------------------

export const TextTypeToFormat = S.Struct({
  bold: IsBold,
  capitalize: IsCapitalize,
  code: IsCode,
  highlight: IsHighlight,
  italic: IsItalic,
  lowercase: IsLowercase,
  strikethrough: IsStrikethrough,
  subscript: IsSubscript,
  superscript: IsSuperscript,
  underline: IsUnderline,
  uppercase: IsUppercase,
}).pipe(
  $I.annoteSchema("TextTypeToFormat", {
    description: "Schema for the Lexical text-format lookup table.",
  })
);

export type TextTypeToFormat = typeof TextTypeToFormat.Type;

export const DetailTypeToDetail = S.Struct({
  directionless: IsDirectionless,
  unmergeable: IsUnmergeable,
}).pipe(
  $I.annoteSchema("DetailTypeToDetail", {
    description: "Schema for the Lexical text-detail lookup table.",
  })
);

export type DetailTypeToDetail = typeof DetailTypeToDetail.Type;

export const ElementTypeToFormat = S.Struct({
  center: IsAlignCenter,
  end: IsAlignEnd,
  justify: IsAlignJustify,
  left: IsAlignLeft,
  right: IsAlignRight,
  start: IsAlignStart,
}).pipe(
  $I.annoteSchema("ElementTypeToFormat", {
    description: "Schema for the Lexical element-format lookup table.",
  })
);

export type ElementTypeToFormat = typeof ElementTypeToFormat.Type;

export const ElementFormatToType = S.Struct({
  1: S.Literal(nonEmptyElementFormatTypeBase.Enum.left),
  2: S.Literal(nonEmptyElementFormatTypeBase.Enum.center),
  3: S.Literal(nonEmptyElementFormatTypeBase.Enum.right),
  4: S.Literal(nonEmptyElementFormatTypeBase.Enum.justify),
  5: S.Literal(nonEmptyElementFormatTypeBase.Enum.start),
  6: S.Literal(nonEmptyElementFormatTypeBase.Enum.end),
}).pipe(
  $I.annoteSchema("ElementFormatToType", {
    description: "Schema for the Lexical reverse element-format lookup table.",
  })
);

export type ElementFormatToType = typeof ElementFormatToType.Type;

export const TextModeToType = S.Struct({
  normal: IsNormal,
  segmented: IsSegmented,
  token: IsToken,
}).pipe(
  $I.annoteSchema("TextModeToType", {
    description: "Schema for the Lexical text-mode lookup table.",
  })
);

export type TextModeToType = typeof TextModeToType.Type;

export const TextTypeToMode = S.Struct({
  0: S.Literal(textModeTypeBase.Enum.normal),
  1: S.Literal(textModeTypeBase.Enum.token),
  2: S.Literal(textModeTypeBase.Enum.segmented),
}).pipe(
  $I.annoteSchema("TextTypeToMode", {
    description: "Schema for the Lexical reverse text-mode lookup table.",
  })
);

export type TextTypeToMode = typeof TextTypeToMode.Type;

//------------------------------------------------------------------------------
// Misc
//------------------------------------------------------------------------------

export const NodeStateKey = S.Literal("$").pipe(
  $I.annoteSchema("NodeStateKey", {
    description: "Schema for Lexical's node state key.",
  })
);

export type NodeStateKey = typeof NodeStateKey.Type;

export const PrototypeConfigMethod = S.Literal("$config").pipe(
  $I.annoteSchema("PrototypeConfigMethod", {
    description: "Schema for Lexical's prototype config method name.",
  })
);

export type PrototypeConfigMethod = typeof PrototypeConfigMethod.Type;

void NonEmptyElementFormatType;
void RTL;
void LTR;
