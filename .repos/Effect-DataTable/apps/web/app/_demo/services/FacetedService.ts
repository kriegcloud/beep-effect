import { Context, Effect, Layer } from "effect"
import { ISSUE_LABELS, ISSUE_STATUSES, USERS } from "../data"
import type { Issue } from "../types"
import { ISSUES } from "./_data"

function computeLabelCounts(issues: readonly Issue[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const label of ISSUE_LABELS) {
    map.set(label.id, 0)
  }

  for (const issue of issues) {
    const labelIds = issue.labels?.map((l) => l.id) ?? []
    for (const labelId of labelIds) {
      const curr = map.get(labelId) ?? 0
      map.set(labelId, curr + 1)
    }
  }

  return map
}

function computeStatusCounts(issues: readonly Issue[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const status of ISSUE_STATUSES) {
    map.set(status.id, 0)
  }

  for (const issue of issues) {
    const statusId = issue.status.id
    const curr = map.get(statusId) ?? 0
    map.set(statusId, curr + 1)
  }

  return map
}

function computeUserCounts(issues: readonly Issue[]): Map<string, number> {
  const map = new Map<string, number>()

  for (const user of USERS) {
    map.set(user.id, 0)
  }

  for (const issue of issues) {
    const userId = issue.assignee?.id ?? ""
    const curr = map.get(userId) ?? 0
    map.set(userId, curr + 1)
  }

  return map
}

function computeHoursRange(issues: readonly Issue[]): readonly [number, number] {
  return issues.reduce<[number, number]>(
    (acc, issue) => {
      const hours = issue.estimatedHours
      if (hours === undefined) return acc
      return [Math.min(acc[0], hours), Math.max(acc[1], hours)]
    },
    [0, 0]
  )
}

export class FacetedService extends Context.Tag("FacetedService")<
  FacetedService,
  {
    readonly getLabelCounts: Effect.Effect<Map<string, number>>
    readonly getStatusCounts: Effect.Effect<Map<string, number>>
    readonly getUserCounts: Effect.Effect<Map<string, number>>
    readonly getHoursRange: Effect.Effect<readonly [number, number]>
  }
>() { }

export const FacetedServiceLive = Layer.effect(
  FacetedService,
  Effect.gen(function* () {
    const getLabelCounts = Effect.sync(() => computeLabelCounts(ISSUES))
    const getStatusCounts = Effect.sync(() => computeStatusCounts(ISSUES))
    const getUserCounts = Effect.sync(() => computeUserCounts(ISSUES))
    const getHoursRange = Effect.sync(() => computeHoursRange(ISSUES))

    return {
      getLabelCounts,
      getStatusCounts,
      getUserCounts,
      getHoursRange,
    }
  })
)
