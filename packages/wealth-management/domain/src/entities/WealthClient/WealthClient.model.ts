/**
 * Wealth-client entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import { WealthClientProfilePack } from "./WealthClient.values.js";

const $I = $WealthManagementDomainId.create("entities/WealthClient/WealthClient.model");

/**
 * Wealth client context.
 *
 * @example
 * ```ts
 * import { WealthClient } from "@beep/wealth-management-domain"
 *
 * console.log(WealthClient)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class WealthClient extends BaseEntity.extend<WealthClient>($I`WealthClient`)(
  WealthManagement.WealthClientId,
  WealthClientProfilePack,
  {},
  $I.annote("WealthClient", {
    description: "Durable wealth-management client context.",
  })
) {}
