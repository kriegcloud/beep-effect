/**
 * Aggregate `$select` clause contract helpers.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/AggregationsClause
 */
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { ValidAggregationKeys } from "./AggregatableKeys.js";
/**
 * Aggregate selector map that allows only unordered metrics.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UnorderedAggregationClause<Q extends ObjectOrInterfaceDefinition> = {
  [AggregationKey in ValidAggregationKeys<Q>]?: "unordered";
};

/**
 * Aggregate selector map that allows ordering for each metric.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type OrderedAggregationClause<Q extends ObjectOrInterfaceDefinition> = {
  [AggregationKey in ValidAggregationKeys<Q>]?: "unordered" | "asc" | "desc";
};

/**
 * Aggregate selector clause accepted by aggregate query options.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AggregationClause<Q extends ObjectOrInterfaceDefinition> =
  | UnorderedAggregationClause<Q>
  | OrderedAggregationClause<Q>;
