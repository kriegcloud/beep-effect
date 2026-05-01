/**
 * Activity entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/Activity/Activity.model");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Provenance activity produced by the runtime proof.
 *
 * @example
 * ```ts
 * import { Activity } from "@beep/epistemic-domain"
 *
 * console.log(Activity.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Activity extends BaseEntity.Class<Activity>($I`Activity`)(
  Epistemic.ActivityId,
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
  $I.annote("Activity", {
    description: "Provenance activity produced by the runtime proof.",
  })
) {}
