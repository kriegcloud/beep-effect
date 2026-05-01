/**
 * Account entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import { AccountProfilePack } from "./Account.values.js";

const $I = $WealthManagementDomainId.create("entities/Account/Account.model");

/**
 * Account reference context.
 *
 * @example
 * ```ts
 * import { Account } from "@beep/wealth-management-domain"
 *
 * console.log(Account)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Account extends BaseEntity.extend<Account>($I`Account`)(
  WealthManagement.AccountId,
  AccountProfilePack,
  {},
  $I.annote("Account", {
    description: "Durable wealth-management account reference context.",
  })
) {}
