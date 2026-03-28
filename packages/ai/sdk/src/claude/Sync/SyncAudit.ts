import { $AiSdkId } from "@beep/identity/packages";
import { Effect, Layer, ServiceMap } from "effect";
import type * as EventJournal from "effect/unstable/eventlog/EventJournal";
import type { ConflictResolution } from "./ConflictPolicy.js";

const $I = $AiSdkId.create("core/Sync/SyncAudit");

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export type SyncConflictAudit = {
  readonly remoteId: string;
  readonly entry: EventJournal.Entry;
  readonly conflicts: ReadonlyArray<EventJournal.Entry>;
  readonly resolution: ConflictResolution;
};

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export type SyncCompactionAudit = Readonly<{
  readonly remoteId: string;
  readonly before: number;
  readonly after: number;
  readonly events: ReadonlyArray<string>;
}>;

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export interface SyncAuditService {
  readonly compaction: (input: SyncCompactionAudit) => Effect.Effect<void>;
  readonly conflict: (input: SyncConflictAudit) => Effect.Effect<void>;
}

const defaultSyncAudit: SyncAuditService = {
  conflict: () => Effect.void,
  compaction: () => Effect.void,
};

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export class SyncAudit extends ServiceMap.Service<SyncAudit, SyncAuditService>()($I`SyncAudit`, {
  make: Effect.succeed(defaultSyncAudit),
}) {
  static readonly layer = Layer.succeed(SyncAudit, SyncAudit.of(defaultSyncAudit));
}
