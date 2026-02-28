/**
 * Ontology action definition models.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/ActionDefinition
 */
import type { OsdkMetadata } from "../OsdkMetadata.js";
import type { InterfaceDefinition } from "./InterfaceDefinition.js";
import type { ObjectTypeDefinition, ReleaseStatus } from "./ObjectTypeDefinition.js";
/**
 * Metadata carried by ontology action definitions.
 *
 * @since 0.0.0
 * @category models
 */
export interface ActionMetadata {
  readonly type: "action";
  readonly apiName: string;
  readonly description?: string;
  readonly displayName?: string;
  readonly parameters: Record<string, ActionMetadata.Parameter<ObjectTypeDefinition>>;
  readonly modifiedEntities?: Partial<
    Record<
      string,
      {
        readonly created: boolean;
        readonly modified: boolean;
      }
    >
  >;
  readonly status: ReleaseStatus | undefined;
  readonly rid: string;
}

/**
 * Types for {@link ActionMetadata}.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace ActionMetadata {
  /**
   * Action parameter metadata entry.
   *
   * @since 0.0.0
   * @category models
   */
  export interface Parameter<T_Target extends ObjectTypeDefinition = never> {
    readonly type:
      | DataType.BaseActionParameterTypes
      | DataType.Object<T_Target>
      | DataType.ObjectSet<T_Target>
      | DataType.Interface<InterfaceDefinition>
      | DataType.Struct<Record<string, DataType.BaseActionParameterTypes>>;
    readonly description?: string;
    readonly multiplicity?: boolean;
    readonly nullable?: boolean;
  }

  /**
   * Action parameter data type contracts.
   *
   * @since 0.0.0
   * @category models
   */
  export namespace DataType {
    /**
     * Primitive/base action parameter types.
     *
     * @since 0.0.0
     * @category models
     */
    export type BaseActionParameterTypes =
      | "boolean"
      | "string"
      | "integer"
      | "long"
      | "double"
      | "datetime"
      | "timestamp"
      | "attachment"
      | "marking"
      | "mediaReference"
      | "objectType"
      | "geoshape"
      | "geohash";

    /**
     * Object action parameter type.
     *
     * @since 0.0.0
     * @category models
     */
    export interface Object<T_Target extends ObjectTypeDefinition = never> {
      readonly __OsdkTargetType?: T_Target;
      readonly type: "object";
      readonly object: T_Target["apiName"];
    }

    /**
     * Interface action parameter type.
     *
     * @since 0.0.0
     * @category models
     */
    export interface Interface<T_Target extends InterfaceDefinition = never> {
      readonly __OsdkTargetType?: T_Target;
      readonly type: "interface";
      readonly interface: T_Target["apiName"];
    }

    /**
     * Object-set action parameter type.
     *
     * @since 0.0.0
     * @category models
     */
    export interface ObjectSet<T_Target extends ObjectTypeDefinition = never> {
      readonly __OsdkTargetType?: T_Target;
      readonly type: "objectSet";
      readonly objectSet: T_Target["apiName"];
    }

    /**
     * Structured action parameter type.
     *
     * @since 0.0.0
     * @category models
     */
    export interface Struct<T extends Record<string, DataType.BaseActionParameterTypes>> {
      readonly type: "struct";
      readonly struct: T;
    }
  }
}

/**
 * Compile-time metadata holder for generated action signatures.
 *
 * @since 0.0.0
 * @category models
 */
export interface ActionCompileTimeMetadata<T> {
  readonly signatures: T;
}

/**
 * Compile-time description of an ontology action definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface ActionDefinition<T_signatures = never> {
  readonly type: "action";
  readonly apiName: string;
  readonly osdkMetadata?: OsdkMetadata;
  readonly __DefinitionMetadata?: ActionCompileTimeMetadata<T_signatures> & ActionMetadata;
}
