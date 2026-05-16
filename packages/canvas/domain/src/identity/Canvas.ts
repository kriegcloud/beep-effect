/**
 * Architecture lab slice-local entity identifiers.
 *
 * @packageDocumentation
 * @category entity-ids
 * @since 0.0.0
 */

import { $CanvasDomainId } from "@beep/identity/packages";
import * as EntityId from "@beep/shared-domain/entity/EntityId";

const $I = $CanvasDomainId.create("identity/Canvas");
const make = EntityId.factory("canvas", $I);

/**
 * Architecture lab Worker entity identifier.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const WorkerId = make("worker", {
  description: "Identifier for an canvas Worker entity.",
});

/**
 * Runtime type for {@link WorkerId}.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type WorkerId = typeof WorkerId.Type;
