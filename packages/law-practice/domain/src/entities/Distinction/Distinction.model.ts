/**
 * Distinction entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $LawPracticeDomainId } from "@beep/identity/packages";
import { TextAnchor } from "@beep/provenance";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as LawPractice from "@beep/shared-domain/identity/LawPractice";
import { ClaimLifecycle } from "@beep/shared-domain/values/ClaimLifecycle";
import * as S from "effect/Schema";
import { DistinctionDetail } from "./Distinction.values.ts";

const $I = $LawPracticeDomainId.create("entities/Distinction/Distinction.model");

/**
 * A distinction asserted to overcome a rejection: the argued
 * {@link DistinctionDetail} (e.g. a missing limitation), anchored to the source
 * text via a {@link TextAnchor}, carrying its admission
 * {@link ClaimLifecycle} state. Pinned to the claim it defends and the rejection
 * it answers. Both the lifecycle literal and the JSONB-persisted anchor and
 * detail survive storage.
 *
 * @example
 * ```ts
 * import { Distinction } from "@beep/law-practice-domain"
 *
 * console.log(Distinction.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Distinction extends BaseEntity.Class<Distinction>($I`Distinction`)(
  LawPractice.DistinctionId,
  {
    fields: {
      anchor: TextAnchor,
      claimFixtureKey: S.String,
      detail: DistinctionDetail,
      fixtureKey: S.String,
      lifecycleState: ClaimLifecycle,
      rejectionFixtureKey: S.String,
    },
    persisted: {
      anchor: EntitySchema.persist.jsonb({
        columnName: "anchor",
      }),
      claimFixtureKey: EntitySchema.persist.text({
        columnName: "claim_fixture_key",
      }),
      detail: EntitySchema.persist.jsonb({
        columnName: "detail",
      }),
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      lifecycleState: EntitySchema.persist.literal({
        columnName: "lifecycle_state",
      }),
      rejectionFixtureKey: EntitySchema.persist.text({
        columnName: "rejection_fixture_key",
      }),
    },
  },
  $I.annote("Distinction", {
    description: "A distinction asserted to overcome a rejection.",
  })
) {}
