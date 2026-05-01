/**
 * Candidate claim entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ClaimLifecycle } from "@beep/epistemic-domain/values";
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/CandidateClaim/CandidateClaim.model");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Candidate claim proposed by an agent with source evidence.
 *
 * @example
 * ```ts
 * import { CandidateClaim } from "@beep/epistemic-domain"
 *
 * console.log(CandidateClaim.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateClaim extends BaseEntity.Class<CandidateClaim>($I`CandidateClaim`)(
  Epistemic.CandidateClaimId,
  {
    fields: {
      fixtureKey: S.String,
      lifecycle: ClaimLifecycle,
      snapshot: UnknownRecord,
    },
    persisted: {
      fixtureKey: EntitySchema.persist.text({
        columnName: "fixture_key",
      }),
      lifecycle: EntitySchema.persist.literal({
        columnName: "lifecycle",
      }),
      snapshot: EntitySchema.persist.jsonb({
        columnName: "snapshot",
      }),
    },
  },
  $I.annote("CandidateClaim", {
    description: "Candidate claim proposed by an agent with source evidence.",
  })
) {}
