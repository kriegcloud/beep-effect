"use client"

import { Effect } from "effect"
import { IssuesService } from "../services/IssuesService"
import { demoRuntime } from "./runtime"
import { issuesAtom } from "./issues"

// Cache stats atom - reactive to issues changes so stats update after each fetch
export const cacheStatsAtom = demoRuntime.atom((get) => {
  // Subscribe to issues atom to trigger re-run when cache is accessed
  get(issuesAtom)
  return Effect.flatMap(IssuesService, (svc) => svc.cacheStats)
})
