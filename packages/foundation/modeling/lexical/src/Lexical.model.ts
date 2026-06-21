/**
 * Schema-first models of Lexical's serialized editor state.
 *
 * The node tree is modeled as a tagged union discriminated on Lexical's own
 * `type` key. House style: `S.Class` hierarchies via `.extend`, tags only on
 * concrete leaf classes, nullish wire values captured as `O.Option` at the
 * schema boundary, and hand-written `Type`/`Encoded` interfaces in merged
 * namespaces (required to break TS inference cycles through the recursive
 * `children`).
 *
 * The package has zero runtime `lexical` imports — `lexical` is a
 * devDependency for dtslint type-conformance tests only.
 *
 * @packageDocumentation \@beep/lexical-schema/Lexical.model
 * @since 0.0.0
 */

// cspell:word youtu
import { $LexicalSchemaId } from "@beep/identity/packages";
import * as Md from "@beep/md/Md.model";
import { LiteralKit, NonNegativeInt, PosInt } from "@beep/schema";
import { A, O, Str } from "@beep/utils";
import { Effect, SchemaGetter } from "effect";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import type { CodeFenceLanguage as MdCodeFenceLanguage } from "@beep/md/Md.model";
import type * as R from "effect/Record";

const $I = $LexicalSchemaId.create("Lexical.model");
type MdYouTubeVideoId = typeof Md.YouTubeVideoId.Type;

const artifactRefIdPattern = /^[A-Za-z0-9][A-Za-z0-9_.:-]*$/u;
const decodeCodeFenceLanguageOption = S.decodeUnknownOption(Md.CodeFenceLanguage);
const decodeYouTubeVideoId = S.decodeUnknownEffect(Md.YouTubeVideoId);

const firstPathSegment = (pathname: string): string => pathname.split("/").find(Str.isNonEmpty) ?? "";

const legacyYouTubeVideoId = (value: string): string => {
  const trimmed = Str.trim(value);

  if (S.is(Md.YouTubeVideoId)(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    const hostname = url.hostname.replace(/^www\./u, "");

    if (hostname === "youtu.be") {
      return firstPathSegment(url.pathname);
    }

    if (hostname === "youtube.com" || hostname.endsWith(".youtube.com")) {
      return url.searchParams.get("v") ?? firstPathSegment(url.pathname.replace(/^\/(?:embed|shorts)\//u, ""));
    }
  } catch {
    return trimmed;
  }

  return trimmed;
};

const CodeNodeLanguage = S.OptionFromOptionalNullOr(S.String).pipe(
  S.decodeTo(S.Option(Md.CodeFenceLanguage), {
    decode: SchemaGetter.transform((language) => O.flatMap(language, decodeCodeFenceLanguageOption)),
    encode: SchemaGetter.transform((language) => language),
  }),
  $I.annoteSchema("CodeNodeLanguage", {
    description:
      "Optional serialized Lexical code language; legacy non-conforming strings decode to None while valid languages remain branded.",
  })
);

const LexicalListStart = NonNegativeInt.pipe(
  S.decodeTo(PosInt, {
    decode: SchemaGetter.transform((value) => PosInt.make(value === 0 ? 1 : value)),
    encode: SchemaGetter.transform((value) => NonNegativeInt.make(value)),
  }),
  $I.annoteSchema("LexicalListStart", {
    description: "Positive Lexical list start with legacy zero values normalized to one during serialized JSON decode.",
  })
);

const LexicalListItemValue = PosInt.pipe(
  $I.annoteSchema("LexicalListItemValue", {
    description: "Positive Lexical list-item ordinal; zero values are rejected to preserve sibling ordering.",
  })
);

const YouTubeVideoIdFromLegacyInput = S.String.pipe(
  S.decodeTo(Md.YouTubeVideoId, {
    decode: SchemaGetter.transformOrFail((value) =>
      decodeYouTubeVideoId(legacyYouTubeVideoId(value)).pipe(Effect.mapError((error) => error.issue))
    ),
    encode: SchemaGetter.transform((value) => value),
  }),
  $I.annoteSchema("YouTubeVideoIdFromLegacyInput", {
    description:
      "Bare YouTube video id; legacy watch, embed, shorts, and youtu.be URLs decode to their canonical 11-character id.",
  })
);

/**
 * Serialized Lexical node version accepted by this package.
 *
 * @category models
 * @since 0.0.0
 */
export const LexicalNodeVersion = S.Literal(1).pipe(
  $I.annoteSchema("LexicalNodeVersion", {
    description: "Serialized Lexical node version currently written by built-in v1 nodes.",
  })
);

/**
 * Type for {@link LexicalNodeVersion}.
 *
 * @category models
 * @since 0.0.0
 */
export type LexicalNodeVersion = typeof LexicalNodeVersion.Type;

/**
 * Lexical TextFormatType flag values.
 *
 * @category models
 * @since 0.0.0
 */
export const TextFormatBits = {
  bold: 1,
  italic: 1 << 1,
  strikethrough: 1 << 2,
  underline: 1 << 3,
  code: 1 << 4,
  subscript: 1 << 5,
  superscript: 1 << 6,
  highlight: 1 << 7,
  lowercase: 1 << 8,
  uppercase: 1 << 9,
  capitalize: 1 << 10,
} as const;

/**
 * Reusable literal domain for individual Lexical text format bits.
 *
 * @category models
 * @since 0.0.0
 */
export const TextFormatBit = LiteralKit([
  TextFormatBits.bold,
  TextFormatBits.italic,
  TextFormatBits.strikethrough,
  TextFormatBits.underline,
  TextFormatBits.code,
  TextFormatBits.subscript,
  TextFormatBits.superscript,
  TextFormatBits.highlight,
  TextFormatBits.lowercase,
  TextFormatBits.uppercase,
  TextFormatBits.capitalize,
]).pipe(
  $I.annoteSchema("TextFormatBit", {
    description: "One Lexical TextFormatType bit value.",
  })
);

/**
 * Type for {@link TextFormatBit}.
 *
 * @category models
 * @since 0.0.0
 */
export type TextFormatBit = typeof TextFormatBit.Type;

/**
 * Bitwise union of every known Lexical text-format bit.
 *
 * @category constants
 * @since 0.0.0
 */
export const TEXT_FORMAT_MASK_ALL =
  TextFormatBits.bold |
  TextFormatBits.italic |
  TextFormatBits.strikethrough |
  TextFormatBits.underline |
  TextFormatBits.code |
  TextFormatBits.subscript |
  TextFormatBits.superscript |
  TextFormatBits.highlight |
  TextFormatBits.lowercase |
  TextFormatBits.uppercase |
  TextFormatBits.capitalize;

const TextFormatMaskBase = NonNegativeInt.check(
  S.isLessThanOrEqualTo(TEXT_FORMAT_MASK_ALL, {
    identifier: $I`TextFormatMaskKnownBitsCheck`,
    title: "Text Format Mask",
    description: "A Lexical text format bitmask containing only known TextFormatType bits.",
    message: "Text format mask must contain only known Lexical TextFormatType bits.",
  })
).pipe(
  S.brand("TextFormatMask"),
  $I.annoteSchema("TextFormatMask", {
    description: "Non-negative Lexical TextFormatType bitmask containing only known formatting bits.",
  })
);

/**
 * Branded Lexical TextFormatType bitmask.
 *
 * @category models
 * @since 0.0.0
 */
export const TextFormatMask = TextFormatMaskBase;

/**
 * Type for {@link TextFormatMask}.
 *
 * @category models
 * @since 0.0.0
 */
export type TextFormatMask = typeof TextFormatMask.Type;

/**
 * Returns whether a Lexical text-format mask contains a specific flag.
 *
 * @category predicates
 * @since 0.0.0
 */
export const hasTextFormat: {
  (bit: TextFormatBit): (format: TextFormatMask) => boolean;
  (format: TextFormatMask, bit: TextFormatBit): boolean;
} = dual(2, (format: TextFormatMask, bit: TextFormatBit): boolean => (format & bit) === bit);

/**
 * Adds a Lexical text-format bit and rebrands the resulting valid mask.
 *
 * @category constructors
 * @since 0.0.0
 */
export const withTextFormat: {
  (bit: TextFormatBit): (format: TextFormatMask) => TextFormatMask;
  (format: TextFormatMask, bit: TextFormatBit): TextFormatMask;
} = dual(2, (format: TextFormatMask, bit: TextFormatBit): TextFormatMask => TextFormatMask.make(format | bit));

/**
 * Lexical TextDetailType flag values.
 *
 * @category models
 * @since 0.0.0
 */
export const TextDetailBits = {
  directionless: 1,
  unmergeable: 1 << 1,
} as const;

/**
 * Reusable literal domain for individual Lexical text detail bits.
 *
 * @category models
 * @since 0.0.0
 */
export const TextDetailBit = LiteralKit([TextDetailBits.directionless, TextDetailBits.unmergeable]).pipe(
  $I.annoteSchema("TextDetailBit", {
    description: "One Lexical TextDetailType bit value.",
  })
);

/**
 * Type for {@link TextDetailBit}.
 *
 * @category models
 * @since 0.0.0
 */
export type TextDetailBit = typeof TextDetailBit.Type;

/**
 * Bitwise union of every known Lexical text-detail bit.
 *
 * @category constants
 * @since 0.0.0
 */
export const TEXT_DETAIL_MASK_ALL = TextDetailBits.directionless | TextDetailBits.unmergeable;

const TextDetailMaskBase = NonNegativeInt.check(
  S.isLessThanOrEqualTo(TEXT_DETAIL_MASK_ALL, {
    identifier: $I`TextDetailMaskKnownBitsCheck`,
    title: "Text Detail Mask",
    description: "A Lexical text detail bitmask containing only known TextDetailType bits.",
    message: "Text detail mask must contain only known Lexical TextDetailType bits.",
  })
).pipe(
  S.brand("TextDetailMask"),
  $I.annoteSchema("TextDetailMask", {
    description: "Non-negative Lexical TextDetailType bitmask containing only known detail bits.",
  })
);

/**
 * Branded Lexical TextDetailType bitmask.
 *
 * @category models
 * @since 0.0.0
 */
export const TextDetailMask = TextDetailMaskBase;

/**
 * Type for {@link TextDetailMask}.
 *
 * @category models
 * @since 0.0.0
 */
export type TextDetailMask = typeof TextDetailMask.Type;

/**
 * Non-negative Lexical indentation depth.
 *
 * @category models
 * @since 0.0.0
 */
export const LexicalIndentDepth = NonNegativeInt.pipe(
  S.brand("LexicalIndentDepth"),
  $I.annoteSchema("LexicalIndentDepth", {
    description: "Non-negative Lexical indentation depth.",
  })
);

/**
 * Type for {@link LexicalIndentDepth}.
 *
 * @category models
 * @since 0.0.0
 */
export type LexicalIndentDepth = typeof LexicalIndentDepth.Type;

/**
 * Lexical table cell header-state bitmask.
 *
 * @category models
 * @since 0.0.0
 */
export const TableCellHeaderState = LiteralKit([0, 1, 2, 3]).pipe(
  $I.annoteSchema("TableCellHeaderState", {
    description: "Lexical table cell header-state bitmask: 0 none, 1 row, 2 column, 3 both.",
  })
);

/**
 * Type for {@link TableCellHeaderState}.
 *
 * @category models
 * @since 0.0.0
 */
export type TableCellHeaderState = typeof TableCellHeaderState.Type;

/**
 * Positive span count for merged Lexical table cells.
 *
 * @category models
 * @since 0.0.0
 */
export const TableCellSpan = PosInt.pipe(
  S.brand("TableCellSpan"),
  $I.annoteSchema("TableCellSpan", {
    description: "Positive row or column span for a Lexical table cell.",
  })
);

/**
 * Type for {@link TableCellSpan}.
 *
 * @category models
 * @since 0.0.0
 */
export type TableCellSpan = typeof TableCellSpan.Type;

/**
 * Non-negative pixel-like table dimension emitted by Lexical table nodes.
 *
 * @category models
 * @since 0.0.0
 */
export const TableDimension = NonNegativeInt.pipe(
  S.brand("TableDimension"),
  $I.annoteSchema("TableDimension", {
    description: "Non-negative table dimension emitted by Lexical table nodes.",
  })
);

/**
 * Type for {@link TableDimension}.
 *
 * @category models
 * @since 0.0.0
 */
export type TableDimension = typeof TableDimension.Type;

/**
 * Package-owned artifact reference id used by `artifact-ref` decorator nodes.
 *
 * @category models
 * @since 0.0.0
 */
export const ArtifactRefId = S.NonEmptyString.check(
  S.isPattern(artifactRefIdPattern, {
    identifier: $I`ArtifactRefIdPatternCheck`,
    title: "Artifact Reference ID",
    description: "An artifact id that can be embedded in the artifact:// Markdown projection.",
    message:
      "Artifact reference id must start with an alphanumeric character and contain only alphanumerics, _, ., :, or -.",
  })
).pipe(
  $I.annoteSchema("ArtifactRefId", {
    description: "Non-empty artifact reference id accepted by package-owned Lexical artifact-ref nodes.",
  })
);

/**
 * Type for {@link ArtifactRefId}.
 *
 * @category models
 * @since 0.0.0
 */
export type ArtifactRefId = typeof ArtifactRefId.Type;

/**
 * `ElementFormatType` from lexical.
 *
 * @example
 * ```ts
 * import { ElementFormat } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ElementFormat.is.center("center")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ElementFormat = LiteralKit(["left", "start", "center", "right", "end", "justify", ""]).pipe(
  $I.annoteSchema("ElementFormat", {
    description:
      "Lexical element alignment token used by block-level nodes; the empty string preserves Lexical's default alignment sentinel.",
  })
);

/**
 * Type for {@link ElementFormat}.
 *
 * @example
 * ```ts
 * import type { ElementFormat } from "@beep/lexical-schema/Lexical.model"
 *
 * const accept = (format: ElementFormat) => format
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ElementFormat = typeof ElementFormat.Type;

/**
 * Text direction token from lexical.
 *
 * @example
 * ```ts
 * import { Direction } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(Direction.is.ltr("ltr")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Direction = LiteralKit(["ltr", "rtl"]).pipe(
  $I.annoteSchema("Direction", {
    description: "Lexical text direction token for left-to-right and right-to-left element layout.",
  })
);

/**
 * Type for {@link Direction}.
 *
 * @example
 * ```ts
 * import type { Direction } from "@beep/lexical-schema/Lexical.model"
 *
 * const accept = (direction: Direction) => direction
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Direction = typeof Direction.Type;

/**
 * `TextModeType` from lexical.
 *
 * @example
 * ```ts
 * import { TextMode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(TextMode.is.normal("normal")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const TextMode = LiteralKit(["normal", "token", "segmented"]).pipe(
  $I.annoteSchema("TextMode", {
    description: "Lexical text node editability mode: normal text, indivisible token text, or segmented text.",
  })
);

/**
 * Type for {@link TextMode}.
 *
 * @example
 * ```ts
 * import type { TextMode } from "@beep/lexical-schema/Lexical.model"
 *
 * const accept = (mode: TextMode) => mode
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TextMode = typeof TextMode.Type;

/**
 * `HeadingTagType` from `@lexical/rich-text`.
 *
 * @example
 * ```ts
 * import { HeadingTag } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(HeadingTag.is.h1("h1")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const HeadingTag = LiteralKit(["h1", "h2", "h3", "h4", "h5", "h6"]).pipe(
  $I.annoteSchema("HeadingTag", {
    description: "Heading level tag for Lexical heading nodes.",
  })
);

/**
 * Type for {@link HeadingTag}.
 *
 * @example
 * ```ts
 * import type { HeadingTag } from "@beep/lexical-schema/Lexical.model"
 *
 * const accept = (tag: HeadingTag) => tag
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HeadingTag = typeof HeadingTag.Type;

/**
 * `ListType` from `@lexical/list`.
 *
 * @example
 * ```ts
 * import { ListType } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ListType.is.bullet("bullet")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ListType = LiteralKit(["number", "bullet", "check"]).pipe(
  $I.annoteSchema("ListType", {
    description: "List semantics for Lexical list nodes: ordered, unordered, or checkbox list.",
  })
);

/**
 * Type for {@link ListType}.
 *
 * @example
 * ```ts
 * import type { ListType } from "@beep/lexical-schema/Lexical.model"
 *
 * const accept = (listType: ListType) => listType
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ListType = typeof ListType.Type;

/**
 * `ListNodeTagType` from `@lexical/list`.
 *
 * @example
 * ```ts
 * import { ListTag } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ListTag.is.ul("ul")) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ListTag = LiteralKit(["ul", "ol"]).pipe(
  $I.annoteSchema("ListTag", {
    description: "HTML list tag rendered for a Lexical list node.",
  })
);

/**
 * Type for {@link ListTag}.
 *
 * @example
 * ```ts
 * import type { ListTag } from "@beep/lexical-schema/Lexical.model"
 *
 * const accept = (tag: ListTag) => tag
 * console.log(accept)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ListTag = typeof ListTag.Type;

/**
 * Allowlist of inline CSS properties that are safe to preserve on serialized
 * Lexical text/element nodes. Anything outside this set — positioning, overlay,
 * stacking, animation, transforms, and any URL-bearing or function-call value —
 * is dropped, because a serialized editor state can originate from untrusted
 * persisted/synced content and Lexical renders these strings directly as DOM
 * `style` attributes (UI redressing / external resource beacons otherwise).
 */
const SAFE_INLINE_STYLE_PROPERTIES: ReadonlyArray<string> = [
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "font-family",
  "font-size",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-style",
  "text-decoration-color",
  "text-align",
  "text-transform",
  "letter-spacing",
  "line-height",
  "vertical-align",
  "white-space",
];

const isSafeStyleValue = (value: string): boolean =>
  Str.isNonEmpty(value) && !Str.includes("url(")(value) && !Str.includes("(")(value) && !Str.includes("\\")(value);

const parseSafeDeclaration = (declaration: string): O.Option<string> => {
  const colon = Str.indexOf(":")(declaration);
  return O.flatMap(colon, (index) => {
    const property = Str.toLowerCase(Str.trim(Str.takeLeft(declaration, index)));
    const value = Str.trim(Str.slice(index + 1)(declaration));
    return A.contains(SAFE_INLINE_STYLE_PROPERTIES, property) && isSafeStyleValue(value)
      ? O.some(`${property}: ${value}`)
      : O.none();
  });
};

/**
 * Sanitizes a serialized Lexical inline `style`/`textStyle` string down to an
 * allowlist of safe presentation declarations, dropping anything that could be
 * weaponized for UI redressing or external resource fetches. Empty input (the
 * common Lexical default) round-trips to the empty string.
 */
const sanitizeInlineStyle = (style: string): string =>
  Str.isEmpty(Str.trim(style)) ? "" : A.join(A.getSomes(A.map(Str.split(style, ";"), parseSafeDeclaration)), "; ");

/**
 * Serialized Lexical inline CSS, sanitized at the schema boundary on both
 * decode and encode so that neither persisted untrusted state nor re-encoded
 * viewer/composer state can carry attacker-controlled CSS into the DOM.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SafeInlineStyle } from "@beep/lexical-schema/Lexical.model"
 *
 * const decode = S.decodeUnknownSync(SafeInlineStyle)
 * console.log(decode("position:fixed;color:red")) // "color: red"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const SafeInlineStyle: S.decodeTo<S.toType<S.String>, S.String> = S.String.pipe(
  S.decode({
    decode: SchemaGetter.transform(sanitizeInlineStyle),
    encode: SchemaGetter.transform(sanitizeInlineStyle),
  }),
  $I.annoteSchema("SafeInlineStyle", {
    description:
      "Serialized Lexical inline CSS restricted to an allowlist of safe presentation properties; positioning, stacking, animation, transforms, and URL/function-bearing values are stripped on decode and encode.",
    // The sanitizer runs on both decode and encode, so only its fixed points
    // survive a round-trip. Projecting the generator through the (idempotent)
    // sanitizer keeps schema-derived arbitraries on those fixed points and the
    // round-trip total without weakening the boundary guard itself.
    toArbitrary: () => (fc) => fc.string().map(sanitizeInlineStyle),
  })
);

/**
 * Sanitizes a serialized Lexical bare CSS value (e.g. a table cell
 * `backgroundColor` or `verticalAlign`) that Lexical renders into a single DOM
 * `style` declaration. Any value that smuggles a second declaration (`;`), a
 * function call / URL (`(`), or an escape (`\`) is dropped to the empty string,
 * preventing the bare-value sink from being used for CSS injection.
 */
const sanitizeStyleValue = (value: string): string => {
  const trimmed = Str.trim(value);
  return isSafeStyleValue(trimmed) && !Str.includes(";")(trimmed) && !Str.includes(":")(trimmed) ? trimmed : "";
};

/**
 * Serialized Lexical single CSS value (table cell `backgroundColor` /
 * `verticalAlign`) sanitized at the schema boundary so the bare-value sink
 * cannot smuggle extra declarations or URL/function constructs into the DOM.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SafeStyleValue } from "@beep/lexical-schema/Lexical.model"
 *
 * const decode = S.decodeUnknownSync(SafeStyleValue)
 * console.log(decode("red; position: fixed")) // ""
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const SafeStyleValue: S.decodeTo<S.toType<S.String>, S.String> = S.String.pipe(
  S.decode({
    decode: SchemaGetter.transform(sanitizeStyleValue),
    encode: SchemaGetter.transform(sanitizeStyleValue),
  }),
  $I.annoteSchema("SafeStyleValue", {
    description:
      "Serialized Lexical single CSS value restricted to a safe form; multi-declaration, URL-bearing, and function-call values are stripped on decode and encode.",
    // See SafeInlineStyle: keep schema-derived arbitraries on the sanitizer's
    // (idempotent) fixed points so the encode/decode round-trip stays total.
    toArbitrary: () => (fc) => fc.string().map(sanitizeStyleValue),
  })
);

/**
 * Mirrors `SerializedLexicalNode`. The `type` discriminant is added by each
 * concrete subclass via `S.tag(...)`. `"$"` is `NODE_STATE_KEY`.
 *
 * @example
 * ```ts
 * import { BaseNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(BaseNode.name) // "BaseNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class BaseNode extends S.Class<BaseNode>($I`BaseNode`)(
  {
    version: LexicalNodeVersion.annotateKey({
      description: "Serialized Lexical node schema version; Lexical currently writes version 1 for built-in nodes.",
    }),
    $: S.Record(S.String, S.Unknown).pipe(
      S.OptionFromOptionalKey,
      S.annotateKey({
        description:
          "Optional NODE_STATE_KEY payload containing arbitrary persisted Lexical NodeState values keyed by state name.",
      })
    ),
  },
  $I.annote("BaseNode", {
    description: "Schema base for every serialized Lexical node, including versioning and optional NodeState metadata.",
  })
) {}

/**
 * Companion namespace for {@link BaseNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace BaseNode {
  /**
   * Companion decoded type for {@link BaseNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type {
    readonly $: O.Option<R.ReadonlyRecord<string, unknown>>;
    readonly version: LexicalNodeVersion;
  }

  /**
   * Companion encoded type for {@link BaseNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded {
    readonly $?: R.ReadonlyRecord<string, unknown>;
    readonly version: number;
  }
}

/**
 * `children` is mutually recursive with the union of all node schemas, so we
 * tie the knot with `S.suspend`. The annotation must only mention the
 * hand-written namespace types — referencing the classes here would make
 * every class's base expression circular.
 */
const NodeChildren = S.Array(S.suspend((): S.Codec<LexicalNode.Type, LexicalNode.Encoded> => LexicalNode)).pipe(
  $I.annoteSchema("NodeChildren", {
    description: "Ordered recursive child node list for serialized Lexical element nodes.",
  })
);

/**
 * Mirrors `SerializedElementNode`.
 *
 * `textFormat`/`textStyle` stay optional here (as on `SerializedElementNode`)
 * even though Lexical 0.45 narrows them to required on paragraph nodes — the
 * schema package owns the persisted contract and must not couple to one
 * Lexical release's wire shape.
 *
 * @example
 * ```ts
 * import { ElementNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ElementNode.name) // "ElementNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ElementNode extends BaseNode.extend<ElementNode>($I`ElementNode`)(
  {
    children: NodeChildren.annotateKey({
      description: "Child nodes in document order, recursively decoded through the LexicalNode tagged union.",
    }),
    direction: S.OptionFromNullOr(Direction).annotateKey({
      description: "Optional text direction decoded from Lexical's nullable direction field.",
    }),
    format: ElementFormat.annotateKey({ description: "Block alignment format token applied to the element." }),
    indent: LexicalIndentDepth.annotateKey({ description: "Lexical indentation depth for nested block layout." }),
    textFormat: TextFormatMask.pipe(
      S.OptionFromOptionalKey,
      S.annotateKey({
        description: "Optional TextFormatType bitmask applied to newly inserted text within the element.",
      })
    ),
    textStyle: SafeInlineStyle.pipe(
      S.OptionFromOptionalKey,
      S.annotateKey({
        description:
          "Optional CSS style applied to newly inserted text within the element, sanitized to an allowlist of safe presentation properties.",
      })
    ),
  },
  $I.annote("ElementNode", {
    description: "Schema base shared by Lexical element (container) nodes.",
  })
) {}

/**
 * Companion namespace for {@link ElementNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ElementNode {
  /**
   * Companion decoded type for {@link ElementNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends BaseNode.Type {
    readonly children: ReadonlyArray<LexicalNode.Type>;
    readonly direction: O.Option<Direction>;
    readonly format: ElementFormat;
    readonly indent: LexicalIndentDepth;
    readonly textFormat: O.Option<TextFormatMask>;
    readonly textStyle: O.Option<string>;
  }

  /**
   * Companion encoded type for {@link ElementNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends BaseNode.Encoded {
    readonly children: ReadonlyArray<LexicalNode.Encoded>;
    readonly direction: null | Direction;
    readonly format: ElementFormat;
    readonly indent: number;
    readonly textFormat?: number;
    readonly textStyle?: string;
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
 * import { TextBase } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(TextBase.name) // "TextBase"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextBase extends BaseNode.extend<TextBase>($I`TextBase`)(
  {
    detail: TextDetailMask.annotateKey({ description: "TextDetailType bitmask." }),
    format: TextFormatMask.annotateKey({
      description: "TextFormatType bitmask (bold=1, italic=2, strikethrough=4, code=16).",
    }),
    mode: TextMode.annotateKey({ description: "Text node mode." }),
    style: SafeInlineStyle.annotateKey({
      description: "Inline CSS style, sanitized to an allowlist of safe presentation properties.",
    }),
    text: S.String.annotateKey({ description: "The text content." }),
  },
  $I.annote("TextBase", { description: "Schema base shared by text-like Lexical leaf nodes." })
) {}

/**
 * Companion namespace for {@link TextBase}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TextBase {
  /**
   * Companion decoded type for {@link TextBase}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends BaseNode.Type {
    readonly detail: TextDetailMask;
    readonly format: TextFormatMask;
    readonly mode: TextMode;
    readonly style: string;
    readonly text: string;
  }

  /**
   * Companion encoded type for {@link TextBase}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends BaseNode.Encoded {
    readonly detail: number;
    readonly format: number;
    readonly mode: TextMode;
    readonly style: string;
    readonly text: string;
  }
}

/**
 * Mirrors `SerializedTextNode`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TextNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(TextNode)({
 *   type: "text", version: 1, detail: 0, format: 0, mode: "normal", style: "", text: "Hello"
 * })
 * console.log(node.text) // "Hello"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextNode extends TextBase.extend<TextNode>($I`TextNode`)(
  {
    type: S.tag("text"),
  },
  $I.annote("TextNode", { description: "A serialized Lexical text leaf node." })
) {
  /**
   * Plain-text projection of a text node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: TextNode.Type) => node.text;
}

/**
 * Companion namespace for {@link TextNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TextNode {
  /**
   * Companion decoded type for {@link TextNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends TextBase.Type {
    readonly type: "text";
  }

  /**
   * Companion encoded type for {@link TextNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends TextBase.Encoded {
    readonly type: "text";
  }
}

/**
 * Mirrors `SerializedTabNode`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { TabNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(TabNode)({
 *   type: "tab", version: 1, detail: 0, format: 0, mode: "normal", style: "", text: "\t"
 * })
 * console.log(node.type) // "tab"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TabNode extends TextBase.extend<TabNode>($I`TabNode`)(
  {
    type: S.tag("tab"),
  },
  $I.annote("TabNode", { description: "A serialized Lexical tab leaf node." })
) {
  /**
   * Plain-text projection of a tab node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (_node: TabNode.Type) => "\t";
}

/**
 * Companion namespace for {@link TabNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TabNode {
  /**
   * Companion decoded type for {@link TabNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends TextBase.Type {
    readonly type: "tab";
  }

  /**
   * Companion encoded type for {@link TabNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends TextBase.Encoded {
    readonly type: "tab";
  }
}

/**
 * Mirrors `SerializedLineBreakNode`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LineBreakNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(LineBreakNode)({ type: "linebreak", version: 1 })
 * console.log(node.type) // "linebreak"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LineBreakNode extends BaseNode.extend<LineBreakNode>($I`LineBreakNode`)(
  {
    type: S.tag("linebreak"),
  },
  $I.annote("LineBreakNode", { description: "A serialized Lexical line-break leaf node." })
) {
  /**
   * Plain-text projection of a line-break node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (_node: LineBreakNode.Type) => "\n";
}

/**
 * Companion namespace for {@link LineBreakNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace LineBreakNode {
  /**
   * Companion decoded type for {@link LineBreakNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends BaseNode.Type {
    readonly type: "linebreak";
  }

  /**
   * Companion encoded type for {@link LineBreakNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends BaseNode.Encoded {
    readonly type: "linebreak";
  }
}

/**
 * Mirrors `SerializedRootNode`.
 *
 * @example
 * ```ts
 * import { RootNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(RootNode.name) // "RootNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RootNode extends ElementNode.extend<RootNode>($I`RootNode`)(
  {
    type: S.tag("root"),
  },
  $I.annote("RootNode", { description: "The serialized Lexical document root element." })
) {
  /**
   * Plain-text projection of the root node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: RootNode.Type) => childText(node.children);
}

/**
 * Companion namespace for {@link RootNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace RootNode {
  /**
   * Companion decoded type for {@link RootNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly type: "root";
  }

  /**
   * Companion encoded type for {@link RootNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly type: "root";
  }
}

/**
 * Mirrors `SerializedParagraphNode`.
 *
 * @example
 * ```ts
 * import { ParagraphNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ParagraphNode.name) // "ParagraphNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ParagraphNode extends ElementNode.extend<ParagraphNode>($I`ParagraphNode`)(
  {
    type: S.tag("paragraph"),
  },
  $I.annote("ParagraphNode", { description: "A serialized Lexical paragraph element node." })
) {
  /**
   * Plain-text projection of a paragraph node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: ParagraphNode.Type) => `${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link ParagraphNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ParagraphNode {
  /**
   * Companion decoded type for {@link ParagraphNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly type: "paragraph";
  }

  /**
   * Companion encoded type for {@link ParagraphNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly type: "paragraph";
  }
}

/**
 * Mirrors `SerializedHeadingNode` from `@lexical/rich-text`.
 *
 * @example
 * ```ts
 * import { HeadingNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(HeadingNode.name) // "HeadingNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HeadingNode extends ElementNode.extend<HeadingNode>($I`HeadingNode`)(
  {
    type: S.tag("heading"),
    tag: HeadingTag.annotateKey({ description: "Heading level tag." }),
  },
  $I.annote("HeadingNode", { description: "A serialized Lexical heading element node." })
) {
  /**
   * Plain-text projection of a heading node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: HeadingNode.Type) => `${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link HeadingNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace HeadingNode {
  /**
   * Companion decoded type for {@link HeadingNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly tag: HeadingTag;
    readonly type: "heading";
  }

  /**
   * Companion encoded type for {@link HeadingNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly tag: HeadingTag;
    readonly type: "heading";
  }
}

/**
 * Mirrors `SerializedQuoteNode` from `@lexical/rich-text`.
 *
 * @example
 * ```ts
 * import { QuoteNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(QuoteNode.name) // "QuoteNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class QuoteNode extends ElementNode.extend<QuoteNode>($I`QuoteNode`)(
  {
    type: S.tag("quote"),
  },
  $I.annote("QuoteNode", { description: "A serialized Lexical block-quote element node." })
) {
  /**
   * Plain-text projection of a quote node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: QuoteNode.Type) => `${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link QuoteNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace QuoteNode {
  /**
   * Companion decoded type for {@link QuoteNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly type: "quote";
  }

  /**
   * Companion encoded type for {@link QuoteNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly type: "quote";
  }
}

/**
 * Mirrors `SerializedListNode` from `@lexical/list`.
 *
 * @example
 * ```ts
 * import { ListNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ListNode.name) // "ListNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ListNode extends ElementNode.extend<ListNode>($I`ListNode`)(
  {
    type: S.tag("list"),
    listType: ListType.annotateKey({ description: "List semantics." }),
    start: LexicalListStart.annotateKey({ description: "Starting number for ordered lists." }),
    tag: ListTag.annotateKey({ description: "HTML list tag." }),
  },
  $I.annote("ListNode", { description: "A serialized Lexical list element node." })
) {
  /**
   * Plain-text projection of a list node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: ListNode.Type) => `${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link ListNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ListNode {
  /**
   * Companion decoded type for {@link ListNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly listType: ListType;
    readonly start: PosInt;
    readonly tag: ListTag;
    readonly type: "list";
  }

  /**
   * Companion encoded type for {@link ListNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly listType: ListType;
    readonly start: number;
    readonly tag: ListTag;
    readonly type: "list";
  }
}

/**
 * Mirrors `SerializedListItemNode` from `@lexical/list` — `checked` is
 * `boolean | undefined` on the wire.
 *
 * @example
 * ```ts
 * import { ListItemNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(ListItemNode.name) // "ListItemNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ListItemNode extends ElementNode.extend<ListItemNode>($I`ListItemNode`)(
  {
    type: S.tag("listitem"),
    checked: S.OptionFromOptional(S.Boolean).annotateKey({
      description: "Checkbox state for check lists; absent otherwise.",
    }),
    value: LexicalListItemValue.annotateKey({ description: "Ordinal value within the list." }),
  },
  $I.annote("ListItemNode", { description: "A serialized Lexical list-item element node." })
) {
  /**
   * Plain-text projection of a list-item node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: ListItemNode.Type) => `- ${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link ListItemNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ListItemNode {
  /**
   * Companion decoded type for {@link ListItemNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly checked: O.Option<boolean>;
    readonly type: "listitem";
    readonly value: PosInt;
  }

  /**
   * Companion encoded type for {@link ListItemNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly checked?: boolean | undefined;
    readonly type: "listitem";
    readonly value: number;
  }
}

/**
 * Mirrors `SerializedLinkNode` from `@lexical/link`.
 *
 * @example
 * ```ts
 * import { LinkNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(LinkNode.name) // "LinkNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LinkNode extends ElementNode.extend<LinkNode>($I`LinkNode`)(
  {
    type: S.tag("link"),
    url: S.String.annotateKey({ description: "The link target URL." }),
    rel: S.OptionFromOptionalNullOr(S.String).annotateKey({ description: "Optional anchor rel attribute." }),
    target: S.OptionFromOptionalNullOr(S.String).annotateKey({ description: "Optional anchor target attribute." }),
    title: S.OptionFromOptionalNullOr(S.String).annotateKey({ description: "Optional anchor title attribute." }),
  },
  $I.annote("LinkNode", { description: "A serialized Lexical hyperlink element node." })
) {
  /**
   * Plain-text projection of a link node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: LinkNode.Type) => childText(node.children);
}

/**
 * Companion namespace for {@link LinkNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace LinkNode {
  /**
   * Companion decoded type for {@link LinkNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly rel: O.Option<string>;
    readonly target: O.Option<string>;
    readonly title: O.Option<string>;
    readonly type: "link";
    readonly url: string;
  }

  /**
   * Companion encoded type for {@link LinkNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly rel?: string | null | undefined;
    readonly target?: string | null | undefined;
    readonly title?: string | null | undefined;
    readonly type: "link";
    readonly url: string;
  }
}

/**
 * Mirrors `SerializedCodeNode` from `@lexical/code` — `language` is
 * `string | null | undefined` on the wire.
 *
 * @example
 * ```ts
 * import { CodeNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(CodeNode.name) // "CodeNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CodeNode extends ElementNode.extend<CodeNode>($I`CodeNode`)(
  {
    type: S.tag("code"),
    language: CodeNodeLanguage.annotateKey({
      description: "Optional code-fence language identifier.",
    }),
    theme: S.OptionFromOptional(S.String).annotateKey({ description: "Optional code highlight theme." }),
  },
  $I.annote("CodeNode", { description: "A serialized Lexical fenced code-block element node." })
) {
  /**
   * Plain-text projection of a code node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: CodeNode.Type) => `\`\`\`\n${childText(node.children)}\n\`\`\`\n`;
}

/**
 * Companion namespace for {@link CodeNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace CodeNode {
  /**
   * Companion decoded type for {@link CodeNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly language: O.Option<MdCodeFenceLanguage>;
    readonly theme: O.Option<string>;
    readonly type: "code";
  }

  /**
   * Companion encoded type for {@link CodeNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly language?: string | null | undefined;
    readonly theme?: string | undefined;
    readonly type: "code";
  }
}

/**
 * Net-new decorator block node owned by this package: a reference to a
 * runtime artifact, rendered as a chip in the editor and round-tripped to
 * `@beep/md` as a paragraph wrapping an `artifact://` link.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { ArtifactRefNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(ArtifactRefNode)({
 *   type: "artifact-ref", version: 1, artifactId: "artifact-123"
 * })
 * console.log(node.artifactId) // "artifact-123"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ArtifactRefNode extends BaseNode.extend<ArtifactRefNode>($I`ArtifactRefNode`)(
  {
    type: S.tag("artifact-ref"),
    artifactId: ArtifactRefId.annotateKey({ description: "Identifier of the referenced runtime artifact." }),
    label: S.OptionFromOptionalKey(S.NonEmptyString).annotateKey({
      description: "Optional human-readable label; defaults to the artifact id when absent.",
    }),
  },
  $I.annote("ArtifactRefNode", { description: "A serialized block-level reference to a runtime artifact." })
) {
  /**
   * Plain-text projection of an artifact-ref node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: ArtifactRefNode.Type) => `[artifact:${node.artifactId}]\n`;
}

/**
 * Companion namespace for {@link ArtifactRefNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ArtifactRefNode {
  /**
   * Companion decoded type for {@link ArtifactRefNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends BaseNode.Type {
    readonly artifactId: ArtifactRefId;
    readonly label: O.Option<string>;
    readonly type: "artifact-ref";
  }

  /**
   * Companion encoded type for {@link ArtifactRefNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends BaseNode.Encoded {
    readonly artifactId: string;
    readonly label?: string;
    readonly type: "artifact-ref";
  }
}

/**
 * Package-owned YouTube decorator block node.
 *
 * Mirrors the serialized shape used by the editor runtime:
 * `{ type: "youtube", videoID, format }`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { YouTubeNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(YouTubeNode)({
 *   type: "youtube", version: 1, videoID: "dQw4w9WgXcQ", format: ""
 * })
 * console.log(node.videoID)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class YouTubeNode extends BaseNode.extend<YouTubeNode>($I`YouTubeNode`)(
  {
    type: S.tag("youtube"),
    videoID: YouTubeVideoIdFromLegacyInput.annotateKey({
      description: "The bare YouTube video id rendered by the decorator block.",
    }),
    format: ElementFormat.annotateKey({ description: "Block alignment format token applied to the embed." }),
  },
  $I.annote("YouTubeNode", { description: "A serialized YouTube decorator block node." })
) {
  /**
   * Plain-text projection of a YouTube node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: YouTubeNode.Type) => `https://www.youtube.com/watch?v=${node.videoID}\n`;
}

/**
 * Companion namespace for {@link YouTubeNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace YouTubeNode {
  /**
   * Companion decoded type for {@link YouTubeNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends BaseNode.Type {
    readonly format: ElementFormat;
    readonly type: "youtube";
    readonly videoID: MdYouTubeVideoId;
  }

  /**
   * Companion encoded type for {@link YouTubeNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends BaseNode.Encoded {
    readonly format: ElementFormat;
    readonly type: "youtube";
    readonly videoID: string;
  }
}

/**
 * Serialized table cell node from `@lexical/table`.
 *
 * @example
 * ```ts
 * import { TableCellNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(TableCellNode.name) // "TableCellNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TableCellNode extends ElementNode.extend<TableCellNode>($I`TableCellNode`)(
  {
    type: S.tag("tablecell"),
    headerState: TableCellHeaderState.annotateKey({
      description: "TableCellHeaderState bitmask: 0 none, 1 row header, 2 column header, 3 both.",
    }),
    colSpan: TableCellSpan.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional colspan for merged table cells." })
    ),
    rowSpan: TableCellSpan.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional rowspan for merged table cells." })
    ),
    width: TableDimension.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional cell width emitted by Lexical table nodes." })
    ),
    backgroundColor: S.NullOr(SafeStyleValue).pipe(
      S.OptionFromOptional,
      S.annotateKey({
        description: "Optional cell background color emitted by Lexical table nodes, sanitized to a safe CSS value.",
      })
    ),
    verticalAlign: SafeStyleValue.pipe(
      S.OptionFromOptional,
      S.annotateKey({
        description: "Optional vertical alignment emitted by Lexical table nodes, sanitized to a safe CSS value.",
      })
    ),
  },
  $I.annote("TableCellNode", { description: "A serialized Lexical table cell element node." })
) {
  /**
   * Plain-text projection of a table cell node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: TableCellNode.Type) => `${Str.trim(childText(node.children))}\t`;
}

/**
 * Companion namespace for {@link TableCellNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TableCellNode {
  /**
   * Companion decoded type for {@link TableCellNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly backgroundColor: O.Option<string | null>;
    readonly colSpan: O.Option<TableCellSpan>;
    readonly headerState: TableCellHeaderState;
    readonly rowSpan: O.Option<TableCellSpan>;
    readonly type: "tablecell";
    readonly verticalAlign: O.Option<string>;
    readonly width: O.Option<TableDimension>;
  }

  /**
   * Companion encoded type for {@link TableCellNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly backgroundColor?: string | null | undefined;
    readonly colSpan?: number | undefined;
    readonly headerState: number;
    readonly rowSpan?: number | undefined;
    readonly type: "tablecell";
    readonly verticalAlign?: string | undefined;
    readonly width?: number | undefined;
  }
}

/**
 * Serialized table row node from `@lexical/table`.
 *
 * @example
 * ```ts
 * import { TableRowNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(TableRowNode.name) // "TableRowNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TableRowNode extends ElementNode.extend<TableRowNode>($I`TableRowNode`)(
  {
    type: S.tag("tablerow"),
    height: TableDimension.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional row height emitted by Lexical table nodes." })
    ),
  },
  $I.annote("TableRowNode", { description: "A serialized Lexical table row element node." })
) {
  /**
   * Plain-text projection of a table row node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: TableRowNode.Type) => `${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link TableRowNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TableRowNode {
  /**
   * Companion decoded type for {@link TableRowNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly height: O.Option<TableDimension>;
    readonly type: "tablerow";
  }

  /**
   * Companion encoded type for {@link TableRowNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly height?: number | undefined;
    readonly type: "tablerow";
  }
}

/**
 * Serialized table node from `@lexical/table`.
 *
 * @example
 * ```ts
 * import { TableNode } from "@beep/lexical-schema/Lexical.model"
 *
 * console.log(TableNode.name) // "TableNode"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TableNode extends ElementNode.extend<TableNode>($I`TableNode`)(
  {
    type: S.tag("table"),
    colWidths: S.Array(TableDimension).pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional table column widths emitted by Lexical table nodes." })
    ),
    rowStriping: S.Boolean.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional row-striping flag emitted by Lexical table nodes." })
    ),
    frozenColumnCount: NonNegativeInt.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional number of frozen columns emitted by Lexical table nodes." })
    ),
    frozenRowCount: NonNegativeInt.pipe(
      S.OptionFromOptional,
      S.annotateKey({ description: "Optional number of frozen rows emitted by Lexical table nodes." })
    ),
  },
  $I.annote("TableNode", { description: "A serialized Lexical table element node." })
) {
  /**
   * Plain-text projection of a table node.
   *
   * @category getters
   * @since 0.0.0
   */
  static readonly toText = (node: TableNode.Type) => `${childText(node.children)}\n`;
}

/**
 * Companion namespace for {@link TableNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TableNode {
  /**
   * Companion decoded type for {@link TableNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type extends ElementNode.Type {
    readonly colWidths: O.Option<ReadonlyArray<TableDimension>>;
    readonly frozenColumnCount: O.Option<NonNegativeInt>;
    readonly frozenRowCount: O.Option<NonNegativeInt>;
    readonly rowStriping: O.Option<boolean>;
    readonly type: "table";
  }

  /**
   * Companion encoded type for {@link TableNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded extends ElementNode.Encoded {
    readonly colWidths?: ReadonlyArray<number> | undefined;
    readonly frozenColumnCount?: number | undefined;
    readonly frozenRowCount?: number | undefined;
    readonly rowStriping?: boolean | undefined;
    readonly type: "table";
  }
}

/**
 * The tagged union of all v1 serialized Lexical nodes, discriminated by
 * Lexical's own `type` key.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LexicalNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(LexicalNode)({ type: "linebreak", version: 1 })
 * console.log(node.type) // "linebreak"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const LexicalNode = S.Union([
  // leaves
  TextNode,
  TabNode,
  LineBreakNode,
  ArtifactRefNode,
  YouTubeNode,
  // elements
  RootNode,
  ParagraphNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  CodeNode,
  TableNode,
  TableRowNode,
  TableCellNode,
]).pipe(S.toTaggedUnion("type"));

/**
 * {@inheritDoc LexicalNode}
 *
 * @example
 * ```ts
 * import type { LexicalNode } from "@beep/lexical-schema/Lexical.model"
 *
 * const nodeType = (node: LexicalNode) => node.type
 * console.log(nodeType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LexicalNode = typeof LexicalNode.Type;

/**
 * Companion namespace for {@link LexicalNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace LexicalNode {
  /**
   * Companion decoded type for {@link LexicalNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Type =
    | TextNode.Type
    | TabNode.Type
    | LineBreakNode.Type
    | ArtifactRefNode.Type
    | YouTubeNode.Type
    | RootNode.Type
    | ParagraphNode.Type
    | HeadingNode.Type
    | QuoteNode.Type
    | ListNode.Type
    | ListItemNode.Type
    | LinkNode.Type
    | CodeNode.Type
    | TableNode.Type
    | TableRowNode.Type
    | TableCellNode.Type;

  /**
   * Companion encoded type for {@link LexicalNode}.
   *
   * @category models
   * @since 0.0.0
   */
  export type Encoded =
    | TextNode.Encoded
    | TabNode.Encoded
    | LineBreakNode.Encoded
    | ArtifactRefNode.Encoded
    | YouTubeNode.Encoded
    | RootNode.Encoded
    | ParagraphNode.Encoded
    | HeadingNode.Encoded
    | QuoteNode.Encoded
    | ListNode.Encoded
    | ListItemNode.Encoded
    | LinkNode.Encoded
    | CodeNode.Encoded
    | TableNode.Encoded
    | TableRowNode.Encoded
    | TableCellNode.Encoded;
}

/**
 * Mirrors `SerializedEditorState`.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SerializedEditorState } from "@beep/lexical-schema/Lexical.model"
 *
 * const state = S.decodeUnknownSync(SerializedEditorState)({
 *   root: {
 *     type: "root", version: 1, children: [], direction: null, format: "", indent: 0
 *   }
 * })
 * console.log(state.root.type) // "root"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class SerializedEditorState extends S.Class<SerializedEditorState>($I`SerializedEditorState`)(
  {
    root: RootNode.annotateKey({ description: "The document root node." }),
  },
  $I.annote("SerializedEditorState", { description: "The serialized Lexical editor state envelope." })
) {}

/**
 * Companion namespace for {@link SerializedEditorState}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace SerializedEditorState {
  /**
   * Companion decoded type for {@link SerializedEditorState}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Type {
    readonly root: RootNode.Type;
  }

  /**
   * Companion encoded type for {@link SerializedEditorState}.
   *
   * @category models
   * @since 0.0.0
   */
  export interface Encoded {
    readonly root: RootNode.Encoded;
  }
}

/**
 * The same envelope, but encoding directly to/from a JSON string (for
 * persistence boundaries).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { EditorStateFromJson } from "@beep/lexical-schema/Lexical.model"
 *
 * const state = S.decodeUnknownSync(EditorStateFromJson)(
 *   '{"root":{"type":"root","version":1,"children":[],"direction":null,"format":"","indent":0}}'
 * )
 * console.log(state.root.type) // "root"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const EditorStateFromJson = S.fromJsonString(SerializedEditorState).pipe(
  $I.annoteSchema("EditorStateFromJson", {
    description: "Serialized Lexical editor state codec over its JSON string wire form.",
  })
);

const childText = (children: ReadonlyArray<LexicalNode.Type>): string => A.join(A.map(children, nodeToPlainText), "");

/**
 * Plain-text projection over the full node union (prompt construction,
 * previews).
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { LexicalNode, nodeToPlainText } from "@beep/lexical-schema/Lexical.model"
 *
 * const node = S.decodeUnknownSync(LexicalNode)({ type: "linebreak", version: 1 })
 * console.log(JSON.stringify(nodeToPlainText(node))) // "\"\\n\""
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const nodeToPlainText: (node: LexicalNode.Type) => string = LexicalNode.match({
  text: TextNode.toText,
  tab: TabNode.toText,
  linebreak: LineBreakNode.toText,
  "artifact-ref": ArtifactRefNode.toText,
  root: RootNode.toText,
  paragraph: ParagraphNode.toText,
  heading: HeadingNode.toText,
  quote: QuoteNode.toText,
  list: ListNode.toText,
  listitem: ListItemNode.toText,
  link: LinkNode.toText,
  code: CodeNode.toText,
  youtube: YouTubeNode.toText,
  table: TableNode.toText,
  tablerow: TableRowNode.toText,
  tablecell: TableCellNode.toText,
});

/**
 * Plain-text projection of a full editor state.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SerializedEditorState, editorStateToPlainText } from "@beep/lexical-schema/Lexical.model"
 *
 * const state = S.decodeUnknownSync(SerializedEditorState)({
 *   root: { type: "root", version: 1, children: [], direction: null, format: "", indent: 0 }
 * })
 * console.log(editorStateToPlainText(state)) // ""
 * ```
 *
 * @category getters
 * @since 0.0.0
 */
export const editorStateToPlainText = (state: SerializedEditorState.Type): string =>
  Str.trim(nodeToPlainText(state.root));
