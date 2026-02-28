/**
 * Aggregate result modeling without group-by buckets.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/AggregationResultsWithoutGroups
 */
import type { OsdkObjectPropertyType } from "../definitions.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { OrderedAggregationClause, UnorderedAggregationClause } from "./AggregationsClause.js";
type ExtractPropName<T extends string> = T extends `${infer PropName}:${string}`
  ? PropName
  : T extends "$count"
    ? T
    : never;

type ExtractMetricNameForPropName<T, PropName extends string> = T extends `${PropName}:${infer MetricName}`
  ? MetricName
  : never;

/**
 * Aggregate response shape when `$groupBy` is absent.
 *
 * @since 0.0.0
 * @category models
 */
export type AggregationResultsWithoutGroups<
  Q extends ObjectOrInterfaceDefinition,
  AC extends UnorderedAggregationClause<Q> | OrderedAggregationClause<Q>,
> = {
  [PropName in ExtractPropName<keyof AC & string>]: PropName extends "$count"
    ? number
    : {
        [MetricName in ExtractMetricNameForPropName<keyof AC & string, PropName>]: MetricName extends
          | "approximateDistinct"
          | "exactDistinct"
          ? number
          : OsdkObjectPropertyType<CompileTimeMetadata<Q>["properties"][PropName]>;
      };
};
