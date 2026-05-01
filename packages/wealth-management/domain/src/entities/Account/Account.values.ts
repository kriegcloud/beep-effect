/**
 * Account value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $WealthManagementDomainId.create("entities/Account/Account.values");

/**
 * Fixture account type vocabulary.
 *
 * @example
 * ```ts
 * import { AccountType } from "@beep/wealth-management-domain"
 *
 * console.log(AccountType.is.taxable_brokerage("taxable_brokerage"))
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AccountType = LiteralKit(["taxable_brokerage"] as const).annotate(
  $I.annote("AccountType", {
    description: "Closed fixture type vocabulary for accounts.",
  })
);

/**
 * Runtime type for {@link AccountType}.
 *
 * @example
 * ```ts
 * import type { AccountType } from "@beep/wealth-management-domain"
 *
 * const value: AccountType = "taxable_brokerage"
 * console.log(value)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type AccountType = typeof AccountType.Type;
