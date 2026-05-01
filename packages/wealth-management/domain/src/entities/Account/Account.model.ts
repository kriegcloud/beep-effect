/**
 * Account entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { AccountType } from "./Account.values.js";

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
export class Account extends BaseEntity.Class<Account>($I`Account`)(
  WealthManagement.AccountId,
  {
    fields: {
      accountType: AccountType,
      externalLabel: S.String,
      fixtureKey: S.String,
      householdFixtureKey: S.String,
    },
    persisted: {
      accountType: EntitySchema.persist.literal({
        columnName: "account_type",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
      externalLabel: EntitySchema.persist.text({
        columnName: "external_label",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
        indexHints: [EntitySchema.IndexHint.unique],
      }),
      householdFixtureKey: EntitySchema.persist.text({
        columnName: "household_fixture_key",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
    },
  },
  $I.annote("Account", {
    description: "Durable wealth-management account reference context.",
  })
) {}
