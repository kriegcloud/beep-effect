/**
 * Candidate Claim value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ClaimLifecycle } from "@beep/epistemic-domain/values";
import { $EpistemicDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import * as S from "effect/Schema";

const $I = $EpistemicDomainId.create("entities/CandidateClaim/CandidateClaim.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the CandidateClaim entity.
 *
 * @example
 * ```ts
 * import { CandidateClaimProfileMixin } from "@beep/epistemic-domain"
 *
 * console.log(CandidateClaimProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateClaimProfileMixin = EntityMixin.make($I`CandidateClaimProfileMixin`)(
  {
    fixtureKey: S.String,
    lifecycle: ClaimLifecycle,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the CandidateClaim entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the candidate claim.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      lifecycle: {
        columnName: "lifecycle",
        description: "Candidate claim lifecycle state.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      snapshot: {
        columnName: "snapshot",
        description: "Structured candidate claim payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed CandidateClaim profile mixin.
 *
 * @example
 * ```ts
 * import { CandidateClaimProfilePack } from "@beep/epistemic-domain"
 *
 * console.log(CandidateClaimProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateClaimProfilePack = EntityMixin.pack(CandidateClaimProfileMixin);
