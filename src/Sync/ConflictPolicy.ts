import * as EventJournal from "@effect/experimental/EventJournal"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"

export type ConflictResolution =
  | { readonly _tag: "accept"; readonly entry: EventJournal.Entry }
  | { readonly _tag: "reject"; readonly reason?: string }
  | { readonly _tag: "merge"; readonly entry: EventJournal.Entry }

const accept = (entry: EventJournal.Entry): ConflictResolution => ({
  _tag: "accept",
  entry
})

const merge = (entry: EventJournal.Entry): ConflictResolution => ({
  _tag: "merge",
  entry
})

const reject = (reason?: string): ConflictResolution => ({
  _tag: "reject",
  ...(reason ? { reason } : {})
})

const pickLatest = (entries: ReadonlyArray<EventJournal.Entry>) =>
  entries.reduce((latest, next) =>
    next.createdAtMillis >= latest.createdAtMillis ? next : latest
  )

const pickEarliest = (entries: ReadonlyArray<EventJournal.Entry>) =>
  entries.reduce((earliest, next) =>
    next.createdAtMillis <= earliest.createdAtMillis ? next : earliest
  )

export class ConflictPolicy extends Context.Tag("@effect/claude-agent-sdk/ConflictPolicy")<
  ConflictPolicy,
  {
    readonly resolve: (options: {
      readonly entry: EventJournal.Entry
      readonly conflicts: ReadonlyArray<EventJournal.Entry>
    }) => Effect.Effect<ConflictResolution>
  }
>() {
  static readonly layerLastWriteWins = Layer.succeed(
    ConflictPolicy,
    ConflictPolicy.of({
      resolve: ({ entry, conflicts }) =>
        Effect.succeed(
          accept(
            pickLatest([entry, ...conflicts])
          )
        )
    })
  )

  static readonly layerFirstWriteWins = Layer.succeed(
    ConflictPolicy,
    ConflictPolicy.of({
      resolve: ({ entry, conflicts }) =>
        Effect.succeed(
          accept(
            pickEarliest([entry, ...conflicts])
          )
        )
    })
  )

  static readonly layerReject = (reason?: string) =>
    Layer.succeed(
      ConflictPolicy,
      ConflictPolicy.of({
        resolve: () => Effect.succeed(reject(reason))
      })
    )

  static readonly layerMerge = (
    mergeFn: (
      entry: EventJournal.Entry,
      conflicts: ReadonlyArray<EventJournal.Entry>
    ) => EventJournal.Entry
  ) =>
    Layer.succeed(
      ConflictPolicy,
      ConflictPolicy.of({
        resolve: ({ entry, conflicts }) =>
          Effect.sync(() => merge(mergeFn(entry, conflicts)))
      })
    )
}
