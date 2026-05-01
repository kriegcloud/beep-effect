/**
 * Candidate Task value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import { CandidateLifecycle } from "@beep/workspace-domain/values";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/CandidateTask/CandidateTask.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the CandidateTask entity.
 *
 * @example
 * ```ts
 * import { CandidateTaskProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(CandidateTaskProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateTaskProfileMixin = EntityMixin.make($I`CandidateTaskProfileMixin`)(
  {
    fixtureKey: S.String,
    lifecycle: CandidateLifecycle,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the CandidateTask entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the candidate task.",
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
        description: "Structured candidate task payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed CandidateTask profile mixin.
 *
 * @example
 * ```ts
 * import { CandidateTaskProfilePack } from "@beep/workspace-domain"
 *
 * console.log(CandidateTaskProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateTaskProfilePack = EntityMixin.pack(CandidateTaskProfileMixin);
