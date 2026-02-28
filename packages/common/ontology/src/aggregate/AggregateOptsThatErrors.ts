/**
 * Aggregate option wrappers that force compile-time error visibility.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/AggregateOptsThatErrors
 */
import type { GroupByClause } from "../groupby/GroupByClause.js";
import type { ObjectOrInterfaceDefinition } from "../ontology/ObjectOrInterface.js";
import type { AggregateOpts } from "./AggregateOpts.js";
import type { UnorderedAggregationClause } from "./AggregationsClause.js";

/**
 * Aggregate option helper that:
 * - narrows invalid keys to `never` for clear compiler errors
 * - disallows ordering when grouping by multiple keys
 * - disallows ordering when grouping with `$exact.$includeNullValue: true`
 *
 * @since 0.0.0
 * @category models
 */
export type AggregateOptsThatErrorsAndDisallowsOrderingWithMultipleGroupBy<
  Q extends ObjectOrInterfaceDefinition,
  AO extends AggregateOpts<Q>,
> =
  ContainsExactMatchWithNull<AO["$groupBy"]> extends true
    ? {
        $groupBy: AO["$groupBy"];
        $select: UnorderedAggregationClause<Q>;
      }
    : SingleKeyObject<AO["$groupBy"]> extends never
      ? AO["$select"] extends UnorderedAggregationClause<Q>
        ? AggregateOptsThatErrors<Q, AO>
        : {} extends AO["$groupBy"]
          ? AggregateOptsThatErrors<Q, AO>
          : {
              $groupBy: AO["$groupBy"];
              $select: UnorderedAggregationClause<Q>;
            }
      : AggregateOptsThatErrors<Q, AO>;

type IsNever<T> = [T] extends [never] ? true : false;

type IsUnion<T, U = T> = IsNever<T> extends true ? false : T extends U ? ([U] extends [T] ? false : true) : false;

type IsEmptyObject<T> = keyof T extends never ? true : false;

type SingleKeyObject<T> = IsUnion<keyof T> extends true ? never : IsEmptyObject<T> extends true ? never : T;

type ContainsExactMatchWithNull<GB extends GroupByClause<ObjectOrInterfaceDefinition> | undefined> =
  undefined extends GB
    ? false
    : {} extends GB
      ? false
      : {
          [P in keyof GB]: GB[P] extends { $exact: { $includeNullValue: true } } ? true : false;
        }[keyof GB];

type AggregateOptsThatErrors<Q extends ObjectOrInterfaceDefinition, AO extends AggregateOpts<Q>> = AO & {
  $select: Pick<AO["$select"], keyof AggregateOpts<Q>["$select"] & keyof AO["$select"]> &
    Record<Exclude<keyof AO["$select"], keyof AggregateOpts<Q>["$select"]>, never>;
} & (unknown extends AO["$groupBy"]
    ? {}
    : Exclude<AO["$groupBy"], undefined> extends never
      ? {}
      : {
          $groupBy: Pick<AO["$groupBy"], keyof GroupByClause<Q> & keyof AO["$groupBy"]> &
            Record<Exclude<keyof AO["$groupBy"], keyof GroupByClause<Q>>, never>;
        });
