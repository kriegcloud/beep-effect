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

export type { AllowedStyles } from "./css/css-filter.js";
export { filterStyles, hasAllowedStyles } from "./css/css-filter.js";
// CSS utilities
export type { CssDeclaration } from "./css/css-parser.js";
export {
  isDangerousCssValue,
  parseStyleAttribute,
  stringifyDeclarations,
} from "./css/css-parser.js";
// CSS stylesheet sanitizer
export type {
  CssStylesheetSanitizerConfig,
  CssStylesheetSanitizerConfigInput,
  UrlSanitizer,
  UrlValidator,
} from "./css/css-stylesheet-sanitizer.js";
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
} from "./css/css-stylesheet-sanitizer.js";
// Defaults
export {
  defaultAllowedEmptyAttributes,
  defaultParserOptions,
  defaults,
  mediaTags,
  vulnerableTags,
} from "./defaults.js";
export {
  buildAttributeGlobMatchers,
  filterAttributes,
  isValidAttributeName,
} from "./filters/attribute-filter.js";
export type { AllowedClasses } from "./filters/class-filter.js";
export {
  filterClasses,
  hasAllowedClasses,
  wouldAnyClassMatch,
} from "./filters/class-filter.js";
// Filter utilities
export {
  isMediaTag,
  isNonTextTag,
  isSelfClosingTag,
  isTagAllowed,
  isVulnerableTag,
  warnAboutVulnerableTags,
} from "./filters/tag-filter.js";
// Parser utilities (for advanced use cases)
export {
  decodeEntities,
  encodeEntities,
  encodeHtml,
  prepareForUrlValidation,
  stripControlChars,
} from "./parser/entities.js";
export { parseHtml, parseHtmlWithCallbacks } from "./parser/html-parser.js";
export type { CommentToken, DoctypeToken, EndTagToken, StartTagToken, TextToken, Token } from "./parser/token.js";
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
} from "./parser/token.js";
// Main sanitization function
export { sanitizeHtml, simpleTransform } from "./sanitize-html.js";
// Transform utilities
export type { TransformTags } from "./transform/tag-transform.js";
export { applyTransform, transformTag } from "./transform/tag-transform.js";
// Types
export type {
  AllowedAttribute,
  Attributes,
  DisallowedTagsMode,
  Frame,
  ParserOptions,
  SanitizeOptions,
  TransformedTag,
  Transformer,
} from "./types.js";
export type { SrcsetEntry } from "./url/srcset-parser.js";
export {
  filterSrcset,
  parseSrcset,
  stringifySrcset,
} from "./url/srcset-parser.js";
// URL utilities
export type { ParsedUrl, UrlValidationOptions } from "./url/url-validator.js";
export {
  isNaughtyHref,
  parseUrl,
  validateIframeSrc,
  validateScriptSrc,
} from "./url/url-validator.js";

// Utility functions
export { escapeRegex } from "./utils/escape-regex.js";
export {
  createGlobMatcher,
  globToRegex,
  isGlobPattern,
  matchGlob,
} from "./utils/glob-matcher.js";
export { isPlainObject } from "./utils/is-plain-object.js";
