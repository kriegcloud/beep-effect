/**
 * Backward-compatible aliases for ontology object primary key helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/OntologyObjectPrimaryKey
 */

import type { OsdkObjectPrimaryKeyType } from "./OsdkObjectPrimaryKeyType.js";

/**
 * Legacy alias for {@link OsdkObjectPrimaryKeyType}.
 *
 * @since 0.0.0
 * @category aliases
 */
export type OntologyObjectPrimaryKey<Q> = OsdkObjectPrimaryKeyType<Q>;

export type {
  /** @since 0.0.0 */
  OsdkObjectPrimaryKeyType,
} from "./OsdkObjectPrimaryKeyType.js";
