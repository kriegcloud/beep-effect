/**
 * Type definitions for sanitize-html
 *
 * @since 0.1.0
 * @module
 */

/**
 * Attributes dictionary for HTML tags.
 *
 * @since 0.1.0
 * @category types
 */
export interface Attributes {
  [attr: string]: string;
}

/**
 * Result of a tag transformation.
 *
 * @since 0.1.0
 * @category types
 */
export interface TransformedTag {
  readonly tagName: string;
  readonly attribs: Attributes;
  readonly text?: undefined | string;
}

/**
 * Tag transformation function type.
 *
 * @since 0.1.0
 * @category types
 */
export type Transformer = (tagName: string, attribs: Attributes) => TransformedTag;

/**
 * Allowed attribute definition.
 * Can be a string (attribute name), or an object with name and allowed values.
 *
 * @since 0.1.0
 * @category types
 */
export type AllowedAttribute =
  | string
  | {
      readonly name: string;
      readonly multiple?: undefined | boolean;
      readonly values: readonly string[];
    };

/**
 * Mode for handling disallowed tags.
 *
 * - `discard`: Remove the tag but keep its content
 * - `escape`: Escape the tag as text but keep content
 * - `recursiveEscape`: Escape the tag and all nested disallowed tags
 * - `completelyDiscard`: Remove the tag and all its content
 *
 * @since 0.1.0
 * @category types
 */
export type DisallowedTagsMode = "discard" | "escape" | "recursiveEscape" | "completelyDiscard";

/**
 * Parser options for HTML parsing behavior.
 *
 * @since 0.1.0
 * @category types
 */
export interface ParserOptions {
  /**
   * Whether to decode HTML entities.
   * @default true
   */
  readonly decodeEntities?: undefined | boolean;

  /**
   * Whether to convert tag names to lowercase.
   * @default true
   */
  readonly lowerCaseTags?: undefined | boolean;

  /**
   * Whether to convert attribute names to lowercase.
   * @default true
   */
  readonly lowerCaseAttributeNames?: undefined | boolean;
}

/**
 * Frame representing the current tag context during parsing.
 * Used for exclusiveFilter callback.
 *
 * @since 0.1.0
 * @category types
 */
export interface Frame {
  readonly tag: string;
  readonly attribs: Attributes;
  readonly text: string;
  readonly tagPosition: number;
  readonly mediaChildren: readonly string[];
}

/**
 * Default configuration values.
 *
 * @since 0.1.0
 * @category types
 */
export interface Defaults {
  readonly allowedAttributes: Record<string, readonly AllowedAttribute[]>;
  readonly allowedSchemes: readonly string[];
  readonly allowedSchemesByTag: Record<string, readonly string[]>;
  readonly allowedSchemesAppliedToAttributes: readonly string[];
  readonly allowedTags: readonly string[];
  readonly allowProtocolRelative: boolean;
  readonly disallowedTagsMode: DisallowedTagsMode;
  readonly enforceHtmlBoundary: boolean;
  readonly selfClosing: readonly string[];
  readonly nonBooleanAttributes: readonly string[];
}

/**
 * Sanitization options.
 *
 * @since 0.1.0
 * @category types
 */
export interface SanitizeOptions {
  /**
   * Tags that are allowed. Set to `false` to allow all tags.
   */
  readonly allowedTags?: undefined | false | readonly string[];

  /**
   * Attributes allowed for each tag. Use `*` for all tags.
   * Set to `false` to allow all attributes.
   */
  readonly allowedAttributes?: undefined | false | Record<string, readonly AllowedAttribute[]>;

  /**
   * CSS styles allowed for each tag. Use `*` for all tags.
   */
  readonly allowedStyles?: undefined | Record<string, Record<string, readonly RegExp[]>>;

  /**
   * Classes allowed for each tag. Use `*` for all tags.
   * Can include glob patterns and RegExp.
   */
  readonly allowedClasses?: undefined | undefined | Record<string, false | readonly (string | RegExp)[]>;

  /**
   * Allowed iframe source hostnames.
   */
  readonly allowedIframeHostnames?: undefined | readonly string[];

  /**
   * Allowed iframe source domains (includes subdomains).
   */
  readonly allowedIframeDomains?: undefined | readonly string[];

  /**
   * Whether to allow relative URLs in iframes.
   */
  readonly allowIframeRelativeUrls?: undefined | boolean;

  /**
   * Allowed URL schemes (protocols).
   */
  readonly allowedSchemes?: undefined | false | readonly string[];

  /**
   * URL schemes allowed per tag.
   */
  readonly allowedSchemesByTag?: undefined | false | Record<string, readonly string[]>;

  /**
   * Attributes to which scheme restrictions apply.
   */
  readonly allowedSchemesAppliedToAttributes?: undefined | readonly string[];

  /**
   * Allowed script source hostnames.
   */
  readonly allowedScriptHostnames?: undefined | readonly string[];

  /**
   * Allowed script source domains (includes subdomains).
   */
  readonly allowedScriptDomains?: undefined | readonly string[];

  /**
   * Whether to allow protocol-relative URLs (//example.com).
   */
  readonly allowProtocolRelative?: undefined | boolean;

  /**
   * Whether to allow vulnerable tags like `script` and `style`.
   * Must be explicitly enabled to suppress warnings.
   */
  readonly allowVulnerableTags?: undefined | boolean;

  /**
   * Filter function for text content.
   */
  readonly textFilter?: undefined | ((text: string, tagName: string) => string);

  /**
   * Filter function to exclude specific tags based on frame context.
   * Return `true` to exclude the tag and its content.
   * Return `"excludeTag"` to exclude just the tag but keep content.
   */
  readonly exclusiveFilter?: undefined | ((frame: Frame) => boolean | "excludeTag");

  /**
   * Maximum nesting depth for tags.
   */
  readonly nestingLimit?: undefined | number;

  /**
   * Tags whose content should not be parsed as HTML.
   */
  readonly nonTextTags?: undefined | readonly string[];

  /**
   * Whether to parse style attributes.
   * @default true
   */
  readonly parseStyleAttributes?: undefined | boolean;

  /**
   * Self-closing tags (void elements).
   */
  readonly selfClosing?: undefined | readonly string[];

  /**
   * Tag transformation functions.
   * Use `*` to transform all tags.
   */
  readonly transformTags?: undefined | Record<string, string | Transformer>;

  /**
   * Parser options.
   */
  readonly parser?: undefined | ParserOptions;

  /**
   * Mode for handling disallowed tags.
   */
  readonly disallowedTagsMode?: undefined | DisallowedTagsMode;

  /**
   * Whether to enforce HTML boundary.
   * Only content inside `<html>` tags is processed.
   */
  readonly enforceHtmlBoundary?: undefined | boolean;

  /**
   * Attributes that are not boolean (require a value).
   */
  readonly nonBooleanAttributes?: undefined | readonly string[];

  /**
   * Attributes that are allowed to be empty.
   */
  readonly allowedEmptyAttributes?: undefined | readonly string[];

  /**
   * Callback when a tag is opened.
   */
  readonly onOpenTag?: undefined | ((name: string, attribs: Attributes) => void);

  /**
   * Callback when a tag is closed.
   * @param isImplied - Whether the close was implied (not explicit in markup)
   */
  readonly onCloseTag?: undefined | ((name: string, isImplied: boolean) => void);

  /**
   * Whether to preserve attributes on escaped tags.
   * Only applies when disallowedTagsMode is 'escape' or 'recursiveEscape'.
   */
  readonly preserveEscapedAttributes?: undefined | boolean;
}
