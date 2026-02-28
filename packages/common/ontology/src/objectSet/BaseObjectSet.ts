/**
 * Base object-set marker interface used for shared generic wiring.
 *
 * @since 0.0.0
 * @module @beep/ontology/objectSet/BaseObjectSet
 */
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import { $OntologyId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $OntologyId.create("objectSet/BaseObjectSet");
/**
 * Minimal object-set metadata carrier.
 *
 * @since 0.0.0
 * @category models
 */
export interface BaseObjectSet<Q extends ObjectOrInterfaceDefinition> {
  readonly $objectSetInternals: { readonly def: Q };
}
