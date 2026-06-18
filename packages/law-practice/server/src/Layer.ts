/**
 * Law-practice server layer.
 *
 * Composes the slice's live service surface: the `IrToLaw` mapping (pure, no
 * dependencies), the file-processing capability backed by the P1 Tika engine,
 * the provider-neutral LangExtract service, and the `OfficeActionReview` loop
 * (which resolves `IrToLaw`, file processing, LangExtract, plus the epistemic
 * `ClaimGate` and `ClaimTransition`). The epistemic server surface is provided
 * once at the merge boundary so the bounded SHACL engine is built a single time.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import { EpistemicServerLive } from "@beep/epistemic-server/layer";
import { ClaimGate } from "@beep/epistemic-use-cases/ClaimGate";
import { ClaimTransition } from "@beep/epistemic-use-cases/ClaimLifecycle";
import { FileProcessingService, makeFileProcessingServiceLayer } from "@beep/file-processing/Service";
import { layer as LangExtractLayer, LangExtractService } from "@beep/langextract/Service";
import { IrToLaw, makeIrToLaw } from "@beep/law-practice-use-cases/IrToLaw";
import { makeOfficeActionReview, OfficeActionReview } from "@beep/law-practice-use-cases/OfficeActionReview";
import { TikaFileProcessingEngine } from "@beep/tika";
import { Effect, Layer } from "effect";

const IrToLawLayer = Layer.succeed(IrToLaw, IrToLaw.of(makeIrToLaw()));
const FileProcessingLayer = makeFileProcessingServiceLayer([TikaFileProcessingEngine]);

const OfficeActionReviewLayer = Layer.effect(
  OfficeActionReview,
  Effect.gen(function* () {
    const fileProcessing = yield* FileProcessingService;
    const irToLaw = yield* IrToLaw;
    const langExtract = yield* LangExtractService;
    const gate = yield* ClaimGate;
    const transition = yield* ClaimTransition;
    return OfficeActionReview.of(makeOfficeActionReview({ fileProcessing, gate, irToLaw, langExtract, transition }));
  })
);

/**
 * Live law-practice server layer providing the IR-to-law mapping and the
 * office-action review loop over provider-neutral extraction and the epistemic
 * admission services.
 *
 * @example
 * ```ts
 * import { LawPracticeServerLive } from "@beep/law-practice-server/layer"
 *
 * console.log(LawPracticeServerLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const LawPracticeServerLive = OfficeActionReviewLayer.pipe(
  // `provideMerge` satisfies the loop's `IrToLaw` dependency while keeping
  // `IrToLaw` in the output surface (a sibling `mergeAll` would race the
  // provider against the consumer); the file-processing capability supplies
  // extracted source text, LangExtract supplies grounded source spans, and the
  // epistemic server supplies the gate + transition the loop also requires.
  Layer.provideMerge(IrToLawLayer),
  Layer.provide(FileProcessingLayer),
  Layer.provide(LangExtractLayer),
  Layer.provide(EpistemicServerLive)
);
