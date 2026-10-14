/**
 * The verdict log: append-only verdict revisions on answers, kept in the
 * plugin store and exported as JSON lines for review.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PracticeClaudeModId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Semaphore from "effect/Semaphore";
import { ModHost } from "./PracticeMod.host.ts";
import { KgAnswerItem, Verdict, VerdictRow } from "./PracticeMod.values.ts";
import type { ModHostError } from "./PracticeMod.host.ts";

const $I = $PracticeClaudeModId.create("PracticeMod.verdicts");

const ItemsKey = "verdict-items";
const RowsKey = "verdict-rows";

const StoredItems = S.Array(KgAnswerItem);
const StoredRows = S.Array(VerdictRow);
const RowLine = S.fromJsonString(VerdictRow);

/**
 * The item already carries a lock, so no further verdict is accepted.
 *
 * @category errors
 * @since 0.0.0
 */
class VerdictLocked extends S.TaggedError<VerdictLocked>($I`VerdictLocked`)(
  "VerdictLocked",
  { itemId: S.NonEmptyString },
  $I.annote("VerdictLocked", { description: "A verdict was refused because its item is locked." })
) {}

/**
 * The stored rows did not decode, so the log refuses to write over them.
 *
 * @category errors
 * @since 0.0.0
 */
class VerdictStoreUnreadable extends S.TaggedError<VerdictStoreUnreadable>($I`VerdictStoreUnreadable`)(
  "VerdictStoreUnreadable",
  { key: S.NonEmptyString, message: S.String },
  $I.annote("VerdictStoreUnreadable", { description: "The plugin store held verdict data that did not decode." })
) {}

/**
 * Everything a verdict log call can fail with.
 *
 * @category errors
 * @since 0.0.0
 */
type VerdictLogError = VerdictLocked | VerdictStoreUnreadable | ModHostError;

/**
 * One verdict to record on one answer.
 *
 * **Example** (Prepare an undo revision)
 *
 * ```ts
 * import { VerdictInput } from "@/PracticeMod.verdicts"
 * import { KgAnswerItem } from "@/PracticeMod.values"
 * import * as O from "effect/Option"
 *
 * const item = KgAnswerItem.make({
 *   itemId: "kg-answer:s-1:t-1",
 *   sessionId: "s-1",
 *   turnId: "t-1",
 *   question: "What changed?",
 *   matter: O.none(),
 * })
 * const input = VerdictInput.make({ item, verdict: O.none(), note: O.none() })
 * console.log(O.isNone(input.verdict)) // true
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class VerdictInput extends S.Class<VerdictInput>($I`VerdictInput`)(
  {
    item: KgAnswerItem,
    verdict: S.Option(Verdict),
    note: S.Option(S.NonEmptyString),
  },
  $I.annote("VerdictInput", { description: "A verdict (or an undo when none) and an optional note on one answer." })
) {}

/**
 * The verdict log.
 *
 * **Example** (Read the latest revision of an answer)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { VerdictLog } from "@/PracticeMod.verdicts"
 *
 * const program = Effect.flatMap(VerdictLog, (log) => log.current("kg-answer:s-1:t-1"))
 * console.log(Effect.isEffect(program)) // true
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class VerdictLog extends Context.Service<
  VerdictLog,
  {
    readonly record: (input: VerdictInput) => Effect.Effect<VerdictRow, VerdictLogError>;
    readonly current: (itemId: string) => Effect.Effect<O.Option<VerdictRow>, VerdictLogError>;
    readonly exportJsonl: (path: string) => Effect.Effect<number, VerdictLogError>;
  }
>()($I`VerdictLog`) {}

const unreadable = (key: string) => (issue: unknown) => VerdictStoreUnreadable.make({ key, message: String(issue) });

const readStored = Effect.fn("VerdictLog.readStored")(function* <A, I>(
  host: ModHost["Service"],
  key: string,
  schema: S.Codec<ReadonlyArray<A>, I>
) {
  const raw = yield* host.storeGet(key);
  return raw === undefined
    ? A.empty<A>()
    : yield* S.decodeUnknownEffect(schema)(raw).pipe(Effect.mapError(unreadable(key)));
});

const writeStored = Effect.fn("VerdictLog.writeStored")(function* <A, I>(
  host: ModHost["Service"],
  key: string,
  schema: S.Codec<ReadonlyArray<A>, I>,
  values: ReadonlyArray<A>
) {
  const encoded = yield* S.encodeEffect(schema)(values).pipe(Effect.mapError(unreadable(key)));
  yield* host.storeSet(key, encoded);
});

const latestFor = (rows: ReadonlyArray<VerdictRow>, itemId: string): O.Option<VerdictRow> =>
  pipe(
    A.filter(rows, (row) => row.itemId === itemId),
    A.last
  );

/**
 * Builds the verdict log over the mod host's store.
 *
 * **Example** (Reference the constructor)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { makeVerdictLog } from "@/PracticeMod.verdicts"
 *
 * console.log(Effect.isEffect(makeVerdictLog)) // true
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeVerdictLog = Effect.gen(function* () {
  const host = yield* ModHost;
  // record reads, appends and writes the stored rows; serialize it so two
  // overlapping records cannot both append to the same snapshot.
  const writes = yield* Semaphore.make(1);

  const current = Effect.fn("VerdictLog.current")(function* (itemId: string) {
    const rows = yield* readStored(host, RowsKey, StoredRows);
    return latestFor(rows, itemId);
  });

  const recordUnserialized = Effect.fn("VerdictLog.record")(function* (input: VerdictInput) {
    const rows = yield* readStored(host, RowsKey, StoredRows);
    const previous = latestFor(rows, input.item.itemId);
    if (O.isSome(previous) && O.isSome(previous.value.lockedAt)) {
      return yield* VerdictLocked.make({ itemId: input.item.itemId });
    }
    const row = VerdictRow.make({
      schemaVersion: "practice-verdict/v1",
      itemId: input.item.itemId,
      verdict: input.verdict,
      note: input.note,
      revision: S.Natural.make(O.match(previous, { onNone: () => 0, onSome: (last) => last.revision + 1 })),
      recordedAt: yield* host.now,
      lockedAt: O.none(),
    });
    const items = yield* readStored(host, ItemsKey, StoredItems);
    if (!A.some(items, (item) => item.itemId === input.item.itemId)) {
      yield* writeStored(host, ItemsKey, StoredItems, A.append(items, input.item));
    }
    yield* writeStored(host, RowsKey, StoredRows, A.append(rows, row));
    return row;
  });

  const exportJsonl = Effect.fn("VerdictLog.exportJsonl")(function* (path: string) {
    const rows = yield* readStored(host, RowsKey, StoredRows);
    const lines = yield* Effect.forEach(rows, (row) =>
      S.encodeEffect(RowLine)(row).pipe(Effect.mapError(unreadable(RowsKey)))
    );
    yield* host.writeText(path, A.join(lines, "\n") + (lines.length > 0 ? "\n" : ""));
    return rows.length;
  });

  const record = (input: VerdictInput) => Semaphore.withPermit(writes)(recordUnserialized(input));

  return VerdictLog.of({ record, current, exportJsonl });
});

/**
 * The verdict log over the mod host's store.
 *
 * **Example** (Reference the layer)
 *
 * ```ts
 * import * as Layer from "effect/Layer"
 * import { verdictLogLayer } from "@/PracticeMod.verdicts"
 *
 * console.log(Layer.isLayer(verdictLogLayer)) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const verdictLogLayer: Layer.Layer<VerdictLog, never, ModHost> = Layer.effect(VerdictLog)(makeVerdictLog);
