import { $AiSdkId } from "@beep/identity/packages";
import { Effect, Layer, ServiceMap } from "effect";
import type * as EventJournal from "effect/unstable/eventlog/EventJournal";

const $I = $AiSdkId.create("core/Sync/ConflictPolicy");

/**
 * @since 0.0.0
 */
export type ConflictResolution =
  | { readonly _tag: "accept"; readonly entry: EventJournal.Entry }
  | { readonly _tag: "reject"; readonly reason?: string }
  | { readonly _tag: "merge"; readonly entry: EventJournal.Entry };

const accept = (entry: EventJournal.Entry): ConflictResolution => ({
  _tag: "accept",
  entry,
});

const merge = (entry: EventJournal.Entry): ConflictResolution => ({
  _tag: "merge",
  entry,
});

const reject = (reason?: string): ConflictResolution => ({
  _tag: "reject",
  ...(reason ? { reason } : {}),
});

const pickLatest = (entries: ReadonlyArray<EventJournal.Entry>) => {
  if (entries.length === 0) return undefined;
  let latest = entries[0]!;
  for (let i = 1; i < entries.length; i++) {
    const next = entries[i]!;
    if (next.createdAtMillis >= latest.createdAtMillis) {
      latest = next;
    }
  }
  return latest;
};

const pickEarliest = (entries: ReadonlyArray<EventJournal.Entry>) => {
  if (entries.length === 0) return undefined;
  let earliest = entries[0]!;
  for (let i = 1; i < entries.length; i++) {
    const next = entries[i]!;
    if (next.createdAtMillis <= earliest.createdAtMillis) {
      earliest = next;
    }
  }
  return earliest;
};

/**
 * @since 0.0.0
 */
export interface ConflictPolicyService {
  readonly resolve: (options: {
    readonly entry: EventJournal.Entry;
    readonly conflicts: ReadonlyArray<EventJournal.Entry>;
  }) => Effect.Effect<ConflictResolution>;
}

const defaultConflictPolicy: ConflictPolicyService = {
  resolve: ({ entry, conflicts }) => Effect.succeed(accept(pickLatest([entry, ...conflicts]) ?? entry)),
};

/**
 * @since 0.0.0
 */
export class ConflictPolicy extends ServiceMap.Service<ConflictPolicy, ConflictPolicyService>()($I`ConflictPolicy`, {
  make: Effect.succeed(defaultConflictPolicy),
}) {
  static readonly layerLastWriteWins = Layer.succeed(ConflictPolicy, ConflictPolicy.of(defaultConflictPolicy));

  static readonly layerFirstWriteWins = Layer.succeed(
    ConflictPolicy,
    ConflictPolicy.of({
      resolve: ({ entry, conflicts }) => Effect.succeed(accept(pickEarliest([entry, ...conflicts]) ?? entry)),
    })
  );

  static readonly layerReject = (reason?: string) =>
    Layer.succeed(
      ConflictPolicy,
      ConflictPolicy.of({
        resolve: () => Effect.succeed(reject(reason)),
      })
    );

  static readonly layerMerge = (
    mergeFn: (entry: EventJournal.Entry, conflicts: ReadonlyArray<EventJournal.Entry>) => EventJournal.Entry
  ) =>
    Layer.succeed(
      ConflictPolicy,
      ConflictPolicy.of({
        resolve: ({ entry, conflicts }) => Effect.sync(() => merge(mergeFn(entry, conflicts))),
      })
    );
}
