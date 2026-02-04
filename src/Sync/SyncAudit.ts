import * as EventJournal from "@effect/experimental/EventJournal"
import * as Context from "effect/Context"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import type { ConflictResolution } from "./ConflictPolicy.js"

export type SyncConflictAudit = {
  readonly remoteId: string
  readonly entry: EventJournal.Entry
  readonly conflicts: ReadonlyArray<EventJournal.Entry>
  readonly resolution: ConflictResolution
}

export type SyncCompactionAudit = {
  readonly remoteId: string
  readonly before: number
  readonly after: number
  readonly events: ReadonlyArray<string>
}

export class SyncAudit extends Context.Tag("@effect/claude-agent-sdk/SyncAudit")<
  SyncAudit,
  {
    readonly conflict: (input: SyncConflictAudit) => Effect.Effect<void>
    readonly compaction: (input: SyncCompactionAudit) => Effect.Effect<void>
  }
>() {
  static readonly layer = Layer.succeed(
    SyncAudit,
    SyncAudit.of({
      conflict: () => Effect.void,
      compaction: () => Effect.void
    })
  )
}
