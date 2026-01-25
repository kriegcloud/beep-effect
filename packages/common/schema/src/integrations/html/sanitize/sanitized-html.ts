/**
 * @module SanitizedHtml
 * @description Branded string type for sanitized HTML
 * @since 1.0.0
 */
import type * as B from "effect/Brand";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";

/**
 * Brand for HTML strings that have been sanitized according to a security policy.
 *
 * @since 1.0.0
 * @category Brands
 */
export type SanitizedHtmlBrand = B.Brand<"SanitizedHtml">;

/**
 * A string that has been sanitized to remove potentially dangerous HTML.
 *
 * This branded type ensures that HTML content has passed through a sanitization
 * pipeline before being rendered in the browser or stored in the database.
 *
 * @since 1.0.0
 * @category Schema
 * @example
 * ```typescript
 * import { SanitizedHtml } from "@beep/schema/integrations/html";
 *
 * // Type error: cannot pass plain string where SanitizedHtml expected
 * function render(html: SanitizedHtml.Type) {
 *   document.body.innerHTML = html;
 * }
 *
 * render("<p>unsafe</p>");  // Type error!
 *
 * // Must use unsafe constructor or decode through sanitization schema
 * const safeHtml = SanitizedHtml.unsafe("<p>Safe content</p>");
 * render(safeHtml);  // OK - branded type
 * ```
 */
export const SanitizedHtmlSchema: S.BrandSchema<string & SanitizedHtmlBrand, string, never> = S.String.pipe(
  S.brand("SanitizedHtml"),
  S.annotations({
    identifier: "@beep/schema/integrations/html/sanitize/sanitized-html/SanitizedHtml",
    title: "Sanitized HTML",
    description:
      "HTML string that has been sanitized to remove potentially dangerous content according to a security policy. Safe for rendering in the browser.",
  })
);

/**
 * Type alias for SanitizedHtml branded type
 * @since 1.0.0
 */
export type SanitizedHtml = S.Schema.Type<typeof SanitizedHtmlSchema>;

/**
 * Namespace for SanitizedHtml utilities and type aliases.
 *
 * @since 1.0.0
 * @category Namespace
 */
export declare namespace SanitizedHtml {
  /**
   * Decoded type (runtime representation).
   * @since 1.0.0
   */
  export type Type = string & SanitizedHtmlBrand;

  /**
   * Encoded type (wire format).
   * @since 1.0.0
   */
  export type Encoded = string;
}

/**
 * Type guard for SanitizedHtml brand.
 *
 * Note: At runtime, this checks if the value is a string. The brand
 * is a TypeScript-only construct and cannot be detected at runtime.
 * This guard is primarily useful for narrowing types in conditional code.
 *
 * @since 1.0.0
 * @category Guards
 */
const isSanitizedHtml = (u: unknown): u is SanitizedHtml.Type => P.isString(u);

/**
 * Unsafe constructor - bypass sanitization for testing or pre-sanitized content.
 *
 * **WARNING**: Only use this when you have absolute certainty that the input
 * is already sanitized or in controlled test environments. Misuse can introduce
 * XSS vulnerabilities.
 *
 * @since 1.0.0
 * @category Unsafe
 * @example
 * ```typescript
 * // Testing scenario
 * const mockHtml = SanitizedHtml.unsafe("<p>Test content</p>");
 *
 * // Pre-sanitized content from trusted source
 * const trustedHtml = SanitizedHtml.unsafe(contentFromCMS);
 * ```
 */
const unsafeSanitizedHtml = (html: string): SanitizedHtml.Type => html as SanitizedHtml.Type;

/**
 * SanitizedHtml branded schema with utility functions
 *
 * @since 1.0.0
 * @category Schema
 */
export const SanitizedHtml: typeof SanitizedHtmlSchema & {
  readonly Type: SanitizedHtml.Type;
  readonly Encoded: SanitizedHtml.Encoded;
  readonly is: (u: unknown) => u is SanitizedHtml.Type;
  readonly unsafe: (html: string) => SanitizedHtml.Type;
} = Object.assign(SanitizedHtmlSchema, {
  Type: undefined as unknown as SanitizedHtml.Type,
  Encoded: undefined as unknown as SanitizedHtml.Encoded,
  is: isSanitizedHtml,
  unsafe: unsafeSanitizedHtml,
});
