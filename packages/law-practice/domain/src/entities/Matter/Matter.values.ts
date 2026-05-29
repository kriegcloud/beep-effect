/**
 * Matter value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $LawPracticeDomainId.create("entities/Matter/Matter.values");

/**
 * Matter type vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { MatterType } from "@beep/law-practice-domain"
 *
 * console.log(MatterType.is.patent_application("patent_application"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const MatterType = LiteralKit(["patent_application"]).pipe(
  $I.annoteSchema("MatterType", {
    description: "Legal matter type vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link MatterType}.
 *
 * @example
 * ```ts
 * import type { MatterType } from "@beep/law-practice-domain"
 *
 * const value: MatterType = "patent_application"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type MatterType = typeof MatterType.Type;
