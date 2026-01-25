/**
 * @module toSanitizeOptions
 * @description Convert SanitizeConfig schema to sanitize-html runtime options
 * @since 1.0.0
 */
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as R from "effect/Record";
import type { AllowedAttribute } from "./allowed-attributes";
import type { AllowedClassesForTag } from "./allowed-classes";
import type { RegExpPattern } from "./regexp-pattern";
import type { SanitizeConfig } from "./sanitize-config";

// ============================================================================
// Runtime Types (matches @beep/utils/sanitize-html types)
// ============================================================================

/**
 * Runtime allowed attribute type for sanitize-html
 */
export type RuntimeAllowedAttribute =
  | string
  | {
      readonly name: string;
      readonly multiple?: boolean;
      readonly values: readonly string[];
    };

/**
 * Runtime sanitize options type (subset that we can generate)
 */
export interface SanitizeOptions {
  readonly allowedTags?: false | readonly string[];
  readonly allowedAttributes?: false | Record<string, readonly RuntimeAllowedAttribute[]>;
  readonly allowedStyles?: Record<string, Record<string, readonly RegExp[]>>;
  readonly allowedClasses?: Record<string, false | readonly (string | RegExp)[]>;
  readonly allowedIframeHostnames?: readonly string[];
  readonly allowedIframeDomains?: readonly string[];
  readonly allowIframeRelativeUrls?: boolean;
  readonly allowedSchemes?: false | readonly string[];
  readonly allowedSchemesByTag?: false | Record<string, readonly string[]>;
  readonly allowedSchemesAppliedToAttributes?: readonly string[];
  readonly allowedScriptHostnames?: readonly string[];
  readonly allowedScriptDomains?: readonly string[];
  readonly allowProtocolRelative?: boolean;
  readonly allowVulnerableTags?: boolean;
  readonly nonTextTags?: readonly string[];
  readonly parseStyleAttributes?: boolean;
  readonly selfClosing?: readonly string[];
  readonly disallowedTagsMode?: "discard" | "escape" | "recursiveEscape" | "completelyDiscard";
  readonly enforceHtmlBoundary?: boolean;
  readonly nonBooleanAttributes?: readonly string[];
  readonly allowedEmptyAttributes?: readonly string[];
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Convert RegExpPattern to native RegExp
 */
const toRegExp = (pattern: RegExpPattern.Type): RegExp => new RegExp(pattern.source, pattern.flags);

/**
 * Convert class pattern (string or RegExpPattern) to runtime form
 */
const classPatternToRuntime = (pattern: string | RegExpPattern.Type): string | RegExp =>
  typeof pattern === "string" ? pattern : toRegExp(pattern);

/**
 * Convert AllowedClassesForTag to runtime form
 */
const allowedClassesForTagToRuntime = (config: AllowedClassesForTag): false | readonly (string | RegExp)[] =>
  Match.value(config).pipe(
    Match.when({ _tag: "AllClasses" }, () => false as const),
    Match.when({ _tag: "SpecificClasses" }, ({ classes }) => A.map(classes, classPatternToRuntime)),
    Match.exhaustive
  );

/**
 * Convert AllowedAttribute schema to runtime form
 */
const allowedAttributeToRuntime = (attr: AllowedAttribute): RuntimeAllowedAttribute => {
  if (typeof attr === "string") {
    return attr;
  }
  // Only include multiple if it's explicitly set to a boolean value
  const result: RuntimeAllowedAttribute = {
    name: attr.name,
    values: attr.values,
  };
  if (attr.multiple !== undefined) {
    return { ...result, multiple: attr.multiple };
  }
  return result;
};

/**
 * Convert SanitizeConfig schema to sanitize-html runtime options.
 *
 * Uses Match.value for exhaustive pattern matching on discriminated unions.
 *
 * @since 1.0.0
 * @category Conversion
 * @example
 * ```typescript
 * import { SanitizeConfig, toSanitizeOptions } from "@beep/schema/integrations/html";
 * import { sanitizeHtml } from "@beep/utils";
 *
 * const config = new SanitizeConfig({
 *   allowedTags: AllowedTags.specific(["p", "a", "strong"]),
 *   allowProtocolRelative: false,
 * });
 *
 * const options = toSanitizeOptions(config);
 * const clean = sanitizeHtml(dirty, options);
 * ```
 */
export const toSanitizeOptions = (config: SanitizeConfig): SanitizeOptions => {
  const options: Record<string, unknown> = {};

  // -------------------------------------------------------------------------
  // allowedTags
  // -------------------------------------------------------------------------
  if (config.allowedTags !== undefined) {
    options.allowedTags = Match.value(config.allowedTags).pipe(
      Match.when({ _tag: "AllTags" }, () => false as const),
      Match.when({ _tag: "NoneTags" }, () => [] as readonly string[]),
      Match.when({ _tag: "SpecificTags" }, ({ tags }) => tags),
      Match.exhaustive
    );
  }

  // -------------------------------------------------------------------------
  // allowedAttributes
  // -------------------------------------------------------------------------
  if (config.allowedAttributes !== undefined) {
    options.allowedAttributes = Match.value(config.allowedAttributes).pipe(
      Match.when({ _tag: "AllAttributes" }, () => false as const),
      Match.when({ _tag: "NoneAttributes" }, () => ({}) as Record<string, readonly RuntimeAllowedAttribute[]>),
      Match.when({ _tag: "SpecificAttributes" }, ({ attributes }) =>
        R.map(attributes, (attrs) => A.map(attrs as readonly AllowedAttribute[], allowedAttributeToRuntime))
      ),
      Match.exhaustive
    );
  }

  // -------------------------------------------------------------------------
  // disallowedTagsMode
  // -------------------------------------------------------------------------
  if (config.disallowedTagsMode !== undefined) {
    options.disallowedTagsMode = config.disallowedTagsMode;
  }

  // -------------------------------------------------------------------------
  // allowedSchemes
  // -------------------------------------------------------------------------
  if (config.allowedSchemes !== undefined) {
    options.allowedSchemes = Match.value(config.allowedSchemes).pipe(
      Match.when({ _tag: "AllSchemes" }, () => false as const),
      Match.when({ _tag: "SpecificSchemes" }, ({ schemes }) => schemes),
      Match.exhaustive
    );
  }

  // -------------------------------------------------------------------------
  // allowedSchemesByTag
  // -------------------------------------------------------------------------
  if (config.allowedSchemesByTag !== undefined) {
    options.allowedSchemesByTag = Match.value(config.allowedSchemesByTag).pipe(
      Match.when({ _tag: "AllSchemesByTag" }, () => false as const),
      Match.when({ _tag: "SpecificSchemesByTag" }, ({ byTag }) => byTag),
      Match.exhaustive
    );
  }

  // -------------------------------------------------------------------------
  // allowedSchemesAppliedToAttributes
  // -------------------------------------------------------------------------
  if (config.allowedSchemesAppliedToAttributes !== undefined) {
    options.allowedSchemesAppliedToAttributes = config.allowedSchemesAppliedToAttributes;
  }

  // -------------------------------------------------------------------------
  // allowProtocolRelative
  // -------------------------------------------------------------------------
  if (config.allowProtocolRelative !== undefined) {
    options.allowProtocolRelative = config.allowProtocolRelative;
  }

  // -------------------------------------------------------------------------
  // iframe security
  // -------------------------------------------------------------------------
  if (config.allowIframeRelativeUrls !== undefined) {
    options.allowIframeRelativeUrls = config.allowIframeRelativeUrls;
  }
  if (config.allowedIframeHostnames !== undefined) {
    options.allowedIframeHostnames = config.allowedIframeHostnames;
  }
  if (config.allowedIframeDomains !== undefined) {
    options.allowedIframeDomains = config.allowedIframeDomains;
  }

  // -------------------------------------------------------------------------
  // script security
  // -------------------------------------------------------------------------
  if (config.allowedScriptHostnames !== undefined) {
    options.allowedScriptHostnames = config.allowedScriptHostnames;
  }
  if (config.allowedScriptDomains !== undefined) {
    options.allowedScriptDomains = config.allowedScriptDomains;
  }

  // -------------------------------------------------------------------------
  // CSS/Style filtering
  // -------------------------------------------------------------------------
  if (config.parseStyleAttributes !== undefined) {
    options.parseStyleAttributes = config.parseStyleAttributes;
  }

  if (config.allowedStyles !== undefined) {
    // Convert RegExpPattern arrays to RegExp arrays
    options.allowedStyles = R.map(config.allowedStyles, (properties) =>
      R.map(properties, (patterns) => A.map(patterns as readonly RegExpPattern.Type[], toRegExp))
    );
  }

  if (config.allowedClasses !== undefined) {
    // Convert AllowedClassesForTag to runtime form
    options.allowedClasses = R.map(config.allowedClasses, (classConfig) =>
      allowedClassesForTagToRuntime(classConfig as AllowedClassesForTag)
    );
  }

  // -------------------------------------------------------------------------
  // Tag behavior
  // -------------------------------------------------------------------------
  if (config.selfClosing !== undefined) {
    options.selfClosing = config.selfClosing;
  }
  if (config.nonTextTags !== undefined) {
    options.nonTextTags = config.nonTextTags;
  }
  if (config.enforceHtmlBoundary !== undefined) {
    options.enforceHtmlBoundary = config.enforceHtmlBoundary;
  }

  // -------------------------------------------------------------------------
  // Attribute behavior
  // -------------------------------------------------------------------------
  if (config.nonBooleanAttributes !== undefined) {
    options.nonBooleanAttributes = config.nonBooleanAttributes;
  }
  if (config.allowedEmptyAttributes !== undefined) {
    options.allowedEmptyAttributes = config.allowedEmptyAttributes;
  }

  // -------------------------------------------------------------------------
  // Security flags
  // -------------------------------------------------------------------------
  if (config.allowVulnerableTags !== undefined) {
    options.allowVulnerableTags = config.allowVulnerableTags;
  }

  return options as SanitizeOptions;
};
