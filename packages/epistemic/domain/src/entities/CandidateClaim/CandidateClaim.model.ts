/**
 * Candidate claim entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { CandidateClaimProfilePack } from "./CandidateClaim.values.js";

const $I = $EpistemicDomainId.create("entities/CandidateClaim/CandidateClaim.model");

/**
 * Candidate claim proposed by an agent with source evidence.
 *
 * @example
 * ```ts
 * import { CandidateClaim } from "@beep/epistemic-domain"
 *
 * console.log(CandidateClaim.definition.entityId.tableName)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CandidateClaim extends BaseEntity.extend<CandidateClaim>($I`CandidateClaim`)(
  Epistemic.CandidateClaimId,
  CandidateClaimProfilePack,
  {},
  $I.annote("CandidateClaim", {
    description: "Candidate claim proposed by an agent with source evidence.",
  })
) {}
