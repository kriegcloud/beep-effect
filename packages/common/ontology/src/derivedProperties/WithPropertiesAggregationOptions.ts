/**
 * Aggregation option unions for with-properties derived-property builders.
 *
 * @since 0.0.0
 * @module @beep/ontology/derivedProperties/WithPropertiesAggregationOptions
 */
import { $OntologyId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";

const $I = $OntologyId.create("derivedProperties/WithPropertiesAggregationOptions");
/**
 * Distinct aggregate options for with-properties aggregations.
 *
 * @since 0.0.0
 * @category models
 */
export const DistinctWithPropAggregateOption = LiteralKit(["approximateDistinct", "exactDistinct"]).annotate(
  $I.annote("DistinctWithPropAggregateOption", {
    description: "Distinct aggregate options for with-properties aggregations.",
  })
);
export type DistinctWithPropAggregateOption = typeof DistinctWithPropAggregateOption.Type;

/**
 * Collection aggregate options for with-properties aggregations.
 *
 * @since 0.0.0
 * @category models
 */
export const CollectWithPropAggregations = LiteralKit(["collectSet", "collectList"]).annotate(
  $I.annote("CollectWithPropAggregations", {
    description: "Collection aggregate options for with-properties aggregations.",
  })
);

/**
 * Collection aggregate options for with-properties aggregations. {@link CollectWithPropAggregations}
 * @since 0.0.0
 * @category models
 */
export type CollectWithPropAggregations = typeof CollectWithPropAggregations.Type;

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
export const MinMaxWithPropAggregateOption = LiteralKit(["min", "max"]).annotate(
  $I.annote("MinMaxWithPropAggregateOption", {
    description: "Min/max aggregate options for with-properties aggregations.",
  })
);

/**
 *
 *
 * @since 0.0.0
 * @category models
 */
export type MinMaxWithPropAggregateOption = typeof MinMaxWithPropAggregateOption.Type;


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
