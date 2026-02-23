/**
 * Semantic version schema helpers for strings shaped like `MAJOR.MINOR.PATCH`.
 *
 * Provides a branded literal schema for packaging metadata and config migrations.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { SemanticVersion } from "@beep/schema/primitives/string/semantic-version";
 *
 * const parsed = S.decodeSync(SemanticVersion)("1.2.3");
 *
 * @category Primitives/String
 * @since 0.1.0
 */

import { $SchemaId } from "@beep/identity/packages";
import type * as B from "effect/Brand";
import * as S from "effect/Schema";

const $I = $SchemaId.create("primitives/string/semantic-version");
/**
 * Semantic version schema using template literal composition.
 *
 * @example
 * import * as S from "effect/Schema";
 * import { SemanticVersion } from "@beep/schema/primitives/string/semantic-version";
 *
 * S.decodeSync(SemanticVersion)("0.0.1");
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export const SemanticVersion = S.TemplateLiteral(S.Number, ".", S.Number, ".", S.Number)
  .pipe(S.brand("SemanticVersion"))
  .annotations(
    $I.annotations("semantic-version/SemanticVersion", {
      description: "A value representing a semantic version",
      examples: [
        "1.0.0" as B.Branded<`${number}.${number}.${number}`, "SemanticVersion">,
        "2.1.0" as B.Branded<`${number}.${number}.${number}`, "SemanticVersion">,
        "3.0.1" as B.Branded<`${number}.${number}.${number}`, "SemanticVersion">,
      ],
    })
  );

/**
 * Namespace exposing helper types for the semantic version schema.
 *
 * @example
 * import type { SemanticVersion } from "@beep/schema/primitives/string/semantic-version";
 *
 * type SemanticVersionValue = SemanticVersion.Type;
 *
 * @category Primitives/String
 * @since 0.1.0
 */
export declare namespace SemanticVersion {
  /**
   * Runtime type produced by the semantic version schema.
   *
   * @example
   * import type { SemanticVersion } from "@beep/schema/primitives/string/semantic-version";
   *
   * let version: SemanticVersion.Type;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Type = S.Schema.Type<typeof SemanticVersion>;
  /**
   * Encoded representation accepted by the semantic version schema.
   *
   * @example
   * import type { SemanticVersion } from "@beep/schema/primitives/string/semantic-version";
   *
   * let encoded: SemanticVersion.Encoded;
   *
   * @category Primitives/String
   * @since 0.1.0
   */
  export type Encoded = S.Schema.Encoded<typeof SemanticVersion>;
}
