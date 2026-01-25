// import {$SchemaId} from "@beep/identity/packages";
// import {StringLiteralKit} from "@beep/schema/derived";
// import * as HashSet from "effect/HashSet";
// import * as A from "effect/Array";
// import * as O from "effect/Option";
// import * as S from "effect/Schema";
// import * as PrimitiveSchemas from "@beep/schema/primitives";
// import * as F from "effect/Function";
// import {URLFromString} from "@beep/schema/primitives";
// import {thunkEmptyStr} from "@beep/utils";
//
// const $I = $SchemaId.create("integrations/css/literal-kits/allowed-property");
//
// export const defaultConfig = {
//   maxCssLength: 65536, // 64 KB limit
//   allowedProperties: HashSet.make(
//     "color",
//     "font-family",
//     "font-size",
//     "font-weight",
//     "line-height",
//     "text-align",
//     "text-decoration",
//     "text-transform",
//     "letter-spacing",
//     "display",
//     "width",
//     "height",
//     "max-width",
//     "max-height",
//     "min-width",
//     "min-height",
//     "margin",
//     "padding",
//     "border",
//     "background-color",
//     "opacity",
//     "box-shadow",
//     "transform",
//     "transition",
//     "background",
//     "animation",
//     "animation-delay",
//     "animation-direction",
//     "animation-duration",
//     "animation-fill-mode",
//     "animation-iteration-count",
//     "animation-name",
//     "animation-play-state",
//     "animation-timing-function",
//     "cursor",
//     "pointer-events",
//     "user-select",
//     "visibility",
//     "word-break",
//     "word-wrap",
//     "overflow",
//     "text-overflow",
//     "clip-path",
//     "filter",
//     "position",
//     "top",
//     "right",
//     "bottom",
//     "left",
//     "z-index",
//     "float",
//     "clear",
//     "object-fit",
//     "object-position",
//     "content",
//     "overflow-x",
//     "overflow-y",
//     "text-shadow",
//     "vertical-align",
//     "white-space",
//     "border-radius",
//     "justify-content",
//     "align-items",
//     "flex-wrap",
//     "flex-direction",
//     "flex"
//   ),
//   allowedAtRules: HashSet.make("@media", "@keyframes", "@font-face", "@import"),
//   allowedPseudoClasses: HashSet.make(
//     ":hover",
//     ":active",
//     ":focus",
//     ":visited",
//     ":first-child",
//     ":last-child",
//     ":nth-child",
//     ":nth-of-type",
//     ":not",
//     ":before",
//     ":after"),
//   validateUrl: S.is(PrimitiveSchemas.CustomURL),
//   sanitizeUrl: (url: string) => F.pipe(
//     url,
//     S.decodeOption(PrimitiveSchemas.URLFromString),
//     O.flatMap(O.liftPredicate((parsedUrl) => A.contains(parsedUrl.hostname)(allowedDomains))),
//   )
// } as const;
//
