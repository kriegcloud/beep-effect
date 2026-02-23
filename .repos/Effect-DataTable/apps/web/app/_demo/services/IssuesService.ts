import { Cache, Context, Duration, Effect, Layer } from "effect"
import {
  Filter,
  type FiltersState,
} from "@/registry/data-table-filter/core/types"
import {
  dateFilterFn,
  multiOptionFilterFn,
  numberFilterFn,
  optionFilterFn,
  textFilterFn,
} from "@/registry/data-table-filter/lib/filter-fns"
import type { Issue } from "../types"
import { ISSUES } from "./_data"

const getIssueValue = (issue: Issue, columnId: keyof Issue) => issue[columnId]

const applyFilter = (issue: Issue) =>
  Filter.$match({
    Text: (f) => {
      const value = getIssueValue(issue, f.columnId as keyof Issue) as string | undefined
      return value ? textFilterFn(value, f) : false
    },
    Number: (f) => {
      const value = getIssueValue(issue, f.columnId as keyof Issue) as number | undefined
      return value !== undefined ? numberFilterFn(value, f) : false
    },
    Date: (f) => {
      const value = getIssueValue(issue, f.columnId as keyof Issue) as Date | undefined
      return value ? dateFilterFn(value, f) : false
    },
    Option: (f) => {
      const value = (getIssueValue(issue, f.columnId as keyof Issue) as { id?: string })?.id
      return value ? optionFilterFn(value, f) : false
    },
    MultiOption: (f) => {
      const items = getIssueValue(issue, f.columnId as keyof Issue) as { id: string }[] | undefined
      const value = (items ?? []).map((l) => l.id)
      return multiOptionFilterFn(value, f)
    },
  })

function filterIssues(issues: readonly Issue[], filters: Readonly<FiltersState>): readonly Issue[] {
  if (!filters || filters.length === 0) return issues
  return issues.filter((issue) => filters.every(applyFilter(issue)))
}

export class IssuesService extends Context.Tag("IssuesService")<
  IssuesService,
  {
    readonly getIssues: (filters: FiltersState) => Effect.Effect<ReadonlyArray<Issue>>
    readonly getAllIssues: Effect.Effect<ReadonlyArray<Issue>>
    readonly cacheStats: Effect.Effect<Cache.CacheStats>
  }
>() { }

export const IssuesServiceLive = Layer.effect(
  IssuesService,
  Effect.gen(function* () {
    const cache = yield* Cache.make({
      capacity: 100,
      timeToLive: Duration.minutes(5),
      lookup: (key: Readonly<FiltersState>) =>
        Effect.sleep("1 second").pipe(
          Effect.map(() => filterIssues(ISSUES, key))
        ),
    })

    return {
      getIssues: (filters: FiltersState) => cache.get(Filter.toKey(filters)),
      getAllIssues: Effect.sync(() => ISSUES),
      cacheStats: cache.cacheStats,
    }
  })
)
