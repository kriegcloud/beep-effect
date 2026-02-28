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
/**
 * Distinct aggregate options for with-properties aggregations. {@link DistinctWithPropAggregateOption}
 *
 * @since 0.0.0
 * @category models
 */
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
export const BaseWithPropAggregations = LiteralKit([
  ...DistinctWithPropAggregateOption.Options,
  ...CollectWithPropAggregations.Options,
]).annotate(
  $I.annote("BaseWithPropAggregations", {
    description: "Base aggregate options for with-properties aggregations.",
  })
);

/**
 * Base aggregate options that all supported with-properties types can use. {@link BaseWithPropAggregations}
 *
 * @since 0.0.0
 * @category models
 */
export type BaseWithPropAggregations = typeof BaseWithPropAggregations.Type;

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
 * Min/max aggregate options. {@link MinMaxWithPropAggregateOption}
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
export const DatetimeWithPropAggregateOption = LiteralKit([
  ...MinMaxWithPropAggregateOption.Options,
  ...BaseWithPropAggregations.Options,
]).annotate(
  $I.annote("DatetimeWithPropAggregateOption", {
    description: "Datetime/timestamp aggregate options for with-properties aggregations.",
  })
);

/**
 * Datetime/timestamp with-properties aggregate options. {@link DatetimeWithPropAggregateOption}
 * @since 0.0.0
 * @category models
 */
export type DatetimeWithPropAggregateOption = typeof DatetimeWithPropAggregateOption.Type;

/**
 * Numeric with-properties aggregate options.
 *
 * @since 0.0.0
 * @category models
 */
export const NumericWithPropAggregateOption = LiteralKit([
  "sum",
  "avg",
  "approximatePercentile",
  ...MinMaxWithPropAggregateOption.Options,
  ...BaseWithPropAggregations.Options,
]).annotate(
  $I.annote("NumericWithPropAggregateOption", {
    description: "Numeric aggregate options for with-properties aggregations.",
  })
);

/**
 * Numeric with-properties aggregate options. {@link NumericWithPropAggregateOption}
 * @since 0.0.0
 * @category models
 */
export type NumericWithPropAggregateOption = typeof NumericWithPropAggregateOption.Type;

/**
 * Special wire types that support collect operations.
 *
 * @since 0.0.0
 * @category models
 */
export const ValidCollectPropertyKeysForSpecialTypes = LiteralKit([
  "attachment",
  "geopoint",
  "geoshape",
  "boolean",
]).annotate(
  $I.annote("ValidCollectPropertyKeysForSpecialTypes", {
    description: "Special wire types that support collect operations.",
  })
);
/**
 * Special wire types that support collect operations. {@link ValidCollectPropertyKeysForSpecialTypes}
 * @since 0.0.0
 * @category models
 */
export type ValidCollectPropertyKeysForSpecialTypes = typeof ValidCollectPropertyKeysForSpecialTypes.Type;
