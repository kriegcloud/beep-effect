/**
 * Verdict-log reading rules shared by the review queue and the verdict
 * projector: which row is an item's latest verdict, whether it is final,
 * which revision comes next, and whether a batch is locked.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import { Verdict } from "@beep/law-practice-domain";
import * as A from "effect/Array";
import * as DateTime from "effect/DateTime";
import { dual, flow, pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import type { ReviewBatchId, ReviewItemId, VerdictRow } from "@beep/law-practice-domain";

// Recency order of verdict rows: by `recordedAt`, ties broken by `revision`.
const VerdictRowRecency: Order.Order<VerdictRow> = Order.combine(
  Order.mapInput(DateTime.Order, (row: VerdictRow) => row.recordedAt),
  Order.mapInput(Num.Order, (row: VerdictRow) => row.revision)
);

const isMoreRecent = Order.isGreaterThan(VerdictRowRecency);

// Of two rows read in append order, the more recent one; a full tie on
// `recordedAt` and `revision` goes to `next`, the row appended last.
const laterRow = (current: VerdictRow, next: VerdictRow): VerdictRow => (isMoreRecent(current, next) ? current : next);

/**
 * Each item's latest verdict row across every batch, keyed by item id.
 *
 * **Details**
 *
 * Latest means the greatest `recordedAt`, ties broken by the greater
 * `revision`; remaining ties go to the row appended last, since rows are read
 * in append order.
 *
 * **Example** (Index an empty log)
 *
 * ```ts
 * import * as HashMap from "effect/HashMap"
 * import { latestVerdictByItem } from "./latestVerdict.ts"
 *
 * console.log(HashMap.size(latestVerdictByItem([]))) // 0
 * ```
 *
 * @internal
 * @category reading
 * @since 0.0.0
 */
export const latestVerdictByItem = (rows: ReadonlyArray<VerdictRow>): HashMap.HashMap<ReviewItemId, VerdictRow> =>
  A.reduce(rows, HashMap.empty<ReviewItemId, VerdictRow>(), (latest, row) =>
    HashMap.set(
      latest,
      row.itemId,
      pipe(
        HashMap.get(latest, row.itemId),
        O.map((current) => laterRow(current, row)),
        O.getOrElse(() => row)
      )
    )
  );

/**
 * Whether a verdict row closes its item: `right` and `wrong` are final;
 * `partly` and `withdrawn` return the item to the queue.
 *
 * **Example** (Check a partly verdict)
 *
 * ```ts
 * import { isFinalVerdict } from "./latestVerdict.ts"
 *
 * console.log(typeof isFinalVerdict) // "function"
 * ```
 *
 * @internal
 * @category reading
 * @since 0.0.0
 */
export const isFinalVerdict = (row: VerdictRow): boolean =>
  Verdict.is.right(row.verdict) || Verdict.is.wrong(row.verdict);

/**
 * The batch's latest row (greatest `recordedAt`, then `revision`, then the
 * row appended last), or none when the batch has no rows.
 *
 * **Example** (Read an empty batch)
 *
 * ```ts
 * import { latestBatchRow } from "./latestVerdict.ts"
 *
 * console.log(latestBatchRow([], "sitting-1")._tag) // "None"
 * ```
 *
 * @internal
 * @category reading
 * @since 0.0.0
 */
export const latestBatchRow: {
  (batchId: ReviewBatchId): (rows: ReadonlyArray<VerdictRow>) => O.Option<VerdictRow>;
  (rows: ReadonlyArray<VerdictRow>, batchId: ReviewBatchId): O.Option<VerdictRow>;
} = dual(
  2,
  (rows: ReadonlyArray<VerdictRow>, batchId: ReviewBatchId): O.Option<VerdictRow> =>
    pipe(
      A.filter(rows, (row) => row.batchId === batchId),
      A.match({
        onEmpty: O.none,
        onNonEmpty: (batch) => O.some(A.reduce(A.tailNonEmpty(batch), A.headNonEmpty(batch), laterRow)),
      })
    )
);

/**
 * The revision the next row for an item in a batch carries: one more than the
 * highest stored revision of that item in that batch, or 1.
 *
 * **Example** (Number the first verdict)
 *
 * ```ts
 * import { nextRevision } from "./latestVerdict.ts"
 *
 * console.log(nextRevision([], "claim-finding:1", "sitting-1")) // 1
 * ```
 *
 * @internal
 * @category reading
 * @since 0.0.0
 */
export const nextRevision: {
  (itemId: ReviewItemId, batchId: ReviewBatchId): (rows: ReadonlyArray<VerdictRow>) => number;
  (rows: ReadonlyArray<VerdictRow>, itemId: ReviewItemId, batchId: ReviewBatchId): number;
} = dual(3, (rows: ReadonlyArray<VerdictRow>, itemId: ReviewItemId, batchId: ReviewBatchId): number =>
  pipe(
    A.filter(rows, (row) => row.itemId === itemId && row.batchId === batchId),
    A.map((row) => row.revision),
    A.match({ onEmpty: () => 1, onNonEmpty: flow(A.max(Num.Order), Num.increment) })
  )
);

/**
 * When the batch was locked: the `lockedAt` of its first row that carries
 * one, or none while the batch is open.
 *
 * **Example** (Read an open batch)
 *
 * ```ts
 * import { batchLockedAt } from "./latestVerdict.ts"
 *
 * console.log(batchLockedAt([], "sitting-1")._tag) // "None"
 * ```
 *
 * @internal
 * @category reading
 * @since 0.0.0
 */
export const batchLockedAt: {
  (batchId: ReviewBatchId): (rows: ReadonlyArray<VerdictRow>) => O.Option<DateTime.Utc>;
  (rows: ReadonlyArray<VerdictRow>, batchId: ReviewBatchId): O.Option<DateTime.Utc>;
} = dual(
  2,
  (rows: ReadonlyArray<VerdictRow>, batchId: ReviewBatchId): O.Option<DateTime.Utc> =>
    A.findFirst(rows, (row) => (row.batchId === batchId ? row.lockedAt : O.none()))
);
