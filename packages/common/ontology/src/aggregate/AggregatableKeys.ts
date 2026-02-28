/**
 * Aggregation key and metric option helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/AggregatableKeys
 */
import type { GetWirePropertyValueFromClient } from "../mapping/PropertyValueMapping.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { WirePropertyTypes } from "../ontology/WirePropertyTypes.js";

/**
 * Core non-ordering aggregate metric options.
 *
 * @since 0.0.0
 * @category models
 */
export type BaseAggregateOptions = "approximateDistinct" | "exactDistinct";

/**
 * Common min/max aggregate metric options.
 *
 * @since 0.0.0
 * @category models
 */
export type MinMaxAggregateOption = "min" | "max";

/**
 * Aggregate options supported by datetime and timestamp properties.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeAggregateOption = MinMaxAggregateOption | BaseAggregateOptions;

/**
 * Aggregate options supported by numeric-like properties.
 *
 * @since 0.0.0
 * @category models
 */
export type NumericAggregateOption = "sum" | "avg" | "approximateDistinct" | "exactDistinct" | MinMaxAggregateOption;

type DistinctWithPropAggregateOption = "approximateDistinct" | "exactDistinct";
type CollectWithPropAggregations = "collectSet" | "collectList";
type BaseWithPropAggregations = DistinctWithPropAggregateOption | CollectWithPropAggregations;
type MinMaxWithPropAggregateOption = "min" | "max";
type DatetimeWithPropAggregateOption = MinMaxWithPropAggregateOption | BaseWithPropAggregations;
type NumericWithPropAggregateOption =
  | "sum"
  | "avg"
  | "approximatePercentile"
  | MinMaxWithPropAggregateOption
  | BaseWithPropAggregations;
type ValidCollectPropertyKeysForSpecialTypes = "attachment" | "geopoint" | "geoshape" | "boolean";

type AGGREGATION_FOR_TYPE<WIRE_TYPE extends WirePropertyTypes> =
  number extends GetWirePropertyValueFromClient<WIRE_TYPE>
    ? NumericAggregateOption
    : WIRE_TYPE extends "datetime" | "timestamp"
      ? DatetimeAggregateOption
      : BaseAggregateOptions;

type WITH_PROPERTIES_AGGREGATION_FOR_TYPE<WIRE_TYPE extends WirePropertyTypes> =
  number extends GetWirePropertyValueFromClient<WIRE_TYPE>
    ? NumericWithPropAggregateOption
    : WIRE_TYPE extends "datetime" | "timestamp"
      ? DatetimeWithPropAggregateOption
      : WIRE_TYPE extends "string"
        ? BaseWithPropAggregations
        : WITH_PROPERTIES_AGGREGATION_FOR_SPECIAL_WIRE_TYPE<WIRE_TYPE>;

type WITH_PROPERTIES_AGGREGATION_FOR_SPECIAL_WIRE_TYPE<WIRE_TYPE extends WirePropertyTypes> =
  WIRE_TYPE extends ValidCollectPropertyKeysForSpecialTypes
    ? BaseWithPropAggregations
    : DistinctWithPropAggregateOption;

/**
 * Valid `$select` keys for aggregate operations.
 *
 * @since 0.0.0
 * @category models
 */
export type ValidAggregationKeys<
  Q extends ObjectOrInterfaceDefinition,
  R extends "aggregate" | "withPropertiesAggregate" = "aggregate",
> = keyof ({
  [Key in AggregatableKeys<Q> as `${Key & string}:${R extends "aggregate"
    ? AGGREGATION_FOR_TYPE<CompileTimeMetadata<Q>["properties"][Key]["type"]>
    : WITH_PROPERTIES_AGGREGATION_FOR_TYPE<CompileTimeMetadata<Q>["properties"][Key]["type"]>}`]?: unknown;
} & { $count?: unknown });

/**
 * Property keys that can participate in aggregation/grouping.
 *
 * @since 0.0.0
 * @category models
 */
export type AggregatableKeys<Q extends ObjectOrInterfaceDefinition> = keyof { [P in PropertyKeys<Q>]: unknown };
