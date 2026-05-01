/**
 * Activity entity model.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $EpistemicDomainId } from "@beep/identity/packages";
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity";
import * as Epistemic from "@beep/shared-domain/identity/Epistemic";
import { ActivityProfilePack } from "./Activity.values.js";

const $I = $EpistemicDomainId.create("entities/Activity/Activity.model");

/**
 * Provenance activity produced by the runtime proof.
 *
 * @example
 * ```ts
 * import { Activity } from "@beep/epistemic-domain"
 *
 * console.log(Activity.definition.entityId.entityType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Activity extends BaseEntity.extend<Activity>($I`Activity`)(
  Epistemic.ActivityId,
  ActivityProfilePack,
  {},
  $I.annote("Activity", {
    description: "Provenance activity produced by the runtime proof.",
  })
) {}
