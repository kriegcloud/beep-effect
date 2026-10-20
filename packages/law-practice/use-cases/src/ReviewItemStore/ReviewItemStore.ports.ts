/**
 * Review-item store port: where producers put the items that wait for the
 * attorney, and where the review hub reads them.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import type { ReviewItem } from "@beep/law-practice-domain";
import type * as Effect from "effect/Effect";
import type { ReviewItemStoreError } from "./ReviewItemStore.errors.ts";

const $I = $LawPracticeUseCasesId.create("ReviewItemStore/ReviewItemStore.ports");

/**
 * Service shape of the review-item store.
 *
 * **Details**
 *
 * `upsert` is idempotent by `itemId`: storing an item whose id is already
 * stored replaces it (the latest write wins), and storing the same items
 * again changes nothing. `list` returns the latest version of every item, in
 * the order the ids were first stored. Producers own the items; the queues
 * store only verdicts and answers.
 *
 * **Example** (Name a store method)
 *
 * ```ts
 * import type { ReviewItemStoreShape } from "@beep/law-practice-use-cases/ReviewItemStore"
 *
 * const method: keyof ReviewItemStoreShape = "upsert"
 * console.log(method) // "upsert"
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface ReviewItemStoreShape {
  /** The latest version of every stored item, in the order the ids were first stored. */
  readonly list: Effect.Effect<ReadonlyArray<ReviewItem>, ReviewItemStoreError>;
  /** Store the items; an item whose id is already stored replaces it. */
  readonly upsert: (items: ReadonlyArray<ReviewItem>) => Effect.Effect<void, ReviewItemStoreError>;
}

/**
 * The review items waiting for the attorney: verdict items and questions.
 *
 * **Details**
 *
 * The workstation adapter is a JSONL file (`@beep/law-practice-server/ReviewFiles`);
 * `ReviewItemStoreMemory` from `@beep/law-practice-use-cases/test` serves tests.
 *
 * **Example** (Reference the store service)
 *
 * ```ts
 * import { ReviewItemStore } from "@beep/law-practice-use-cases/ReviewItemStore"
 *
 * console.log(ReviewItemStore.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class ReviewItemStore extends Context.Service<ReviewItemStore, ReviewItemStoreShape>()($I`ReviewItemStore`) {}

// Replace the item with the same id in place, or add the item at the end.
const upsertOne = (items: ReadonlyArray<ReviewItem>, item: ReviewItem): Array<ReviewItem> =>
  A.some(items, ({ itemId }) => itemId === item.itemId)
    ? A.map(items, (stored) => (stored.itemId === item.itemId ? item : stored))
    : A.append(items, item);

/**
 * Collapse stored item versions into what `list` returns: the latest version
 * of each id, in the order the ids were first stored.
 *
 * **Details**
 *
 * Every `ReviewItemStore` adapter answers `list` with this function over its
 * stored versions in write order, so all adapters agree on order and on which
 * version wins.
 *
 * **Example** (Keep the latest version of each item)
 *
 * ```ts
 * import { ReviewItem } from "@beep/law-practice-domain"
 * import { latestItems } from "@beep/law-practice-use-cases/ReviewItemStore"
 * import * as A from "effect/Array"
 *
 * const item = (itemId: string, text: string) =>
 *   ReviewItem.cases["kg-answer"].make({ itemId, text, sourceRefs: [] })
 * const items = latestItems([item("a", "First"), item("b", "Other"), item("a", "Second")])
 * console.log(A.map(items, ({ itemId, text }) => `${itemId}:${text}`)) // ["a:Second", "b:Other"]
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const latestItems = (versions: ReadonlyArray<ReviewItem>): ReadonlyArray<ReviewItem> =>
  A.reduce(versions, A.empty<ReviewItem>(), upsertOne);
