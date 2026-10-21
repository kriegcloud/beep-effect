/**
 * Shared in-memory scaffolding for the Sync entity repository adapters.
 *
 * **Details**
 *
 * The four Sync entity repositories (`SyncItem`, `SyncOperation`, `SyncCursor`,
 * `SyncConflict`) each back their deterministic in-memory adapter with the same
 * `Ref<HashMap>` store, monotonic id counter, live snapshot, and
 * application-write audit stamp. This module owns that scaffolding so the
 * adapters stay behavior-identical without repeating it. It is private to
 * `@beep/documents-server` (not re-exported from any barrel and excluded from
 * docgen).
 *
 * @packageDocumentation
 * @internal
 * @category repositories
 * @since 0.0.0
 */

import { nextRowVersion } from "@beep/shared-domain/entity/EntityKit";
import { A, N } from "@beep/utils";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as Ref from "effect/Ref";
import * as Result from "effect/Result";
import type { RowVersion } from "@beep/shared-domain/entity/EntityKit";
/**
 * System-principal audit stamp for rows the repository writes on the
 * application's behalf (there is no acting user for a runtime-initiated sync).
 *
 * **Example** (System principal kind value)
 *
 * ```ts
 * import { SYSTEM_PRINCIPAL } from "@beep/documents-server/entities/internal/RepoSupport"
 *
 * console.log(SYSTEM_PRINCIPAL.kind) // "System"
 * ```
 *
 * @internal
 * @category repositories
 * @since 0.0.0
 */
export const SYSTEM_PRINCIPAL = { component: "Runtime", kind: "System" } as const;

/**
 * Next monotonic entity id: one past the maximum id already present, matching
 * the sequence-shaped ids the persisted tables allocate.
 *
 * **Example** (Next id after maximum)
 *
 * ```ts
 * import { nextEntityId } from "@beep/documents-server/entities/internal/RepoSupport"
 *
 * console.log(nextEntityId([{ id: 1 }, { id: 4 }])) // 5
 * console.log(nextEntityId([])) // 1
 * ```
 *
 * @internal
 * @category repositories
 * @since 0.0.0
 */
export const nextEntityId = (rows: ReadonlyArray<{ readonly id: number }>): number =>
  A.reduce(rows, 0, (max, row) => N.max(max, row.id)) + 1;

/**
 * Ascending `Order` over any id-bearing entity, so listings are stable in
 * enqueue/creation order (ascending id equals insertion order in these stores).
 *
 * **Example** (Sort entities by id)
 *
 * ```ts
 * import { byIdAscending } from "@beep/documents-server/entities/internal/RepoSupport"
 * import * as A from "effect/Array"
 *
 * const sorted = A.sort([{ id: 3 }, { id: 1 }], byIdAscending<{ readonly id: number }>())
 * console.log(A.map(sorted, (row) => row.id)) // [1, 3]
 * ```
 *
 * @typeParam T - the id-bearing entity the resulting order compares
 * @internal
 * @category repositories
 * @since 0.0.0
 */
export const byIdAscending = <T extends { readonly id: number }>(): Order.Order<T> =>
  Order.mapInput(Order.Number, (entity: T) => entity.id);

/**
 * Allocate an in-memory entity store from an initial (typically empty) map: a
 * `Ref<HashMap>` keyed by id, an id counter seeded at `1`, and a `snapshot`
 * effect that materializes the current values as an array. The initial map
 * carries the `Id`/`T` types so callers pass `HashMap.empty<Id, T>()`.
 *
 * **Example** (Empty store snapshot)
 *
 * ```ts
 * import { makeEntityStore } from "@beep/documents-server/entities/internal/RepoSupport"
 * import * as Effect from "effect/Effect";
 * import * as HashMap from "effect/HashMap";
 * const program = Effect.gen(function* () {
 *   const { snapshot } = yield* makeEntityStore(HashMap.empty<number, { readonly id: number }>())
 *   return yield* snapshot
 * })
 * console.log(Effect.runSync(program)) // []
 * ```
 *
 * @typeParam Id - the entity id used as the store's `HashMap` key
 * @typeParam T - the stored entity value
 * @effects Allocates two process-local `Ref` cells; the returned `snapshot`
 * reads the store each time it is run.
 * @internal
 * @category repositories
 * @since 0.0.0
 */
export const makeEntityStore = Effect.fn("Documents.RepoSupport.makeEntityStore")(function* <Id, T>(
  initial: HashMap.HashMap<Id, T>
) {
  const store = yield* Ref.make(initial);
  const counter = yield* Ref.make(1);
  const snapshot = Effect.map(Ref.get(store), (values): ReadonlyArray<T> => A.fromIterable(HashMap.values(values)));
  return { counter, snapshot, store };
});

/**
 * What {@link replaceVersioned} writes and how it reports a rejected write.
 *
 * @typeParam T - the stored entity value
 * @typeParam Missing - failure raised when the row is absent
 * @typeParam Stale - failure raised when another write advanced the row
 * @internal
 * @category repositories
 * @since 0.0.0
 */
export type ReplaceVersionedRequest<T, Missing, Stale> = {
  /** Entity to store; its `rowVersion` is the version the write expects. */
  readonly replacement: T;
  /** Rebuild the entity at the version the write stores. */
  readonly withRowVersion: (entity: T, rowVersion: RowVersion) => T;
  /** Failure for a row that is not in the store. */
  readonly onMissing: () => Missing;
  /** Failure for a row whose stored version differs; receives the stored version. */
  readonly onStale: (actualRowVersion: RowVersion) => Stale;
};

/**
 * Replace one stored entity only while its stored `rowVersion` still equals the
 * replacement's, storing the replacement at the next version.
 *
 * **Details**
 *
 * This is the in-memory twin of the Drizzle adapters' guarded
 * `UPDATE ... WHERE id = $id AND row_version = $expected`: the comparison and
 * the write happen in one `Ref.modify`, so two writers holding the same read
 * cannot both succeed. A missing row fails with `onMissing`; a row another
 * write already advanced fails with `onStale`, which receives the stored
 * version.
 *
 * **Example** (Reject a stale replacement)
 *
 * ```ts
 * import { replaceVersioned } from "@beep/documents-server/entities/internal/RepoSupport"
 * import { RowVersion } from "@beep/shared-domain/entity/EntityKit"
 * import * as Effect from "effect/Effect"
 * import * as HashMap from "effect/HashMap"
 * import * as Ref from "effect/Ref"
 *
 * type Row = { readonly id: number; readonly rowVersion: RowVersion; readonly note: string }
 * const program = Effect.gen(function* () {
 *   const store = yield* Ref.make(HashMap.make<[number, Row]>([1, { id: 1, rowVersion: RowVersion.make(1), note: "a" }]))
 *   const replace = (replacement: Row) =>
 *     replaceVersioned(store, {
 *       replacement,
 *       withRowVersion: (entity, rowVersion) => ({ ...entity, rowVersion }),
 *       onMissing: () => "missing",
 *       onStale: () => "stale"
 *     })
 *   const first = yield* replace({ id: 1, rowVersion: RowVersion.make(1), note: "b" })
 *   const second = yield* Effect.flip(replace({ id: 1, rowVersion: RowVersion.make(1), note: "c" }))
 *   return [first.rowVersion, second] as const
 * })
 * console.log(Effect.runSync(program)) // [2, "stale"]
 * ```
 *
 * @typeParam Id - the entity id used as the store's `HashMap` key
 * @typeParam T - the stored entity value
 * @effects Atomically reads and, on a version match, writes the store.
 * @internal
 * @category repositories
 * @since 0.0.0
 */
export const replaceVersioned: {
  <Id, T extends { readonly id: Id; readonly rowVersion: RowVersion }, Missing, Stale>(
    request: ReplaceVersionedRequest<T, Missing, Stale>
  ): (store: Ref.Ref<HashMap.HashMap<Id, T>>) => Effect.Effect<T, Missing | Stale>;
  <Id, T extends { readonly id: Id; readonly rowVersion: RowVersion }, Missing, Stale>(
    store: Ref.Ref<HashMap.HashMap<Id, T>>,
    request: ReplaceVersionedRequest<T, Missing, Stale>
  ): Effect.Effect<T, Missing | Stale>;
} = dual(
  2,
  <Id, T extends { readonly id: Id; readonly rowVersion: RowVersion }, Missing, Stale>(
    store: Ref.Ref<HashMap.HashMap<Id, T>>,
    { onMissing, onStale, replacement, withRowVersion }: ReplaceVersionedRequest<T, Missing, Stale>
  ): Effect.Effect<T, Missing | Stale> =>
    Ref.modify(store, (current): readonly [Result.Result<T, Missing | Stale>, HashMap.HashMap<Id, T>] =>
      O.match(HashMap.get(current, replacement.id), {
        onNone: () => [Result.fail(onMissing()), current],
        onSome: (stored) => {
          if (stored.rowVersion !== replacement.rowVersion) {
            return [Result.fail(onStale(stored.rowVersion)), current];
          }
          const written = withRowVersion(replacement, nextRowVersion(replacement.rowVersion));
          return [Result.succeed(written), HashMap.set(current, replacement.id, written)];
        },
      })
    ).pipe(Effect.flatMap(Effect.fromResult))
);
