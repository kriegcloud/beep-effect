/**
 * Evidence entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { EvidenceProfilePack } from "./Evidence.values.js";

const $I = $EpistemicDomainId.create("entities/Evidence/Evidence.model");

/**
 * Source span evidence reference.
 *
 * @example
 * ```ts
 * import { Evidence } from "@beep/epistemic-domain"
 *
 * console.log(Evidence.definition.entityId.resource)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Evidence extends BaseEntity.extend<Evidence>($I`Evidence`)(
  Epistemic.EvidenceId,
  EvidenceProfilePack,
  {},
  $I.annote("Evidence", {
    description: "Source span evidence reference.",
  })
) {}
