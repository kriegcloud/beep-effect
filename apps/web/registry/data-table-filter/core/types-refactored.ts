import type { LucideIcon } from 'lucide-react'
import * as Equal from "effect/Equal"
import * as Data from "effect/Data"
import * as Order from "effect/Order"
import * as Equivalence from "effect/Equivalence"
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

/*
 * The model of a column option.
 * Used for representing underlying column values of type `option` or `multiOption`.
 */
export interface ColumnOption {
  /* The label to display for the option. */
  label: string
  /* The internal value of the option. */
  value: string
  /* An optional icon to display next to the label. */
  icon?: React.ReactElement | React.ElementType
}

export interface ColumnOptionExtended extends ColumnOption {
  selected?: boolean
  count?: number
}

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
  date: Date
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

// -----------------------------------------------------------------------------
// ColumnConfig - functional column configuration with Equal and Pipeable
// -----------------------------------------------------------------------------

/**
 * Base interface for column configuration
 */
interface ColumnConfigBase<
  TData,
  TType extends ColumnDataType,
  TVal,
  TId extends string
> extends Equal.Equal, Pipeable {
  readonly id: TId
  readonly accessor: TAccessorFn<TData, TVal>
  readonly displayName: string
  readonly icon: LucideIcon
  readonly type: TType
}

/**
 * Text column configuration
 */
export interface TextColumnConfig<TData, TVal, TId extends string = string>
  extends ColumnConfigBase<TData, 'text', TVal, TId> {
  readonly type: 'text'
}

/**
 * Number column configuration
 */
export interface NumberColumnConfig<TData, TVal, TId extends string = string>
  extends ColumnConfigBase<TData, 'number', TVal, TId> {
  readonly type: 'number'
  readonly min?: number
  readonly max?: number
}

/**
 * Date column configuration
 */
export interface DateColumnConfig<TData, TVal, TId extends string = string>
  extends ColumnConfigBase<TData, 'date', TVal, TId> {
  readonly type: 'date'
}

/**
 * Option column configuration
 */
export interface OptionColumnConfig<TData, TVal, TId extends string = string>
  extends ColumnConfigBase<TData, 'option', TVal, TId> {
  readonly type: 'option'
  readonly options?: ColumnOption[]
  readonly facetedOptions?: Map<string, number>
  readonly transformOptionFn?: TTransformOptionFn<TVal>
  readonly orderFn?: TOrderFn<TVal>
}

/**
 * MultiOption column configuration
 */
export interface MultiOptionColumnConfig<TData, TVal, TId extends string = string>
  extends ColumnConfigBase<TData, 'multiOption', TVal, TId> {
  readonly type: 'multiOption'
  readonly options?: ColumnOption[]
  readonly facetedOptions?: Map<string, number>
  readonly transformOptionFn?: TTransformOptionFn<TVal>
  readonly orderFn?: TOrderFn<TVal>
}

/**
 * Union type for all column configurations
 */
export type ColumnConfig<
  TData = any,
  TType extends ColumnDataType = any,
  TVal = unknown,
  TId extends string = string,
> =
  TType extends 'text' ? TextColumnConfig<TData, TVal, TId> :
  TType extends 'number' ? NumberColumnConfig<TData, TVal, TId> :
  TType extends 'date' ? DateColumnConfig<TData, TVal, TId> :
  TType extends 'option' ? OptionColumnConfig<TData, TVal, TId> :
  TType extends 'multiOption' ? MultiOptionColumnConfig<TData, TVal, TId> :
  TextColumnConfig<TData, TVal, TId> |
  NumberColumnConfig<TData, TVal, TId> |
  DateColumnConfig<TData, TVal, TId> |
  OptionColumnConfig<TData, TVal, TId> |
  MultiOptionColumnConfig<TData, TVal, TId>

/**
 * Internal proto implementation for ColumnConfig with Pipeable
 */
const ColumnConfigProto: Pipeable = {
  pipe() {
    return pipeArguments(this, arguments)
  }
}

/**
 * ColumnConfig namespace with constructors, pipeable operations, and pattern matching
 */
export const ColumnConfig = {
  /**
   * Create a text column configuration
   */
  text: <TData, TVal = string, TId extends string = string>(args: {
    id: TId
    accessor: TAccessorFn<TData, TVal>
    displayName: string
    icon: LucideIcon
  }): TextColumnConfig<TData, TVal, TId> => {
    const config = Object.create(ColumnConfigProto)
    config.id = args.id
    config.accessor = args.accessor
    config.displayName = args.displayName
    config.icon = args.icon
    config.type = 'text' as const
    config[Equal.symbol] = function(this: TextColumnConfig<TData, TVal, TId>, that: unknown) {
      if (typeof that !== 'object' || that === null) return false
      const other = that as any
      return (
        other.type === 'text' &&
        this.id === other.id &&
        this.displayName === other.displayName &&
        this.accessor === other.accessor
      )
    }
    return config
  },

  /**
   * Create a number column configuration
   */
  number: <TData, TVal = number, TId extends string = string>(args: {
    id: TId
    accessor: TAccessorFn<TData, TVal>
    displayName: string
    icon: LucideIcon
    min?: number
    max?: number
  }): NumberColumnConfig<TData, TVal, TId> => {
    const config = Object.create(ColumnConfigProto)
    config.id = args.id
    config.accessor = args.accessor
    config.displayName = args.displayName
    config.icon = args.icon
    config.type = 'number' as const
    config.min = args.min
    config.max = args.max
    config[Equal.symbol] = function(this: NumberColumnConfig<TData, TVal, TId>, that: unknown) {
      if (typeof that !== 'object' || that === null) return false
      const other = that as any
      return (
        other.type === 'number' &&
        this.id === other.id &&
        this.displayName === other.displayName &&
        this.accessor === other.accessor &&
        this.min === other.min &&
        this.max === other.max
      )
    }
    return config
  },

  /**
   * Create a date column configuration
   */
  date: <TData, TVal = Date, TId extends string = string>(args: {
    id: TId
    accessor: TAccessorFn<TData, TVal>
    displayName: string
    icon: LucideIcon
  }): DateColumnConfig<TData, TVal, TId> => {
    const config = Object.create(ColumnConfigProto)
    config.id = args.id
    config.accessor = args.accessor
    config.displayName = args.displayName
    config.icon = args.icon
    config.type = 'date' as const
    config[Equal.symbol] = function(this: DateColumnConfig<TData, TVal, TId>, that: unknown) {
      if (typeof that !== 'object' || that === null) return false
      const other = that as any
      return (
        other.type === 'date' &&
        this.id === other.id &&
        this.displayName === other.displayName &&
        this.accessor === other.accessor
      )
    }
    return config
  },

  /**
   * Create an option column configuration
   */
  option: <TData, TVal = string, TId extends string = string>(args: {
    id: TId
    accessor: TAccessorFn<TData, TVal>
    displayName: string
    icon: LucideIcon
    options?: ColumnOption[]
    facetedOptions?: Map<string, number>
    transformOptionFn?: TTransformOptionFn<TVal>
    orderFn?: TOrderFn<TVal>
  }): OptionColumnConfig<TData, TVal, TId> => {
    const config = Object.create(ColumnConfigProto)
    config.id = args.id
    config.accessor = args.accessor
    config.displayName = args.displayName
    config.icon = args.icon
    config.type = 'option' as const
    config.options = args.options
    config.facetedOptions = args.facetedOptions
    config.transformOptionFn = args.transformOptionFn
    config.orderFn = args.orderFn
    config[Equal.symbol] = function(this: OptionColumnConfig<TData, TVal, TId>, that: unknown) {
      if (typeof that !== 'object' || that === null) return false
      const other = that as any
      return (
        other.type === 'option' &&
        this.id === other.id &&
        this.displayName === other.displayName &&
        this.accessor === other.accessor &&
        Equal.equals(this.options, other.options) &&
        Equal.equals(this.facetedOptions, other.facetedOptions)
      )
    }
    return config
  },

  /**
   * Create a multiOption column configuration
   */
  multiOption: <TData, TVal = string[], TId extends string = string>(args: {
    id: TId
    accessor: TAccessorFn<TData, TVal>
    displayName: string
    icon: LucideIcon
    options?: ColumnOption[]
    facetedOptions?: Map<string, number>
    transformOptionFn?: TTransformOptionFn<TVal>
    orderFn?: TOrderFn<TVal>
  }): MultiOptionColumnConfig<TData, TVal, TId> => {
    const config = Object.create(ColumnConfigProto)
    config.id = args.id
    config.accessor = args.accessor
    config.displayName = args.displayName
    config.icon = args.icon
    config.type = 'multiOption' as const
    config.options = args.options
    config.facetedOptions = args.facetedOptions
    config.transformOptionFn = args.transformOptionFn
    config.orderFn = args.orderFn
    config[Equal.symbol] = function(this: MultiOptionColumnConfig<TData, TVal, TId>, that: unknown) {
      if (typeof that !== 'object' || that === null) return false
      const other = that as any
      return (
        other.type === 'multiOption' &&
        this.id === other.id &&
        this.displayName === other.displayName &&
        this.accessor === other.accessor &&
        Equal.equals(this.options, other.options) &&
        Equal.equals(this.facetedOptions, other.facetedOptions)
      )
    }
    return config
  },

  /**
   * Set options for option-based columns (pipeable)
   */
  setOptions: dual<
    (options: ColumnOption[]) => <TData, TVal, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>
    ) => typeof config,
    <TData, TVal, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>,
      options: ColumnOption[]
    ) => typeof config
  >(2, (config, options) => {
    const newConfig = Object.create(Object.getPrototypeOf(config))
    Object.assign(newConfig, config, { options })
    return newConfig
  }),

  /**
   * Set faceted options for option-based columns (pipeable)
   */
  setFacetedOptions: dual<
    (facetedOptions: Map<string, number>) => <TData, TVal, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>
    ) => typeof config,
    <TData, TVal, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>,
      facetedOptions: Map<string, number>
    ) => typeof config
  >(2, (config, facetedOptions) => {
    const newConfig = Object.create(Object.getPrototypeOf(config))
    Object.assign(newConfig, config, { facetedOptions })
    return newConfig
  }),

  /**
   * Set min/max for number columns (pipeable)
   */
  setMinMax: dual<
    (min: number, max: number) => <TData, TVal, TId extends string>(
      config: NumberColumnConfig<TData, TVal, TId>
    ) => NumberColumnConfig<TData, TVal, TId>,
    <TData, TVal, TId extends string>(
      config: NumberColumnConfig<TData, TVal, TId>,
      min: number,
      max: number
    ) => NumberColumnConfig<TData, TVal, TId>
  >(3, (config, min, max) => {
    const newConfig = Object.create(Object.getPrototypeOf(config))
    Object.assign(newConfig, config, { min, max })
    return newConfig
  }),

  /**
   * Set transform option function for option-based columns (pipeable)
   */
  setTransformOptionFn: dual<
    <TVal>(fn: TTransformOptionFn<TVal>) => <TData, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>
    ) => typeof config,
    <TData, TVal, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>,
      fn: TTransformOptionFn<TVal>
    ) => typeof config
  >(2, (config, fn) => {
    const newConfig = Object.create(Object.getPrototypeOf(config))
    Object.assign(newConfig, config, { transformOptionFn: fn })
    return newConfig
  }),

  /**
   * Set order function for option-based columns (pipeable)
   */
  setOrderFn: dual<
    <TVal>(fn: TOrderFn<TVal>) => <TData, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>
    ) => typeof config,
    <TData, TVal, TId extends string>(
      config: OptionColumnConfig<TData, TVal, TId> | MultiOptionColumnConfig<TData, TVal, TId>,
      fn: TOrderFn<TVal>
    ) => typeof config
  >(2, (config, fn) => {
    const newConfig = Object.create(Object.getPrototypeOf(config))
    Object.assign(newConfig, config, { orderFn: fn })
    return newConfig
  }),

  /**
   * Type guard for checking column type
   */
  $is: <T extends ColumnDataType>(type: T) =>
    <TData, TVal, TId extends string>(
      config: ColumnConfig<TData, any, TVal, TId>
    ): config is ColumnConfig<TData, T, TVal, TId> =>
      config.type === type,

  /**
   * Pattern match on column type
   */
  $match: <TData, TVal, TId extends string, R>(matchers: {
    text: (config: TextColumnConfig<TData, TVal, TId>) => R
    number: (config: NumberColumnConfig<TData, TVal, TId>) => R
    date: (config: DateColumnConfig<TData, TVal, TId>) => R
    option: (config: OptionColumnConfig<TData, TVal, TId>) => R
    multiOption: (config: MultiOptionColumnConfig<TData, TVal, TId>) => R
  }) =>
    (config: ColumnConfig<TData, any, TVal, TId>): R => {
      switch (config.type) {
        case 'text':
          return matchers.text(config as TextColumnConfig<TData, TVal, TId>)
        case 'number':
          return matchers.number(config as NumberColumnConfig<TData, TVal, TId>)
        case 'date':
          return matchers.date(config as DateColumnConfig<TData, TVal, TId>)
        case 'option':
          return matchers.option(config as OptionColumnConfig<TData, TVal, TId>)
        case 'multiOption':
          return matchers.multiOption(config as MultiOptionColumnConfig<TData, TVal, TId>)
        default:
          throw new Error(`Unknown column type: ${(config as any).type}`)
      }
    },
} as const

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

export type ColumnPrivateProperties<TData, TVal> = {
  _prefetchedOptionsCache: ColumnOption[] | null
  _prefetchedValuesCache: ElementType<NonNullable<TVal>>[] | null
  _prefetchedFacetedUniqueValuesCache: Map<string, number> | null
  _prefetchedFacetedMinMaxValuesCache: [number, number] | null
}

export type Column<
  TData,
  TType extends ColumnDataType = any,
  TVal = unknown,
> = ColumnConfig<TData, TType, TVal> &
  ColumnProperties<TData, TVal> &
  ColumnPrivateProperties<TData, TVal>

export interface DataTableFilterActions {
  addFilterValue: <TData, TType extends OptionBasedColumnDataType>(
    column: Column<TData, TType>,
    values: FilterModel<TType>['values'],
  ) => void

  removeFilterValue: <TData, TType extends OptionBasedColumnDataType>(
    column: Column<TData, TType>,
    value: FilterModel<TType>['values'],
  ) => void

  setFilterValue: <TData, TType extends ColumnDataType>(
    column: Column<TData, TType>,
    values: FilterModel<TType>['values'],
  ) => void

  setFilterOperator: <TType extends ColumnDataType>(
    columnId: string,
    operator: FilterModel<TType>['operator'],
  ) => void

  removeFilter: (columnId: string) => void

  removeAllFilters: () => void
}

export type FilterStrategy = 'client' | 'server'

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

export type FilterOperators = {
  text: TextFilterOperator
  number: NumberFilterOperator
  date: DateFilterOperator
  option: OptionFilterOperator
  multiOption: MultiOptionFilterOperator
}

export interface FilterModel<TType extends ColumnDataType = any> extends Equal.Equal {
  columnId: string
  type: TType
  operator: FilterOperators[TType]
  values: FilterValues<TType>
}

export type FiltersState = Array<FilterModel>

export type FilterDetails<T extends ColumnDataType> = {
  [key in FilterOperators[T]]: FilterOperatorDetails<key, T>
}

export type FilterOperatorTarget = 'single' | 'multiple'

export type FilterOperatorDetailsBase<
  OperatorValue,
  T extends ColumnDataType,
> = {
  key: string
  value: OperatorValue
  target: FilterOperatorTarget
  singularOf?: FilterOperators[T]
  pluralOf?: FilterOperators[T]
  relativeOf: FilterOperators[T] | Array<FilterOperators[T]>
  isNegated: boolean
  negation?: FilterOperators[T]
  negationOf?: FilterOperators[T]
}

export type FilterOperatorDetails<
  OperatorValue,
  T extends ColumnDataType,
> = FilterOperatorDetailsBase<OperatorValue, T> &
  (
    | { singularOf?: never; pluralOf?: never }
    | { target: 'single'; singularOf: FilterOperators[T]; pluralOf?: never }
    | { target: 'multiple'; singularOf?: never; pluralOf: FilterOperators[T] }
  ) &
  (
    | { isNegated: false; negation: FilterOperators[T]; negationOf?: never }
    | { isNegated: true; negation?: never; negationOf: FilterOperators[T] }
  )

export type FilterTypeOperatorDetails = {
  [key in ColumnDataType]: FilterDetails<key>
}

// -----------------------------------------------------------------------------
// Filter Namespace - constructors, pattern matching, and ordering
// -----------------------------------------------------------------------------

const typeOrder: Record<ColumnDataType, number> = {
  text: 0,
  number: 1,
  date: 2,
  option: 3,
  multiOption: 4
}

export const FilterOrder: Order.Order<FilterModel> = pipe(
  Order.string,
  Order.mapInput((f: FilterModel) => f.columnId),
  Order.combine(
    pipe(
      Order.number,
      Order.mapInput((f: FilterModel) => typeOrder[f.type as ColumnDataType])
    )
  )
)

export const Filter = {
  text: (args: {
    columnId: string
    operator: TextFilterOperator
    values: string[]
  }): FilterModel<'text'> =>
    Data.struct({
      columnId: args.columnId,
      type: 'text' as const,
      operator: args.operator,
      values: Data.array(args.values),
    }) as FilterModel<'text'>,

  number: (args: {
    columnId: string
    operator: NumberFilterOperator
    values: number[]
  }): FilterModel<'number'> =>
    Data.struct({
      columnId: args.columnId,
      type: 'number' as const,
      operator: args.operator,
      values: Data.array(args.values),
    }) as FilterModel<'number'>,

  date: (args: {
    columnId: string
    operator: DateFilterOperator
    values: Date[]
  }): FilterModel<'date'> =>
    Data.struct({
      columnId: args.columnId,
      type: 'date' as const,
      operator: args.operator,
      values: Data.array(args.values),
    }) as FilterModel<'date'>,

  option: (args: {
    columnId: string
    operator: OptionFilterOperator
    values: string[]
  }): FilterModel<'option'> =>
    Data.struct({
      columnId: args.columnId,
      type: 'option' as const,
      operator: args.operator,
      values: Data.array(args.values),
    }) as FilterModel<'option'>,

  multiOption: (args: {
    columnId: string
    operator: MultiOptionFilterOperator
    values: string[]
  }): FilterModel<'multiOption'> =>
    Data.struct({
      columnId: args.columnId,
      type: 'multiOption' as const,
      operator: args.operator,
      values: Data.array(args.values),
    }) as FilterModel<'multiOption'>,

  $is: <T extends ColumnDataType>(type: T) =>
    (filter: FilterModel): filter is FilterModel<T> =>
      filter.type === type,

  $match: <R>(matchers: {
    text: (filter: FilterModel<'text'>) => R
    number: (filter: FilterModel<'number'>) => R
    date: (filter: FilterModel<'date'>) => R
    option: (filter: FilterModel<'option'>) => R
    multiOption: (filter: FilterModel<'multiOption'>) => R
  }) =>
    (filter: FilterModel): R => {
      switch (filter.type) {
        case 'text':
          return matchers.text(filter as FilterModel<'text'>)
        case 'number':
          return matchers.number(filter as FilterModel<'number'>)
        case 'date':
          return matchers.date(filter as FilterModel<'date'>)
        case 'option':
          return matchers.option(filter as FilterModel<'option'>)
        case 'multiOption':
          return matchers.multiOption(filter as FilterModel<'multiOption'>)
        default:
          throw new Error(`Unknown filter type: ${(filter as FilterModel).type}`)
      }
    },

  Order: FilterOrder,

  normalize: (filter: FilterModel): FilterModel =>
    Data.struct({
      columnId: filter.columnId,
      type: filter.type,
      operator: filter.operator,
      values: Data.array([...filter.values]),
    }) as FilterModel,

  toKey: (filters: FiltersState): Readonly<FiltersState> =>
    Data.array(
      [...filters]
        .map(Filter.normalize)
        .sort(FilterOrder)
    ) as Readonly<FiltersState>
} as const

export function makeFilter<TType extends ColumnDataType = any>(
  filter: {
    columnId: string
    type: TType
    operator: any
    values: any
  }
): FilterModel<TType> {
  return Data.struct({
    columnId: filter.columnId,
    type: filter.type,
    operator: filter.operator,
    values: Data.array([...filter.values]),
  }) as FilterModel<TType>
}
