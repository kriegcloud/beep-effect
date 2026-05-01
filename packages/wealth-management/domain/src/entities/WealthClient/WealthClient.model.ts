/**
 * Wealth-client entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { WealthClientStatus } from "./WealthClient.values.js";

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
export class WealthClient extends BaseEntity.Class<WealthClient>($I`WealthClient`)(
  WealthManagement.WealthClientId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      householdFixtureKey: S.String,
      partyFixtureKey: S.String,
      status: WealthClientStatus,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
        indexHints: [EntitySchema.IndexHint.unique],
      }),
      householdFixtureKey: EntitySchema.persist.text({
        columnName: "household_fixture_key",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
      partyFixtureKey: EntitySchema.persist.text({
        columnName: "party_fixture_key",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
      status: EntitySchema.persist.literal({
        columnName: "status",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
    },
  },
  $I.annote("WealthClient", {
    description: "Durable wealth-management client context.",
  })
) {}
