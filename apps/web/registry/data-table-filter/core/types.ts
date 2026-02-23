import type { LucideIcon } from 'lucide-react'
import * as Equal from "effect/Equal"
import * as Data from "effect/Data"
import * as Order from "effect/Order"
import * as Equivalence from "effect/Equivalence"
import * as Option from "effect/Option"
import * as DateTime from "effect/DateTime"
import { pipe, dual } from "effect/Function"
import { Pipeable, pipeArguments } from "effect/Pipeable"
/*
 * # GENERAL NOTES:
 *
 * ## GENERICS:
 *
 * TData is the shape of a single row in your data table.
 * TVal is the shape of the underlying value for a column.
 * TType is the type (kind) of the column.
 *
 */

export type ElementType<T> = T extends (infer U)[] ? U : T

export type Nullable<T> = T | null | undefined

// -----------------------------------------------------------------------------
// ColumnOption - Simple interface (plain objects are valid)
// -----------------------------------------------------------------------------

/*
 * The model of a column option.
 * Used for representing underlying column values of type `option` or `multiOption`.
 */
export interface ColumnOption {
  readonly label: string
  readonly value: string
  readonly icon?: React.ReactElement | React.ElementType
}

export const ColumnOption = {
  make: (args: {
    label: string
    value: string
    icon?: React.ReactElement | React.ElementType
  }): ColumnOption & Equal.Equal =>
    Data.struct({
      label: args.label,
      value: args.value,
      icon: args.icon,
    }),

  $is: (value: unknown): value is ColumnOption =>
    typeof value === 'object' &&
    value !== null &&
    'label' in value &&
    'value' in value &&
    typeof (value as any).label === 'string' &&
    typeof (value as any).value === 'string',

  Order: pipe(
    Order.string,
    Order.mapInput((option: ColumnOption) => option.value)
  ),

  Equivalence: pipe(
    Equivalence.string,
    Equivalence.mapInput((option: ColumnOption) => option.value)
  ),
} as const

export interface ColumnOptionExtended extends ColumnOption {
  readonly selected?: boolean
  readonly count?: number
}

export const ColumnOptionExtended = {
  make: (args: {
    label: string
    value: string
    icon?: React.ReactElement | React.ElementType
    selected?: boolean
    count?: number
  }): ColumnOptionExtended & Equal.Equal =>
    Data.struct({
      label: args.label,
      value: args.value,
      icon: args.icon,
      selected: args.selected,
      count: args.count,
    }),

  fromColumnOption: (
    option: ColumnOption,
    args?: { selected?: boolean; count?: number }
  ): ColumnOptionExtended & Equal.Equal =>
    Data.struct({
      label: option.label,
      value: option.value,
      icon: option.icon,
      selected: args?.selected,
      count: args?.count,
    }),

  $is: (value: unknown): value is ColumnOptionExtended =>
    ColumnOption.$is(value) &&
    (typeof (value as any).selected === 'undefined' ||
      typeof (value as any).selected === 'boolean') &&
    (typeof (value as any).count === 'undefined' ||
      typeof (value as any).count === 'number'),

  Order: pipe(
    Order.string,
    Order.mapInput((option: ColumnOptionExtended) => option.value)
  ),

  Equivalence: pipe(
    Equivalence.string,
    Equivalence.mapInput((option: ColumnOptionExtended) => option.value)
  ),
} as const

/*
 * Represents the data type (kind) of a column.
 */
export type ColumnDataType =
  /* The column value is a string that should be searchable. */
  | 'text'
  | 'number'
  | 'date'
  /* The column value can be a single value from a list of options. */
  | 'option'
  /* The column value can be zero or more values from a list of options. */
  | 'multiOption'

/*
 * Represents the data type (kind) of option and multi-option columns.
 */
export type OptionBasedColumnDataType = Extract<
  ColumnDataType,
  'option' | 'multiOption'
>

/*
 * Maps a ColumnDataType to it's primitive type (i.e. string, number, etc.).
 */
export type ColumnDataNativeMap = {
  text: string
  number: number
  date: DateTime.DateTime
  option: string
  multiOption: string[]
}

/*
 * Represents the value of a column filter.
 * Contigent on the filtered column's data type.
 */
export type FilterValues<T extends ColumnDataType> = Array<
  ElementType<ColumnDataNativeMap[T]>
>

/*
 * An accessor function for a column's data.
 * Uses the original row data as an argument.
 */
export type TAccessorFn<TData, TVal = unknown> = (data: TData) => TVal

/*
 * Used by `option` and `multiOption` columns.
 * Transforms the underlying column value into a valid ColumnOption.
 */
export type TTransformOptionFn<TVal = unknown> = (
  value: ElementType<NonNullable<TVal>>,
) => ColumnOption

/*
 * Used by `option` and `multiOption` columns.
 * A custom ordering function when sorting a column's options.
 */
export type TOrderFn<TVal = unknown> = (
  a: ElementType<NonNullable<TVal>>,
  b: ElementType<NonNullable<TVal>>,
) => number

/*
 * The configuration for a column.
 */
export type ColumnConfig<
  TData,
  TType extends ColumnDataType = any,
  TVal = unknown,
  TId extends string = string,
> = {
  id: TId
  accessor: TAccessorFn<TData, TVal>
  displayName: string
  icon: LucideIcon
  type: TType
  options?: TType extends OptionBasedColumnDataType ? ColumnOption[] : never
  facetedOptions?: TType extends OptionBasedColumnDataType
  ? Map<string, number>
  : never
  min?: TType extends 'number' ? number : never
  max?: TType extends 'number' ? number : never
  transformOptionFn?: TType extends OptionBasedColumnDataType
  ? TTransformOptionFn<TVal>
  : never
  orderFn?: TType extends OptionBasedColumnDataType ? TOrderFn<TVal> : never
}

export type OptionColumnId<T> = T extends ColumnConfig<
  infer TData,
  'option' | 'multiOption',
  infer TVal,
  infer TId
>
  ? TId
  : never

export type OptionColumnIds<
  T extends ReadonlyArray<ColumnConfig<any, any, any, any>>,
> = {
  [K in keyof T]: OptionColumnId<T[K]>
}[number]

export type NumberColumnId<T> = T extends ColumnConfig<
  infer TData,
  'number',
  infer TVal,
  infer TId
>
  ? TId
  : never

export type NumberColumnIds<
  T extends ReadonlyArray<ColumnConfig<any, any, any, any>>,
> = {
  [K in keyof T]: NumberColumnId<T[K]>
}[number]

/*
 * Describes a helper function for creating column configurations.
 */
export type ColumnConfigHelper<TData> = {
  accessor: <
    TAccessor extends TAccessorFn<TData>,
    TType extends ColumnDataType,
    TVal extends ReturnType<TAccessor>,
  >(
    accessor: TAccessor,
    config?: Omit<ColumnConfig<TData, TType, TVal>, 'accessor'>,
  ) => ColumnConfig<TData, TType, unknown>
}

export type DataTableFilterConfig<TData> = {
  data: TData[]
  columns: ColumnConfig<TData>[]
}

/**
 * Runtime properties for a Column - memoized getters and prefetch methods
 * @category Column
 * @since 1.0.0
 */
export type ColumnProperties<TData, TVal> = {
  getOptions: () => ColumnOption[]
  getValues: () => ElementType<NonNullable<TVal>>[]
  getFacetedUniqueValues: () => Map<string, number> | undefined
  getFacetedMinMaxValues: () => [number, number] | undefined
  prefetchOptions: () => Promise<void>
  prefetchValues: () => Promise<void>
  prefetchFacetedUniqueValues: () => Promise<void>
  prefetchFacetedMinMaxValues: () => Promise<void>
}

/**
 * Private cache storage for prefetched column data
 * @category Column
 * @since 1.0.0
 */
export type ColumnPrivateProperties<TData, TVal> = {
  _prefetchedOptionsCache: ColumnOption[] | null
  _prefetchedValuesCache: ElementType<NonNullable<TVal>>[] | null
  _prefetchedFacetedUniqueValuesCache: Map<string, number> | null
  _prefetchedFacetedMinMaxValuesCache: [number, number] | null
}

/**
 * Column combines static configuration with runtime behavior.
 * Extends Equal.Equal for structural equality on the config portion.
 * Implements Pipeable for functional composition.
 *
 * @category Column
 * @since 1.0.0
 */
export interface Column<
  TData,
  TType extends ColumnDataType = any,
  TVal = unknown,
> extends ColumnConfig<TData, TType, TVal>,
    ColumnProperties<TData, TVal>,
    ColumnPrivateProperties<TData, TVal>,
    Equal.Equal,
    Pipeable {
}

// -----------------------------------------------------------------------------
// Column Namespace - constructors, accessors, and pattern matching
// -----------------------------------------------------------------------------

/**
 * Type-level ordering of column data types for consistent operations
 */
const columnTypeOrder: Record<ColumnDataType, number> = {
  text: 0,
  number: 1,
  date: 2,
  option: 3,
  multiOption: 4
}

/**
 * Order for Column - sorts by id first, then by type
 */
export const ColumnOrder: Order.Order<Column<any>> = pipe(
  Order.string,
  Order.mapInput((c: Column<any>) => c.id),
  Order.combine(
    pipe(
      Order.number,
      Order.mapInput((c: Column<any>) => columnTypeOrder[c.type as ColumnDataType])
    )
  )
)

/**
 * Column namespace with constructors, accessors, and pattern matching utilities
 * @category Column
 * @since 1.0.0
 */
export const Column = {
  /**
   * Order for sorting columns
   */
  Order: ColumnOrder,

  /**
   * Type guard for checking if a value is a Column
   */
  $is: (u: unknown): u is Column<any> => {
    return (
      typeof u === "object" &&
      u !== null &&
      "id" in u &&
      "type" in u &&
      "accessor" in u &&
      "getOptions" in u &&
      "getValues" in u &&
      typeof (u as any).getOptions === "function" &&
      typeof (u as any).getValues === "function"
    )
  },

  /**
   * Type guard for checking column type
   */
  $isType: <T extends ColumnDataType>(type: T) =>
    <TData>(column: Column<TData>): column is Column<TData, T> =>
      column.type === type,

  /**
   * Pattern match on column type
   */
  $match: <TData, R>(matchers: {
    text: (column: Column<TData, 'text'>) => R
    number: (column: Column<TData, 'number'>) => R
    date: (column: Column<TData, 'date'>) => R
    option: (column: Column<TData, 'option'>) => R
    multiOption: (column: Column<TData, 'multiOption'>) => R
  }) =>
    (column: Column<TData>): R => {
      switch (column.type) {
        case 'text':
          return matchers.text(column as Column<TData, 'text'>)
        case 'number':
          return matchers.number(column as Column<TData, 'number'>)
        case 'date':
          return matchers.date(column as Column<TData, 'date'>)
        case 'option':
          return matchers.option(column as Column<TData, 'option'>)
        case 'multiOption':
          return matchers.multiOption(column as Column<TData, 'multiOption'>)
        default:
          throw new Error(`Unknown column type: ${(column as Column<TData>).type}`)
      }
    },

  /**
   * Get options from a column (pure accessor)
   */
  getOptions: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): ColumnOption[] => column.getOptions(),

  /**
   * Get values from a column (pure accessor)
   */
  getValues: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): ElementType<NonNullable<TVal>>[] => column.getValues(),

  /**
   * Get faceted unique values from a column (pure accessor)
   */
  getFacetedUniqueValues: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): Map<string, number> | undefined => column.getFacetedUniqueValues(),

  /**
   * Get faceted min/max values from a column (pure accessor)
   */
  getFacetedMinMaxValues: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): [number, number] | undefined => column.getFacetedMinMaxValues(),

  /**
   * Prefetch options for a column
   */
  prefetchOptions: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): Promise<void> => column.prefetchOptions(),

  /**
   * Prefetch values for a column
   */
  prefetchValues: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): Promise<void> => column.prefetchValues(),

  /**
   * Prefetch faceted unique values for a column
   */
  prefetchFacetedUniqueValues: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): Promise<void> => column.prefetchFacetedUniqueValues(),

  /**
   * Prefetch faceted min/max values for a column
   */
  prefetchFacetedMinMaxValues: <TData, TType extends ColumnDataType, TVal>(
    column: Column<TData, TType, TVal>
  ): Promise<void> => column.prefetchFacetedMinMaxValues(),
} as const

/*
 * Describes the available actions on column filters.
 * Includes both column-specific and global actions, ultimately acting on the column filters.
 */
export interface DataTableFilterActions {
  addFilterValue: <TData, TType extends OptionBasedColumnDataType>(
    column: Column<TData, TType>,
    values: readonly string[],
  ) => void

  removeFilterValue: <TData, TType extends OptionBasedColumnDataType>(
    column: Column<TData, TType>,
    value: readonly string[],
  ) => void

  setFilterValue: <TData, TType extends ColumnDataType>(
    column: Column<TData, TType>,
    values: readonly (string | number | DateTime.DateTime)[],
  ) => void

  setFilterOperator: (
    columnId: string,
    operator: TextOperator | NumberOperator | DateOperator | OptionOperator | MultiOptionOperator,
  ) => void

  removeFilter: (columnId: string) => void

  removeAllFilters: () => void
}

export type FilterStrategy = 'client' | 'server'

// -----------------------------------------------------------------------------
// Filter Operators - PascalCase string literals for TaggedEnum
// -----------------------------------------------------------------------------

/* Operators for text data */
export type TextOperator = "Contains" | "DoesNotContain"

/* Operators for number data */
export type NumberOperator =
  | "Is"
  | "IsNot"
  | "IsLessThan"
  | "IsGreaterThan"
  | "IsBetween"
  | "IsNotBetween"
  | "IsLessThanOrEqualTo"
  | "IsGreaterThanOrEqualTo"

/* Operators for date data */
export type DateOperator =
  | "Is"
  | "IsNot"
  | "IsBefore"
  | "IsAfter"
  | "IsOnOrBefore"
  | "IsOnOrAfter"
  | "IsBetween"
  | "IsNotBetween"

/* Operators for option data */
export type OptionOperator = "Is" | "IsNot" | "IsAnyOf" | "IsNoneOf"

/* Operators for multi-option data */
export type MultiOptionOperator =
  | "Include"
  | "Exclude"
  | "IncludeAnyOf"
  | "IncludeAllOf"
  | "ExcludeIfAnyOf"
  | "ExcludeIfAll"

// Legacy operator types (lowercase) - kept for backwards compatibility
export type TextFilterOperator = 'contains' | 'does not contain'
export type NumberFilterOperator =
  | 'is'
  | 'is not'
  | 'is less than'
  | 'is greater than or equal to'
  | 'is greater than'
  | 'is less than or equal to'
  | 'is between'
  | 'is not between'
export type DateFilterOperator =
  | 'is'
  | 'is not'
  | 'is before'
  | 'is on or after'
  | 'is after'
  | 'is on or before'
  | 'is between'
  | 'is not between'
export type OptionFilterOperator = 'is' | 'is not' | 'is any of' | 'is none of'
export type MultiOptionFilterOperator =
  | 'include'
  | 'exclude'
  | 'include any of'
  | 'include all of'
  | 'exclude if any of'
  | 'exclude if all'

/* Maps filter operators to their respective data types */
export type FilterOperators = {
  text: TextFilterOperator
  number: NumberFilterOperator
  date: DateFilterOperator
  option: OptionFilterOperator
  multiOption: MultiOptionFilterOperator
}

// -----------------------------------------------------------------------------
// FilterModel TaggedEnum - Type Definitions
// -----------------------------------------------------------------------------

/**
 * FilterModel TaggedEnum definition
 * Each variant has: columnId, operator, values
 *
 * @category FilterModel
 * @since 1.0.0
 */
type FilterModelDef = {
  readonly Text: {
    readonly columnId: string
    readonly operator: TextOperator
    readonly values: readonly string[]
  }
  readonly Number: {
    readonly columnId: string
    readonly operator: NumberOperator
    readonly values: readonly number[]
  }
  readonly Date: {
    readonly columnId: string
    readonly operator: DateOperator
    readonly values: readonly DateTime.DateTime[]
  }
  readonly Option: {
    readonly columnId: string
    readonly operator: OptionOperator
    readonly values: readonly string[]
  }
  readonly MultiOption: {
    readonly columnId: string
    readonly operator: MultiOptionOperator
    readonly values: readonly string[]
  }
}

/**
 * FilterModel - A tagged union representing different filter types
 *
 * @category FilterModel
 * @since 1.0.0
 */
export type FilterModel = Data.TaggedEnum<FilterModelDef>

/**
 * FilterModel extends Data.TaggedEnum.Value to provide type inference
 *
 * @category FilterModel
 * @since 1.0.0
 */
export interface FilterModel extends Data.TaggedEnum.Value<FilterModelDef, "_tag"> {}

/**
 * Individual filter types extracted from the TaggedEnum
 *
 * @category FilterModel
 * @since 1.0.0
 */
export type TextFilter = Data.TaggedEnum.Value<FilterModelDef, "Text">
export type NumberFilter = Data.TaggedEnum.Value<FilterModelDef, "Number">
export type DateFilter = Data.TaggedEnum.Value<FilterModelDef, "Date">
export type OptionFilter = Data.TaggedEnum.Value<FilterModelDef, "Option">
export type MultiOptionFilter = Data.TaggedEnum.Value<FilterModelDef, "MultiOption">

// Legacy type names for backwards compatibility
export type TextFilterModel = TextFilter
export type NumberFilterModel = NumberFilter
export type DateFilterModel = DateFilter
export type OptionFilterModel = OptionFilter
export type MultiOptionFilterModel = MultiOptionFilter

/**
 * FiltersState - readonly array of FilterModel
 *
 * @category FilterModel
 * @since 1.0.0
 */
export type FiltersState = readonly FilterModel[]

// -----------------------------------------------------------------------------
// FiltersState Namespace - pure functional operations for filter collections
// -----------------------------------------------------------------------------

/**
 * FiltersState namespace with pure functional operations for managing filter collections.
 * All operations are immutable and use dual API for pipe compatibility.
 *
 * @category FiltersState
 * @since 1.0.0
 */
export const FiltersState = {
  /**
   * Create an empty FiltersState
   *
   * @category Constructors
   * @since 1.0.0
   */
  empty: (): FiltersState => [],

  /**
   * Add a filter to the state (appends at the end)
   *
   * @category Operations
   * @since 1.0.0
   */
  add: dual<
    (filter: FilterModel) => (self: FiltersState) => FiltersState,
    (self: FiltersState, filter: FilterModel) => FiltersState
  >(2, (self, filter) => [...self, filter]),

  /**
   * Remove all filters matching the given columnId
   *
   * @category Operations
   * @since 1.0.0
   */
  remove: dual<
    (columnId: string) => (self: FiltersState) => FiltersState,
    (self: FiltersState, columnId: string) => FiltersState
  >(2, (self, columnId) => self.filter(f => f.columnId !== columnId)),

  /**
   * Find the first filter matching the given columnId
   *
   * @category Queries
   * @since 1.0.0
   */
  findByColumnId: dual<
    (columnId: string) => (self: FiltersState) => Option.Option<FilterModel>,
    (self: FiltersState, columnId: string) => Option.Option<FilterModel>
  >(2, (self, columnId) => {
    const found = self.find(f => f.columnId === columnId)
    return found !== undefined ? Option.some(found) : Option.none()
  }),

  /**
   * Update all filters matching the given columnId using the provided function
   *
   * @category Operations
   * @since 1.0.0
   */
  updateByColumnId: dual<
    (columnId: string, fn: (filter: FilterModel) => FilterModel) => (self: FiltersState) => FiltersState,
    (self: FiltersState, columnId: string, fn: (filter: FilterModel) => FilterModel) => FiltersState
  >(3, (self, columnId, fn) => self.map(f => f.columnId === columnId ? fn(f) : f)),
} as const

/*
 * FilterDetails is a type that represents the details of all the filter operators for a specific column data type.
 */
export type FilterDetails<T extends ColumnDataType> = {
  [key in FilterOperators[T]]: FilterOperatorDetails<key, T>
}

export type FilterOperatorTarget = 'single' | 'multiple'

/*
 * FilterOperatorDetails is an interface that provides details about a filter operator for a specific column data type.
 * Implements Equal.Equal for structural equality comparison using Data.struct.
 */
export interface FilterOperatorDetails<
  OperatorValue,
  T extends ColumnDataType,
> extends Equal.Equal {
  /* The i18n key for the operator. */
  readonly key: string
  /* The operator value. Usually the string representation of the operator. */
  readonly value: OperatorValue
  /* How much data the operator applies to. */
  readonly target: FilterOperatorTarget
  /* The plural form of the operator, if applicable. */
  readonly singularOf?: FilterOperators[T]
  /* The singular form of the operator, if applicable. */
  readonly pluralOf?: FilterOperators[T]
  /* All related operators. Normally, all the operators which share the same target. */
  readonly relativeOf: FilterOperators[T] | ReadonlyArray<FilterOperators[T]>
  /* Whether the operator is negated. */
  readonly isNegated: boolean
  /* If the operator is not negated, this provides the negated equivalent. */
  readonly negation?: FilterOperators[T]
  /* If the operator is negated, this provides the positive equivalent. */
  readonly negationOf?: FilterOperators[T]
}

/* Maps column data types to their respective filter operator details */
export type FilterTypeOperatorDetails = {
  [key in ColumnDataType]: FilterDetails<key>
}

// -----------------------------------------------------------------------------
// FilterOperator Namespace - constructors, type guards, and utilities
// -----------------------------------------------------------------------------

/**
 * FilterOperator namespace with constructors and utility functions for working with filter operator details
 * @since 1.0.0
 * @category operators
 */
export const FilterOperator = {
  /**
   * Create a single-target filter operator with structural equality
   */
  single: <T extends ColumnDataType>(args: {
    readonly key: string
    readonly value: FilterOperators[T]
    readonly singularOf?: FilterOperators[T]
    readonly relativeOf: FilterOperators[T] | ReadonlyArray<FilterOperators[T]>
    readonly isNegated: boolean
    readonly negation?: FilterOperators[T]
    readonly negationOf?: FilterOperators[T]
  }): FilterOperatorDetails<FilterOperators[T], T> =>
    Data.struct({
      key: args.key,
      value: args.value,
      target: 'single' as const,
      singularOf: args.singularOf,
      relativeOf: args.relativeOf,
      isNegated: args.isNegated,
      negation: args.negation,
      negationOf: args.negationOf,
    }) as FilterOperatorDetails<FilterOperators[T], T>,

  /**
   * Create a multiple-target filter operator with structural equality
   */
  multiple: <T extends ColumnDataType>(args: {
    readonly key: string
    readonly value: FilterOperators[T]
    readonly pluralOf?: FilterOperators[T]
    readonly relativeOf: FilterOperators[T] | ReadonlyArray<FilterOperators[T]>
    readonly isNegated: boolean
    readonly negation?: FilterOperators[T]
    readonly negationOf?: FilterOperators[T]
  }): FilterOperatorDetails<FilterOperators[T], T> =>
    Data.struct({
      key: args.key,
      value: args.value,
      target: 'multiple' as const,
      pluralOf: args.pluralOf,
      relativeOf: args.relativeOf,
      isNegated: args.isNegated,
      negation: args.negation,
      negationOf: args.negationOf,
    }) as FilterOperatorDetails<FilterOperators[T], T>,

  /**
   * Type guard to check if an operator is single-target
   */
  $is: {
    single: <T extends ColumnDataType>(
      op: FilterOperatorDetails<FilterOperators[T], T>
    ): op is FilterOperatorDetails<FilterOperators[T], T> & { target: 'single' } =>
      op.target === 'single',

    multiple: <T extends ColumnDataType>(
      op: FilterOperatorDetails<FilterOperators[T], T>
    ): op is FilterOperatorDetails<FilterOperators[T], T> & { target: 'multiple' } =>
      op.target === 'multiple',
  },

  /**
   * Check if an operator is negated
   */
  isNegated: <T extends ColumnDataType>(
    op: FilterOperatorDetails<FilterOperators[T], T>
  ): boolean => op.isNegated,

  /**
   * Get the negation of an operator
   * Returns undefined if the operator has no negation
   */
  getNegation: <T extends ColumnDataType>(
    op: FilterOperatorDetails<FilterOperators[T], T>
  ): FilterOperators[T] | undefined =>
    op.isNegated ? op.negationOf : op.negation,

  /**
   * Get the related operators for a given operator
   * Always returns an array for consistent handling
   */
  getRelatives: <T extends ColumnDataType>(
    op: FilterOperatorDetails<FilterOperators[T], T>
  ): ReadonlyArray<FilterOperators[T]> =>
    Array.isArray(op.relativeOf) ? op.relativeOf : [op.relativeOf],

  /**
   * Get the singular form of an operator
   * Returns undefined if the operator has no singular form
   */
  getSingular: <T extends ColumnDataType>(
    op: FilterOperatorDetails<FilterOperators[T], T>
  ): FilterOperators[T] | undefined =>
    'singularOf' in op ? op.singularOf : undefined,

  /**
   * Get the plural form of an operator
   * Returns undefined if the operator has no plural form
   */
  getPlural: <T extends ColumnDataType>(
    op: FilterOperatorDetails<FilterOperators[T], T>
  ): FilterOperators[T] | undefined =>
    'pluralOf' in op ? op.pluralOf : undefined,
} as const

// -----------------------------------------------------------------------------
// Filter Namespace - constructors, pattern matching, and ordering
// -----------------------------------------------------------------------------

/**
 * Type-level ordering of filter tags for consistent cache key generation
 */
const tagOrder: Record<FilterModel["_tag"], number> = {
  Text: 0,
  Number: 1,
  Date: 2,
  Option: 3,
  MultiOption: 4
}

/**
 * Order for FilterModel - sorts by columnId first, then by _tag
 */
export const FilterOrder: Order.Order<FilterModel> = pipe(
  Order.string,
  Order.mapInput((f: FilterModel) => f.columnId),
  Order.combine(
    pipe(
      Order.number,
      Order.mapInput((f: FilterModel) => tagOrder[f._tag])
    )
  )
)

/**
 * Create FilterModel instances using Data.taggedEnum
 * Provides constructors, pattern matching, and type guards
 *
 * @category FilterModel
 * @since 1.0.0
 */
const { Text, Number: NumberCtor, Date: DateCtor, Option: OptionCtor, MultiOption: MultiOptionCtor, $is, $match } = Data.taggedEnum<FilterModel>()

// -----------------------------------------------------------------------------
// Filter Builder Interfaces - compositional API for filter construction
// Single-target operators take single values, multiple-target operators take arrays
// -----------------------------------------------------------------------------

/**
 * Builder for Text filters with chainable operator methods
 * All text operators are single-target
 *
 * @category FilterBuilder
 * @since 1.0.0
 */
export interface TextFilterBuilder {
  readonly columnId: string
  readonly Contains: (value: string) => TextFilter
  readonly DoesNotContain: (value: string) => TextFilter
}

/**
 * Builder for Number filters with chainable operator methods
 * Single-target: Is, IsNot, IsLessThan, IsGreaterThan, etc.
 * Multiple-target: IsBetween, IsNotBetween
 *
 * @category FilterBuilder
 * @since 1.0.0
 */
export interface NumberFilterBuilder {
  readonly columnId: string
  // Single-target operators
  readonly Is: (value: number) => NumberFilter
  readonly IsNot: (value: number) => NumberFilter
  readonly IsLessThan: (value: number) => NumberFilter
  readonly IsGreaterThan: (value: number) => NumberFilter
  readonly IsLessThanOrEqualTo: (value: number) => NumberFilter
  readonly IsGreaterThanOrEqualTo: (value: number) => NumberFilter
  // Multiple-target operators (range)
  readonly IsBetween: (values: readonly [number, number]) => NumberFilter
  readonly IsNotBetween: (values: readonly [number, number]) => NumberFilter
}

/**
 * Builder for Date filters with chainable operator methods
 * Single-target: Is, IsNot, IsBefore, IsAfter, IsOnOrBefore, IsOnOrAfter
 * Multiple-target: IsBetween, IsNotBetween
 *
 * @category FilterBuilder
 * @since 1.0.0
 */
export interface DateFilterBuilder {
  readonly columnId: string
  // Single-target operators
  readonly Is: (value: DateTime.DateTime) => DateFilter
  readonly IsNot: (value: DateTime.DateTime) => DateFilter
  readonly IsBefore: (value: DateTime.DateTime) => DateFilter
  readonly IsAfter: (value: DateTime.DateTime) => DateFilter
  readonly IsOnOrBefore: (value: DateTime.DateTime) => DateFilter
  readonly IsOnOrAfter: (value: DateTime.DateTime) => DateFilter
  // Multiple-target operators (range)
  readonly IsBetween: (values: readonly [DateTime.DateTime, DateTime.DateTime]) => DateFilter
  readonly IsNotBetween: (values: readonly [DateTime.DateTime, DateTime.DateTime]) => DateFilter
}

/**
 * Builder for Option filters with chainable operator methods
 * Single-target: Is, IsNot
 * Multiple-target: IsAnyOf, IsNoneOf
 *
 * @category FilterBuilder
 * @since 1.0.0
 */
export interface OptionFilterBuilder {
  readonly columnId: string
  // Single-target operators
  readonly Is: (value: string) => OptionFilter
  readonly IsNot: (value: string) => OptionFilter
  // Multiple-target operators
  readonly IsAnyOf: (values: ReadonlyArray<string>) => OptionFilter
  readonly IsNoneOf: (values: ReadonlyArray<string>) => OptionFilter
}

/**
 * Builder for MultiOption filters with chainable operator methods
 * Single-target: Include, Exclude
 * Multiple-target: IncludeAnyOf, IncludeAllOf, ExcludeIfAnyOf, ExcludeIfAll
 *
 * @category FilterBuilder
 * @since 1.0.0
 */
export interface MultiOptionFilterBuilder {
  readonly columnId: string
  // Single-target operators
  readonly Include: (value: string) => MultiOptionFilter
  readonly Exclude: (value: string) => MultiOptionFilter
  // Multiple-target operators
  readonly IncludeAnyOf: (values: ReadonlyArray<string>) => MultiOptionFilter
  readonly IncludeAllOf: (values: ReadonlyArray<string>) => MultiOptionFilter
  readonly ExcludeIfAnyOf: (values: ReadonlyArray<string>) => MultiOptionFilter
  readonly ExcludeIfAll: (values: ReadonlyArray<string>) => MultiOptionFilter
}

// -----------------------------------------------------------------------------
// Filter Builder Implementations
// Single values are wrapped in arrays internally for consistent storage
// -----------------------------------------------------------------------------

/**
 * Create a TextFilterBuilder for the given columnId
 */
const textFilterBuilder = (columnId: string): TextFilterBuilder => ({
  columnId,
  // Single-target: wrap value in array
  Contains: (value) => Text({ columnId, operator: "Contains", values: Data.array([value]) as any }),
  DoesNotContain: (value) => Text({ columnId, operator: "DoesNotContain", values: Data.array([value]) as any }),
})

/**
 * Create a NumberFilterBuilder for the given columnId
 */
const numberFilterBuilder = (columnId: string): NumberFilterBuilder => ({
  columnId,
  // Single-target: wrap value in array
  Is: (value) => NumberCtor({ columnId, operator: "Is", values: Data.array([value]) as any }),
  IsNot: (value) => NumberCtor({ columnId, operator: "IsNot", values: Data.array([value]) as any }),
  IsLessThan: (value) => NumberCtor({ columnId, operator: "IsLessThan", values: Data.array([value]) as any }),
  IsGreaterThan: (value) => NumberCtor({ columnId, operator: "IsGreaterThan", values: Data.array([value]) as any }),
  IsLessThanOrEqualTo: (value) => NumberCtor({ columnId, operator: "IsLessThanOrEqualTo", values: Data.array([value]) as any }),
  IsGreaterThanOrEqualTo: (value) => NumberCtor({ columnId, operator: "IsGreaterThanOrEqualTo", values: Data.array([value]) as any }),
  // Multiple-target: spread array directly
  IsBetween: (values) => NumberCtor({ columnId, operator: "IsBetween", values: Data.array([...values]) as any }),
  IsNotBetween: (values) => NumberCtor({ columnId, operator: "IsNotBetween", values: Data.array([...values]) as any }),
})

/**
 * Create a DateFilterBuilder for the given columnId
 */
const dateFilterBuilder = (columnId: string): DateFilterBuilder => ({
  columnId,
  // Single-target: wrap value in array
  Is: (value) => DateCtor({ columnId, operator: "Is", values: Data.array([value]) as any }),
  IsNot: (value) => DateCtor({ columnId, operator: "IsNot", values: Data.array([value]) as any }),
  IsBefore: (value) => DateCtor({ columnId, operator: "IsBefore", values: Data.array([value]) as any }),
  IsAfter: (value) => DateCtor({ columnId, operator: "IsAfter", values: Data.array([value]) as any }),
  IsOnOrBefore: (value) => DateCtor({ columnId, operator: "IsOnOrBefore", values: Data.array([value]) as any }),
  IsOnOrAfter: (value) => DateCtor({ columnId, operator: "IsOnOrAfter", values: Data.array([value]) as any }),
  // Multiple-target: spread array directly
  IsBetween: (values) => DateCtor({ columnId, operator: "IsBetween", values: Data.array([...values]) as any }),
  IsNotBetween: (values) => DateCtor({ columnId, operator: "IsNotBetween", values: Data.array([...values]) as any }),
})

/**
 * Create an OptionFilterBuilder for the given columnId
 */
const optionFilterBuilder = (columnId: string): OptionFilterBuilder => ({
  columnId,
  // Single-target: wrap value in array
  Is: (value) => OptionCtor({ columnId, operator: "Is", values: Data.array([value]) as any }),
  IsNot: (value) => OptionCtor({ columnId, operator: "IsNot", values: Data.array([value]) as any }),
  // Multiple-target: spread array directly
  IsAnyOf: (values) => OptionCtor({ columnId, operator: "IsAnyOf", values: Data.array([...values]) as any }),
  IsNoneOf: (values) => OptionCtor({ columnId, operator: "IsNoneOf", values: Data.array([...values]) as any }),
})

/**
 * Create a MultiOptionFilterBuilder for the given columnId
 */
const multiOptionFilterBuilder = (columnId: string): MultiOptionFilterBuilder => ({
  columnId,
  // Single-target: wrap value in array
  Include: (value) => MultiOptionCtor({ columnId, operator: "Include", values: Data.array([value]) as any }),
  Exclude: (value) => MultiOptionCtor({ columnId, operator: "Exclude", values: Data.array([value]) as any }),
  // Multiple-target: spread array directly
  IncludeAnyOf: (values) => MultiOptionCtor({ columnId, operator: "IncludeAnyOf", values: Data.array([...values]) as any }),
  IncludeAllOf: (values) => MultiOptionCtor({ columnId, operator: "IncludeAllOf", values: Data.array([...values]) as any }),
  ExcludeIfAnyOf: (values) => MultiOptionCtor({ columnId, operator: "ExcludeIfAnyOf", values: Data.array([...values]) as any }),
  ExcludeIfAll: (values) => MultiOptionCtor({ columnId, operator: "ExcludeIfAll", values: Data.array([...values]) as any }),
})

// -----------------------------------------------------------------------------
// Standalone operator functions for pipe-based composition
// -----------------------------------------------------------------------------

/**
 * Standalone operator functions for text filters (pipe-compatible)
 */
export const TextOperators = {
  Contains: (values: readonly string[]) => (builder: TextFilterBuilder) => builder.Contains(values),
  DoesNotContain: (values: readonly string[]) => (builder: TextFilterBuilder) => builder.DoesNotContain(values),
} as const

/**
 * Standalone operator functions for number filters (pipe-compatible)
 */
export const NumberOperators = {
  Is: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.Is(values),
  IsNot: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsNot(values),
  IsLessThan: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsLessThan(values),
  IsGreaterThan: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsGreaterThan(values),
  IsBetween: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsBetween(values),
  IsNotBetween: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsNotBetween(values),
  IsLessThanOrEqualTo: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsLessThanOrEqualTo(values),
  IsGreaterThanOrEqualTo: (values: readonly number[]) => (builder: NumberFilterBuilder) => builder.IsGreaterThanOrEqualTo(values),
} as const

/**
 * Standalone operator functions for date filters (pipe-compatible)
 */
export const DateOperators = {
  Is: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.Is(values),
  IsNot: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsNot(values),
  IsBefore: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsBefore(values),
  IsAfter: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsAfter(values),
  IsOnOrBefore: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsOnOrBefore(values),
  IsOnOrAfter: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsOnOrAfter(values),
  IsBetween: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsBetween(values),
  IsNotBetween: (values: readonly DateTime.DateTime[]) => (builder: DateFilterBuilder) => builder.IsNotBetween(values),
} as const

/**
 * Standalone operator functions for option filters (pipe-compatible)
 */
export const OptionOperators = {
  Is: (values: readonly string[]) => (builder: OptionFilterBuilder) => builder.Is(values),
  IsNot: (values: readonly string[]) => (builder: OptionFilterBuilder) => builder.IsNot(values),
  IsAnyOf: (values: readonly string[]) => (builder: OptionFilterBuilder) => builder.IsAnyOf(values),
  IsNoneOf: (values: readonly string[]) => (builder: OptionFilterBuilder) => builder.IsNoneOf(values),
} as const

/**
 * Standalone operator functions for multi-option filters (pipe-compatible)
 */
export const MultiOptionOperators = {
  Include: (values: readonly string[]) => (builder: MultiOptionFilterBuilder) => builder.Include(values),
  Exclude: (values: readonly string[]) => (builder: MultiOptionFilterBuilder) => builder.Exclude(values),
  IncludeAnyOf: (values: readonly string[]) => (builder: MultiOptionFilterBuilder) => builder.IncludeAnyOf(values),
  IncludeAllOf: (values: readonly string[]) => (builder: MultiOptionFilterBuilder) => builder.IncludeAllOf(values),
  ExcludeIfAnyOf: (values: readonly string[]) => (builder: MultiOptionFilterBuilder) => builder.ExcludeIfAnyOf(values),
  ExcludeIfAll: (values: readonly string[]) => (builder: MultiOptionFilterBuilder) => builder.ExcludeIfAll(values),
} as const

/**
 * Filter namespace with builder pattern constructors, pattern matching, and pure functional operations.
 *
 * @category FilterModel
 * @since 1.0.0
 */
export const Filter = {
  /**
   * Create a TextFilterBuilder for compositional filter construction
   * Usage: Filter.Text("columnId").Contains(["value"])
   * Or: pipe(Filter.Text("columnId"), TextOperators.Contains(["value"]))
   *
   * @category Constructors
   * @since 1.0.0
   */
  Text: textFilterBuilder,

  /**
   * Create a NumberFilterBuilder for compositional filter construction
   * Usage: Filter.Number("columnId").Is([42])
   * Or: pipe(Filter.Number("columnId"), NumberOperators.Is([42]))
   *
   * @category Constructors
   * @since 1.0.0
   */
  Number: numberFilterBuilder,

  /**
   * Create a DateFilterBuilder for compositional filter construction
   * Usage: Filter.Date("columnId").Is([dateTime])
   * Or: pipe(Filter.Date("columnId"), DateOperators.Is([dateTime]))
   *
   * @category Constructors
   * @since 1.0.0
   */
  Date: dateFilterBuilder,

  /**
   * Create an OptionFilterBuilder for compositional filter construction
   * Usage: Filter.Option("columnId").Is(["value"])
   * Or: pipe(Filter.Option("columnId"), OptionOperators.Is(["value"]))
   *
   * @category Constructors
   * @since 1.0.0
   */
  Option: optionFilterBuilder,

  /**
   * Create a MultiOptionFilterBuilder for compositional filter construction
   * Usage: Filter.MultiOption("columnId").Include(["value"])
   * Or: pipe(Filter.MultiOption("columnId"), MultiOptionOperators.Include(["value"]))
   *
   * @category Constructors
   * @since 1.0.0
   */
  MultiOption: multiOptionFilterBuilder,

  /**
   * Type guard for checking if value has a specific _tag
   *
   * @category Type Guards
   * @since 1.0.0
   */
  $is,

  /**
   * Pattern match on FilterModel _tag
   *
   * @category Pattern Matching
   * @since 1.0.0
   */
  $match,

  /**
   * Add a value to a filter (dual API - supports both piped and direct calls)
   *
   * @category Operations
   * @since 1.0.0
   */
  addValue: dual<
    <V>(value: V) => (self: FilterModel) => FilterModel,
    <V>(self: FilterModel, value: V) => FilterModel
  >(2, (self, value) =>
    $match(self, {
      Text: (f) => Text({ ...f, values: Data.array([...f.values, value as string]) as any }),
      Number: (f) => NumberCtor({ ...f, values: Data.array([...f.values, value as number]) as any }),
      Date: (f) => DateCtor({ ...f, values: Data.array([...f.values, value as DateTime.DateTime]) as any }),
      Option: (f) => OptionCtor({ ...f, values: Data.array([...f.values, value as string]) as any }),
      MultiOption: (f) => MultiOptionCtor({ ...f, values: Data.array([...f.values, value as string]) as any }),
    })
  ),

  /**
   * Remove a value from a filter (dual API - supports both piped and direct calls)
   *
   * @category Operations
   * @since 1.0.0
   */
  removeValue: dual<
    <V>(value: V) => (self: FilterModel) => FilterModel,
    <V>(self: FilterModel, value: V) => FilterModel
  >(2, (self, value) =>
    $match(self, {
      Text: (f) => Text({
        ...f,
        values: Data.array(f.values.filter(v => !Equal.equals(v, value))) as any
      }),
      Number: (f) => NumberCtor({
        ...f,
        values: Data.array(f.values.filter(v => !Equal.equals(v, value))) as any
      }),
      Date: (f) => DateCtor({
        ...f,
        values: Data.array(f.values.filter(v => !Equal.equals(v, value))) as any
      }),
      Option: (f) => OptionCtor({
        ...f,
        values: Data.array(f.values.filter(v => !Equal.equals(v, value))) as any
      }),
      MultiOption: (f) => MultiOptionCtor({
        ...f,
        values: Data.array(f.values.filter(v => !Equal.equals(v, value))) as any
      }),
    })
  ),

  /**
   * Set the operator on a filter (dual API - supports both piped and direct calls)
   *
   * @category Operations
   * @since 1.0.0
   */
  setOperator: dual<
    <Op>(operator: Op) => (self: FilterModel) => FilterModel,
    <Op>(self: FilterModel, operator: Op) => FilterModel
  >(2, (self, operator) =>
    $match(self, {
      Text: (f) => Text({ ...f, operator: operator as TextOperator }),
      Number: (f) => NumberCtor({ ...f, operator: operator as NumberOperator }),
      Date: (f) => DateCtor({ ...f, operator: operator as DateOperator }),
      Option: (f) => OptionCtor({ ...f, operator: operator as OptionOperator }),
      MultiOption: (f) => MultiOptionCtor({ ...f, operator: operator as MultiOptionOperator }),
    })
  ),

  /**
   * Set all values on a filter (dual API - supports both piped and direct calls)
   *
   * @category Operations
   * @since 1.0.0
   */
  setValues: dual<
    <V extends readonly any[]>(values: V) => (self: FilterModel) => FilterModel,
    <V extends readonly any[]>(self: FilterModel, values: V) => FilterModel
  >(2, (self, values) =>
    $match(self, {
      Text: (f) => Text({ ...f, values: Data.array([...values]) as any }),
      Number: (f) => NumberCtor({ ...f, values: Data.array([...values]) as any }),
      Date: (f) => DateCtor({ ...f, values: Data.array([...values]) as any }),
      Option: (f) => OptionCtor({ ...f, values: Data.array([...values]) as any }),
      MultiOption: (f) => MultiOptionCtor({ ...f, values: Data.array([...values]) as any }),
    })
  ),

  /**
   * Normalize a filter to have stable hash (wrap values with Data.array)
   *
   * @category Utilities
   * @since 1.0.0
   */
  normalize: (filter: FilterModel): FilterModel =>
    $match(filter, {
      Text: (f) => Text({ ...f, values: Data.array([...f.values]) as any }),
      Number: (f) => NumberCtor({ ...f, values: Data.array([...f.values]) as any }),
      Date: (f) => DateCtor({ ...f, values: Data.array([...f.values]) as any }),
      Option: (f) => OptionCtor({ ...f, values: Data.array([...f.values]) as any }),
      MultiOption: (f) => MultiOptionCtor({ ...f, values: Data.array([...f.values]) as any }),
    }),

  /**
   * Order for sorting filters (needed for cache key generation)
   *
   * @category Ordering
   * @since 1.0.0
   */
  Order: FilterOrder,

  /**
   * Convert filters to a sorted Data.array for use as cache key
   * Each filter is normalized (values wrapped with Data.array) for stable hashing
   *
   * @category Utilities
   * @since 1.0.0
   */
  toKey: (filters: FiltersState): Readonly<FiltersState> =>
    Data.array(
      [...filters]
        .map(Filter.normalize)
        .sort(FilterOrder)
    ) as Readonly<FiltersState>
} as const

