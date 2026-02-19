/**
 * CSS stylesheet sanitizer configuration and types
 *
 * Pure Effect-based configuration for sanitizing full CSS stylesheets.
 * Uses HashSet for O(1) property/at-rule lookups.
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as O from "effect/Option";
import * as S from "effect/Schema";

/**
 * URL validator function type.
 *
 * @since 0.1.0
 * @category types
 */
export type UrlValidator = (url: string) => boolean;

/**
 * URL sanitizer function type.
 * Returns Option.none() if URL should be rejected.
 *
 * @since 0.1.0
 * @category types
 */
export type UrlSanitizer = (url: string) => O.Option<string>;

/**
 * CSS sanitizer configuration.
 *
 * @since 0.1.0
 * @category types
 */
export interface CssStylesheetSanitizerConfig {
  /** Maximum CSS length in bytes (default: 65536 = 64KB) */
  readonly maxCssLength: number;
  /** Set of allowed CSS property names */
  readonly allowedProperties: HashSet.HashSet<string>;
  /** Set of allowed at-rules (e.g., @media, @keyframes) */
  readonly allowedAtRules: HashSet.HashSet<string>;
  /** Set of allowed pseudo-classes and pseudo-elements */
  readonly allowedPseudoClasses: HashSet.HashSet<string>;
  /** Function to validate URLs */
  readonly validateUrl: UrlValidator;
  /** Function to sanitize URLs, returns Option.none() to reject */
  readonly sanitizeUrl: UrlSanitizer;
}

/**
 * User-provided configuration input.
 * Arrays are converted to HashSets internally.
 *
 * @since 0.1.0
 * @category types
 */
export interface CssStylesheetSanitizerConfigInput {
  readonly maxCssLength?: number;
  readonly allowedProperties?: readonly string[];
  readonly allowedAtRules?: readonly string[];
  readonly allowedPseudoClasses?: readonly string[];
  readonly allowedDomains?: readonly string[];
  readonly validateUrl?: UrlValidator;
  readonly sanitizeUrl?: UrlSanitizer;
}

/**
 * Default allowed CSS properties.
 *
 * @since 0.1.0
 * @category defaults
 */
export const defaultAllowedProperties: readonly string[] = [
  // Typography
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "line-height",
  "text-align",
  "text-decoration",
  "text-transform",
  "letter-spacing",
  // Layout
  "display",
  "width",
  "height",
  "max-width",
  "max-height",
  "min-width",
  "min-height",
  "margin",
  "padding",
  "border",
  // Visual
  "background-color",
  "opacity",
  "box-shadow",
  "transform",
  "transition",
  "background",
  // Animation
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  // Interaction
  "cursor",
  "pointer-events",
  "user-select",
  "visibility",
  // Text handling
  "word-break",
  "word-wrap",
  "overflow",
  "text-overflow",
  // Effects
  "clip-path",
  "filter",
  // Positioning
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
  "float",
  "clear",
  // Object fit
  "object-fit",
  "object-position",
  // Misc
  "content",
  "overflow-x",
  "overflow-y",
  "text-shadow",
  "vertical-align",
  "white-space",
  "border-radius",
  // Flexbox
  "justify-content",
  "align-items",
  "flex-wrap",
  "flex-direction",
  "flex",
];

/**
 * Default allowed at-rules.
 *
 * @since 0.1.0
 * @category defaults
 */
export const defaultAllowedAtRules: readonly string[] = ["@media", "@keyframes", "@font-face", "@import"];

/**
 * Default allowed pseudo-classes and pseudo-elements.
 *
 * @since 0.1.0
 * @category defaults
 */
export const defaultAllowedPseudoClasses: readonly string[] = [
  ":hover",
  ":active",
  ":focus",
  ":visited",
  ":first-child",
  ":last-child",
  ":nth-child",
  ":nth-of-type",
  ":not",
  ":before",
  ":after",
];

/**
 * Default maximum CSS length (64 KB).
 *
 * @since 0.1.0
 * @category defaults
 */
export const defaultMaxCssLength = 65536;

/**
 * Default allowed domains for URL imports.
 *
 * @since 0.1.0
 * @category defaults
 */
export const defaultAllowedDomains: readonly string[] = ["fonts.googleapis.com"];

/**
 * URL schema for validation.
 */
const UrlSchema = S.String.pipe(
  S.filter((url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  })
);

/**
 * Create a default URL validator.
 *
 * @since 0.1.0
 * @category factories
 */
export const createDefaultUrlValidator = (): UrlValidator => (url) => S.is(UrlSchema)(url);

/**
 * Create a URL sanitizer that only allows specified domains.
 *
 * @since 0.1.0
 * @category factories
 */
export const createDomainRestrictedUrlSanitizer = (allowedDomains: readonly string[]): UrlSanitizer => {
  const domainsSet = HashSet.fromIterable(allowedDomains);

  return (url) =>
    F.pipe(
      url,
      O.liftPredicate((u) => {
        try {
          const parsed = new URL(u);
          return HashSet.has(domainsSet, parsed.hostname);
        } catch {
          return false;
        }
      })
    );
};

/**
 * Merge HashSets from default and user-provided values.
 */
const mergeHashSets = (
  defaultValues: readonly string[],
  userValues: readonly string[] | undefined
): HashSet.HashSet<string> =>
  F.pipe(
    userValues,
    O.fromNullable,
    O.match({
      onNone: () => HashSet.fromIterable(defaultValues),
      onSome: (values) => F.pipe(A.appendAll(defaultValues, values), HashSet.fromIterable),
    })
  );

/**
 * Create a sanitizer config from user input.
 *
 * @example
 * ```typescript
 * import { createConfig } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer-config"
 *
 * const config = createConfig({
 *   maxCssLength: 32768, // 32 KB
 *   allowedProperties: ["grid", "gap"], // adds to defaults
 *   allowedDomains: ["fonts.gstatic.com"]
 * })
 * ```
 *
 * @since 0.1.0
 * @category factories
 */
export const createConfig = (input: CssStylesheetSanitizerConfigInput = {}): CssStylesheetSanitizerConfig => {
  const allowedDomains = F.pipe(
    input.allowedDomains,
    O.fromNullable,
    O.match({
      onNone: () => defaultAllowedDomains,
      onSome: (domains) => A.appendAll(defaultAllowedDomains, domains),
    })
  );

  return {
    maxCssLength: input.maxCssLength ?? defaultMaxCssLength,
    allowedProperties: mergeHashSets(defaultAllowedProperties, input.allowedProperties),
    allowedAtRules: mergeHashSets(defaultAllowedAtRules, input.allowedAtRules),
    allowedPseudoClasses: mergeHashSets(defaultAllowedPseudoClasses, input.allowedPseudoClasses),
    validateUrl: input.validateUrl ?? createDefaultUrlValidator(),
    sanitizeUrl: input.sanitizeUrl ?? createDomainRestrictedUrlSanitizer(allowedDomains),
  };
};

/**
 * Default configuration.
 *
 * @since 0.1.0
 * @category defaults
 */
export const defaultConfig: CssStylesheetSanitizerConfig = createConfig();
