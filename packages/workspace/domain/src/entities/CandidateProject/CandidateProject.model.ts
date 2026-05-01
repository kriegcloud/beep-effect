/**
 * Candidate project entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import * as EntitySchema from "@beep/schema/EntitySchema";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { CandidateLifecycle } from "@beep/workspace-domain/values";
import * as S from "effect/Schema";

const $I = $WorkspaceDomainId.create("entities/CandidateProject/CandidateProject.model");

const UnknownRecord = S.Record(S.String, S.Unknown);

/**
 * Candidate project proposed by an agent.
 *
 * @example
 * ```ts
 * import { CandidateProject } from "@beep/workspace-domain"
 *
 * console.log(CandidateProject.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateProject extends BaseEntity.Class<CandidateProject>($I`CandidateProject`)(
  Workspace.CandidateProjectId,
  {
    fields: {
      fixtureKey: S.String,
      lifecycle: CandidateLifecycle,
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
  $I.annote("CandidateProject", {
    description: "Candidate project proposed by an agent.",
  })
) {}
