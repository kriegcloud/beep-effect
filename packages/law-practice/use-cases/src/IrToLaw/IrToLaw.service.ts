/**
 * IR-to-law mapping implementation.
 *
 * Maps the span-bearing `GroundedExtraction[]` for one office action into the
 * five law-practice domain entities, keyed by the extraction `label`
 * vocabulary (`"office_action"`, `"claim"`, `"rejection_reference"`,
 * `"distinction"`). The `"distinction"` extraction's aligned `span` +
 * `matchedText` ground the required `Distinction.anchor` (`TextAnchor`); the
 * §102 rejection cites the prior-art reference by its fixture key.
 *
 * Entities are decoded through their schemas with a spike audit envelope (see
 * {@link spikeEntityInput}) — a spike affordance, not the production id/audit
 * path. The mapping is effectful and fails typed when required extraction labels
 * are missing, empty, or unaligned before any law entity is decoded.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Claim, Distinction, OfficeAction, PriorArtReference, Rejection } from "@beep/law-practice-domain";
import { Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { spikeEntityInput } from "../internal/spikeEntity.ts";
import { IrToLawExtractionError } from "./IrToLaw.errors.ts";
import type { GroundedExtraction } from "@beep/langextract/Extraction";
import type { IrToLawShape, LawEntities } from "./IrToLaw.ports.ts";

// Module-scope sync decoders: the spike builds these entities from statically
// known-good shapes (fixed fixture keys/literals + unconstrained extraction
// strings), so a decode failure here is a construction defect, not input error —
// matching the ClaimGate/ClaimProjection precedent. Binding the decoders at
// module scope (not inside an Effect) also satisfies the `schemaSyncInEffect` lint.
const decodeOfficeAction = S.decodeUnknownSync(OfficeAction);
const decodeClaim = S.decodeUnknownSync(Claim);
const decodePriorArtReference = S.decodeUnknownSync(PriorArtReference);
const decodeRejection = S.decodeUnknownSync(Rejection);
const decodeDistinction = S.decodeUnknownSync(Distinction);

const missingExtraction = (label: string): IrToLawExtractionError =>
  IrToLawExtractionError.fromReason("required-extraction-missing", {
    label,
    message: `Office-action extraction output is missing required label "${label}".`,
  });

const emptyExtraction = (extraction: GroundedExtraction): IrToLawExtractionError =>
  IrToLawExtractionError.fromReason("required-extraction-missing", {
    label: extraction.label,
    message: `Office-action extraction label "${extraction.label}" is empty.`,
  });

const unalignedExtraction = (extraction: GroundedExtraction): IrToLawExtractionError =>
  IrToLawExtractionError.fromReason("required-extraction-unaligned", {
    alignmentStatus: extraction.alignmentStatus,
    label: extraction.label,
    message: `Office-action extraction label "${extraction.label}" is not source-grounded.`,
  });

const requiredExtraction = Effect.fn("law_practice.ir_to_law.required_extraction")(function* (
  extractions: ReadonlyArray<GroundedExtraction>,
  label: string
): Effect.fn.Return<GroundedExtraction, IrToLawExtractionError> {
  const extraction = yield* pipe(
    A.findFirst(extractions, (extraction) => extraction.label === label),
    O.match({
      onNone: () => Effect.fail(missingExtraction(label)),
      onSome: Effect.succeed,
    })
  );

  if (extraction.text.trim().length === 0) {
    return yield* emptyExtraction(extraction);
  }
  if (extraction.alignmentStatus === "unaligned") {
    return yield* unalignedExtraction(extraction);
  }

  return extraction;
});

const textOf = Effect.fn("law_practice.ir_to_law.text_of")(function* (
  extractions: ReadonlyArray<GroundedExtraction>,
  label: string
): Effect.fn.Return<string, IrToLawExtractionError> {
  const extraction = yield* requiredExtraction(extractions, label);
  return extraction.text;
});

const anchorOf = Effect.fn("law_practice.ir_to_law.anchor_of")(function* (
  extractions: ReadonlyArray<GroundedExtraction>,
  label: string
): Effect.fn.Return<
  { readonly endChar: number; readonly quote: string; readonly startChar: number },
  IrToLawExtractionError
> {
  const extraction = yield* requiredExtraction(extractions, label);

  if (extraction.alignmentStatus === "unaligned") {
    return yield* unalignedExtraction(extraction);
  }

  const span = yield* pipe(
    O.fromUndefinedOr(extraction.span),
    O.match({
      onNone: () => Effect.fail(unalignedExtraction(extraction)),
      onSome: Effect.succeed,
    })
  );
  const quote = pipe(
    O.fromUndefinedOr(extraction.matchedText),
    O.getOrElse(() => extraction.text)
  );

  return { endChar: span.end, quote, startChar: span.start };
});

const officeActionFixtureKey = "office-action.spike";
const patentAssetFixtureKey = "patent-asset.spike";
const claimFixtureKey = "claim.spike";
const referenceFixtureKey = "prior-art.spike";
const rejectionFixtureKey = "rejection.spike";
const distinctionFixtureKey = "distinction.spike";

const buildLawEntities = Effect.fn("law_practice.ir_to_law.build_entities")(function* (
  extractions: ReadonlyArray<GroundedExtraction>
): Effect.fn.Return<LawEntities, IrToLawExtractionError> {
  const officeActionText = yield* textOf(extractions, "office_action");
  const claimText = yield* textOf(extractions, "claim");
  const referenceText = yield* textOf(extractions, "rejection_reference");
  const distinctionText = yield* textOf(extractions, "distinction");
  const distinctionAnchor = yield* anchorOf(extractions, "distinction");

  return {
    claim: decodeClaim({
      ...spikeEntityInput("LawPracticeClaim", 2),
      claimNumber: 1,
      fixtureKey: claimFixtureKey,
      independent: true,
      patentAssetFixtureKey,
      text: claimText,
    }),
    distinction: decodeDistinction({
      ...spikeEntityInput("LawPracticeDistinction", 5),
      anchor: distinctionAnchor,
      claimFixtureKey,
      detail: { kind: "missing_limitation", limitation: distinctionText },
      fixtureKey: distinctionFixtureKey,
      lifecycleState: "candidate",
      rejectionFixtureKey,
    }),
    officeAction: decodeOfficeAction({
      ...spikeEntityInput("LawPracticeOfficeAction", 1),
      applicationNumber: officeActionText,
      fixtureKey: officeActionFixtureKey,
      matterFixtureKey: "matter.spike",
      patentAssetFixtureKey,
    }),
    priorArtReference: decodePriorArtReference({
      ...spikeEntityInput("LawPracticePriorArtReference", 3),
      documentNumber: "US 0,000,000 B2",
      fixtureKey: referenceFixtureKey,
      officeActionFixtureKey,
      title: referenceText,
    }),
    rejection: decodeRejection({
      ...spikeEntityInput("LawPracticeRejection", 4),
      claimFixtureKey,
      fixtureKey: rejectionFixtureKey,
      ground: { referenceFixtureKey, statute: "102" },
      officeActionFixtureKey,
    }),
  };
});

/**
 * Build the pure IR-to-law mapping shape.
 *
 * @example
 * ```ts
 * import { makeIrToLaw } from "@beep/law-practice-use-cases/IrToLaw"
 *
 * console.log(typeof makeIrToLaw().toLaw)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeIrToLaw = (): IrToLawShape => ({
  toLaw: (extractions: ReadonlyArray<GroundedExtraction>): Effect.Effect<LawEntities, IrToLawExtractionError> =>
    buildLawEntities(extractions),
});
