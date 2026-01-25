/**
 * CSS stylesheet sanitizer
 *
 * Pure Effect-based sanitization for full CSS stylesheets.
 * Handles selectors, at-rules, and property filtering.
 *
 * @example
 * ```typescript
 * import { sanitizeCss, createConfig } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer"
 *
 * // Basic usage with defaults
 * const result = sanitizeCss(`
 *   .container { color: red; cursor: pointer; }
 *   .danger { -moz-binding: url(evil.xml); }
 * `)
 * // ".container { color: red; cursor: pointer; }"
 *
 * // Custom configuration
 * const config = createConfig({
 *   allowedProperties: ["grid", "gap"],
 *   maxCssLength: 32768
 * })
 * const customResult = sanitizeCss(cssText, config)
 * ```
 *
 * @since 0.1.0
 * @module
 */

import * as A from "effect/Array";
import * as F from "effect/Function";
import * as HashSet from "effect/HashSet";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import {
  type CssStylesheetSanitizerConfig,
  type CssStylesheetSanitizerConfigInput,
  createConfig,
  defaultConfig,
} from "./css-stylesheet-sanitizer-config.js";

export type {
  CssStylesheetSanitizerConfig,
  CssStylesheetSanitizerConfigInput,
  UrlSanitizer,
  UrlValidator,
} from "./css-stylesheet-sanitizer-config.js";
// Re-export config creation
export { createConfig } from "./css-stylesheet-sanitizer-config.js";

/**
 * Parser state for tracking CSS structure.
 */
interface ParseState {
  readonly nestedLevel: number;
  readonly inAtRule: boolean;
  readonly currentAtRule: string;
  readonly buffer: string;
  readonly output: string;
}

/**
 * Initial parser state.
 */
const initialParseState: ParseState = {
  nestedLevel: 0,
  inAtRule: false,
  currentAtRule: "",
  buffer: "",
  output: "",
};

/**
 * Remove CSS comments from input.
 */
const removeComments = (css: string): string => F.pipe(css, Str.replace(/\/\*[\s\S]*?\*\//g, ""));

/**
 * Truncate CSS to maximum length.
 */
const truncateCss = (css: string, maxLength: number): string =>
  Str.length(css) > maxLength ? Str.slice(0, maxLength)(css) : css;

/**
 * Extract rule name from buffer (first word).
 */
const extractRuleName = (buffer: string): string =>
  F.pipe(
    buffer,
    Str.trim,
    (s) => Str.split(s, /\s+/),
    A.head,
    O.getOrElse(() => "")
  );

/**
 * Extract URL from a CSS value like `url('...')` or `url(...)`.
 */
const extractUrlFromValue = (value: string): O.Option<string> =>
  F.pipe(
    value,
    (v) => /url\(['"]?(.*?)['"]?\)/i.exec(v),
    O.fromNullable,
    O.flatMap((match) => O.fromNullable(match[1]))
  );

/**
 * Check if a CSS property is related to background images.
 */
const isBackgroundImageProperty = (property: string): boolean =>
  F.pipe(property, Str.toLowerCase, (p) => p === "background-image" || p === "background");

/**
 * Sanitize a single CSS property-value pair.
 */
const sanitizeProperty = (property: string, value: string, config: CssStylesheetSanitizerConfig): O.Option<string> => {
  const normalizedProperty = F.pipe(property, Str.trim, Str.toLowerCase);

  // Check if property is allowed
  if (!HashSet.has(config.allowedProperties, normalizedProperty)) {
    return O.none();
  }

  // Handle background-image and background with URL
  if (isBackgroundImageProperty(normalizedProperty)) {
    return F.pipe(
      extractUrlFromValue(value),
      O.flatMap((url) => (config.validateUrl(url) ? config.sanitizeUrl(url) : O.none())),
      O.map((sanitizedUrl) => `${normalizedProperty}: url('${sanitizedUrl}')`),
      O.orElse(() =>
        // If no URL in value, pass through (e.g., background-color via background)
        F.pipe(
          value,
          O.liftPredicate((v) => !Str.includes("url(")(v)),
          O.map(() => `${normalizedProperty}: ${Str.trim(value)}`)
        )
      )
    );
  }

  return O.some(`${normalizedProperty}: ${Str.trim(value)}`);
};

/**
 * Parse and sanitize CSS declarations from a rule body.
 */
const sanitizeDeclarations = (body: string, config: CssStylesheetSanitizerConfig): string =>
  F.pipe(
    body,
    (s) => Str.split(s, ";"),
    A.filter((prop) => Str.length(Str.trim(prop)) > 0),
    A.filterMap((prop) => {
      const colonIndex = prop.indexOf(":");
      if (colonIndex < 0) return O.none();

      const property = Str.slice(0, colonIndex)(prop);
      const value = Str.slice(colonIndex + 1)(prop);

      return sanitizeProperty(property, value, config);
    }),
    A.join("; ")
  );

/**
 * Check if an at-rule is allowed.
 */
const isAtRuleAllowed = (ruleName: string, config: CssStylesheetSanitizerConfig): boolean =>
  HashSet.has(config.allowedAtRules, ruleName);

/**
 * Process an opening brace character.
 */
const processOpenBrace = (state: ParseState, config: CssStylesheetSanitizerConfig): ParseState => {
  const newNestedLevel = state.nestedLevel + 1;
  const ruleName = extractRuleName(state.buffer);

  // Check if this is an at-rule
  if (isAtRuleAllowed(ruleName, config)) {
    return {
      nestedLevel: newNestedLevel,
      inAtRule: true,
      currentAtRule: ruleName,
      buffer: "",
      output: Str.concat(state.output, Str.concat(state.buffer, "{")),
    };
  }

  // Regular rule or nested inside at-rule
  if (state.inAtRule || newNestedLevel === 1) {
    return {
      ...state,
      nestedLevel: newNestedLevel,
      buffer: "",
      output: Str.concat(state.output, Str.concat(state.buffer, "{")),
    };
  }

  // Disallowed at-rule, skip
  return {
    ...state,
    nestedLevel: newNestedLevel,
    buffer: "",
  };
};

/**
 * Process a closing brace character for at-rules.
 */
const processCloseBraceAtRule = (state: ParseState): ParseState => {
  const newNestedLevel = state.nestedLevel - 1;

  if (newNestedLevel === 0) {
    return {
      nestedLevel: 0,
      inAtRule: false,
      currentAtRule: "",
      buffer: "",
      output: Str.concat(state.output, Str.concat(state.buffer, "}")),
    };
  }

  return {
    ...state,
    nestedLevel: newNestedLevel,
    buffer: "",
    output: Str.concat(state.output, Str.concat(state.buffer, "}")),
  };
};

/**
 * Process a closing brace character for regular rules.
 */
const processCloseBraceRegular = (state: ParseState, config: CssStylesheetSanitizerConfig): ParseState => {
  const newNestedLevel = state.nestedLevel - 1;

  if (newNestedLevel === 0) {
    // Top-level rule, sanitize properties
    const sanitizedProperties = sanitizeDeclarations(state.buffer, config);

    if (Str.length(sanitizedProperties) > 0) {
      return {
        ...state,
        nestedLevel: 0,
        buffer: "",
        output: Str.concat(state.output, Str.concat(sanitizedProperties, "}")),
      };
    }

    // All properties were filtered out, skip the closing brace
    return {
      ...state,
      nestedLevel: 0,
      buffer: "",
    };
  }

  return {
    ...state,
    nestedLevel: newNestedLevel,
    buffer: "",
    output: Str.concat(state.output, Str.concat(state.buffer, "}")),
  };
};

/**
 * Process a closing brace character.
 */
const processCloseBrace = (state: ParseState, config: CssStylesheetSanitizerConfig): ParseState => {
  if (state.inAtRule) {
    return processCloseBraceAtRule(state);
  }
  return processCloseBraceRegular(state, config);
};

/**
 * Process a single character during parsing.
 */
const processChar = (config: CssStylesheetSanitizerConfig): ((state: ParseState, char: string) => ParseState) => {
  return (state: ParseState, char: string): ParseState =>
    F.pipe(
      Match.value(char),
      Match.when("{", () => processOpenBrace(state, config)),
      Match.when("}", () => processCloseBrace(state, config)),
      Match.orElse(() => ({
        ...state,
        buffer: Str.concat(state.buffer, char),
      }))
    );
};

/**
 * Sanitize a CSS stylesheet.
 *
 * Filters CSS content based on allowed properties, at-rules, and URL patterns.
 * Removes comments and truncates to maximum length.
 *
 * @example
 * ```typescript
 * import { sanitizeCss } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer"
 *
 * // Using default configuration
 * sanitizeCss(".btn { color: red; expression(evil()); }")
 * // ".btn { color: red }"
 *
 * // With custom config
 * import { createConfig } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer"
 *
 * const config = createConfig({ allowedProperties: ["grid", "gap"] })
 * sanitizeCss(".grid { display: grid; gap: 1rem; }", config)
 * ```
 *
 * @since 0.1.0
 * @category sanitization
 */
export const sanitizeCss = (css: string, config: CssStylesheetSanitizerConfig = defaultConfig): string => {
  // Handle non-string input
  if (!P.isString(css)) {
    return "";
  }

  const trimmed = Str.trim(css);
  if (Str.isEmpty(trimmed)) {
    return "";
  }

  // Process the CSS
  const processed = F.pipe(
    trimmed,
    (c) => truncateCss(c, config.maxCssLength),
    removeComments,
    (s) => Str.split(s, ""),
    A.reduce(initialParseState, processChar(config)),
    (state) => state.output
  );

  return processed;
};

/**
 * Create a CSS sanitizer function with a fixed configuration.
 *
 * @example
 * ```typescript
 * import { createCssSanitizer } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer"
 *
 * const sanitize = createCssSanitizer({
 *   maxCssLength: 32768,
 *   allowedProperties: ["grid", "gap"]
 * })
 *
 * sanitize(".container { display: grid; gap: 1rem; }")
 * ```
 *
 * @since 0.1.0
 * @category factories
 */
export const createCssSanitizer = (input: CssStylesheetSanitizerConfigInput = {}): ((css: string) => string) => {
  const config = createConfig(input);
  return (css) => sanitizeCss(css, config);
};

/**
 * Check if a CSS property name is allowed.
 *
 * @example
 * ```typescript
 * import { isPropertyAllowed, defaultConfig } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer"
 *
 * isPropertyAllowed("color", defaultConfig) // true
 * isPropertyAllowed("behavior", defaultConfig) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export const isPropertyAllowed = (property: string, config: CssStylesheetSanitizerConfig = defaultConfig): boolean =>
  HashSet.has(config.allowedProperties, F.pipe(property, Str.trim, Str.toLowerCase));

/**
 * Check if an at-rule is allowed.
 *
 * @example
 * ```typescript
 * import { isAtRuleAllowed, defaultConfig } from "@beep/utils/sanitize-html/css/css-stylesheet-sanitizer"
 *
 * isAtRuleAllowed("@media", defaultConfig) // true
 * isAtRuleAllowed("@import", defaultConfig) // true
 * isAtRuleAllowed("@charset", defaultConfig) // false
 * ```
 *
 * @since 0.1.0
 * @category guards
 */
export { isAtRuleAllowed };

/**
 * Re-export default configuration for convenience.
 *
 * @since 0.1.0
 * @category defaults
 */
/**
 * Re-export default values for customization.
 *
 * @since 0.1.0
 * @category defaults
 */
export {
  defaultAllowedAtRules,
  defaultAllowedDomains,
  defaultAllowedProperties,
  defaultAllowedPseudoClasses,
  defaultConfig,
  defaultMaxCssLength,
} from "./css-stylesheet-sanitizer-config.js";
