/**
 * Ontology query definition models.
 *
 * @since 0.0.0
 * @module @beep/ontology/ontology/QueryDefinition
 */
import type { OsdkMetadata } from "../OsdkMetadata.js";
import type { ObjectOrInterfaceDefinition } from "./ObjectOrInterface.js";
import type { ObjectTypeDefinition } from "./ObjectTypeDefinition.js";
/**
 * Metadata carried by ontology query definitions.
 *
 * @since 0.0.0
 * @category models
 */
export interface QueryMetadata {
  readonly type: "query";
  readonly apiName: string;
  readonly description?: string;
  readonly displayName?: string;
  readonly version: string;
  readonly parameters: Record<string, QueryParameterDefinition<ObjectTypeDefinition>>;
  readonly output: QueryDataTypeDefinition;
  readonly rid: string;
}

/**
 * Compile-time metadata holder for generated query signatures.
 *
 * @since 0.0.0
 * @category models
 */
export interface QueryCompileTimeMetadata<T> {
  readonly signature: T;
}

/**
 * Compile-time description of an ontology query definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface QueryDefinition<T = unknown> {
  readonly type: "query";
  readonly apiName: string;
  readonly version?: string;
  readonly isFixedVersion?: boolean;
  readonly osdkMetadata?: OsdkMetadata;
  readonly __DefinitionMetadata?: QueryCompileTimeMetadata<T> & QueryMetadata;
}

/**
 * Query parameter metadata entry.
 *
 * @since 0.0.0
 * @category models
 */
export type QueryParameterDefinition<T_Target extends ObjectTypeDefinition = ObjectTypeDefinition> = {
  readonly description?: string;
} & QueryDataTypeDefinition<T_Target>;

/**
 * Query output/input data-type definition family.
 *
 * @since 0.0.0
 * @category models
 */
export type QueryDataTypeDefinition<T_Target extends ObjectOrInterfaceDefinition = ObjectOrInterfaceDefinition> =
  | PrimitiveDataType
  | ObjectQueryDataType<T_Target>
  | InterfaceQueryDataType<T_Target>
  | ObjectSetQueryDataType<T_Target>
  | InterfaceObjectSetQueryDataType<T_Target>
  | SetQueryDataType
  | UnionQueryDataType
  | StructQueryDataType
  | TwoDimensionalAggregationDataType
  | ThreeDimensionalAggregationDataType
  | MapDataType
  | ArrayQueryDataType;

/**
 * Shared query data-type discriminator base.
 *
 * @since 0.0.0
 * @category models
 */
export type BaseQueryDataTypeDefinition<T extends string> = {
  readonly nullable?: boolean;
  readonly type: T;
};

/**
 * Wire-level primitive query data types.
 *
 * @since 0.0.0
 * @category models
 */
export type WireQueryDataTypes =
  | "double"
  | "float"
  | "integer"
  | "long"
  | "boolean"
  | "string"
  | "date"
  | "timestamp"
  | "attachment";

/**
 * Primitive query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export type PrimitiveDataType<Q extends WireQueryDataTypes = WireQueryDataTypes> = BaseQueryDataTypeDefinition<Q>;

/**
 * Object query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface ObjectQueryDataType<T_Target extends ObjectOrInterfaceDefinition = never>
  extends BaseQueryDataTypeDefinition<"object"> {
  readonly object: string;
  readonly __OsdkTargetType?: T_Target;
}

/**
 * Interface query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface InterfaceQueryDataType<T_Target extends ObjectOrInterfaceDefinition = never>
  extends BaseQueryDataTypeDefinition<"interface"> {
  readonly interface: string;
  readonly __OsdkTargetType?: T_Target;
}

/**
 * Object-set query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface ObjectSetQueryDataType<T_Target extends ObjectOrInterfaceDefinition = never>
  extends BaseQueryDataTypeDefinition<"objectSet"> {
  readonly objectSet: string;
  readonly __OsdkTargetType?: T_Target;
}

/**
 * Interface-object-set query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface InterfaceObjectSetQueryDataType<T_Target extends ObjectOrInterfaceDefinition = never>
  extends BaseQueryDataTypeDefinition<"interfaceObjectSet"> {
  readonly objectSet: string;
  readonly __OsdkTargetType?: T_Target;
}

/**
 * Set query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface SetQueryDataType extends BaseQueryDataTypeDefinition<"set"> {
  readonly set: QueryDataTypeDefinition;
}

/**
 * Array query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface ArrayQueryDataType extends BaseQueryDataTypeDefinition<"array"> {
  readonly array: QueryDataTypeDefinition;
}

/**
 * Union query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface UnionQueryDataType extends BaseQueryDataTypeDefinition<"union"> {
  readonly union: ReadonlyArray<QueryDataTypeDefinition>;
}

/**
 * Struct query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface StructQueryDataType extends BaseQueryDataTypeDefinition<"struct"> {
  readonly struct: Record<string, QueryDataTypeDefinition>;
}

/**
 * Two-dimensional aggregation query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface TwoDimensionalAggregationDataType extends BaseQueryDataTypeDefinition<"twoDimensionalAggregation"> {
  readonly twoDimensionalAggregation: TwoDimensionalQueryAggregationDefinition;
}

/**
 * Three-dimensional aggregation query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface ThreeDimensionalAggregationDataType
  extends BaseQueryDataTypeDefinition<"threeDimensionalAggregation"> {
  readonly threeDimensionalAggregation: ThreeDimensionalQueryAggregationDefinition;
}

/**
 * Map query data type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface MapDataType extends BaseQueryDataTypeDefinition<"map"> {
  readonly keyType: QueryDataTypeDefinition;
  readonly valueType: QueryDataTypeDefinition;
}

/**
 * Aggregation key data type (simple or range).
 *
 * @since 0.0.0
 * @category models
 */
export type AggregationKeyDataType<V = unknown> = SimpleAggregationKeyDataType<V> | RangeAggregationKeyDataType<V>;

/**
 * Non-range aggregation key type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface SimpleAggregationKeyDataType<V = unknown> {
  readonly keyType: Exclude<AggregationKeyTypes, "range">;
  readonly valueType: V;
}

/**
 * Range aggregation key type definition.
 *
 * @since 0.0.0
 * @category models
 */
export interface RangeAggregationKeyDataType<V = unknown> {
  readonly keyType: "range";
  readonly keySubtype: AggregationRangeKeyTypes;
  readonly valueType: V;
}

/**
 * Two-dimensional aggregation definition.
 *
 * @since 0.0.0
 * @category models
 */
export type TwoDimensionalQueryAggregationDefinition = AggregationKeyDataType<AggregationValueTypes>;

/**
 * Three-dimensional aggregation definition.
 *
 * @since 0.0.0
 * @category models
 */
export type ThreeDimensionalQueryAggregationDefinition =
  AggregationKeyDataType<TwoDimensionalQueryAggregationDefinition>;

/**
 * Supported aggregation key types.
 *
 * @since 0.0.0
 * @category models
 */
export type AggregationKeyTypes = "boolean" | "string" | "date" | "double" | "integer" | "timestamp" | "range";

/**
 * Supported range-aggregation key subtypes.
 *
 * @since 0.0.0
 * @category models
 */
export type AggregationRangeKeyTypes = "date" | "double" | "integer" | "timestamp";

/**
 * Supported aggregation value primitive types.
 *
 * @since 0.0.0
 * @category models
 */
export type AggregationValueTypes = "date" | "double" | "timestamp";
