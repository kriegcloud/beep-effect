/**
 * Legal client entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import * as S from "effect/Schema";
import { LegalClientStatus } from "./LegalClient.values.ts";

const $I = $LawPracticeDomainId.create("entities/LegalClient/LegalClient.model");

/**
 * Legal client context.
 *
 * @example
 * ```ts
 * import { LegalClient } from "@beep/law-practice-domain"
 *
 * console.log(LegalClient.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LegalClient extends BaseEntity.Class<LegalClient>($I`LegalClient`)(
  LawPractice.LegalClientId,
  {
    fields: {
      displayName: S.String,
      fixtureKey: S.String,
      status: LegalClientStatus,
    },
    persisted: {
      displayName: EntitySchema.persist.text({
        columnName: "display_name",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      status: EntitySchema.persist.literal({
        columnName: "status",
      }),
    },
  },
  $I.annote("LegalClient", {
    description: "Legal client context.",
  })
) {}
