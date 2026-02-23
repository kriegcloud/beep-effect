import { Data, pipe } from 'effect'
import * as Equal from 'effect/Equal'
import * as Hash from 'effect/Hash'
import { pipeArguments } from 'effect/Pipeable'
import type { LucideIcon } from 'lucide-react'
import { isAnyOf, uniq } from '../lib/array'
import { isColumnOptionArray } from '../lib/helpers'
import { memo } from '../lib/memo'
import {
  Column,
  type ColumnConfig,
  type ColumnDataType,
  type ColumnOption,
  type ElementType,
  type FilterStrategy,
  type Nullable,
  type TAccessorFn,
  type TOrderFn,
  type TTransformOptionFn,
} from './types'

// -----------------------------------------------------------------------------
// Functional ColumnConfig API
// -----------------------------------------------------------------------------

/**
 * Functional API for creating and composing column configurations.
 * All configs extend Equal.Equal for structural equality.
 *
 * @category ColumnConfig
 * @since 1.0.0
 */
export const ColumnConfig = {
  /**
   * Create a text column configuration.
   *
   * @category Constructors
   * @since 1.0.0
   */
  text: <TData, TId extends string>(base: {
    id: TId
    accessor: TAccessorFn<TData, string>
    displayName: string
    icon: LucideIcon
  }): ColumnConfig<TData, 'text', string, TId> =>
    Data.struct({
      ...base,
      type: 'text' as const,
    }) as ColumnConfig<TData, 'text', string, TId>,

  /**
   * Create a number column configuration.
   *
   * @category Constructors
   * @since 1.0.0
   */
  number: <TData, TId extends string>(base: {
    id: TId
    accessor: TAccessorFn<TData, number>
    displayName: string
    icon: LucideIcon
    min?: number
    max?: number
  }): ColumnConfig<TData, 'number', number, TId> =>
    Data.struct({
      ...base,
      type: 'number' as const,
    }) as ColumnConfig<TData, 'number', number, TId>,

  /**
   * Create a date column configuration.
   *
   * @category Constructors
   * @since 1.0.0
   */
  date: <TData, TId extends string>(base: {
    id: TId
    accessor: TAccessorFn<TData, Date>
    displayName: string
    icon: LucideIcon
  }): ColumnConfig<TData, 'date', Date, TId> =>
    Data.struct({
      ...base,
      type: 'date' as const,
    }) as ColumnConfig<TData, 'date', Date, TId>,

  /**
   * Create an option column configuration.
   *
   * @category Constructors
   * @since 1.0.0
   */
  option: <TData, TId extends string>(base: {
    id: TId
    accessor: TAccessorFn<TData, string>
    displayName: string
    icon: LucideIcon
    options?: ColumnOption[]
    facetedOptions?: Map<string, number>
    transformOptionFn?: TTransformOptionFn<string>
    orderFn?: TOrderFn<string>
  }): ColumnConfig<TData, 'option', string, TId> =>
    Data.struct({
      ...base,
      type: 'option' as const,
    }) as ColumnConfig<TData, 'option', string, TId>,

  /**
   * Create a multi-option column configuration.
   *
   * @category Constructors
   * @since 1.0.0
   */
  multiOption: <TData, TId extends string>(base: {
    id: TId
    accessor: TAccessorFn<TData, string[]>
    displayName: string
    icon: LucideIcon
    options?: ColumnOption[]
    facetedOptions?: Map<string, number>
    transformOptionFn?: TTransformOptionFn<string[]>
    orderFn?: TOrderFn<string[]>
  }): ColumnConfig<TData, 'multiOption', string[], TId> =>
    Data.struct({
      ...base,
      type: 'multiOption' as const,
    }) as ColumnConfig<TData, 'multiOption', string[], TId>,

  // ---------------------------------------------------------------------------
  // Pipeline Modifiers
  // ---------------------------------------------------------------------------

  /**
   * Set static options for option/multiOption columns.
   *
   * @category Modifiers
   * @since 1.0.0
   */
  setOptions:
    (options: ColumnOption[]) =>
    <TData, TVal, TId extends string>(
      config: ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,
    ): ColumnConfig<TData, 'option' | 'multiOption', TVal, TId> =>
      Data.struct({
        ...config,
        options,
      }) as ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,

  /**
   * Set faceted options (server-side) for option/multiOption columns.
   *
   * @category Modifiers
   * @since 1.0.0
   */
  setFacetedOptions:
    (facetedOptions: Map<string, number>) =>
    <TData, TVal, TId extends string>(
      config: ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,
    ): ColumnConfig<TData, 'option' | 'multiOption', TVal, TId> =>
      Data.struct({
        ...config,
        facetedOptions,
      }) as ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,

  /**
   * Set min/max bounds for number columns.
   *
   * @category Modifiers
   * @since 1.0.0
   */
  setMinMax:
    (min: number, max: number) =>
    <TData, TId extends string>(
      config: ColumnConfig<TData, 'number', number, TId>,
    ): ColumnConfig<TData, 'number', number, TId> =>
      Data.struct({
        ...config,
        min,
        max,
      }) as ColumnConfig<TData, 'number', number, TId>,

  /**
   * Set transform function for option/multiOption columns.
   *
   * @category Modifiers
   * @since 1.0.0
   */
  setTransformOptionFn:
    <TVal>(fn: TTransformOptionFn<TVal>) =>
    <TData, TId extends string>(
      config: ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,
    ): ColumnConfig<TData, 'option' | 'multiOption', TVal, TId> =>
      Data.struct({
        ...config,
        transformOptionFn: fn,
      }) as ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,

  /**
   * Set ordering function for option/multiOption columns.
   *
   * @category Modifiers
   * @since 1.0.0
   */
  setOrderFn:
    <TVal>(fn: TOrderFn<TVal>) =>
    <TData, TId extends string>(
      config: ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,
    ): ColumnConfig<TData, 'option' | 'multiOption', TVal, TId> =>
      Data.struct({
        ...config,
        orderFn: fn,
      }) as ColumnConfig<TData, 'option' | 'multiOption', TVal, TId>,
} as const

export function getColumnOptions<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: TData[],
  strategy: FilterStrategy,
): ColumnOption[] {
  if (!isAnyOf(column.type, ['option', 'multiOption'])) {
    console.warn(
      'Column options can only be retrieved for option and multiOption columns',
    )
    return []
  }

  if (strategy === 'server' && !column.options) {
    throw new Error('column options are required for server-side filtering')
  }

  if (column.options) {
    return column.options
  }

  const filtered = data
    .flatMap(column.accessor)
    .filter((v): v is NonNullable<TVal> => v !== undefined && v !== null)

  let models = uniq(filtered)

  if (column.orderFn) {
    models = models.sort((m1, m2) =>
      column.orderFn!(
        m1 as ElementType<NonNullable<TVal>>,
        m2 as ElementType<NonNullable<TVal>>,
      ),
    )
  }

  if (column.transformOptionFn) {
    // Memoize transformOptionFn calls
    const memoizedTransform = memo(
      () => [models],
      (deps) =>
        deps[0].map((m) =>
          column.transformOptionFn!(m as ElementType<NonNullable<TVal>>),
        ),
      { key: `transform-${column.id}` },
    )
    return memoizedTransform()
  }

  if (isColumnOptionArray(models)) return models

  throw new Error(
    `[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`,
  )
}

export function getColumnValues<TData, TType extends ColumnDataType, TVal>(
  column: ColumnConfig<TData, TType, TVal>,
  data: TData[],
) {
  // Memoize accessor calls
  const memoizedAccessor = memo(
    () => [data],
    (deps) =>
      deps[0]
        .flatMap(column.accessor)
        .filter(
          (v): v is NonNullable<TVal> => v !== undefined && v !== null,
        ) as ElementType<NonNullable<TVal>>[],
    { key: `accessor-${column.id}` },
  )

  const raw = memoizedAccessor()

  if (!isAnyOf(column.type, ['option', 'multiOption'])) {
    return raw
  }

  if (column.options) {
    return raw
      .map((v) => column.options?.find((o) => o.value === v)?.value)
      .filter((v) => v !== undefined && v !== null)
  }

  if (column.transformOptionFn) {
    const memoizedTransform = memo(
      () => [raw],
      (deps) =>
        deps[0].map(
          (v) => column.transformOptionFn!(v) as ElementType<NonNullable<TVal>>,
        ),
      { key: `transform-values-${column.id}` },
    )
    return memoizedTransform()
  }

  if (isColumnOptionArray(raw)) {
    return raw
  }

  throw new Error(
    `[data-table-filter] [${column.id}] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type`,
  )
}

export function getFacetedUniqueValues<
  TData,
  TType extends ColumnDataType,
  TVal,
>(
  column: ColumnConfig<TData, TType, TVal>,
  values: string[] | ColumnOption[],
  strategy: FilterStrategy,
): Map<string, number> | undefined {
  if (!isAnyOf(column.type, ['option', 'multiOption'])) {
    console.warn(
      'Faceted unique values can only be retrieved for option and multiOption columns',
    )
    return new Map<string, number>()
  }

  if (strategy === 'server') {
    return column.facetedOptions
  }

  const acc = new Map<string, number>()

  if (isColumnOptionArray(values)) {
    for (const option of values) {
      const curr = acc.get(option.value) ?? 0
      acc.set(option.value, curr + 1)
    }
  } else {
    for (const option of values) {
      const curr = acc.get(option as string) ?? 0
      acc.set(option as string, curr + 1)
    }
  }

  return acc
}

export function getFacetedMinMaxValues<
  TData,
  TType extends ColumnDataType,
  TVal,
>(
  column: ColumnConfig<TData, TType, TVal>,
  data: TData[],
  strategy: FilterStrategy,
): [number, number] | undefined {
  if (column.type !== 'number') return undefined // Only applicable to number columns

  if (typeof column.min === 'number' && typeof column.max === 'number') {
    return [column.min, column.max]
  }

  if (strategy === 'server') {
    return undefined
  }

  const values = data
    .flatMap((row) => column.accessor(row) as Nullable<number>)
    .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))

  if (values.length === 0) {
    return [0, 0] // Fallback to config or reasonable defaults
  }

  const min = Math.min(...values)
  const max = Math.max(...values)

  return [min, max]
}

/**
 * Creates Column instances from ColumnConfig with runtime behavior.
 * Implements Equal.Equal for structural equality on config properties.
 * Implements Pipeable for functional composition.
 *
 * @category Column
 * @since 1.0.0
 */
export function createColumns<TData>(
  data: TData[],
  columnConfigs: ReadonlyArray<ColumnConfig<TData, any, any, any>>,
  strategy: FilterStrategy,
): Column<TData>[] {
  return columnConfigs.map((columnConfig) => {
    const getOptions: () => ColumnOption[] = memo(
      () => [data, strategy, columnConfig.options],
      ([data, strategy]) =>
        getColumnOptions(columnConfig, data as any, strategy as any),
      { key: `options-${columnConfig.id}` },
    )

    const getValues: () => ElementType<NonNullable<any>>[] = memo(
      () => [data, strategy],
      () => (strategy === 'client' ? getColumnValues(columnConfig, data) : []),
      { key: `values-${columnConfig.id}` },
    )

    const getUniqueValues: () => Map<string, number> | undefined = memo(
      () => [getValues(), strategy],
      ([values, strategy]) =>
        getFacetedUniqueValues(columnConfig, values as any, strategy as any),
      { key: `faceted-${columnConfig.id}` },
    )

    const getMinMaxValues: () => [number, number] | undefined = memo(
      () => [data, strategy],
      () => getFacetedMinMaxValues(columnConfig, data, strategy),
      { key: `minmax-${columnConfig.id}` },
    )

    // Compute hash based on config properties only (not runtime methods)
    const configHash = Hash.hash(columnConfig)

    // Create the Column instance with Equal and Pipeable implementations
    const column: Column<TData> = {
      ...columnConfig,
      getOptions,
      getValues,
      getFacetedUniqueValues: getUniqueValues,
      getFacetedMinMaxValues: getMinMaxValues,
      // Prefetch methods will be added below
      prefetchOptions: async () => {}, // Placeholder, defined below
      prefetchValues: async () => {},
      prefetchFacetedUniqueValues: async () => {},
      prefetchFacetedMinMaxValues: async () => {},
      _prefetchedOptionsCache: null, // Initialize private cache
      _prefetchedValuesCache: null,
      _prefetchedFacetedUniqueValuesCache: null,
      _prefetchedFacetedMinMaxValuesCache: null,
      // Implement Equal.Equal - equality based on config properties only
      [Equal.symbol](that: unknown): boolean {
        if (!Column.$is(that)) return false
        // Compare only the config properties, not runtime methods
        return (
          this.id === that.id &&
          this.type === that.type &&
          this.displayName === that.displayName &&
          this.accessor === that.accessor
        )
      },
      [Hash.symbol](): number {
        return configHash
      },
      // Implement Pipeable
      pipe(): any {
        return pipeArguments(this, arguments)
      },
    }

    if (strategy === 'client') {
      // Define prefetch methods with access to the column instance
      column.prefetchOptions = async (): Promise<void> => {
        if (!column._prefetchedOptionsCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const options = getOptions()
              column._prefetchedOptionsCache = options
              // console.log(`Prefetched options for ${columnConfig.id}`)
              resolve(undefined)
            }, 0),
          )
        }
      }

      column.prefetchValues = async (): Promise<void> => {
        if (!column._prefetchedValuesCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const values = getValues()
              column._prefetchedValuesCache = values
              // console.log(`Prefetched values for ${columnConfig.id}`)
              resolve(undefined)
            }, 0),
          )
        }
      }

      column.prefetchFacetedUniqueValues = async (): Promise<void> => {
        if (!column._prefetchedFacetedUniqueValuesCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const facetedMap = getUniqueValues()
              column._prefetchedFacetedUniqueValuesCache = facetedMap ?? null
              // console.log(
              //   `Prefetched faceted unique values for ${columnConfig.id}`,
              // )
              resolve(undefined)
            }, 0),
          )
        }
      }

      column.prefetchFacetedMinMaxValues = async (): Promise<void> => {
        if (!column._prefetchedFacetedMinMaxValuesCache) {
          await new Promise((resolve) =>
            setTimeout(() => {
              const value = getMinMaxValues()
              column._prefetchedFacetedMinMaxValuesCache = value ?? null
              // console.log(
              //   `Prefetched faceted min/max values for ${columnConfig.id}`,
              // )
              resolve(undefined)
            }, 0),
          )
        }
      }
    }

    return column
  })
}
