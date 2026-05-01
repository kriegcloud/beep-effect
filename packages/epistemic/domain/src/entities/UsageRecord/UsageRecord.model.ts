/**
 * Usage record entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { UnknownRecord } from "@beep/schema";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/UsageRecord/UsageRecord.model");

/**
 * Usage attribution record for a fixture agent run.
 *
 * @example
 * ```ts
 * import { UsageRecord } from "@beep/epistemic-domain"
 *
 * console.log(UsageRecord.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class UsageRecord extends BaseEntity.Class<UsageRecord>($I`UsageRecord`)(
  Epistemic.UsageRecordId,
  {
    fields: {
      fixtureKey: S.String,
      snapshot: UnknownRecord,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      snapshot: EntitySchema.persist.jsonb({
        columnName: "snapshot",
      }),
    },
  },
  $I.annote("UsageRecord", {
    description: "Usage attribution record for a fixture agent run.",
  })
) {}
