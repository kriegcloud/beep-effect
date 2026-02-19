/**
 * Pure TypeScript HTML sanitization module
 *
 * A minimal-dependency implementation of HTML sanitization following the sanitize-html API.
 * Uses Effect utilities throughout and implements HTML parsing from scratch.
 *
 * @example
 * ```typescript
 * import { sanitizeHtml, simpleTransform, defaults } from "@beep/utils/sanitize-html"
 *
 * // Basic sanitization
 * sanitizeHtml("<script>alert('XSS')</script><p>Hello</p>")
 * // "<p>Hello</p>"
 *
 * // Custom configuration
 * sanitizeHtml("<b>Bold</b><custom>Content</custom>", {
 *   allowedTags: ["b", "i", "em", "strong"]
 * })
 * // "<b>Bold</b>Content"
 *
 * // Transform tags
 * sanitizeHtml("<ol><li>Item</li></ol>", {
 *   transformTags: {
 *     ol: simpleTransform("ul", { class: "list" })
 *   }
 * })
 * // "<ul class=\"list\"><li>Item</li></ul>"
 * ```
 *
 * @since 0.1.0
 * @module
 */

export type { AllowedStyles } from "./css/css-filter";
export { filterStyles, hasAllowedStyles } from "./css/css-filter";
// CSS utilities
export type { CssDeclaration } from "./css/css-parser";
export {
  isDangerousCssValue,
  parseStyleAttribute,
  stringifyDeclarations,
} from "./css/css-parser";
// CSS stylesheet sanitizer
export type {
  CssStylesheetSanitizerConfig,
  CssStylesheetSanitizerConfigInput,
  UrlSanitizer,
  UrlValidator,
} from "./css/css-stylesheet-sanitizer";
export {
  createConfig as createCssConfig,
  createCssSanitizer,
  defaultAllowedAtRules,
  defaultAllowedDomains,
  defaultAllowedProperties,
  defaultAllowedPseudoClasses,
  defaultConfig as defaultCssConfig,
  defaultMaxCssLength,
  isPropertyAllowed,
  sanitizeCss,
} from "./css/css-stylesheet-sanitizer";
// Defaults
export {
  defaultAllowedEmptyAttributes,
  defaultParserOptions,
  defaults,
  mediaTags,
  vulnerableTags,
} from "./defaults";
export {
  buildAttributeGlobMatchers,
  filterAttributes,
  isValidAttributeName,
} from "./filters/attribute-filter";
export type { AllowedClasses } from "./filters/class-filter";
export {
  filterClasses,
  hasAllowedClasses,
  wouldAnyClassMatch,
} from "./filters/class-filter";
// Filter utilities
export {
  isMediaTag,
  isNonTextTag,
  isSelfClosingTag,
  isTagAllowed,
  isVulnerableTag,
  warnAboutVulnerableTags,
} from "./filters/tag-filter";
// Parser utilities (for advanced use cases)
export {
  decodeEntities,
  encodeEntities,
  encodeHtml,
  prepareForUrlValidation,
  stripControlChars,
} from "./parser/entities";
export { parseHtml, parseHtmlWithCallbacks } from "./parser/html-parser";
export type { CommentToken, DoctypeToken, EndTagToken, StartTagToken, TextToken, Token } from "./parser/token";
export {
  comment,
  doctype,
  endTag,
  isComment,
  isDoctype,
  isEndTag,
  isStartTag,
  isText,
  startTag,
  text,
} from "./parser/token";
// Main sanitization function
export { sanitizeHtml, simpleTransform } from "./sanitize-html";
// Transform utilities
export type { TransformTags } from "./transform/tag-transform";
export { applyTransform, transformTag } from "./transform/tag-transform";
// Types
export type {
  AllowedAttribute,
  Attributes,
  DisallowedTagsMode,
  Frame,
  MergedSanitizeOptions,
  ParserOptions,
  SanitizeOptions,
  TransformedTag,
  Transformer,
} from "./types";
export type { SrcsetEntry } from "./url/srcset-parser";
export {
  filterSrcset,
  parseSrcset,
  stringifySrcset,
} from "./url/srcset-parser";
// URL utilities
export type { ParsedUrl, UrlValidationOptions } from "./url/url-validator";
export {
  isNaughtyHref,
  parseUrl,
  validateIframeSrc,
  validateScriptSrc,
} from "./url/url-validator";

// Utility functions
export { escapeRegex } from "./utils/escape-regex";
export {
  createGlobMatcher,
  globToRegex,
  isGlobPattern,
  matchGlob,
} from "./utils/glob-matcher";
export { isPlainObject } from "./utils/is-plain-object";
