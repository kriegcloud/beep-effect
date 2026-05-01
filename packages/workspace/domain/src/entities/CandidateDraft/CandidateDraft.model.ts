/**
 * Candidate draft entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $WorkspaceDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Workspace from "@beep/shared-domain/identity/Workspace";
import { CandidateDraftProfilePack } from "./CandidateDraft.values.js";

const $I = $WorkspaceDomainId.create("entities/CandidateDraft/CandidateDraft.model");

/**
 * Candidate draft artifact proposed by an agent.
 *
 * @example
 * ```ts
 * import { CandidateDraft } from "@beep/workspace-domain"
 *
 * console.log(CandidateDraft.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateDraft extends BaseEntity.extend<CandidateDraft>($I`CandidateDraft`)(
  Workspace.CandidateDraftId,
  CandidateDraftProfilePack,
  {},
  $I.annote("CandidateDraft", {
    description: "Candidate draft artifact proposed by an agent.",
  })
) {}
