/**
 * Approval Gate value schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntityMixin from "@beep/shared-domain/entity/EntityMixin";
import { ApprovalDecision, CandidateLifecycle } from "@beep/workspace-domain/values";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/ApprovalGate/ApprovalGate.values");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Entity-specific fields contributed to the ApprovalGate entity.
 *
 * @example
 * ```ts
 * import { ApprovalGateProfileMixin } from "@beep/workspace-domain"
 *
 * console.log(ApprovalGateProfileMixin)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ApprovalGateProfileMixin = EntityMixin.make($I`ApprovalGateProfileMixin`)(
  {
    decision: ApprovalDecision,
    fixtureKey: S.String,
    lifecycle: CandidateLifecycle,
    snapshot: UnknownRecord,
  },
  {
    description: "Runtime proof fields owned by the ApprovalGate entity.",
    fields: {
      decision: {
        columnName: "decision",
        description: "Current human review decision for the gate.",
        nullable: false,
        storageKind: "literal",
        valueStrategy: "provided",
      },
      fixtureKey: {
        columnName: "fixture_key",
        description: "Stable fixture identifier for the approval gate.",
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
        description: "Structured approval gate payload retained by the proof.",
        nullable: false,
        storageKind: "json",
        valueStrategy: "provided",
      },
    },
  }
);

/**
 * Packed ApprovalGate profile mixin.
 *
 * @example
 * ```ts
 * import { ApprovalGateProfilePack } from "@beep/workspace-domain"
 *
 * console.log(ApprovalGateProfilePack)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const ApprovalGateProfilePack = EntityMixin.pack(ApprovalGateProfileMixin);
