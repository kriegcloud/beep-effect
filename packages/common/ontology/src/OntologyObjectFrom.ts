/**
 * Backward-compatible aliases for ontology object constructor helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/OntologyObjectFrom
 */

import type { Osdk } from "./OsdkObjectFrom.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "./ontology/ObjectOrInterface.js";

/**
 * Legacy alias for {@link Osdk.Instance}.
 *
 * @since 0.0.0
 * @category aliases
 */
export type OntologyObjectFrom<
  Q extends ObjectOrInterfaceDefinition,
  OPTIONS extends never | "$rid" | "$allBaseProperties" | "$propertySecurities" = never,
  K extends string = PropertyKeys<Q>,
> = Osdk.Instance<Q, OPTIONS, K>;

/** @since 0.0.0 */
export * from "./OsdkObjectFrom.js";
