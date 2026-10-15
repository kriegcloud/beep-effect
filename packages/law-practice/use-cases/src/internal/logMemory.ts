/**
 * In-memory stores of the review envelope's append-only logs and items for
 * tests, re-exported from the package's `./test` surface.
 *
 * @internal
 * @packageDocumentation
 * @since 0.0.0
 */

import * as A from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Ref from "effect/Ref";
import { AnswerLog } from "../QuestionQueue/QuestionQueue.ports.ts";
import { latestItems, ReviewItemStore } from "../ReviewItemStore/ReviewItemStore.ports.ts";
import { VerdictLog } from "../ReviewQueue/ReviewQueue.ports.ts";
import type { AnswerRow, ReviewItem, VerdictRow } from "@beep/law-practice-domain";

// An append-only chunk of rows in a `Ref`: atomic appends, reads in append order.
const appendOnlyRows = <Row>() =>
  Effect.map(Ref.make(Chunk.empty<Row>()), (ref) => ({
    append: (row: Row) => Ref.update(ref, Chunk.append(row)),
    rows: Effect.map(Ref.get(ref), Chunk.toReadonlyArray),
  }));

/**
 * In-memory verdict-log store: an append-only chunk of rows held in a `Ref`.
 *
 * **Details**
 *
 * Each build of the layer starts from an empty log. It never fails, and its
 * appends are atomic, so concurrent writers inside one process cannot lose a
 * row. Meant for tests and examples; it keeps nothing across processes.
 *
 * **Example** (Append and read a row)
 *
 * ```ts
 * import { VerdictRow } from "@beep/law-practice-domain"
 * import { VerdictLog } from "@beep/law-practice-use-cases/ReviewQueue"
 * import { VerdictLogMemory } from "@beep/law-practice-use-cases/test"
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const log = yield* VerdictLog
 *   yield* log.append(
 *     VerdictRow.make({
 *       itemId: "claim-finding:1",
 *       batchId: "sitting-1",
 *       verdict: "right",
 *       revision: 1,
 *       recordedAt: DateTime.makeUnsafe(0),
 *     })
 *   )
 *   console.log((yield* log.rows).length) // 1
 * }).pipe(Effect.provide(VerdictLogMemory))
 * ```
 *
 * @internal
 * @category layers
 * @since 0.0.0
 */
export const VerdictLogMemory: Layer.Layer<VerdictLog> = Layer.effect(
  VerdictLog,
  Effect.map(appendOnlyRows<VerdictRow>(), ({ append, rows }) =>
    VerdictLog.of({ append: Effect.fn("VerdictLog.append")(append), rows })
  )
);

/**
 * In-memory answer-log store: an append-only chunk of rows held in a `Ref`.
 *
 * **Details**
 *
 * Each build of the layer starts from an empty log. It never fails, and its
 * appends are atomic. Meant for tests and examples; it keeps nothing across
 * processes.
 *
 * **Example** (Append and read an answer)
 *
 * ```ts
 * import { AnswerRow } from "@beep/law-practice-domain"
 * import { AnswerLog } from "@beep/law-practice-use-cases/QuestionQueue"
 * import { AnswerLogMemory } from "@beep/law-practice-use-cases/test"
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const log = yield* AnswerLog
 *   yield* log.append(
 *     AnswerRow.cases["keep-reminding"].make({ itemId: "question:1", revision: 1, recordedAt: DateTime.makeUnsafe(0) })
 *   )
 *   console.log((yield* log.rows).length) // 1
 * }).pipe(Effect.provide(AnswerLogMemory))
 * ```
 *
 * @internal
 * @category layers
 * @since 0.0.0
 */
export const AnswerLogMemory: Layer.Layer<AnswerLog> = Layer.effect(
  AnswerLog,
  Effect.map(appendOnlyRows<AnswerRow>(), ({ append, rows }) =>
    AnswerLog.of({ append: Effect.fn("AnswerLog.append")(append), rows })
  )
);

/**
 * In-memory review-item store: the latest version of each item, held in a `Ref`.
 *
 * **Details**
 *
 * Each build of the layer starts empty. It never fails, and it orders and
 * replaces items with `latestItems`, as every adapter does.
 *
 * **Example** (Store an item twice)
 *
 * ```ts
 * import { ReviewItem } from "@beep/law-practice-domain"
 * import { ReviewItemStore } from "@beep/law-practice-use-cases/ReviewItemStore"
 * import { ReviewItemStoreMemory } from "@beep/law-practice-use-cases/test"
 * import * as Effect from "effect/Effect"
 *
 * const item = ReviewItem.cases["kg-answer"].make({ itemId: "kg-answer:1", text: "A synthetic answer.", sourceRefs: [] })
 * const program = Effect.gen(function* () {
 *   const store = yield* ReviewItemStore
 *   yield* store.upsert([item, item])
 *   console.log((yield* store.list).length) // 1
 * }).pipe(Effect.provide(ReviewItemStoreMemory))
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const ReviewItemStoreMemory: Layer.Layer<ReviewItemStore> = Layer.effect(
  ReviewItemStore,
  Effect.map(Ref.make<ReadonlyArray<ReviewItem>>([]), (ref) =>
    ReviewItemStore.of({
      list: Ref.get(ref),
      upsert: Effect.fn("ReviewItemStore.upsert")((items: ReadonlyArray<ReviewItem>) =>
        Ref.update(ref, (stored) => latestItems(A.appendAll(stored, items)))
      ),
    })
  )
);
