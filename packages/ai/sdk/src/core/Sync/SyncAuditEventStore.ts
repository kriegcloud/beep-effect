import * as Clock from "effect/Clock"
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import { AuditEventStore } from "../Storage/AuditEventStore.js"
import { SyncAudit } from "./SyncAudit.js"
import type { SyncConflictAudit, SyncCompactionAudit } from "./SyncAudit.js"

export const layerAuditEventStore = Layer.effect(
  SyncAudit,
  Effect.gen(function*() {
    const store = yield* AuditEventStore

    const conflict = (input: SyncConflictAudit) => {
      const resolvedEntryId =
        input.resolution._tag === "reject"
          ? undefined
          : input.resolution.entry.idString
      const basePayload = {
        remoteId: input.remoteId,
        event: input.entry.event,
        primaryKey: input.entry.primaryKey,
        entryId: input.entry.idString,
        conflictCount: input.conflicts.length,
        resolution: input.resolution._tag
      }
      const payload =
        resolvedEntryId === undefined
          ? basePayload
          : { ...basePayload, resolvedEntryId }
      return store.write({
        event: "sync_conflict",
        payload
      }).pipe(
        Effect.catchAll((cause) => Effect.logError(cause).pipe(Effect.asVoid))
      )
    }

    const compaction = (input: SyncCompactionAudit) =>
      Effect.gen(function*() {
        const timestamp = yield* Clock.currentTimeMillis
        const basePayload = {
          remoteId: input.remoteId,
          before: input.before,
          after: input.after,
          timestamp
        }
        const payload =
          input.events.length === 0
            ? basePayload
            : { ...basePayload, events: input.events }
        return yield* store.write({
          event: "sync_compaction",
          payload
        }).pipe(
          Effect.catchAll((cause) => Effect.logError(cause).pipe(Effect.asVoid))
        )
      })

    return SyncAudit.of({ conflict, compaction })
  })
)
