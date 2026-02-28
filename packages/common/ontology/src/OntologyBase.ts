/**
 * Backward-compatible aliases for base ontology model surfaces.
 *
 * @since 0.0.0
 * @module @beep/ontology/OntologyBase
 */

import type { OsdkBase } from "./OsdkBase.js";
import type { ObjectOrInterfaceDefinition } from "./ontology/ObjectOrInterface.js";

/**
 * Legacy alias for {@link OsdkBase}.
 *
 * @since 0.0.0
 * @category aliases
 */
export type OntologyBase<Q extends ObjectOrInterfaceDefinition> = OsdkBase<Q>;

export type {
  /** @since 0.0.0 */
  ObjectIdentifiers,
  /** @since 0.0.0 */
  OsdkBase,
  /** @since 0.0.0 */
  PrimaryKeyType,
} from "./OsdkBase.js";
