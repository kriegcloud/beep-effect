/**
 * Approval gate entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import * as EntitySchema from "@beep/schema/EntitySchema";
import * as S from "effect/Schema";
import { ApprovalDecision, CandidateLifecycle } from "@beep/workspace-domain/values";

const $I = $WorkspaceDomainId.create("entities/ApprovalGate/ApprovalGate.model");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Human approval gate for candidate work.
 *
 * @example
 * ```ts
 * import { ApprovalGate } from "@beep/workspace-domain"
 *
 * console.log(ApprovalGate.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ApprovalGate extends BaseEntity.Class<ApprovalGate>($I`ApprovalGate`)(
  Workspace.ApprovalGateId,
  {
    fields: {
      decision: ApprovalDecision,
      fixtureKey: S.String,
      lifecycle: CandidateLifecycle,
      snapshot: UnknownRecord,
    },
    persisted: {
      decision: EntitySchema.persist.literal({
        columnName: "decision",
      }),
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
  $I.annote("ApprovalGate", {
    description: "Human approval gate for candidate work.",
  })
) {}
