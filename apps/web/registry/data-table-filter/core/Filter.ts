import type { DateTime } from "effect/DateTime"
import * as DT from "effect/DateTime"
import type {
  TextOperator,
  NumberOperator,
  DateOperator,
  OptionOperator,
  MultiOptionOperator
} from "./Operators"
import * as Data from "effect/Data"
import * as Equal from "effect/Equal"
import { dual } from "effect/Function"
import { Match, Order, Types } from "effect"


type Operator = TextOperator | NumberOperator | DateOperator | OptionOperator | MultiOptionOperator
// =============================================================================
// FilterModel - Generic tagged enum tracking columnId and operator
// =============================================================================


// Base type with defaults (for collections/runtime)
export type FilterModel<Id, Op> = Data.TaggedEnum<{
  readonly Text: {
    readonly columnId: Id
    readonly operator: Op & TextOperator
    readonly values: ReadonlyArray<string>
  }
  readonly Number: {
    readonly columnId: Id
    readonly operator: Op & NumberOperator
    readonly values: ReadonlyArray<number>
  }
  readonly Date: {
    readonly columnId: Id
    readonly operator: Op & DateOperator
    readonly values: ReadonlyArray<DateTime>
  }
  readonly Option: {
    readonly columnId: Id
    readonly operator: Op & OptionOperator
    readonly values: ReadonlyArray<string>
  }
  readonly MultiOption: {
    readonly columnId: Id
    readonly operator: Op & MultiOptionOperator
    readonly values: ReadonlyArray<string>
  }
}>
interface FilterModelDef extends Data.TaggedEnum.WithGenerics<2> {
  readonly taggedEnum: FilterModel<this["A"], this["B"]>
}
export const FilterModel = Data.taggedEnum<FilterModelDef>()

// =============================================================================
// Typed extractors with generics
// =============================================================================

export type TextFilter<
  Id extends string = string,
  Op extends TextOperator = TextOperator
> = Data.TaggedEnum.Value<FilterModel<Id, Op>, "Text">

export type NumberFilter<
  Id extends string = string,
  Op extends NumberOperator = NumberOperator
> = Data.TaggedEnum.Value<FilterModel<Id, Op>, "Number">

export type DateFilter<
  Id extends string = string,
  Op extends DateOperator = DateOperator
> = Data.TaggedEnum.Value<FilterModel<Id, Op>, "Date">

export type OptionFilter<
  Id extends string = string,
  Op extends OptionOperator = OptionOperator
> = Data.TaggedEnum.Value<FilterModel<Id, Op>, "Option">

export type MultiOptionFilter<
  Id extends string = string,
  Op extends MultiOptionOperator = MultiOptionOperator
> = Data.TaggedEnum.Value<FilterModel<Id, Op>, "MultiOption">

declare namespace FilterModel {
  export type AnyFilter = FilterModel<string, string>
}

// =============================================================================
// Curried Constructor Types - Functions that return operator method objects
// =============================================================================

export type TextFilterConstructors<Id extends string> = {
  readonly Contains: (values: ReadonlyArray<string>) => TextFilter<Id, 'Contains'>
  readonly DoesNotContain: (values: ReadonlyArray<string>) => TextFilter<Id, 'DoesNotContain'>
}

export type NumberFilterConstructors<Id extends string> = {
  readonly Is: (values: ReadonlyArray<number>) => NumberFilter<Id, 'Is'>
  readonly IsNot: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsNot'>
  readonly IsLessThan: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsLessThan'>
  readonly IsGreaterThan: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsGreaterThan'>
  readonly IsLessThanOrEqualTo: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsLessThanOrEqualTo'>
  readonly IsGreaterThanOrEqualTo: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsGreaterThanOrEqualTo'>
  readonly IsBetween: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsBetween'>
  readonly IsNotBetween: (values: ReadonlyArray<number>) => NumberFilter<Id, 'IsNotBetween'>
}

export type DateFilterConstructors<Id extends string> = {
  readonly Is: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'Is'>
  readonly IsNot: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsNot'>
  readonly IsBefore: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsBefore'>
  readonly IsAfter: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsAfter'>
  readonly IsOnOrBefore: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsOnOrBefore'>
  readonly IsOnOrAfter: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsOnOrAfter'>
  readonly IsBetween: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsBetween'>
  readonly IsNotBetween: (values: ReadonlyArray<DateTime>) => DateFilter<Id, 'IsNotBetween'>
}

export type OptionFilterConstructors<Id extends string> = {
  readonly Is: (values: ReadonlyArray<string>) => OptionFilter<Id, 'Is'>
  readonly IsNot: (values: ReadonlyArray<string>) => OptionFilter<Id, 'IsNot'>
  readonly IsAnyOf: (values: ReadonlyArray<string>) => OptionFilter<Id, 'IsAnyOf'>
  readonly IsNoneOf: (values: ReadonlyArray<string>) => OptionFilter<Id, 'IsNoneOf'>
}

export type MultiOptionFilterConstructors<Id extends string> = {
  readonly Include: (values: ReadonlyArray<string>) => MultiOptionFilter<Id, 'Include'>
  readonly Exclude: (values: ReadonlyArray<string>) => MultiOptionFilter<Id, 'Exclude'>
  readonly IncludeAnyOf: (values: ReadonlyArray<string>) => MultiOptionFilter<Id, 'IncludeAnyOf'>
  readonly IncludeAllOf: (values: ReadonlyArray<string>) => MultiOptionFilter<Id, 'IncludeAllOf'>
  readonly ExcludeIfAnyOf: (values: ReadonlyArray<string>) => MultiOptionFilter<Id, 'ExcludeIfAnyOf'>
  readonly ExcludeIfAll: (values: ReadonlyArray<string>) => MultiOptionFilter<Id, 'ExcludeIfAll'>
}

// =============================================================================
// Curried Constructor Implementations
// =============================================================================

export const Text = <Id extends string>(columnId: Id): TextFilterConstructors<Id> => ({
  Contains: (values) => FilterModel.Text({ columnId, operator: "Contains", values }),
  DoesNotContain: (values) => FilterModel.Text({ columnId, operator: "DoesNotContain", values })
})

export const Number = <Id extends string>(columnId: Id): NumberFilterConstructors<Id> => ({
  Is: (values) => FilterModel.Number({ columnId, operator: "Is", values }),
  IsNot: (values) => FilterModel.Number({ columnId, operator: "IsNot", values }),
  IsLessThan: (values) => FilterModel.Number({ columnId, operator: "IsLessThan", values }),
  IsGreaterThan: (values) => FilterModel.Number({ columnId, operator: "IsGreaterThan", values }),
  IsLessThanOrEqualTo: (values) => FilterModel.Number({ columnId, operator: "IsLessThanOrEqualTo", values }),
  IsGreaterThanOrEqualTo: (values) => FilterModel.Number({ columnId, operator: "IsGreaterThanOrEqualTo", values }),
  IsBetween: (values) => FilterModel.Number({ columnId, operator: "IsBetween", values }),
  IsNotBetween: (values) => FilterModel.Number({ columnId, operator: "IsNotBetween", values })
})

export const Date = <Id extends string>(columnId: Id): DateFilterConstructors<Id> => ({
  Is: (values) => FilterModel.Date({ columnId, operator: "Is", values }),
  IsNot: (values) => FilterModel.Date({ columnId, operator: "IsNot", values }),
  IsBefore: (values) => FilterModel.Date({ columnId, operator: "IsBefore", values }),
  IsAfter: (values) => FilterModel.Date({ columnId, operator: "IsAfter", values }),
  IsOnOrBefore: (values) => FilterModel.Date({ columnId, operator: "IsOnOrBefore", values }),
  IsOnOrAfter: (values) => FilterModel.Date({ columnId, operator: "IsOnOrAfter", values }),
  IsBetween: (values) => FilterModel.Date({ columnId, operator: "IsBetween", values }),
  IsNotBetween: (values) => FilterModel.Date({ columnId, operator: "IsNotBetween", values })
})

export const Option = <Id extends string>(columnId: Id): OptionFilterConstructors<Id> => ({
  Is: (values) => FilterModel.Option({ columnId, operator: "Is", values }),
  IsNot: (values) => FilterModel.Option({ columnId, operator: "IsNot", values }),
  IsAnyOf: (values) => FilterModel.Option({ columnId, operator: "IsAnyOf", values }),
  IsNoneOf: (values) => FilterModel.Option({ columnId, operator: "IsNoneOf", values })
})

export const MultiOption = <Id extends string>(columnId: Id): MultiOptionFilterConstructors<Id> => ({
  Include: (values) => FilterModel.MultiOption({ columnId, operator: "Include", values }),
  Exclude: (values) => FilterModel.MultiOption({ columnId, operator: "Exclude", values }),
  IncludeAnyOf: (values) => FilterModel.MultiOption({ columnId, operator: "IncludeAnyOf", values }),
  IncludeAllOf: (values) => FilterModel.MultiOption({ columnId, operator: "IncludeAllOf", values }),
  ExcludeIfAnyOf: (values) => FilterModel.MultiOption({ columnId, operator: "ExcludeIfAnyOf", values }),
  ExcludeIfAll: (values) => FilterModel.MultiOption({ columnId, operator: "ExcludeIfAll", values })
})

// =============================================================================
// Filter Operations - Dual API (data-first and data-last)
// =============================================================================

type FilterValue<F extends FilterModel.AnyFilter> = F extends { values: ReadonlyArray<infer V> } ? V : never

const sortValues = <V extends FilterModel.AnyFilter["values"]>(values: V): V =>
  Data.array(values.toSorted((a, b: any) =>
    Match.value(a).pipe(
      Match.when(Match.number, (n) => Order.number(n, b)),
      Match.when(Match.string, (s) => Order.string(s, b)),
      Match.orElse((dt) => DT.Order(dt as DT.DateTime, b))
    )
  )) as V

const makeFilter = <F extends FilterModel.AnyFilter>(
  filter: F,
  values: ReadonlyArray<FilterValue<F>>
): F => Data.struct({ ...filter, values: sortValues(values as any) }) as F
export const addValue: {
  <V>(value: V): <F extends FilterModel.AnyFilter & { values: ReadonlyArray<V> }>(filter: F) => F
  <F extends FilterModel.AnyFilter, V extends FilterValue<F>>(filter: F, value: V): F
} = dual(
  2,
  (filter: any, value: any) => makeFilter(filter, [...filter.values, value])
)

export const removeValue: {
  <V>(value: V): <F extends FilterModel.AnyFilter & { values: ReadonlyArray<V> }>(filter: F) => F
  <F extends FilterModel.AnyFilter, V extends FilterValue<F>>(filter: F, value: V): F
} = dual(
  2,
  (filter: any, value: any) => makeFilter(filter, filter.values.filter((v: any) => !Equal.equals(v, value)))
)

export const setOperator: {
  <Op extends string>(operator: Op): <F extends FilterModel.AnyFilter>(filter: F) => Types.MergeRight<F, { operator: Op }>
  <F extends FilterModel.AnyFilter, Op extends string>(filter: F, operator: Op): Types.MergeRight<F, { operator: Op }>
} = dual(
  2,
  (filter: any, operator: any) => Data.struct({ ...filter, operator })
)

export const setValues: {
  <V>(values: ReadonlyArray<V>): <F extends FilterModel.AnyFilter & { values: ReadonlyArray<V> }>(filter: F) => F
  <F extends FilterModel.AnyFilter, V extends FilterValue<F>>(filter: F, values: ReadonlyArray<V>): F
} = dual(
  2,
  (filter: any, values: any) => makeFilter(filter, values)
)
