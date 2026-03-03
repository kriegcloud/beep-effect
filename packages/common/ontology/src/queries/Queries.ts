/**
 * Query parameter/result conversion helper types.
 *
 * @since 0.0.0
 * @module @beep/ontology/queries/Queries
 */
import type { DataValueClientToWire, DataValueWireToClient } from "../mapping/DataValueMapping.js";
import type { ObjectIdentifiers, OsdkBase } from "../OsdkBase.js";
import type { OsdkObjectPrimaryKeyType } from "../OsdkObjectPrimaryKeyType.js";
import type { ObjectSet } from "../objectSet/ObjectSet.js";
import type { InterfaceDefinition } from "../ontology/InterfaceDefinition.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type {
  AggregationKeyTypes,
  AggregationRangeKeyTypes,
  AggregationValueTypes,
} from "../ontology/QueryDefinition.js";
import type {
  AggKeyClientToWire,
  AggKeyWireToClient,
  AggValueClientToWire,
  AggValueWireToClient,
  ThreeDimensionalAggregation,
  TwoDimensionalAggregation,
} from "./Aggregations.js";

/**
 * Query parameter conversion helper namespace.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export namespace QueryParam {
  /**
   * Resolve primitive query parameter type from wire primitive key.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type PrimitiveType<T extends keyof DataValueClientToWire> = DataValueClientToWire[T];

  /**
   * Resolve object query parameter type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ObjectType<T extends ObjectOrInterfaceDefinition> = ObjectIdentifiers<T> | OsdkObjectPrimaryKeyType<T>;

  /**
   * Resolve interface query parameter type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type InterfaceType<T extends InterfaceDefinition> =
    | {
        $objectType: CompileTimeMetadata<T> extends { implementedBy: infer U }
          ? U extends ReadonlyArray<never>
            ? string
            : U extends ReadonlyArray<string>
              ? U[number]
              : string
          : string;
        $primaryKey: string | number;
        $apiName?: never;
      }
    | {
        $apiName: T["apiName"];
        $objectType: string;
        $primaryKey: string | number;
      };

  /**
   * Resolve object-set query parameter type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ObjectSetType<T extends ObjectOrInterfaceDefinition> = ObjectSet<T>;

  /**
   * Resolve range key query parameter type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type RangeKey<T extends AggregationRangeKeyTypes> = AggKeyClientToWire<"range", T>;

  /**
   * Resolve two-dimensional aggregation query parameter type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type TwoDimensionalAggregationType<
    T extends AggregationKeyTypes | RangeKey<AggregationRangeKeyTypes>,
    V extends AggregationValueTypes,
  > = TwoDimensionalAggregation<T extends AggregationKeyTypes ? AggKeyClientToWire<T> : T, AggValueClientToWire<V>>;

  /**
   * Resolve three-dimensional aggregation query parameter type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ThreeDimensionalAggregationType<
    OUT extends AggregationKeyTypes | RangeKey<AggregationRangeKeyTypes>,
    IN extends AggregationKeyTypes | RangeKey<AggregationRangeKeyTypes>,
    V extends AggregationValueTypes,
  > = ThreeDimensionalAggregation<
    OUT extends AggregationKeyTypes ? AggKeyClientToWire<OUT> : OUT,
    IN extends AggregationKeyTypes ? AggKeyClientToWire<IN> : IN,
    AggValueClientToWire<V>
  >;
}

/**
 * Query result conversion helper namespace.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export namespace QueryResult {
  /**
   * Resolve primitive query result type from wire primitive key.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type PrimitiveType<T extends keyof DataValueClientToWire> = DataValueWireToClient[T];

  /**
   * Resolve object query result type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ObjectType<T extends ObjectOrInterfaceDefinition> = OsdkBase<T>;

  /**
   * Resolve interface query result type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type InterfaceType<T extends ObjectOrInterfaceDefinition> = OsdkBase<T>;

  /**
   * Resolve object-set query result type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ObjectSetType<T extends ObjectOrInterfaceDefinition> = ObjectSet<T>;

  /**
   * Resolve range key query result type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type RangeKey<T extends AggregationRangeKeyTypes> = AggKeyWireToClient<"range", T>;

  /**
   * Resolve two-dimensional aggregation query result type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type TwoDimensionalAggregationType<
    T extends AggregationKeyTypes | RangeKey<AggregationRangeKeyTypes>,
    V extends AggregationValueTypes,
  > = TwoDimensionalAggregation<T extends AggregationKeyTypes ? AggKeyWireToClient<T> : T, AggValueWireToClient<V>>;

  /**
   * Resolve three-dimensional aggregation query result type.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  export type ThreeDimensionalAggregationType<
    OUT extends AggregationKeyTypes | RangeKey<AggregationRangeKeyTypes>,
    IN extends AggregationKeyTypes | RangeKey<AggregationRangeKeyTypes>,
    V extends AggregationValueTypes,
  > = ThreeDimensionalAggregation<
    OUT extends AggregationKeyTypes ? AggKeyWireToClient<OUT> : OUT,
    IN extends AggregationKeyTypes ? AggKeyWireToClient<IN> : IN,
    AggValueWireToClient<V>
  >;
}
