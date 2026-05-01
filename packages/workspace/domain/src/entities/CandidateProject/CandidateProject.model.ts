/**
 * Candidate project entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { CandidateProjectProfilePack } from "./CandidateProject.values.js";

const $I = $WorkspaceDomainId.create("entities/CandidateProject/CandidateProject.model");

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
export class CandidateProject extends BaseEntity.extend<CandidateProject>($I`CandidateProject`)(
  Workspace.CandidateProjectId,
  CandidateProjectProfilePack,
  {},
  $I.annote("CandidateProject", {
    description: "Candidate project proposed by an agent.",
  })
) {}
