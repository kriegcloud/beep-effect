import { Effect, Layer, ServiceMap } from "effect";
import type * as EventJournal from "effect/unstable/eventlog/EventJournal";
import type { ConflictResolution } from "./ConflictPolicy.js";

/**
 * @since 0.0.0
 */
export type SyncConflictAudit = {
  readonly remoteId: string;
  readonly entry: EventJournal.Entry;
  readonly conflicts: ReadonlyArray<EventJournal.Entry>;
  readonly resolution: ConflictResolution;
};

/**
 * @since 0.0.0
 */
export type SyncCompactionAudit = {
  readonly remoteId: string;
  readonly before: number;
  readonly after: number;
  readonly events: ReadonlyArray<string>;
};

/**
 * @since 0.0.0
 */
export type SyncAuditService = {
  readonly conflict: (input: SyncConflictAudit) => Effect.Effect<void>;
  readonly compaction: (input: SyncCompactionAudit) => Effect.Effect<void>;
};

const defaultSyncAudit: SyncAuditService = {
  conflict: () => Effect.void,
  compaction: () => Effect.void,
};

/**
 * @since 0.0.0
 */
export class SyncAudit extends ServiceMap.Service<SyncAudit, SyncAuditService>()("@effect/claude-agent-sdk/SyncAudit", {
  make: Effect.succeed(defaultSyncAudit),
}) {
  static readonly layer = Layer.succeed(SyncAudit, SyncAudit.of(defaultSyncAudit));
}
