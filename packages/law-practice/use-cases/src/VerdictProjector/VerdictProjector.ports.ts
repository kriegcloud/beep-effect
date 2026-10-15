/**
 * Verdict projector contract: a pure, deterministic mapping from the verdict
 * log to claim-disposition projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LawPracticeUseCasesId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type { ReviewItem, VerdictRow } from "@beep/law-practice-domain";
import type { Principal } from "@beep/shared-domain/entity/Principal";
import type * as O from "effect/Option";
import type { ClaimDispositionProjection } from "./VerdictProjector.schemas.ts";

const $I = $LawPracticeUseCasesId.create("VerdictProjector/VerdictProjector.ports");

/**
 * The `claim-finding` member of `ReviewItem`, the only kind the projector
 * maps onto a claim disposition.
 *
 * @see {@link VerdictProjectorShape.projectItem} for the per-item mapping.
 * @category models
 * @since 0.0.0
 */
export type ClaimFindingReviewItem = (typeof ReviewItem.cases)["claim-finding"]["Type"];

/**
 * Service shape of the verdict projector.
 *
 * **Details**
 *
 * Both methods are pure and total: they return plain values, read no clock,
 * invent no ids and fail with no error. The same rows and the same
 * `resolvedBy` always give equal results.
 *
 * An item's latest verdict is its row with the greatest `recordedAt` across
 * every batch; a tie goes to the row appended last, since rows are read in
 * append order. Revisions never break ties. A latest verdict of `right` or
 * `wrong` is final. The mapping:
 *
 * - `right` projects to `active` with `ATTORNEY_CONFIRMED_REASON`;
 * - `wrong` projects to `rejected` with the row's note as the reason, or
 *   `ATTORNEY_REJECTED_REASON` when the row has no note;
 * - `partly`, `withdrawn`, or no row for the item, projects to nothing: the claim stays
 *   unresolved and the item returns to the queue.
 *
 * `resolvedAt` is the deciding row's `recordedAt`; `resolvedBy` is copied
 * from the input. Lock rows copy the row they close on, so a lock never
 * changes a projection.
 *
 * **Example** (Name a projector method)
 *
 * ```ts
 * import type { VerdictProjectorShape } from "@beep/law-practice-use-cases/VerdictProjector"
 *
 * const method: keyof VerdictProjectorShape = "project"
 * console.log(method) // "project"
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export interface VerdictProjectorShape {
  /**
   * Project every `claim-finding` item whose latest verdict is final, in the
   * order of `items`. Items of other kinds and unresolved findings are
   * skipped; `rows` may hold rows for any item.
   */
  readonly project: (input: {
    readonly items: ReadonlyArray<ReviewItem>;
    readonly resolvedBy: Principal;
    readonly rows: ReadonlyArray<VerdictRow>;
  }) => ReadonlyArray<ClaimDispositionProjection>;
  /**
   * Project one `claim-finding` item. `None` when the item has no rows or its
   * latest verdict is `partly` or `withdrawn`. Rows for other items are ignored.
   */
  readonly projectItem: (input: {
    readonly item: ClaimFindingReviewItem;
    readonly resolvedBy: Principal;
    readonly rows: ReadonlyArray<VerdictRow>;
  }) => O.Option<ClaimDispositionProjection>;
}

/**
 * Service: maps the attorney's final verdicts on `claim-finding` items to
 * claim-disposition projections.
 *
 * **Details**
 *
 * The projector has no write capability and never reaches the epistemic
 * tables. Completing a projection into a `ClaimDispositionAppend` and storing
 * it stays with the epistemic owner.
 *
 * **Example** (Reference the projector service)
 *
 * ```ts
 * import { VerdictProjector } from "@beep/law-practice-use-cases/VerdictProjector"
 *
 * console.log(VerdictProjector.key)
 * ```
 *
 * @category ports
 * @since 0.0.0
 */
export class VerdictProjector extends Context.Service<VerdictProjector, VerdictProjectorShape>()(
  $I`VerdictProjector`
) {}
