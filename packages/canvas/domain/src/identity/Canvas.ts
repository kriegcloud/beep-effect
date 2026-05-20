/**
 * Canvas slice-local entity identifiers.
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
 * Canvas operator entity identifier.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export const CanvasOperatorId = make("operator", {
  description: "Identifier for a canvas operator in local proof metadata.",
});

/**
 * Runtime type for {@link CanvasOperatorId}.
 *
 * @category entity-ids
 * @since 0.0.0
 */
export type CanvasOperatorId = typeof CanvasOperatorId.Type;
