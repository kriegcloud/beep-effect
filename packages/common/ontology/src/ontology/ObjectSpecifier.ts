/**
 * Object specifier models for ontology queries and links.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/ObjectSpecifier
 */
import type { InterfaceDefinition, InterfaceMetadata } from "./InterfaceDefinition.js";
import type { ObjectOrInterfaceDefinition } from "./ObjectOrInterface.js";
import type { CompileTimeMetadata } from "./ObjectTypeDefinition.js";
/**
 * Opaque object specifier value branded by compatible ontology API names.
 *
 * @since 0.0.0
 * @category models
 */
export type ObjectSpecifier<Q extends ObjectOrInterfaceDefinition> = string & {
  readonly __apiName:
    | Q["apiName"]
    | (Q extends InterfaceDefinition
        ? CompileTimeMetadata<Q> extends InterfaceMetadata
          ? NonNullable<CompileTimeMetadata<Q>["implementedBy"]>[number]
          : never
        : never);
};
