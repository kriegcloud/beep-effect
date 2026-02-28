/**
 * Backward-compatible aliases for ontology object model surfaces.
 *
 * @since 0.0.0
 * @module @beep/ontology/OntologyObject
 */

import type { OsdkObject } from "./OsdkObject.js";

/**
 * Legacy alias for {@link OsdkObject}.
 *
 * @since 0.0.0
 * @category aliases
 */
export type OntologyObject<N extends string> = OsdkObject<N>;

export type {
  /** @since 0.0.0 */
  OsdkObject,
} from "./OsdkObject.js";
