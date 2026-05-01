/**
 * Household entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { HouseholdStatus } from "./Household.values.js";

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
export class Household extends BaseEntity.Class<Household>($I`Household`)(
  WealthManagement.HouseholdId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      status: HouseholdStatus,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
        indexHints: [EntitySchema.IndexHint.unique],
      }),
      status: EntitySchema.persist.literal({
        columnName: "status",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
    },
  },
  $I.annote("Household", {
    description: "Durable wealth-management household context.",
  })
) {}
