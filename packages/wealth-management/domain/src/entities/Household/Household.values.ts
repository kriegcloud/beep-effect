/**
 * Household value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $WealthManagementDomainId.create("entities/Household/Household.values");

/**
 * Fixture household status vocabulary.
 *
 * @example
 * ```ts
 * import { HouseholdStatus } from "@beep/wealth-management-domain"
 *
 * console.log(HouseholdStatus.is.active("active"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const HouseholdStatus = LiteralKit(["active"]).pipe(
  $I.annoteSchema("HouseholdStatus", {
    description: "Closed fixture status vocabulary for households.",
  })
);

/**
 * Runtime type for {@link HouseholdStatus}.
 *
 * @example
 * ```ts
 * import type { HouseholdStatus } from "@beep/wealth-management-domain"
 *
 * const value: HouseholdStatus = "active"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type HouseholdStatus = typeof HouseholdStatus.Type;
