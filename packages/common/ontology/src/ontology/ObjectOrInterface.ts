/**
 * Shared union surfaces between object and interface definitions.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/ObjectOrInterface
 */
import type { IncludeValuesExtending } from "../util/IncludeValuesExtending.js";
import type { InterfaceDefinition } from "./InterfaceDefinition.js";
import type { CompileTimeMetadata, ObjectTypeDefinition } from "./ObjectTypeDefinition.js";
import type { SimplePropertyDef } from "./SimplePropertyDef.js";
import type { WirePropertyTypes } from "./WirePropertyTypes.js";
/**
 * Canonical union of ontology object or interface definition contracts.
 *
 * @since 0.0.0
 * @category models
 */
export type ObjectOrInterfaceDefinition = ObjectTypeDefinition | InterfaceDefinition;

/**
 * Derived-property compile-time augmentation helpers.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace DerivedObjectOrInterfaceDefinition {
  /**
   * Attach derived-property compile-time metadata to a base definition.
   *
   * @since 0.0.0
   * @category models
   */
  export type WithDerivedProperties<
    K extends ObjectOrInterfaceDefinition,
    D extends Record<string, SimplePropertyDef>,
  > = {
    readonly __DefinitionMetadata?: {
      readonly properties: {
        readonly [T in keyof D]: SimplePropertyDef.ToPropertyDef<D[T]>;
      };
      readonly props?: {
        readonly [T in keyof D]: SimplePropertyDef.ToRuntimeProperty<D[T]>;
      };
    };
  } & K;
}

/**
 * Property key extraction helper for ontology definitions.
 *
 * @since 0.0.0
 * @category models
 */
export type PropertyKeys<O extends ObjectOrInterfaceDefinition> = keyof CompileTimeMetadata<O>["properties"] & string;

/**
 * Property-key filtering helpers.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace PropertyKeys {
  /**
   * Filter property keys whose metadata `type` extends a target wire type.
   *
   * @since 0.0.0
   * @category models
   */
  export type Filtered<
    Q extends ObjectOrInterfaceDefinition,
    T extends WirePropertyTypes,
  > = keyof IncludeValuesExtending<CompileTimeMetadata<Q>["properties"], { readonly type: T }>;
}
