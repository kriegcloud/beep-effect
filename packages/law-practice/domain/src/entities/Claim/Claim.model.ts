/**
 * Patent claim entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/Claim/Claim.model");

/**
 * Patent claim context. Carries the claim number, its full text, and whether it
 * is an independent claim; pinned to the patent asset that owns it.
 *
 * @example
 * ```ts
 * import { Claim } from "@beep/law-practice-domain"
 *
 * console.log(Claim.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Claim extends BaseEntity.Class<Claim>($I`Claim`)(
  LawPractice.ClaimId,
  {
    fields: {
      claimNumber: NonNegativeInt,
      fixtureKey: S.String,
      independent: S.Boolean,
      patentAssetFixtureKey: S.String,
      text: S.String,
    },
    persisted: {
      claimNumber: EntitySchema.persist.int({
        columnName: "claim_number",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      independent: EntitySchema.persist.bool({
        columnName: "independent",
      }),
      patentAssetFixtureKey: EntitySchema.persist.text({
        columnName: "patent_asset_fixture_key",
      }),
      text: EntitySchema.persist.text({
        columnName: "text",
      }),
    },
  },
  $I.annote("Claim", {
    description: "Patent claim context.",
  })
) {}
