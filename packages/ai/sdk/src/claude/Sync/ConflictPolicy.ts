import { $AiSdkId } from "@beep/identity/packages";
import { Effect, Layer, ServiceMap } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as EventJournal from "effect/unstable/eventlog/EventJournal";

const $I = $AiSdkId.create("core/Sync/ConflictPolicy");

/**
 * @since 0.0.0
 * @category DomainModel
 */
export class ConflictResolutionAccept extends S.TaggedClass<ConflictResolutionAccept>($I`ConflictResolutionAccept`)(
  "accept",
  {
    entry: EventJournal.Entry,
  }
) {}

/**
 * Reject conflict resolution outcome.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConflictResolutionReject extends S.TaggedClass<ConflictResolutionReject>($I`ConflictResolutionReject`)(
  "reject",
  {
    reason: S.OptionFromOptionalKey(S.String),
  }
) {}

/**
 * Merge conflict resolution outcome.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ConflictResolutionMerge extends S.TaggedClass<ConflictResolutionMerge>($I`ConflictResolutionMerge`)(
  "merge",
  {
    entry: EventJournal.Entry,
  }
) {}

/**
 * Union of supported conflict resolution outcomes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ConflictResolution = S.Union([
  ConflictResolutionAccept,
  ConflictResolutionReject,
  ConflictResolutionMerge,
]).pipe(S.toTaggedUnion("_tag"));

/**
 * Runtime type for `ConflictResolution`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ConflictResolution = typeof ConflictResolution.Type;

const accept = (entry: EventJournal.Entry): ConflictResolution =>
  new ConflictResolutionAccept({
    entry,
  });

const merge = (entry: EventJournal.Entry): ConflictResolution =>
  new ConflictResolutionMerge({
    entry,
  });

const reject = (reason?: string): ConflictResolution =>
  ConflictResolution.cases.reject.makeUnsafe({
    reason: O.fromNullishOr(reason),
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
 * @category PortContract
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
 * @category PortContract
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
