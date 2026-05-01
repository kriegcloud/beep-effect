/**
 * Legal matter entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";
import { MatterType } from "./Matter.values.js";

const $I = $LawPracticeDomainId.create("entities/Matter/Matter.model");

/**
 * Legal matter context.
 *
 * @example
 * ```ts
 * import { Matter } from "@beep/law-practice-domain"
 *
 * console.log(Matter.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Matter extends BaseEntity.Class<Matter>($I`Matter`)(
  LawPractice.MatterId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      legalClientFixtureKey: S.String,
      matterType: MatterType,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      legalClientFixtureKey: EntitySchema.persist.text({
        columnName: "legal_client_fixture_key",
      }),
      matterType: EntitySchema.persist.literal({
        columnName: "matter_type",
      }),
    },
  },
  $I.annote("Matter", {
    description: "Legal matter context.",
  })
) {}
