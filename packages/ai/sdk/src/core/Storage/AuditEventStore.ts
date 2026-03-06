import { $AiSdkId } from "@beep/identity/packages";
import { Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import type * as S from "effect/Schema";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";
import * as EventLog from "effect/unstable/eventlog/EventLog";
import { KeyValueStore } from "effect/unstable/persistence";
import { AuditEventSchema, layerAuditHandlers } from "../experimental/EventLog.js";
import type { HookEvent } from "../Schema/Hooks.js";
import type { CompactionStrategy } from "../Sync/index.js";
import { Compaction, ConflictPolicy, compactEntries } from "../Sync/index.js";
import { defaultAuditEventJournalKey, defaultAuditIdentityKey, defaultStorageDirectory } from "./defaults.js";
import { layerKeyValueStore as layerEventJournalKeyValueStore } from "./EventJournalKeyValueStore.js";
import { StorageConfig } from "./StorageConfig.js";
import { type StorageError, toStorageError } from "./StorageError.js";

const $I = $AiSdkId.create("core/Storage/AuditEventStore");

type Utc = typeof S.DateTimeUtcFromMillis.Type;

/**
 * @since 0.0.0
 */
export type AuditEventInput =
  | {
      readonly event: "tool_use";
      readonly payload: {
        readonly sessionId: string;
        readonly toolName: string;
        readonly toolUseId?: string;
        readonly status: "start" | "success" | "failure";
        readonly durationMs?: number;
      };
    }
  | {
      readonly event: "permission_decision";
      readonly payload: {
        readonly sessionId: string;
        readonly toolName: string;
        readonly decision: "allow" | "deny" | "prompt";
        readonly reason?: string;
      };
    }
  | {
      readonly event: "hook_event";
      readonly payload: {
        readonly sessionId?: string;
        readonly hook: HookEvent;
        readonly toolUseId?: string;
        readonly outcome: "success" | "failure";
      };
    }
  | {
      readonly event: "sync_conflict";
      readonly payload: {
        readonly remoteId: string;
        readonly event: string;
        readonly primaryKey: string;
        readonly entryId: string;
        readonly conflictCount: number;
        readonly resolution: "accept" | "merge" | "reject";
        readonly resolvedEntryId?: string;
      };
    }
  | {
      readonly event: "sync_compaction";
      readonly payload: {
        readonly remoteId: string;
        readonly before: number;
        readonly after: number;
        readonly events?: ReadonlyArray<string>;
        readonly timestamp: Utc;
      };
    };

const storeName = "AuditEventStore";

const mapError = (operation: string, cause: unknown) => toStorageError(storeName, operation, cause);

const resolveEnabled = Effect.gen(function* () {
  const config = yield* Effect.serviceOption(StorageConfig);
  return O.isNone(config) ? true : config.value.settings.enabled.auditLog;
});

const resolveAuditKeys = (options?: {
  readonly journalKey?: string;
  readonly identityKey?: string;
  readonly prefix?: string;
}) => ({
  journalKey:
    options?.journalKey ?? (options?.prefix ? `${options.prefix}/event-journal` : defaultAuditEventJournalKey),
  identityKey:
    options?.identityKey ?? (options?.prefix ? `${options.prefix}/event-log-identity` : defaultAuditIdentityKey),
});

const auditEventTags = ["tool_use", "permission_decision", "hook_event", "sync_conflict", "sync_compaction"] as const;

const layerAuditJournalCompaction = Layer.effectDiscard(
  Effect.gen(function* () {
    const config = yield* Effect.serviceOption(StorageConfig);
    if (O.isNone(config)) return;
    const retention = config.value.settings.retention.audit;
    const strategies: Array<CompactionStrategy> = [];
    strategies.push(Compaction.byAge(retention.maxAge));
    strategies.push(Compaction.byCount(retention.maxEntries));
    const strategy = Compaction.composite(...strategies);
    const log = yield* EventLog.EventLog;
    yield* log.registerCompaction({
      events: auditEventTags,
      effect: ({ entries, write }) =>
        compactEntries(strategy, entries).pipe(
          Effect.flatMap((kept) => Effect.forEach(kept, write, { discard: true }))
        ),
    });
  })
);

const makeStore = Effect.gen(function* () {
  const log = yield* EventLog.EventLog;

  const write = Effect.fn("AuditEventStore.write")((input: AuditEventInput) =>
    Effect.gen(function* () {
      const enabled = yield* resolveEnabled;
      if (!enabled) return;
      yield* log
        .write({
          schema: AuditEventSchema,
          event: input.event,
          payload: input.payload,
        })
        .pipe(Effect.mapError((cause) => mapError("write", cause)));
    })
  );

  const entries = log.entries.pipe(Effect.mapError((cause) => mapError("entries", cause)));

  return AuditEventStore.of({ write, entries });
});

/**
 * @since 0.0.0
 */
export interface AuditEventStoreShape {
  readonly cleanup?: () => Effect.Effect<void, StorageError>;
  readonly entries: Effect.Effect<ReadonlyArray<EventJournal.Entry>, StorageError>;
  readonly write: (input: AuditEventInput) => Effect.Effect<void, StorageError>;
}

/**
 * @since 0.0.0
 */
export class AuditEventStore extends ServiceMap.Service<AuditEventStore, AuditEventStoreShape>()($I`AuditEventStore`) {
  static readonly layerMemory = Layer.effect(AuditEventStore, makeStore).pipe(
    Layer.provide(
      (() => {
        const baseLayer = EventLog.layerEventLog.pipe(
          Layer.provide(EventJournal.layerMemory),
          Layer.provide(Layer.sync(EventLog.Identity, () => EventLog.makeIdentityUnsafe())),
          Layer.provide(layerAuditHandlers)
        );
        const compactionLayer = layerAuditJournalCompaction.pipe(Layer.provide(baseLayer));
        return Layer.merge(baseLayer, compactionLayer);
      })()
    )
  );

  static readonly layerKeyValueStore = (options?: {
    readonly journalKey?: string;
    readonly identityKey?: string;
    readonly conflictPolicy?: Layer.Layer<ConflictPolicy>;
  }) =>
    Layer.effect(AuditEventStore, makeStore).pipe(
      Layer.provide(
        (() => {
          const conflictPolicyLayer = options?.conflictPolicy ?? ConflictPolicy.layerLastWriteWins;
          const baseLayer = EventLog.layerEventLog.pipe(
            Layer.provide(
              layerEventJournalKeyValueStore(options?.journalKey ? { key: options.journalKey } : undefined)
            ),
            Layer.provide(Layer.sync(EventLog.Identity, () => EventLog.makeIdentityUnsafe())),
            Layer.provide(layerAuditHandlers),
            Layer.provide(conflictPolicyLayer)
          );
          const compactionLayer = layerAuditJournalCompaction.pipe(Layer.provide(baseLayer));
          return Layer.merge(baseLayer, compactionLayer);
        })()
      )
    );

  static readonly layerFileSystem = (options?: {
    readonly directory?: string;
    readonly journalKey?: string;
    readonly identityKey?: string;
    readonly prefix?: string;
    readonly conflictPolicy?: Layer.Layer<ConflictPolicy>;
  }) =>
    AuditEventStore.layerKeyValueStore({
      ...resolveAuditKeys(options),
      ...(options?.conflictPolicy !== undefined ? { conflictPolicy: options.conflictPolicy } : {}),
    }).pipe(Layer.provide(KeyValueStore.layerFileSystem(options?.directory ?? defaultStorageDirectory)));

  static readonly layerFileSystemBun = (options?: {
    readonly directory?: string;
    readonly journalKey?: string;
    readonly identityKey?: string;
    readonly prefix?: string;
    readonly conflictPolicy?: Layer.Layer<ConflictPolicy>;
  }) =>
    AuditEventStore.layerKeyValueStore({
      ...resolveAuditKeys(options),
      ...(options?.conflictPolicy !== undefined ? { conflictPolicy: options.conflictPolicy } : {}),
    }).pipe(Layer.provide(KeyValueStore.layerFileSystem(options?.directory ?? defaultStorageDirectory)));
}
