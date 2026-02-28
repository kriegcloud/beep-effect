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
import { $OntologyId } from "@beep/identity/packages";
import {LiteralKit} from "@beep/schema";


const $I = $OntologyId.create("aggregate/AggregatableKeys");
/**
 * Core non-ordering aggregate metric options.
 *
 * @since 0.0.0
 * @category models
 */
export const BaseAggregateOptions = LiteralKit(
  [
    "approximateDistinct",
    "exactDistinct"
  ]
).annotate(
  $I.annote(
    "BaseAggregateOptions",
    {
      description: "Core non-ordering aggregate metric options."
    }
  )
)

/**
 * Defines the base options for aggregate operations.
 * This type encapsulates the core configuration parameters that can be used
 * when performing aggregation operations on a collection or dataset.
 *
 * It represents a set of options that can be customized to enable specific
 * aggregation behaviors, depending on the requirements of the operation.
 *
 * Note: This type is derived from the static type `BaseAggregateOptions.Type`.
 * 
 * @since 0.0.0
 * @category models
 */
export type BaseAggregateOptions = typeof BaseAggregateOptions.Type;

/**
 * Common min/max aggregate metric options.
 *
 * @since 0.0.0
 * @category models
 */
export const MinMaxAggregateOption = LiteralKit(
  ["min", "max"]
).annotate(
  $I.annote(
    "MinMaxAggregateOption",
    {
      description: "Common min/max aggregate metric options."
    }
  )
)

/**
 * Represents an aggregation option that determines whether to calculate
 * the minimum or maximum value in a given dataset.
 *
 * This type can be used to specify the desired operation for aggregations,
 * allowing for clearer and stricter type definitions in functions or APIs
 * that perform such operations.
 *
 * The available options for this type are:
 * - "min": Used to retrieve the minimum value.
 * - "max": Used to retrieve the maximum value.
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
export const NumericAggregateOption = LiteralKit(
  [
    "sum",
    "avg",
    "approximateDistinct",
    "exactDistinct",
    ...MinMaxAggregateOption.Options
  ]
).annotate(
  $I.annote(
    "NumericAggregateOption",
    {
      description: "Common numeric aggregate metric options."
    }
  )
);

/**
 * Represents the options available for numeric aggregate operations.
 *
 * This type defines a set of allowed values that specify the type of numeric
 * aggregation to perform. It includes predefined options such as:
 * - "sum": Computes the total sum of the numeric values.
 * - "avg": Calculates the average of the numeric values.
 * - "approximateDistinct": Estimates the number of distinct values.
 * - "exactDistinct": Calculates the exact number of distinct values.
 * Additionally, it can include the values defined by the `MinMaxAggregateOption` type.
 *
 * It is typically used in scenarios where aggregation functions need to be specified
 * for numeric data processing tasks.
 *
 * @since 0.0.0
 * @category models
 * {@link NumericAggregateOption}
 */
export type NumericAggregateOption = typeof NumericAggregateOption.Type;

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
