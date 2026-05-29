/**
 * Legal client value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $LawPracticeDomainId.create("entities/LegalClient/LegalClient.values");

/**
 * Legal client status vocabulary represented in proof seeds.
 *
 * @example
 * ```ts
 * import { LegalClientStatus } from "@beep/law-practice-domain"
 *
 * console.log(LegalClientStatus.is.active_client("active_client"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const LegalClientStatus = LiteralKit(["active_client"]).annotate(
  $I.annote("LegalClientStatus", {
    description: "Legal client status vocabulary represented in proof seeds.",
  })
);

/**
 * Runtime type for {@link LegalClientStatus}.
 *
 * @example
 * ```ts
 * import type { LegalClientStatus } from "@beep/law-practice-domain"
 *
 * const value: LegalClientStatus = "active_client"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type LegalClientStatus = typeof LegalClientStatus.Type;
