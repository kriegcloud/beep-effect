/**
 * Verdict projector implementation: the pure mapping from the attorney's
 * final verdicts on `claim-finding` items to claim-disposition projections.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { ReviewItem } from "@beep/law-practice-domain";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import { isFinalVerdict, latestVerdictByItem } from "../internal/latestVerdict.ts";
import {
  ATTORNEY_CONFIRMED_REASON,
  ATTORNEY_REJECTED_REASON,
  ClaimDispositionProjection,
} from "./VerdictProjector.model.ts";
import { VerdictProjector } from "./VerdictProjector.ports.ts";
import type { VerdictRow } from "@beep/law-practice-domain";
import type { Principal } from "@beep/shared-domain/entity/Principal";
import type { ClaimDispositionProjectionStatus } from "./VerdictProjector.model.ts";
import type { ClaimFindingReviewItem, VerdictProjectorShape } from "./VerdictProjector.ports.ts";

const disposition = Match.type<VerdictRow>().pipe(
  Match.withReturnType<O.Option<{ readonly reason: string; readonly status: ClaimDispositionProjectionStatus }>>(),
  Match.when({ verdict: "right" }, () => O.some({ status: "active", reason: ATTORNEY_CONFIRMED_REASON })),
  Match.when({ verdict: "wrong" }, (row) =>
    O.some({
      status: "rejected",
      reason: O.getOrElse(row.note, () => ATTORNEY_REJECTED_REASON),
    })
  ),
  Match.orElse(() => O.none())
);

const projectRow = (item: ClaimFindingReviewItem, resolvedBy: Principal) => (row: VerdictRow) =>
  pipe(
    O.liftPredicate(row, isFinalVerdict),
    O.flatMap(disposition),
    O.map(({ reason, status }) =>
      ClaimDispositionProjection.make({
        claimId: item.claimId,
        status,
        reason,
        resolvedAt: row.recordedAt,
        resolvedBy,
      })
    )
  );

const isClaimFinding = ReviewItem.guards["claim-finding"];

const project: VerdictProjectorShape["project"] = ({ items, resolvedBy, rows }) => {
  const latest = latestVerdictByItem(rows);
  return pipe(
    A.filter(items, isClaimFinding),
    A.map((item) => O.flatMap(HashMap.get(latest, item.itemId), projectRow(item, resolvedBy))),
    A.getSomes
  );
};

const projectItem: VerdictProjectorShape["projectItem"] = ({ item, resolvedBy, rows }) =>
  O.flatMap(HashMap.get(latestVerdictByItem(rows), item.itemId), projectRow(item, resolvedBy));

/**
 * Layer providing the pure verdict projector.
 *
 * **Details**
 *
 * The layer has no dependencies: the projector reads no clock, stores
 * nothing and fails with no error. Equal inputs give equal outputs.
 *
 * **Example** (Project a confirmed claim finding)
 *
 * ```ts
 * import { ReviewItem, VerdictRow } from "@beep/law-practice-domain"
 * import { VerdictProjector, VerdictProjectorLive } from "@beep/law-practice-use-cases/VerdictProjector"
 * import * as DateTime from "effect/DateTime"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const projector = yield* VerdictProjector
 *   const item = ReviewItem.cases["claim-finding"].make({
 *     itemId: "claim-finding:1",
 *     text: "Element (b) is disclosed.",
 *     sourceRefs: [],
 *     claimId: 3,
 *   })
 *   const row = VerdictRow.make({
 *     itemId: "claim-finding:1",
 *     batchId: "sitting-1",
 *     verdict: "right",
 *     revision: 1,
 *     recordedAt: DateTime.makeUnsafe(0),
 *   })
 *   const projections = projector.project({
 *     items: [item],
 *     resolvedBy: { kind: "System", component: "Runtime" },
 *     rows: [row],
 *   })
 *   console.log(projections[0]?.status) // "active"
 * }).pipe(Effect.provide(VerdictProjectorLive))
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const VerdictProjectorLive: Layer.Layer<VerdictProjector> = Layer.succeed(
  VerdictProjector,
  VerdictProjector.of({ project, projectItem })
);
