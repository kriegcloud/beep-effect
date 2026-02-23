"use client"

import { Effect } from "effect"
import type { FiltersState } from "@/registry/data-table-filter/core/types"
import { IssuesService } from "../services/IssuesService"
import { filtersStateAtom } from "./filters"
import { demoRuntime } from "./runtime"

// Issues atom - reactive to filter changes
export const issuesAtom = demoRuntime.atom((get) => {
  const filters = get(filtersStateAtom) as FiltersState
  return Effect.flatMap(IssuesService, (svc) => svc.getIssues(filters))
})
