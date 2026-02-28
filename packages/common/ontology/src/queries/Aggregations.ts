/**
 * Query aggregation key/value conversion helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/queries/Aggregations
 */
import type { DataValueClientToWire, DataValueWireToClient } from "../mapping/DataValueMapping.js";
import type {
  AggregationKeyTypes,
  AggregationRangeKeyTypes,
  AggregationValueTypes,
} from "../ontology/QueryDefinition.js";
/**
 * Range bucket helper used by query aggregations.
 *
 * @since 0.0.0
 * @category models
 */
export type Range<T extends AllowedBucketTypes> =
  | {
      startValue?: T;
      endValue: T;
    }
  | {
      startValue: T;
      endValue?: T;
    };

/**
 * Primitive value types allowed in aggregation buckets.
 *
 * @since 0.0.0
 * @category models
 */
export type AllowedBucketTypes = string | number | boolean;

/**
 * Supported bucket key payload types.
 *
 * @since 0.0.0
 * @category models
 */
export type AllowedBucketKeyTypes = AllowedBucketTypes | Range<AllowedBucketTypes>;

/**
 * Two-dimensional aggregation payload shape.
 *
 * @since 0.0.0
 * @category models
 */
export type TwoDimensionalAggregation<T extends AllowedBucketKeyTypes, U extends AllowedBucketTypes> = Array<{
  key: T;
  value: U;
}>;

/**
 * Three-dimensional aggregation payload shape.
 *
 * @since 0.0.0
 * @category models
 */
export type ThreeDimensionalAggregation<
  T extends AllowedBucketKeyTypes,
  U extends AllowedBucketKeyTypes,
  V extends AllowedBucketTypes,
> = Array<{ key: T; groups: Array<{ key: U; value: V }> }>;

/**
 * Resolve an aggregation key from wire response format to client format.
 *
 * @since 0.0.0
 * @category models
 */
export type AggKeyWireToClient<
  T extends AggregationKeyTypes,
  S extends AggregationRangeKeyTypes = never,
> = T extends keyof DataValueWireToClient
  ? DataValueWireToClient[T]
  : T extends "range"
    ? S extends keyof DataValueWireToClient
      ? Range<DataValueWireToClient[S]>
      : never
    : never;

/**
 * Resolve an aggregation key from client format to wire request format.
 *
 * @since 0.0.0
 * @category models
 */
export type AggKeyClientToWire<
  T extends AggregationKeyTypes,
  S extends AggregationRangeKeyTypes = never,
> = T extends keyof DataValueClientToWire
  ? DataValueClientToWire[T]
  : T extends "range"
    ? S extends keyof DataValueClientToWire
      ? Range<DataValueClientToWire[S]>
      : never
    : never;

/**
 * Resolve aggregation value type from wire response format.
 *
 * @since 0.0.0
 * @category models
 */
export type AggValueWireToClient<T extends AggregationValueTypes> = T extends keyof DataValueWireToClient
  ? DataValueWireToClient[T]
  : never;

/**
 * Resolve aggregation value type from client request format.
 *
 * @since 0.0.0
 * @category models
 */
export type AggValueClientToWire<T extends AggregationValueTypes> = T extends keyof DataValueClientToWire
  ? DataValueClientToWire[T]
  : never;
