/**
 * Candidate Project value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import { CandidateLifecycle } from "@beep/workspace-domain/values";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/CandidateProject/CandidateProject.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the CandidateProject entity.
 *
 * @example
 * ```ts
 * import { CandidateProjectProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(CandidateProjectProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateProjectProfileMixin = EntityMixin.make($I`CandidateProjectProfileMixin`)(
  {
    fixtureKey: S.String,
    lifecycle: CandidateLifecycle,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the CandidateProject entity.",
    fields: {
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the candidate project.",
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
        description: "Structured candidate project payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed CandidateProject profile mixin.
 *
 * @example
 * ```ts
 * import { CandidateProjectProfilePack } from "@beep/workspace-domain"
 *
 * console.log(CandidateProjectProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CandidateProjectProfilePack = EntityMixin.pack(CandidateProjectProfileMixin);
