/**
 * Account value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

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

/**
 * Account profile mixin contributed through EntityMixin metadata.
 *
 * @example
 * ```ts
 * import { AccountProfileMixin } from "@beep/wealth-management-domain"
 *
 * console.log(AccountProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AccountProfileMixin = EntityMixin.make($I`AccountProfileMixin`)(
  {
    accountType: AccountType,
    externalLabel: S.String,
    fixtureKey: S.String,
    householdFixtureKey: S.String,
  },
  {
    description: "Persisted fields owned by the account entity.",
    fields: {
      accountType: {
        columnName: "account_type",
        description: "Fixture account type.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      externalLabel: {
        columnName: "external_label",
        description: "External label for the account.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Deterministic fixture key for the account.",
        indexHints: [EntityMixin.IndexHint.unique],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      householdFixtureKey: {
        columnName: "household_fixture_key",
        description: "Fixture key for the household associated with this account.",
        indexHints: [EntityMixin.IndexHint.lookup],
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Account profile pack used by entity and table constructors.
 *
 * @example
 * ```ts
 * import { AccountProfilePack } from "@beep/wealth-management-domain"
 *
 * console.log(AccountProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AccountProfilePack = EntityMixin.pack(AccountProfileMixin);
