import type { FilterModel } from "./Filter"

// =============================================================================
// FiltersState - An array of filters
// =============================================================================

export type FiltersState<Id, Op> = ReadonlyArray<FilterModel<Id, Op>>
