/**
 * Candidate Draft value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import { CandidateLifecycle } from "@beep/workspace-domain/values";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/CandidateDraft/CandidateDraft.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the CandidateDraft entity.
 *
 * @example
 * ```ts
 * import { CandidateDraftProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(CandidateDraftProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateDraftProfileMixin = EntityMixin.make($I`CandidateDraftProfileMixin`)(
  {
    fixtureKey: S.String,
    lifecycle: CandidateLifecycle,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the CandidateDraft entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the candidate draft.",
        nullable: false,
        storageKind: "text",
        valueStrategy: "provided",
      },
      lifecycle: {
        columnName: "lifecycle",
        description: "Candidate lifecycle state.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      snapshot: {
        columnName: "snapshot",
        description: "Structured candidate draft payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed CandidateDraft profile mixin.
 *
 * @example
 * ```ts
 * import { CandidateDraftProfilePack } from "@beep/workspace-domain"
 *
 * console.log(CandidateDraftProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateDraftProfilePack = EntityMixin.pack(CandidateDraftProfileMixin);
