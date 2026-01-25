/**
 * @module makeSanitizeSchema
 * @description Factory function for creating sanitization transformation schemas
 * @since 1.0.0
 */
import { $SchemaId } from "@beep/identity/packages";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type { SanitizeConfig } from "./sanitize-config";
import { SanitizedHtml } from "./sanitized-html";
import { toSanitizeOptions } from "./to-sanitize-options";

const $I = $SchemaId.create("integrations/html/sanitize/make-sanitize-schema");

// ============================================================================
// Input Schema
// ============================================================================

/**
 * Input schema for dirty HTML - accepts string, number, null, or undefined
 *
 * This matches sanitize-html's permissive input handling.
 *
 * @since 1.0.0
 * @category Schema
 */
export const DirtyHtml = S.Union(S.String, S.Number, S.Null, S.Undefined).annotations(
  $I.annotations("DirtyHtml", {
    title: "Dirty HTML Input",
    description: "Potentially unsafe HTML input that needs sanitization",
  })
);

export type DirtyHtml = S.Schema.Type<typeof DirtyHtml>;

// ============================================================================
// Sanitization Function Type
// ============================================================================

/**
 * Type for the sanitization function
 *
 * This allows dependency injection of the actual sanitization implementation.
 */
export type SanitizeFn = (dirty: string, options: ReturnType<typeof toSanitizeOptions>) => string;

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a transformation schema that sanitizes input to produce SanitizedHtml.
 *
 * The factory closes over the configuration and sanitization function,
 * creating a reusable schema that can be embedded in other schemas.
 *
 * @param config - The sanitization configuration
 * @param sanitize - The sanitization function (defaults to identity for schema-only usage)
 * @returns A transformation schema from DirtyHtml to SanitizedHtml
 *
 * @since 1.0.0
 * @category Factory
 * @example
 * ```typescript
 * import { makeSanitizeSchema, SanitizeConfig, AllowedTags } from "@beep/schema/integrations/html";
 * import { sanitizeHtml } from "@beep/utils";
 *
 * const config = new SanitizeConfig({
 *   allowedTags: AllowedTags.specific(["p", "strong", "em"]),
 *   allowedAttributes: AllowedAttributes.specific({}),
 * });
 *
 * const Sanitize = makeSanitizeSchema(config, sanitizeHtml);
 *
 * // Use in other schemas
 * const UserBio = S.Struct({
 *   name: S.String,
 *   bio: Sanitize,
 * });
 *
 * // Or decode directly
 * const html = S.decodeSync(Sanitize)("<p>Hello <script>xss</script></p>");
 * // Result: "<p>Hello </p>" (branded SanitizedHtml)
 * ```
 */
export const makeSanitizeSchema = (
  config: SanitizeConfig,
  sanitize?: SanitizeFn
): S.Schema<SanitizedHtml.Type, string | number | null | undefined> => {
  // Convert config to runtime options once
  const options = toSanitizeOptions(config);

  // Default sanitize function just returns the string (for schema validation only)
  const sanitizeFn: SanitizeFn = sanitize ?? ((dirty: string) => dirty);

  return S.transformOrFail(DirtyHtml, SanitizedHtml, {
    strict: true,
    decode: (dirty, _parseOptions, ast) =>
      Effect.gen(function* () {
        // Handle null/undefined → empty string
        if (dirty == null) {
          return "" as SanitizedHtml.Type;
        }

        // Coerce numbers to strings
        const input = P.isNumber(dirty) ? String(dirty) : dirty;

        // Use Effect.try to wrap potential errors from the sanitization function
        return yield* Effect.try({
          try: () => {
            const clean = sanitizeFn(input, options);
            return clean as SanitizedHtml.Type;
          },
          catch: (error) =>
            new ParseResult.Type(
              ast,
              input,
              `HTML sanitization failed: ${error instanceof Error ? error.message : String(error)}`
            ),
        });
      }),

    // Encoding: branded type → original string (identity)
    encode: (sanitized) => Effect.succeed(sanitized),
  }).annotations(
    $I.annotations("SanitizeTransform", {
      title: "HTML Sanitization Transform",
      description: "Transforms dirty HTML input into sanitized HTML according to the provided configuration",
    })
  );
};

/**
 * Creates a sanitization schema that only validates structure (no actual sanitization).
 *
 * Use this when you only need schema validation without runtime sanitization,
 * for example when defining API contracts or form schemas.
 *
 * @param config - The sanitization configuration
 * @returns A transformation schema from DirtyHtml to SanitizedHtml
 *
 * @since 1.0.0
 * @category Factory
 * @example
 * ```typescript
 * import { makeSanitizeSchemaValidateOnly, SanitizeConfig } from "@beep/schema/integrations/html";
 *
 * const config = new SanitizeConfig({ ... });
 * const ValidateSchema = makeSanitizeSchemaValidateOnly(config);
 *
 * // This only validates input type, doesn't actually sanitize
 * const html = S.decodeSync(ValidateSchema)("<p>Hello</p>");
 * ```
 */
export const makeSanitizeSchemaValidateOnly = (
  config: SanitizeConfig
): S.Schema<SanitizedHtml.Type, string | number | null | undefined> => makeSanitizeSchema(config, (dirty) => dirty);
