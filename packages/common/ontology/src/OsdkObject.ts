/**
 * Backward-compatible alias for the canonical OSDK instance type.
 *
 * @since 0.0.0
 * @module @beep/ontology/OsdkObject
 */
import type { Osdk } from "./OsdkObjectFrom.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "./ontology/ObjectOrInterface.js";

/**
 * Legacy alias for {@link Osdk.Instance}.
 *
 * @since 0.0.0
 * @category aliases
 */
export type OsdkObject<
  Q extends ObjectOrInterfaceDefinition,
  OPTIONS extends never | "$rid" | "$allBaseProperties" | "$propertySecurities" = never,
  P extends PropertyKeys<Q> = PropertyKeys<Q>,
> = Osdk.Instance<Q, OPTIONS, P>;
