/**
 * Base object-set marker interface used for shared generic wiring.
 *
 * @since 0.0.0
 * @module @beep/ontology/objectSet/BaseObjectSet
 */
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
/**
 * Minimal object-set metadata carrier.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export interface BaseObjectSet<Q extends ObjectOrInterfaceDefinition> {
  readonly $objectSetInternals: { readonly def: Q };
}
