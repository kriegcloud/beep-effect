/**
 * Party entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import { PartyProfilePack } from "./Party.values.js";

const $I = $WealthManagementDomainId.create("entities/Party/Party.model");

/**
 * Party context.
 *
 * @example
 * ```ts
 * import { Party } from "@beep/wealth-management-domain"
 *
 * console.log(Party)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Party extends BaseEntity.extend<Party>($I`Party`)(
  WealthManagement.PartyId,
  PartyProfilePack,
  {},
  $I.annote("Party", {
    description: "Durable wealth-management party context.",
  })
) {}
