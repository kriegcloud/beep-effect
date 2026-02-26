/**
 * Aggregation option unions for with-properties derived-property builders.
 *
 * @since 0.0.0
 * @module @beep/ontology/derivedProperties/WithPropertiesAggregationOptions
 */

/**
 * Distinct aggregate options for with-properties aggregations.
 *
 * @since 0.0.0
 * @category models
 */
export type DistinctWithPropAggregateOption = "approximateDistinct" | "exactDistinct";

/**
 * Collection aggregate options for with-properties aggregations.
 *
 * @since 0.0.0
 * @category models
 */
export type CollectWithPropAggregations = "collectSet" | "collectList";

/**
 * Base aggregate options that all supported with-properties types can use.
 *
 * @since 0.0.0
 * @category models
 */
export type BaseWithPropAggregations = DistinctWithPropAggregateOption | CollectWithPropAggregations;

/**
 * Min/max aggregate options.
 *
 * @since 0.0.0
 * @category models
 */
export type MinMaxWithPropAggregateOption = "min" | "max";

/**
 * Datetime/timestamp with-properties aggregate options.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeWithPropAggregateOption = MinMaxWithPropAggregateOption | BaseWithPropAggregations;

/**
 * Numeric with-properties aggregate options.
 *
 * @since 0.0.0
 * @category models
 */
export type NumericWithPropAggregateOption =
  | "sum"
  | "avg"
  | "approximatePercentile"
  | MinMaxWithPropAggregateOption
  | BaseWithPropAggregations;

/**
 * Special wire types that support collect operations.
 *
 * @since 0.0.0
 * @category models
 */
export type ValidCollectPropertyKeysForSpecialTypes = "attachment" | "geopoint" | "geoshape" | "boolean";
