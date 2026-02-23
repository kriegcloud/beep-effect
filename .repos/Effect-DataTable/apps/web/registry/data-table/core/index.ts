/**
 * Core data-table module exports.
 *
 * @since 1.0.0
 */

// Accessor ADT
export {
  type Accessor,
  type Sync,
  type Deferred,
  type Streamed,
  TypeId as AccessorTypeId,
  sync,
  deferred,
  streamed,
  isAccessor,
  isSync,
  isDeferred,
  isStreamed,
  match
} from "./Accessor"

// Column
export { type Column, createColumnHelper } from "./Column"

// Table
export { type Table, type TableColumnIds, createTable } from "./Table"

// DataFetcher
export {
  type FiltersState,
  type DataFetcher,
  DataFetcher as DataFetcherTag,
  ClientFetcher
} from "./DataFetcher"
