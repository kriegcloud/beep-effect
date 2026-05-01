/**
 * Party entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WealthManagementDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement";
import * as S from "effect/Schema";
import { PartyType } from "./Party.values.js";

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
export class Party extends BaseEntity.Class<Party>($I`Party`)(
  WealthManagement.PartyId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      partyType: PartyType,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
        indexHints: [EntitySchema.IndexHint.unique],
      }),
      partyType: EntitySchema.persist.literal({
        columnName: "party_type",
        indexHints: [EntitySchema.IndexHint.lookup],
      }),
    },
  },
  $I.annote("Party", {
    description: "Durable wealth-management party context.",
  })
) {}
