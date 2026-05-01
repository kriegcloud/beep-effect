/**
 * Household entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import { HouseholdProfilePack } from "./Household.values.js";

const $I = $WealthManagementDomainId.create("entities/Household/Household.model");

/**
 * Household context.
 *
 * @example
 * ```ts
 * import { Household } from "@beep/wealth-management-domain"
 *
 * console.log(Household)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Household extends BaseEntity.extend<Household>($I`Household`)(
  WealthManagement.HouseholdId,
  HouseholdProfilePack,
  {},
  $I.annote("Household", {
    description: "Durable wealth-management household context.",
  })
) {}
