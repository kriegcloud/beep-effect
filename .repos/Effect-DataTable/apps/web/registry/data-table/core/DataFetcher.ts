/**
 * DataFetcher service for fetching table rows based on filter state.
 *
 * @since 1.0.0
 */
import { Context, Effect, Layer, Stream } from "effect"

/**
 * Placeholder type for filter state.
 * Will be properly typed when filter state is implemented.
 *
 * @since 1.0.0
 * @category models
 */
export type FiltersState = unknown

/**
 * Service interface for fetching table data.
 *
 * @since 1.0.0
 * @category models
 */
export interface DataFetcher<Row, E = never, R = never> {
  /**
   * Fetch rows based on the current filter state.
   *
   * @since 1.0.0
   */
  readonly fetch: (
    filters: FiltersState
  ) => Stream.Stream<ReadonlyArray<Row>, E, R>
}

/**
 * @since 1.0.0
 * @category models
 */
export declare namespace DataFetcher {
  export type Any = DataFetcher<any, any, any>
}

/**
 * Generic Tag for DataFetcher service.
 *
 * @since 1.0.0
 * @category tags
 */
export const DataFetcher = <Row, E = never, R = never>() =>
  Context.GenericTag<DataFetcher<Row, E, R>>(
    "@registry/data-table/DataFetcher"
  )

/**
 * Client-side data fetcher that filters data in-memory.
 *
 * Currently returns all data without filtering - filtering logic
 * will be implemented when FiltersState is properly typed.
 *
 * @since 1.0.0
 * @category layers
 */
export const ClientFetcher = <Row>(data: ReadonlyArray<Row>) =>
  Layer.succeed(DataFetcher<Row>(), {
    fetch: (_filters) => Stream.succeed(data),
  })
