/**
 * Candidate task entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { CandidateTaskProfilePack } from "./CandidateTask.values.js";

const $I = $WorkspaceDomainId.create("entities/CandidateTask/CandidateTask.model");

/**
 * Candidate task proposed by an agent.
 *
 * @example
 * ```ts
 * import { CandidateTask } from "@beep/workspace-domain"
 *
 * console.log(CandidateTask.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateTask extends BaseEntity.extend<CandidateTask>($I`CandidateTask`)(
  Workspace.CandidateTaskId,
  CandidateTaskProfilePack,
  {},
  $I.annote("CandidateTask", {
    description: "Candidate task proposed by an agent.",
  })
) {}
