/**
 * Patent asset entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";
import { PatentAssetStatus } from "./PatentAsset.values.js";

const $I = $LawPracticeDomainId.create("entities/PatentAsset/PatentAsset.model");

/**
 * Patent asset context.
 *
 * @example
 * ```ts
 * import { PatentAsset } from "@beep/law-practice-domain"
 *
 * console.log(PatentAsset.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class PatentAsset extends BaseEntity.Class<PatentAsset>($I`PatentAsset`)(
  LawPractice.PatentAssetId,
  {
    fields: {
      fixtureKey: S.String,
      matterFixtureKey: S.String,
      status: PatentAssetStatus,
      title: S.String,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      matterFixtureKey: EntitySchema.persist.text({
        columnName: "matter_fixture_key",
      }),
      status: EntitySchema.persist.literal({
        columnName: "status",
      }),
      title: EntitySchema.persist.text({
        columnName: "title",
      }),
    },
  },
  $I.annote("PatentAsset", {
    description: "Patent asset context.",
  })
) {}
