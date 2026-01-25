/**
 * @module SanitizeConfig
 * @description Complete sanitize-html configuration schema
 * @since 1.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { HtmlAttribute } from "../literal-kits/html-attributes";
import { TagsMode } from "../literal-kits/tags-mode";
import { AllowedAttributes } from "./allowed-attributes";
import { AllowedClasses } from "./allowed-classes";
import { AllowedSchemes, AllowedSchemesByTag } from "./allowed-schemes";
import { AllowedTags } from "./allowed-tags";
import { RegExpPattern } from "./regexp-pattern";

const $I = $SchemaId.create("integrations/html/sanitize/sanitize-config");

// ============================================================================
// Allowed Styles Schema
// ============================================================================

/**
 * CSS property value patterns for style filtering
 *
 * Maps CSS property names to arrays of allowed value patterns.
 *
 * @since 1.0.0
 * @category Schema
 */
export const CssPropertyPatterns = S.Record({
  key: S.String,
  value: S.Array(RegExpPattern),
}).annotations(
  $I.annotations("CssPropertyPatterns", {
    description: "Map of CSS properties to allowed value patterns",
  })
);

/**
 * Allowed styles configuration per tag
 *
 * Maps tag names to CSS property patterns. Use "*" for global styles.
 *
 * @since 1.0.0
 * @category Schema
 */
export const AllowedStyles = S.Record({
  key: S.String,
  value: CssPropertyPatterns,
}).annotations(
  $I.annotations("AllowedStyles", {
    description: "Map of tag names to CSS property patterns",
  })
);

export type AllowedStyles = S.Schema.Type<typeof AllowedStyles>;

// ============================================================================
// SanitizeConfig Schema
// ============================================================================

/**
 * Complete sanitize-html configuration schema.
 *
 * Excludes callback fields (textFilter, exclusiveFilter, transformTags,
 * onOpenTag, onCloseTag) as they cannot be serialized.
 *
 * Matches sanitize-html defaults where appropriate.
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { SanitizeConfig, DefaultSanitizeConfig } from "@beep/schema/integrations/html";
 *
 * // Use default configuration
 * const config = DefaultSanitizeConfig;
 *
 * // Create custom configuration
 * const customConfig: SanitizeConfig = {
 *   allowedTags: AllowedTags.specific(["p", "b", "i", "a"]),
 *   allowedAttributes: AllowedAttributes.specific({
 *     a: ["href", "title"],
 *   }),
 *   allowProtocolRelative: false,
 * };
 * ```
 */
export const SanitizeConfig = S.Struct({
  // -------------------------------------------------------------------------
  // Core Tag/Attribute Allow-lists
  // -------------------------------------------------------------------------

  /**
   * Tags to allow. Undefined = default set, AllTags = all tags, SpecificTags = explicit list
   */
  allowedTags: S.optional(AllowedTags).annotations({
    description: "Tags to allow. Undefined = default set, AllTags = all tags, SpecificTags = explicit list",
  }),

  /**
   * Attributes to allow per tag. Undefined = default set, AllAttributes = all, SpecificAttributes = per-tag map
   */
  allowedAttributes: S.optional(AllowedAttributes).annotations({
    description: "Attributes to allow per tag",
  }),

  /**
   * How to handle disallowed tags
   */
  disallowedTagsMode: S.optional(TagsMode).annotations({
    description:
      'How to handle disallowed tags: "discard" removes tag but keeps content, "escape" HTML-encodes tag, "recursiveEscape" encodes recursively, "completelyDiscard" removes tag and content',
  }),

  // -------------------------------------------------------------------------
  // URL Scheme Filtering
  // -------------------------------------------------------------------------

  /**
   * URL schemes to allow globally
   */
  allowedSchemes: S.optional(AllowedSchemes).annotations({
    description: "URL schemes to allow globally. Undefined = default schemes (http, https, mailto, ftp)",
  }),

  /**
   * URL schemes to allow per tag
   */
  allowedSchemesByTag: S.optional(AllowedSchemesByTag).annotations({
    description: "URL schemes to allow per tag",
  }),

  /**
   * Attributes to which scheme filtering applies
   */
  allowedSchemesAppliedToAttributes: S.optional(S.Array(HtmlAttribute)).annotations({
    description: "Attributes to which scheme filtering applies. Defaults to ['href', 'src', 'cite']",
  }),

  /**
   * Whether to allow protocol-relative URLs (//example.com)
   */
  allowProtocolRelative: S.optional(S.Boolean).annotations({
    description: "Whether to allow protocol-relative URLs (//example.com). Default: true",
  }),

  // -------------------------------------------------------------------------
  // iframe Security
  // -------------------------------------------------------------------------

  /**
   * Whether to allow relative URLs in iframe src attributes
   */
  allowIframeRelativeUrls: S.optional(S.Boolean).annotations({
    description: "Whether to allow relative URLs in iframe src attributes. Default: undefined (disallow)",
  }),

  /**
   * Whitelist of allowed iframe hostnames (exact match)
   */
  allowedIframeHostnames: S.optional(S.Array(S.String)).annotations({
    description: "Whitelist of allowed iframe hostnames (exact match). Example: ['www.youtube.com']",
  }),

  /**
   * Whitelist of allowed iframe domains (suffix match)
   */
  allowedIframeDomains: S.optional(S.Array(S.String)).annotations({
    description:
      "Whitelist of allowed iframe domains (suffix match). Example: ['youtube.com'] allows 'www.youtube.com'",
  }),

  // -------------------------------------------------------------------------
  // script Security
  // -------------------------------------------------------------------------

  /**
   * Whitelist of allowed script hostnames (exact match)
   */
  allowedScriptHostnames: S.optional(S.Array(S.String)).annotations({
    description: "Whitelist of allowed script hostnames (exact match). Requires script tag to be in allowedTags",
  }),

  /**
   * Whitelist of allowed script domains (suffix match)
   */
  allowedScriptDomains: S.optional(S.Array(S.String)).annotations({
    description: "Whitelist of allowed script domains (suffix match). Requires script tag to be in allowedTags",
  }),

  // -------------------------------------------------------------------------
  // CSS/Style Filtering
  // -------------------------------------------------------------------------

  /**
   * Whether to parse and filter style attributes
   */
  parseStyleAttributes: S.optional(S.Boolean).annotations({
    description: "Whether to parse and filter style attributes according to allowedStyles. Default: true",
  }),

  /**
   * Allowed CSS styles per tag
   */
  allowedStyles: S.optional(AllowedStyles).annotations({
    description: "Map of tag names to map of CSS properties to allowed value patterns",
  }),

  /**
   * Allowed CSS classes per tag
   */
  allowedClasses: S.optional(AllowedClasses).annotations({
    description: "Map of tag names to allowed class configurations",
  }),

  // -------------------------------------------------------------------------
  // Tag Behavior
  // -------------------------------------------------------------------------

  /**
   * Tags to treat as self-closing
   */
  selfClosing: S.optional(S.Array(S.String)).annotations({
    description: "Tags to treat as self-closing (e.g., <br> becomes <br />). Defaults to HTML5 self-closing tags",
  }),

  /**
   * Tags whose content should not be treated as text
   */
  nonTextTags: S.optional(S.Array(S.String)).annotations({
    description:
      "Tags whose content should not be treated as text. Defaults to ['script', 'style', 'textarea', 'option']",
  }),

  /**
   * Whether to enforce HTML boundary
   */
  enforceHtmlBoundary: S.optional(S.Boolean).annotations({
    description: "Whether to enforce that output is a complete HTML document. Default: false",
  }),

  // -------------------------------------------------------------------------
  // Attribute Behavior
  // -------------------------------------------------------------------------

  /**
   * Attributes that should always have a value (not treated as boolean)
   */
  nonBooleanAttributes: S.optional(S.Array(HtmlAttribute)).annotations({
    description: "Attributes that should always have a value (not treated as boolean)",
  }),

  /**
   * Attributes that are allowed to have empty string values
   */
  allowedEmptyAttributes: S.optional(S.Array(HtmlAttribute)).annotations({
    description: "Attributes that are allowed to have empty string values",
  }),

  // -------------------------------------------------------------------------
  // Security Flags
  // -------------------------------------------------------------------------

  /**
   * Whether to allow potentially dangerous tags
   */
  allowVulnerableTags: S.optional(S.Boolean).annotations({
    description:
      "Whether to allow potentially dangerous tags like <script>, <style>, <iframe> even if in allowedTags. Default: false (safer)",
  }),
}).annotations(
  $I.annotations("SanitizeConfig", {
    title: "Sanitize HTML Configuration",
    description:
      "Complete configuration for HTML sanitization. Serializable subset excluding callback functions (textFilter, exclusiveFilter, transformTags, onOpenTag, onCloseTag)",
  })
);

export type SanitizeConfig = S.Schema.Type<typeof SanitizeConfig>;
export type SanitizeConfigEncoded = S.Schema.Encoded<typeof SanitizeConfig>;

// ============================================================================
// Default Configurations
// ============================================================================

/**
 * Default sanitize-html configuration matching library defaults.
 * Strict but commonly used tags/attributes are allowed.
 *
 * @since 1.0.0
 * @category Presets
 */
export const DefaultSanitizeConfig: SanitizeConfig = {
  allowedTags: AllowedTags.specific([
    "address",
    "article",
    "aside",
    "footer",
    "header",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hgroup",
    "main",
    "nav",
    "section",
    "blockquote",
    "dd",
    "div",
    "dl",
    "dt",
    "figcaption",
    "figure",
    "hr",
    "li",
    "ol",
    "p",
    "pre",
    "ul",
    "a",
    "abbr",
    "b",
    "bdi",
    "bdo",
    "br",
    "cite",
    "code",
    "data",
    "dfn",
    "em",
    "i",
    "kbd",
    "mark",
    "q",
    "rb",
    "rp",
    "rt",
    "rtc",
    "ruby",
    "s",
    "samp",
    "small",
    "span",
    "strong",
    "sub",
    "sup",
    "time",
    "u",
    "var",
    "wbr",
    "caption",
    "col",
    "colgroup",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "tr",
  ]),
  allowedAttributes: AllowedAttributes.specific({
    a: ["href", "name", "target"],
    img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
  }),
  allowedSchemes: AllowedSchemes.specific(["http", "https", "ftp", "mailto", "tel"]),
  allowProtocolRelative: true,
  parseStyleAttributes: true,
  allowVulnerableTags: false,
  enforceHtmlBoundary: false,
};

/**
 * Minimal configuration - only allow basic text formatting.
 *
 * @since 1.0.0
 * @category Presets
 */
export const MinimalSanitizeConfig: SanitizeConfig = {
  allowedTags: AllowedTags.specific(["p", "b", "i", "strong", "em", "br"]),
  allowedAttributes: AllowedAttributes.specific({}),
  allowProtocolRelative: false,
  parseStyleAttributes: false,
  allowVulnerableTags: false,
};

/**
 * Permissive configuration - allow most tags but restrict dangerous ones.
 *
 * @since 1.0.0
 * @category Presets
 */
export const PermissiveSanitizeConfig: SanitizeConfig = {
  allowedTags: AllowedTags.all(),
  allowedAttributes: AllowedAttributes.all(),
  allowedSchemes: AllowedSchemes.specific(["http", "https", "mailto", "tel", "data"]),
  allowedIframeDomains: ["youtube.com", "vimeo.com", "youtube-nocookie.com"],
  allowProtocolRelative: true,
  parseStyleAttributes: true,
  allowVulnerableTags: false, // Still block inline scripts
};
