import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SharedDomainId.create("value-objects/Query");

export class SortOrder extends BS.StringLiteralKit("asc", "desc").annotations(
  $I.annotations("SortOrder", {
    description: "SortOrder direction for query results - ascending (asc) or descending (desc) order",
  })
) {}

export declare namespace SortOrder {
  export type Type = typeof SortOrder.Type;
}

export class FilterVariant extends BS.StringLiteralKit(
  "text",
  "numeric",
  "range",
  "date",
  "dateRange",
  "select",
  "multiselect",
  "boolean"
).annotations(
  $I.annotations("FilterVariant", {
    description:
      "FilterVariant represents the type of filter to apply - text for string matching, number for numeric comparisons, range for numeric ranges, date for single date filters, dateRange for date intervals, select for single option selection, multiselect for multiple option selection, and boolean for true/false filters",
  })
) {}

export declare namespace FilterVariant {
  export type Type = typeof FilterVariant.Type;
}

export class FilterOperator extends BS.StringLiteralKit(
  "iLike",
  "notILike",
  "eq",
  "ne",
  "inArray",
  "notInArray",
  "isEmpty",
  "isNotEmpty",
  "lt",
  "lte",
  "gt",
  "gte",
  "isBetween",
  "isRelativeToToday"
).annotations(
  $I.annotations("FilterOperator", {
    description:
      "Operator for filter conditions - is, isNot, isAnyOf, isNoneOf, isEmpty, isNotEmpty, equals, notEquals, before, after, onOrBefore, onOrAfter, isBetween, lessThan, lessThanOrEqual, greaterThan, greaterThanOrEqual, contains, notContains, startsWith, endsWith",
  })
) {}

export declare namespace FilterOperator {
  export type Type = typeof FilterOperator.Type;
}

export class TextFilterOperator extends FilterOperator.derive(
  "iLike",
  "notILike",
  "eq",
  "ne",
  "isEmpty",
  "isNotEmpty"
).annotations(
  $I.annotations("TextFilterOperator", {
    description:
      "Operator for filtering text values - iLike for case-insensitive pattern matching, notILike for negated pattern matching, eq for exact equality, ne for inequality, isEmpty for null/empty checks, isNotEmpty for non-empty checks",
  })
) {
  static readonly makeClass = TextFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.text),
  });
}

export declare namespace TextFilterOperator {
  export type Type = typeof TextFilterOperator.Type;
}

const LikePatternSearch = S.transform(S.String, S.TemplateLiteral("%", S.String, "%"), {
  strict: true,
  decode: (searchPattern) => `%${searchPattern}%` as const,
  encode: Str.replace(/^%|%$/g, ""),
});

export class ILikeTextFilter extends S.Class<ILikeTextFilter>($I`ILikeTextFilter`)(
  TextFilterOperator.makeClass.iLike({
    value: LikePatternSearch,
  }),
  $I.annotations("ILikeTextFilter", {
    description: "ILikeTextFilter represents a text filter using the ILike operator",
  })
) {}

export class NotILikeTextFilter extends S.Class<NotILikeTextFilter>($I`NotILikeTextFilter`)(
  TextFilterOperator.makeClass.notILike({
    value: LikePatternSearch,
  }),
  $I.annotations("NotILikeTextFilter", {
    description: "NotILikeTextFilter represents a text filter using the NotILike operator",
  })
) {}

export class IsEmptyTextFilter extends S.Class<IsEmptyTextFilter>($I`IsEmptyTextFilter`)(
  TextFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptyTextFilter", {
    description: "IsEmptyTextFilter represents a text filter using the isEmpty operator",
  })
) {}

export class IsNotEmptyTextFilter extends S.Class<IsNotEmptyTextFilter>($I`IsNotEmptyTextFilter`)(
  TextFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptyTextFilter", {
    description: "IsNotEmptyTextFilter represents a text filter using the isEmpty operator",
  })
) {}

export class EqTextFilter extends S.Class<EqTextFilter>($I`EqTextFilter`)(
  TextFilterOperator.makeClass.eq({ value: S.String }),
  $I.annotations("EqTextFilter", {
    description: "EqTextFilter represents a text filter using the Eq operator",
  })
) {}

export class NeTextFilter extends S.Class<NeTextFilter>($I`NeTextFilter`)(
  TextFilterOperator.makeClass.ne({ value: S.String }),
  $I.annotations("NeTextFilter", {
    description: "NeTextFilter represents a text filter using the Eq operator",
  })
) {}

export class TextFilter extends S.Union(
  ILikeTextFilter,
  NotILikeTextFilter,
  IsEmptyTextFilter,
  IsNotEmptyTextFilter,
  EqTextFilter,
  NeTextFilter
).annotations(
  $I.annotations("TextFilter", {
    description:
      "TextFilter is a union type representing all available text filtering operations including case-insensitive pattern matching (ILike/NotILike), exact equality checks (Eq/Ne), and null/empty state validation (IsEmpty/IsNotEmpty)",
  })
) {}

export declare namespace TextFilter {
  export type Type = typeof TextFilter.Type;
  export type Encoded = typeof TextFilter.Encoded;
}

export class NumericFilterOperator extends FilterOperator.derive(
  "eq",
  "ne",
  "lt",
  "lte",
  "gt",
  "gte",
  "isBetween",
  "isEmpty",
  "isNotEmpty"
).annotations(
  $I.annotations("NumericFilterOperator", {
    description: "Operator for filtering numeric values with comparison operations",
  })
) {
  static readonly makeClass = NumericFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.numeric),
  });
}

export declare namespace NumericFilterOperator {
  export type Type = typeof NumericFilterOperator.Type;
}

export class DateFilterOperator extends FilterOperator.derive(
  "eq",
  "ne",
  "lt",
  "lte",
  "gt",
  "gte",
  "isBetween",
  "isRelativeToToday",
  "isEmpty",
  "isNotEmpty"
).annotations(
  $I.annotations("DateFilterOperator", {
    description:
      "Filter operators for date fields supporting equality comparisons, range checks, between queries, and empty/non-empty validation",
  })
) {
  static readonly makeClass = DateFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.date),
  });
}

export declare namespace DateFilterOperator {
  export type Type = typeof DateFilterOperator.Type;
}

export class RelativeDateDirection extends BS.StringLiteralKit("past", "future").annotations(
  $I.annotations("RelativeDateDirection", {
    description: "Direction for relative date filtering windows (past or future)",
  })
) {}

export declare namespace RelativeDateDirection {
  export type Type = typeof RelativeDateDirection.Type;
}

export class RelativeDateUnit extends BS.StringLiteralKit("day", "week", "month", "year").annotations(
  $I.annotations("RelativeDateUnit", {
    description: "Time unit for relative date filtering windows",
  })
) {}

export declare namespace RelativeDateUnit {
  export type Type = typeof RelativeDateUnit.Type;
}

export class DateRangeFilterOperator extends FilterOperator.derive(
  "isBetween",
  "isRelativeToToday",
  "isEmpty",
  "isNotEmpty"
).annotations(
  $I.annotations("DateRangeFilterOperator", {
    description:
      "Operators for date-range filters supporting absolute ranges, relative date windows, and empty/non-empty checks",
  })
) {
  static readonly makeClass = DateRangeFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.dateRange),
  });
}

export declare namespace DateRangeFilterOperator {
  export type Type = typeof DateRangeFilterOperator.Type;
}

export class RangeFilterOperator extends FilterOperator.derive("isBetween", "isEmpty", "isNotEmpty").annotations(
  $I.annotations("RangeFilterOperator", {
    description: "Operators for numeric-range filters supporting bounded comparisons and empty/non-empty checks",
  })
) {
  static readonly makeClass = RangeFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.range),
  });
}

export declare namespace RangeFilterOperator {
  export type Type = typeof RangeFilterOperator.Type;
}

export class SelectFilterOperator extends FilterOperator.derive("eq", "ne", "isEmpty", "isNotEmpty").annotations(
  $I.annotations("SelectFilterOperator", {
    description: "Operators for filtering single-select fields (equals, not equals, is empty, is not empty)",
  })
) {
  static readonly makeClass = SelectFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.select),
  });
}

export declare namespace SelectFilterOperator {
  export type Type = typeof SelectFilterOperator.Type;
}

export class MultiSelectFilterOperator extends FilterOperator.derive(
  "inArray",
  "notInArray",
  "isEmpty",
  "isNotEmpty"
).annotations(
  $I.annotations("MultiSelectFilterOperator", {
    description: "Operators for filtering multi-select fields (is any of, is none of, is empty, is not empty)",
  })
) {
  static readonly makeClass = MultiSelectFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.multiselect),
  });
}

export declare namespace MultiSelectFilterOperator {
  export type Type = typeof MultiSelectFilterOperator.Type;
}

export class BooleanFilterOperator extends FilterOperator.derive("eq", "ne").annotations(
  $I.annotations("BooleanFilterOperator", {
    description: "Operators for filtering boolean fields (equals or not equals)",
  })
) {
  static readonly makeClass = BooleanFilterOperator.toTagged("operator").composer({
    variant: S.tag(FilterVariant.Enum.boolean),
  });
}

export declare namespace BooleanFilterOperator {
  export type Type = typeof BooleanFilterOperator.Type;
}

const DateFilterValue = BS.DateTimeUtcFromAllAcceptable;

export class EqNumericFilter extends S.Class<EqNumericFilter>($I`EqNumericFilter`)(
  NumericFilterOperator.makeClass.eq({ value: S.Number }),
  $I.annotations("EqNumericFilter", {
    description: "Numeric equality filter",
  })
) {}

export class NeNumericFilter extends S.Class<NeNumericFilter>($I`NeNumericFilter`)(
  NumericFilterOperator.makeClass.ne({ value: S.Number }),
  $I.annotations("NeNumericFilter", {
    description: "Numeric inequality filter",
  })
) {}

export class LtNumericFilter extends S.Class<LtNumericFilter>($I`LtNumericFilter`)(
  NumericFilterOperator.makeClass.lt({ value: S.Number }),
  $I.annotations("LtNumericFilter", {
    description: "Numeric less-than filter",
  })
) {}

export class LteNumericFilter extends S.Class<LteNumericFilter>($I`LteNumericFilter`)(
  NumericFilterOperator.makeClass.lte({ value: S.Number }),
  $I.annotations("LteNumericFilter", {
    description: "Numeric less-than-or-equal filter",
  })
) {}

export class GtNumericFilter extends S.Class<GtNumericFilter>($I`GtNumericFilter`)(
  NumericFilterOperator.makeClass.gt({ value: S.Number }),
  $I.annotations("GtNumericFilter", {
    description: "Numeric greater-than filter",
  })
) {}

export class GteNumericFilter extends S.Class<GteNumericFilter>($I`GteNumericFilter`)(
  NumericFilterOperator.makeClass.gte({ value: S.Number }),
  $I.annotations("GteNumericFilter", {
    description: "Numeric greater-than-or-equal filter",
  })
) {}

export class IsBetweenNumericFilter extends S.Class<IsBetweenNumericFilter>($I`IsBetweenNumericFilter`)(
  NumericFilterOperator.makeClass.isBetween({
    from: S.Number,
    to: S.Number,
  }),
  $I.annotations("IsBetweenNumericFilter", {
    description: "Numeric bounded-range filter",
  })
) {}

export class IsEmptyNumericFilter extends S.Class<IsEmptyNumericFilter>($I`IsEmptyNumericFilter`)(
  NumericFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptyNumericFilter", {
    description: "Numeric empty filter",
  })
) {}

export class IsNotEmptyNumericFilter extends S.Class<IsNotEmptyNumericFilter>($I`IsNotEmptyNumericFilter`)(
  NumericFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptyNumericFilter", {
    description: "Numeric non-empty filter",
  })
) {}

export class NumericFilter extends S.Union(
  EqNumericFilter,
  NeNumericFilter,
  LtNumericFilter,
  LteNumericFilter,
  GtNumericFilter,
  GteNumericFilter,
  IsBetweenNumericFilter,
  IsEmptyNumericFilter,
  IsNotEmptyNumericFilter
).annotations(
  $I.annotations("NumericFilter", {
    description: "Union of numeric filters with operator-specific payloads",
  })
) {}

export declare namespace NumericFilter {
  export type Type = typeof NumericFilter.Type;
  export type Encoded = typeof NumericFilter.Encoded;
}

export class EqDateFilter extends S.Class<EqDateFilter>($I`EqDateFilter`)(
  DateFilterOperator.makeClass.eq({ value: DateFilterValue }),
  $I.annotations("EqDateFilter", {
    description: "Date equality filter",
  })
) {}

export class NeDateFilter extends S.Class<NeDateFilter>($I`NeDateFilter`)(
  DateFilterOperator.makeClass.ne({ value: DateFilterValue }),
  $I.annotations("NeDateFilter", {
    description: "Date inequality filter",
  })
) {}

export class LtDateFilter extends S.Class<LtDateFilter>($I`LtDateFilter`)(
  DateFilterOperator.makeClass.lt({ value: DateFilterValue }),
  $I.annotations("LtDateFilter", {
    description: "Date before filter",
  })
) {}

export class LteDateFilter extends S.Class<LteDateFilter>($I`LteDateFilter`)(
  DateFilterOperator.makeClass.lte({ value: DateFilterValue }),
  $I.annotations("LteDateFilter", {
    description: "Date on-or-before filter",
  })
) {}

export class GtDateFilter extends S.Class<GtDateFilter>($I`GtDateFilter`)(
  DateFilterOperator.makeClass.gt({ value: DateFilterValue }),
  $I.annotations("GtDateFilter", {
    description: "Date after filter",
  })
) {}

export class GteDateFilter extends S.Class<GteDateFilter>($I`GteDateFilter`)(
  DateFilterOperator.makeClass.gte({ value: DateFilterValue }),
  $I.annotations("GteDateFilter", {
    description: "Date on-or-after filter",
  })
) {}

export class IsBetweenDateFilter extends S.Class<IsBetweenDateFilter>($I`IsBetweenDateFilter`)(
  DateFilterOperator.makeClass.isBetween({
    from: DateFilterValue,
    to: DateFilterValue,
  }),
  $I.annotations("IsBetweenDateFilter", {
    description: "Date bounded-range filter",
  })
) {}

export class IsRelativeToTodayDateFilter extends S.Class<IsRelativeToTodayDateFilter>($I`IsRelativeToTodayDateFilter`)(
  DateFilterOperator.makeClass.isRelativeToToday({
    direction: RelativeDateDirection,
    amount: S.NonNegativeInt,
    unit: RelativeDateUnit,
    includeCurrent: S.Boolean,
  }),
  $I.annotations("IsRelativeToTodayDateFilter", {
    description: "Date filter relative to the current day using direction, amount, and unit",
  })
) {}

export class IsEmptyDateFilter extends S.Class<IsEmptyDateFilter>($I`IsEmptyDateFilter`)(
  DateFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptyDateFilter", {
    description: "Date empty filter",
  })
) {}

export class IsNotEmptyDateFilter extends S.Class<IsNotEmptyDateFilter>($I`IsNotEmptyDateFilter`)(
  DateFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptyDateFilter", {
    description: "Date non-empty filter",
  })
) {}

export class DateFilter extends S.Union(
  EqDateFilter,
  NeDateFilter,
  LtDateFilter,
  LteDateFilter,
  GtDateFilter,
  GteDateFilter,
  IsBetweenDateFilter,
  IsRelativeToTodayDateFilter,
  IsEmptyDateFilter,
  IsNotEmptyDateFilter
).annotations(
  $I.annotations("DateFilter", {
    description: "Union of date filters with operator-specific payloads",
  })
) {}

export declare namespace DateFilter {
  export type Type = typeof DateFilter.Type;
  export type Encoded = typeof DateFilter.Encoded;
}

export class IsBetweenDateRangeFilter extends S.Class<IsBetweenDateRangeFilter>($I`IsBetweenDateRangeFilter`)(
  DateRangeFilterOperator.makeClass.isBetween({
    from: DateFilterValue,
    to: DateFilterValue,
  }),
  $I.annotations("IsBetweenDateRangeFilter", {
    description: "Date-range bounded filter",
  })
) {}

export class IsRelativeToTodayDateRangeFilter extends S.Class<IsRelativeToTodayDateRangeFilter>(
  $I`IsRelativeToTodayDateRangeFilter`
)(
  DateRangeFilterOperator.makeClass.isRelativeToToday({
    direction: RelativeDateDirection,
    amount: S.NonNegativeInt,
    unit: RelativeDateUnit,
    includeCurrent: S.Boolean,
  }),
  $I.annotations("IsRelativeToTodayDateRangeFilter", {
    description: "Date-range filter relative to current date",
  })
) {}

export class IsEmptyDateRangeFilter extends S.Class<IsEmptyDateRangeFilter>($I`IsEmptyDateRangeFilter`)(
  DateRangeFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptyDateRangeFilter", {
    description: "Date-range empty filter",
  })
) {}

export class IsNotEmptyDateRangeFilter extends S.Class<IsNotEmptyDateRangeFilter>($I`IsNotEmptyDateRangeFilter`)(
  DateRangeFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptyDateRangeFilter", {
    description: "Date-range non-empty filter",
  })
) {}

export class DateRangeFilter extends S.Union(
  IsBetweenDateRangeFilter,
  IsRelativeToTodayDateRangeFilter,
  IsEmptyDateRangeFilter,
  IsNotEmptyDateRangeFilter
).annotations(
  $I.annotations("DateRangeFilter", {
    description: "Union of date-range filters with operator-specific payloads",
  })
) {}

export declare namespace DateRangeFilter {
  export type Type = typeof DateRangeFilter.Type;
  export type Encoded = typeof DateRangeFilter.Encoded;
}

export class IsBetweenRangeFilter extends S.Class<IsBetweenRangeFilter>($I`IsBetweenRangeFilter`)(
  RangeFilterOperator.makeClass.isBetween({
    from: S.Number,
    to: S.Number,
  }),
  $I.annotations("IsBetweenRangeFilter", {
    description: "Numeric-range bounded filter",
  })
) {}

export class IsEmptyRangeFilter extends S.Class<IsEmptyRangeFilter>($I`IsEmptyRangeFilter`)(
  RangeFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptyRangeFilter", {
    description: "Numeric-range empty filter",
  })
) {}

export class IsNotEmptyRangeFilter extends S.Class<IsNotEmptyRangeFilter>($I`IsNotEmptyRangeFilter`)(
  RangeFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptyRangeFilter", {
    description: "Numeric-range non-empty filter",
  })
) {}

export class RangeFilter extends S.Union(IsBetweenRangeFilter, IsEmptyRangeFilter, IsNotEmptyRangeFilter).annotations(
  $I.annotations("RangeFilter", {
    description: "Union of numeric-range filters with operator-specific payloads",
  })
) {}

export declare namespace RangeFilter {
  export type Type = typeof RangeFilter.Type;
  export type Encoded = typeof RangeFilter.Encoded;
}

export class EqSelectFilter extends S.Class<EqSelectFilter>($I`EqSelectFilter`)(
  SelectFilterOperator.makeClass.eq({ value: S.String }),
  $I.annotations("EqSelectFilter", {
    description: "Single-select equality filter",
  })
) {}

export class NeSelectFilter extends S.Class<NeSelectFilter>($I`NeSelectFilter`)(
  SelectFilterOperator.makeClass.ne({ value: S.String }),
  $I.annotations("NeSelectFilter", {
    description: "Single-select inequality filter",
  })
) {}

export class IsEmptySelectFilter extends S.Class<IsEmptySelectFilter>($I`IsEmptySelectFilter`)(
  SelectFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptySelectFilter", {
    description: "Single-select empty filter",
  })
) {}

export class IsNotEmptySelectFilter extends S.Class<IsNotEmptySelectFilter>($I`IsNotEmptySelectFilter`)(
  SelectFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptySelectFilter", {
    description: "Single-select non-empty filter",
  })
) {}

export class SelectFilter extends S.Union(
  EqSelectFilter,
  NeSelectFilter,
  IsEmptySelectFilter,
  IsNotEmptySelectFilter
).annotations(
  $I.annotations("SelectFilter", {
    description: "Union of single-select filters with operator-specific payloads",
  })
) {}

export declare namespace SelectFilter {
  export type Type = typeof SelectFilter.Type;
  export type Encoded = typeof SelectFilter.Encoded;
}

export class InArrayMultiSelectFilter extends S.Class<InArrayMultiSelectFilter>($I`InArrayMultiSelectFilter`)(
  MultiSelectFilterOperator.makeClass.inArray({ values: S.NonEmptyArray(S.String) }),
  $I.annotations("InArrayMultiSelectFilter", {
    description: "Multi-select includes-any filter",
  })
) {}

export class NotInArrayMultiSelectFilter extends S.Class<NotInArrayMultiSelectFilter>($I`NotInArrayMultiSelectFilter`)(
  MultiSelectFilterOperator.makeClass.notInArray({ values: S.NonEmptyArray(S.String) }),
  $I.annotations("NotInArrayMultiSelectFilter", {
    description: "Multi-select excludes-all filter",
  })
) {}

export class IsEmptyMultiSelectFilter extends S.Class<IsEmptyMultiSelectFilter>($I`IsEmptyMultiSelectFilter`)(
  MultiSelectFilterOperator.makeClass.isEmpty({}),
  $I.annotations("IsEmptyMultiSelectFilter", {
    description: "Multi-select empty filter",
  })
) {}

export class IsNotEmptyMultiSelectFilter extends S.Class<IsNotEmptyMultiSelectFilter>($I`IsNotEmptyMultiSelectFilter`)(
  MultiSelectFilterOperator.makeClass.isNotEmpty({}),
  $I.annotations("IsNotEmptyMultiSelectFilter", {
    description: "Multi-select non-empty filter",
  })
) {}

export class MultiSelectFilter extends S.Union(
  InArrayMultiSelectFilter,
  NotInArrayMultiSelectFilter,
  IsEmptyMultiSelectFilter,
  IsNotEmptyMultiSelectFilter
).annotations(
  $I.annotations("MultiSelectFilter", {
    description: "Union of multi-select filters with operator-specific payloads",
  })
) {}

export declare namespace MultiSelectFilter {
  export type Type = typeof MultiSelectFilter.Type;
  export type Encoded = typeof MultiSelectFilter.Encoded;
}

export class EqBooleanFilter extends S.Class<EqBooleanFilter>($I`EqBooleanFilter`)(
  BooleanFilterOperator.makeClass.eq({ value: S.Boolean }),
  $I.annotations("EqBooleanFilter", {
    description: "Boolean equality filter",
  })
) {}

export class NeBooleanFilter extends S.Class<NeBooleanFilter>($I`NeBooleanFilter`)(
  BooleanFilterOperator.makeClass.ne({ value: S.Boolean }),
  $I.annotations("NeBooleanFilter", {
    description: "Boolean inequality filter",
  })
) {}

export class BooleanFilter extends S.Union(EqBooleanFilter, NeBooleanFilter).annotations(
  $I.annotations("BooleanFilter", {
    description: "Union of boolean filters with operator-specific payloads",
  })
) {}

export declare namespace BooleanFilter {
  export type Type = typeof BooleanFilter.Type;
  export type Encoded = typeof BooleanFilter.Encoded;
}

export class ColumnFilter extends S.Union(
  TextFilter,
  NumericFilter,
  DateFilter,
  DateRangeFilter,
  RangeFilter,
  SelectFilter,
  MultiSelectFilter,
  BooleanFilter
).annotations(
  $I.annotations("ColumnFilter", {
    description: "Union of all supported column filters with discriminants on variant and operator",
  })
) {}

export declare namespace ColumnFilter {
  export type Type = typeof ColumnFilter.Type;
  export type Encoded = typeof ColumnFilter.Encoded;
}

export class TextOperatorLabelMap extends BS.MappedLiteralKit(
  ["iLike", "Contains"],
  ["notILike", "Does not contain"],
  ["eq", "Is"],
  ["ne", "Is not"],
  ["isEmpty", "Is empty"],
  ["isNotEmpty", "Is not empty"]
).annotations(
  $I.annotations("TextOperatorLabelMap", {
    description: "Label map for text filter operators - iLike, notILike, eq, ne, isEmpty, isNotEmpty",
  })
) {}

export declare namespace TextOperatorLabelMap {
  export type Type = typeof TextOperatorLabelMap.Type;
  export type Encoded = typeof TextOperatorLabelMap.Encoded;
}

export class NumericOperatorLabelMap extends BS.MappedLiteralKit(
  ["eq", "Is"],
  ["ne", "Is not"],
  ["lt", "Is less than"],
  ["lte", "Is less than or equal to"],
  ["gt", "Is greater than"],
  ["gte", "Is greater than or equal to"],
  ["isBetween", "Is between"],
  ["isEmpty", "Is empty"],
  ["isNotEmpty", "Is not empty"]
).annotations(
  $I.annotations("NumericOperatorLabelMap", {
    description: "Label map for numeric filter operators - eq, ne, lt, lte, gt, gte, isBetween, isEmpty, isNotEmpty",
  })
) {}

export declare namespace NumericOperatorLabelMap {
  export type Type = typeof NumericOperatorLabelMap.Type;
  export type Encoded = typeof NumericOperatorLabelMap.Encoded;
}

export class DateOperatorLabelMap extends BS.MappedLiteralKit(
  ["eq", "Is"],
  ["ne", "Is not"],
  ["lt", "Is before"],
  ["lte", "Is on or before"],
  ["gt", "Is after"],
  ["gte", "Is on or after"],
  ["isBetween", "Is between"],
  ["isRelativeToToday", "Is relative to today"],
  ["isEmpty", "Is empty"],
  ["isNotEmpty", "Is not empty"]
).annotations(
  $I.annotations("DateOperatorLabelMap", {
    description:
      "Label map for date filter operators - eq, ne, lt, lte, gt, gte, isBetween, isRelativeToToday, isEmpty, isNotEmpty",
  })
) {}

export declare namespace DateOperatorLabelMap {
  export type Type = typeof DateOperatorLabelMap.Type;
  export type Encoded = typeof DateOperatorLabelMap.Encoded;
}

export class SelectOperatorLabelMap extends BS.MappedLiteralKit(
  ["eq", "Is"],
  ["ne", "Is not"],
  ["isEmpty", "Is empty"],
  ["isNotEmpty", "Is not empty"]
).annotations(
  $I.annotations("SelectOperatorLabelMap", {
    description: "Label map for select filter operators - eq, ne, isEmpty, isNotEmpty",
  })
) {}

export declare namespace SelectOperatorLabelMap {
  export type Type = typeof SelectOperatorLabelMap.Type;
  export type Encoded = typeof SelectOperatorLabelMap.Encoded;
}

export class MultiSelectOperatorLabelMap extends BS.MappedLiteralKit(
  ["inArray", "Has any of"],
  ["notInArray", "Has none of"],
  ["isEmpty", "Is empty"],
  ["isNotEmpty", "Is not empty"]
).annotations(
  $I.annotations("MultiSelectOperatorLabelMap", {
    description: "Label map for multi-select filter operators - inArray, notInArray, isEmpty, isNotEmpty",
  })
) {}

export declare namespace MultiSelectOperatorLabelMap {
  export type Type = typeof MultiSelectOperatorLabelMap.Type;
  export type Encoded = typeof MultiSelectOperatorLabelMap.Encoded;
}

export class BooleanOperatorLabelMap extends BS.MappedLiteralKit(["eq", "Is"], ["ne", "Is not"]).annotations(
  $I.annotations("BooleanOperatorLabelMap", {
    description: "Label map for boolean filter operators - eq, ne",
  })
) {}

export declare namespace BooleanOperatorLabelMap {
  export type Type = typeof BooleanOperatorLabelMap.Type;
  export type Encoded = typeof BooleanOperatorLabelMap.Encoded;
}

export class SortOrderLabelMap extends BS.MappedLiteralKit(["asc", "Asc"], ["desc", "Desc"]).annotations(
  $I.annotations("SortOrderLabelMap", {
    description: "Label map for sort order - asc, desc",
  })
) {}

export declare namespace SortOrderLabelMap {
  export type Type = typeof SortOrderLabelMap.Type;
  export type Encoded = typeof SortOrderLabelMap.Encoded;
}

export class JoinOperator extends BS.StringLiteralKit("and", "or").annotations(
  $I.annotations("JoinOperator", {
    description: "JoinOperator represents the type of join to apply - and for AND joins, or for OR joins",
  })
) {}

export declare namespace JoinOperator {
  export type Type = typeof JoinOperator.Type;
}

export class BaseFilterItem extends S.Class<BaseFilterItem>($I`BaseFilterItem`)(
  {
    filterId: S.String,
  },
  $I.annotations("BaseFilterItem", {
    description: "BaseFilterItem represents a filter item with an id and a filter id",
  })
) {}
