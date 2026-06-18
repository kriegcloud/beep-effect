/**
 * Office action entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";

const $I = $LawPracticeDomainId.create("entities/OfficeAction/OfficeAction.model");

/**
 * USPTO office action context. Pinned to the matter it prosecutes (the matter
 * wall) and the patent asset under examination, plus the bare application number
 * carried on the action.
 *
 * @example
 * ```ts
 * import { OfficeAction } from "@beep/law-practice-domain"
 *
 * console.log(OfficeAction.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class OfficeAction extends BaseEntity.Class<OfficeAction>($I`OfficeAction`)(
  LawPractice.OfficeActionId,
  {
    fields: {
      applicationNumber: S.String,
      fixtureKey: S.String,
      matterFixtureKey: S.String,
      patentAssetFixtureKey: S.String,
    },
    persisted: {
      applicationNumber: EntitySchema.persist.text({
        columnName: "application_number",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      matterFixtureKey: EntitySchema.persist.text({
        columnName: "matter_fixture_key",
      }),
      patentAssetFixtureKey: EntitySchema.persist.text({
        columnName: "patent_asset_fixture_key",
      }),
    },
  },
  $I.annote("OfficeAction", {
    description: "USPTO office action context.",
  })
) {}
