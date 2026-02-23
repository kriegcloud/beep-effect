import { Context, Effect, Layer } from "effect"
import { ISSUE_LABELS, ISSUE_STATUSES, USERS } from "../data"
import type { IssueLabel, IssueStatus, User } from "../types"

export class ReferenceService extends Context.Tag("ReferenceService")<
  ReferenceService,
  {
    readonly getLabels: Effect.Effect<ReadonlyArray<IssueLabel>>
    readonly getStatuses: Effect.Effect<ReadonlyArray<IssueStatus>>
    readonly getUsers: Effect.Effect<ReadonlyArray<User>>
  }
>() {}

export const ReferenceServiceLive = Layer.effect(
  ReferenceService,
  Effect.gen(function* () {
    const getLabels = yield* Effect.cached(
      Effect.sleep("1 second").pipe(
        Effect.map(() => [...ISSUE_LABELS] as ReadonlyArray<IssueLabel>)
      )
    )

    const getStatuses = yield* Effect.cached(
      Effect.sleep("1 second").pipe(
        Effect.map(() => [...ISSUE_STATUSES] as ReadonlyArray<IssueStatus>)
      )
    )

    const getUsers = yield* Effect.cached(
      Effect.sleep("1 second").pipe(
        Effect.map(() => [...USERS] as ReadonlyArray<User>)
      )
    )

    return ReferenceService.of({
      getLabels,
      getStatuses,
      getUsers,
    })
  })
)
