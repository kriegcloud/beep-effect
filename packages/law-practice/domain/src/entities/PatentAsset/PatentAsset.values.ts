/**
 * Patent asset value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $LawPracticeDomainId.create("entities/PatentAsset/PatentAsset.values");

/**
 * Patent asset status vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { PatentAssetStatus } from "@beep/law-practice-domain"
 *
 * console.log(PatentAssetStatus.is.pre_filing("pre_filing"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const PatentAssetStatus = LiteralKit(["pre_filing"] as const).annotate(
  $I.annote("PatentAssetStatus", {
    description: "Patent asset status vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link PatentAssetStatus}.
 *
 * @example
 * ```ts
 * import type { PatentAssetStatus } from "@beep/law-practice-domain"
 *
 * const value: PatentAssetStatus = "pre_filing"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type PatentAssetStatus = typeof PatentAssetStatus.Type;
