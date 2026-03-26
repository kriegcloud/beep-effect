/**
 * Semantic version schema helpers for strings shaped like `MAJOR.MINOR.PATCH`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SemanticVersion } from "@beep/schema/SemanticVersion";
 *
 * const version = S.decodeUnknownSync(SemanticVersion)("1.24.0");
 *
 * console.log(version);
 * ```
 *
 * @module @beep/schema/SemanticVersion
 * @since 0.0.0
 */
import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("SemanticVersion");
const semanticVersionSegmentPattern = /^(?:0|[1-9]\d*)$/;
const SemanticVersionSegment = S.String.check(
  S.isPattern(semanticVersionSegmentPattern, {
    message: "Semantic version segments must be non-negative integers without leading zeroes",
  })
);

/**
 * A Semantic Versioning (SemVer) schema for validating `MAJOR.MINOR.PATCH` version strings.
 *
 * Each segment must be a non-negative integer, and multi-digit segments may not start with `0`.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { SemanticVersion } from "@beep/schema/SemanticVersion";
 *
 * S.decodeUnknownSync(SemanticVersion)("0.1.2");
 * S.decodeUnknownSync(SemanticVersion)("12.34.56");
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export const SemanticVersion = S.TemplateLiteral([
  SemanticVersionSegment,
  ".",
  SemanticVersionSegment,
  ".",
  SemanticVersionSegment,
]).pipe(
  $I.annoteSchema("SemanticVersion", {
    description: "A semantic version string in the format x.y.z",
  })
);

/**
 * Type for {@link SemanticVersion}. {@inheritDoc SemanticVersion}
 *
 * @example
 * ```typescript
 * import type { SemanticVersion } from "@beep/schema/SemanticVersion";
 *
 * const currentVersion: SemanticVersion = "2.3.4";
 * console.log(currentVersion);
 * ```
 *
 * @category Validation
 * @since 0.0.0
 */
export type SemanticVersion = typeof SemanticVersion.Type;
