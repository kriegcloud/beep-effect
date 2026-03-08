import { Clock, Effect, Layer } from "effect";
import { utcFromMillis } from "../internal/dateTime.js";
import { AuditEventStore } from "../Storage/index.js";
import type { SyncCompactionAudit, SyncConflictAudit } from "./SyncAudit.js";
import { SyncAudit } from "./SyncAudit.js";

/**
 * @since 0.0.0
 * @category Configuration
 */
export const layerAuditEventStore = Layer.effect(
  SyncAudit,
  Effect.gen(function* () {
    const store = yield* AuditEventStore;

    const conflict = (input: SyncConflictAudit) => {
      const resolvedEntryId = input.resolution._tag === "reject" ? undefined : input.resolution.entry.idString;
      const basePayload = {
        remoteId: input.remoteId,
        event: input.entry.event,
        primaryKey: input.entry.primaryKey,
        entryId: input.entry.idString,
        conflictCount: input.conflicts.length,
        resolution: input.resolution._tag,
      };
      const payload = resolvedEntryId === undefined ? basePayload : { ...basePayload, resolvedEntryId };
      return store
        .write({
          event: "sync_conflict",
          payload,
        })
        .pipe(Effect.catch((cause) => Effect.logError(cause).pipe(Effect.asVoid)));
    };

    const compaction = (input: SyncCompactionAudit) =>
      Effect.gen(function* () {
        const timestamp = yield* Clock.currentTimeMillis;
        const basePayload = {
          remoteId: input.remoteId,
          before: input.before,
          after: input.after,
          timestamp: utcFromMillis(timestamp),
        };
        const payload = input.events.length === 0 ? basePayload : { ...basePayload, events: input.events };
        return yield* store
          .write({
            event: "sync_compaction",
            payload,
          })
          .pipe(Effect.catch((cause) => Effect.logError(cause).pipe(Effect.asVoid)));
      });

    return SyncAudit.of({ conflict, compaction });
  })
);
