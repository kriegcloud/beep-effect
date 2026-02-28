/**
 * Aggregate result modeling with group-by buckets.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/AggregationResultsWithGroups
 */
import type { OsdkObjectPropertyTypeNotUndefined } from "../definitions.js";
import type { GroupByClause, GroupByRange } from "../groupby/GroupByClause.js";
import type { ObjectOrInterfaceDefinition, PropertyKeys } from "../ontology/ObjectOrInterface.js";
import type { CompileTimeMetadata } from "../ontology/ObjectTypeDefinition.js";
import type { AggregationResultsWithoutGroups } from "./AggregationResultsWithoutGroups.js";
import type { OrderedAggregationClause, UnorderedAggregationClause } from "./AggregationsClause.js";

/**
 * Aggregate response shape when `$groupBy` is provided.
 *
 * @since 0.0.0
 * @category models
 */
export type AggregationResultsWithGroups<
  Q extends ObjectOrInterfaceDefinition,
  A extends UnorderedAggregationClause<Q> | OrderedAggregationClause<Q>,
  G extends GroupByClause<Q> | undefined,
> = ({
  $group: {
    [P in keyof G & PropertyKeys<Q>]: G[P] extends { $ranges: GroupByRange<infer T>[] }
      ? { startValue: T; endValue: T }
      : MaybeNullable<G[P], OsdkObjectPropertyTypeNotUndefined<CompileTimeMetadata<Q>["properties"][P]>>;
  };
} & AggregationResultsWithoutGroups<Q, A>)[];

type MaybeNullable<GROUP, VALUE> = GROUP extends {
  $exact: { $includeNullValue: true };
}
  ? VALUE | null
  : VALUE;
