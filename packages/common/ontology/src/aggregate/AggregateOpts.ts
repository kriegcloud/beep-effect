/**
 * Aggregate query option contracts.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/AggregateOpts
 */
import type { GroupByClause } from "../groupby/GroupByClause.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { OrderedAggregationClause, UnorderedAggregationClause } from "./AggregationsClause.js";

/**
 * Input options accepted by aggregate calls.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AggregateOpts<Q extends ObjectOrInterfaceDefinition> = {
  $select: UnorderedAggregationClause<Q> | OrderedAggregationClause<Q>;
  $groupBy?: GroupByClause<Q>;
};
