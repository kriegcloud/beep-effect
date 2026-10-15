/**
 * Needs-review questions for the review hub: each needs-review message in the
 * ledger, raised as a question for the attorney and stored where the hub
 * reads it.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $DocketIntakeId } from "@beep/identity/packages";
import { makeReviewFilesLayer, ReviewFilesConfig } from "@beep/law-practice-server/ReviewFiles";
import { DocketQuestionInput, DocketQuestions, DocketQuestionsLive } from "@beep/law-practice-use-cases/DocketIntake";
import { ReviewItemStore } from "@beep/law-practice-use-cases/ReviewItemStore";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as R from "effect/Record";
import type { DocketIntakeState } from "@beep/law-practice-use-cases/DocketIntake";
import type * as Crypto from "effect/Crypto";
import type * as FileSystem from "effect/FileSystem";
import type * as Path from "effect/Path";

const $I = $DocketIntakeId.create("Questions");

/**
 * Publishes the questions of the needs-review messages in the ledger.
 *
 * **Details**
 *
 * Present only when the review hub is configured; the poll cycle skips the
 * step when no publisher is provided. `publish` never fails: a question that
 * could not be raised or stored is logged and published again next cycle.
 *
 * **Example** (Reference the publisher service)
 *
 * ```ts
 * import { DocketQuestionPublisher } from "../../src/Questions.ts"
 *
 * console.log(DocketQuestionPublisher.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class DocketQuestionPublisher extends Context.Service<
  DocketQuestionPublisher,
  { readonly publish: (state: DocketIntakeState) => Effect.Effect<void> }
>()($I`DocketQuestionPublisher`) {}

/**
 * The publisher over the review hub's item store in `directory`.
 *
 * **Details**
 *
 * Every cycle raises a question for every needs-review record in the ledger
 * and upserts them all. The store writes only questions that changed, and a
 * question's id is stable per message and reason, so repeating a cycle adds
 * nothing.
 *
 * **Example** (Make the publisher layer)
 *
 * ```ts
 * import * as Layer from "effect/Layer"
 * import { makeDocketQuestionPublisherLayer } from "../../src/Questions.ts"
 *
 * console.log(Layer.isLayer(makeDocketQuestionPublisherLayer("/var/lib/practice-review-hub"))) // true
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const makeDocketQuestionPublisherLayer = (
  directory: string
): Layer.Layer<DocketQuestionPublisher, never, Crypto.Crypto | FileSystem.FileSystem | Path.Path> =>
  Layer.effect(
    DocketQuestionPublisher,
    Effect.gen(function* () {
      const questions = yield* DocketQuestions;
      const store = yield* ReviewItemStore;
      return DocketQuestionPublisher.of({
        publish: Effect.fn("DocketIntakeApp.publishQuestions")(
          function* (state: DocketIntakeState) {
            const raised = yield* Effect.forEach(R.values(state.ledger), ({ outcome }) =>
              questions.raise(DocketQuestionInput.make({ outcome }))
            );
            yield* store.upsert(A.getSomes(raised));
          },
          Effect.catchTags({
            DocketIntakeError: ({ stage }) => Effect.logError("docket intake questions were not raised", { stage }),
            ReviewItemStoreError: ({ operation, reason }) =>
              Effect.logError("docket intake questions were not stored", { operation, reason }),
          })
        ),
      });
    })
  ).pipe(
    Layer.provide(
      Layer.merge(DocketQuestionsLive, makeReviewFilesLayer(ReviewFilesConfig.make({ dataDirectory: directory })))
    )
  );
