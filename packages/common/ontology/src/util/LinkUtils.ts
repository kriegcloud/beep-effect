/**
 * Link-name and linked-type extraction helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/util/LinkUtils
 */
import type { InterfaceDefinition } from "../ontology/InterfaceDefinition.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";

/**
 * Link API names available on an object or interface definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type LinkNames<Q extends ObjectOrInterfaceDefinition> = Q extends InterfaceDefinition
  ? keyof CompileTimeMetadata<Q>["links"]
  : keyof CompileTimeMetadata<Q>["links"] & string;

/**
 * Resolve the linked target definition for a given link name.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type LinkedType<Q extends ObjectOrInterfaceDefinition, L extends LinkNames<Q>> = NonNullable<
  CompileTimeMetadata<Q>["links"][L]["__OsdkLinkTargetType"]
>;
