/**
 * Architecture lab slice-local entity identifiers.
 *
 * @packageDocumentation
 * @category entity-ids
 * @since 0.0.0
 */

import { $ArchitectureLabDomainId } from "@beep/identity/packages";
import * as EntityId from "@beep/shared-domain/entity/EntityId";

const $I = $ArchitectureLabDomainId.create("identity/ArchitectureLab");
const make = EntityId.factory("architecture_lab", $I);

/**
 * Architecture lab Worker entity identifier.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const WorkerId = make("worker", {
  description: "Identifier for an architecture lab Worker entity.",
});

/**
 * Runtime type for {@link WorkerId}.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type WorkerId = typeof WorkerId.Type;
