import { alignCandidates } from "@beep/langextract/Alignment";
import { ExtractionCandidate } from "@beep/langextract/Extraction";
import { Distinction } from "@beep/law-practice-domain";
import { LawPracticeServerLive } from "@beep/law-practice-server/layer";
import { IrToLaw } from "@beep/law-practice-use-cases/IrToLaw";
import { OfficeActionReview } from "@beep/law-practice-use-cases/OfficeActionReview";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import {
  EXPECTED_DISTINCTION_LIMITATION,
  EXPECTED_DISTINCTION_QUOTE,
  makeOfficeActionReviewInput,
  OFFICE_ACTION_FIXTURE,
} from "./fixture.ts";

// Mirrors — byte for byte — the fixed candidate set inside the OfficeActionReview
// loop (packages/law-practice/use-cases/src/OfficeActionReview/OfficeActionReview.service.ts).
// This duplication is the spike's deliberate cost of NOT widening the use-cases
// public surface; the two lists MUST stay in sync until LLM extraction replaces
// the fixed candidates at graduation. Because they are identical, the anchor
// re-slice proven below (Test 1) also covers the loop's grounding (Test 2).
const candidates = [
  ExtractionCandidate.make({ label: "office_action", text: "Office Action" }),
  ExtractionCandidate.make({ label: "claim", text: "A widget comprising a lid and a base." }),
  ExtractionCandidate.make({ label: "rejection_reference", text: "Smith" }),
  ExtractionCandidate.make({ label: "distinction", text: EXPECTED_DISTINCTION_LIMITATION }),
];

describe("@beep/law-practice-server", () => {
  it.layer(LawPracticeServerLive)("office-action review loop over the epistemic server", (it) => {
    it.effect("IrToLaw grounds exactly one distinction to its source anchor", () =>
      Effect.gen(function* () {
        const irToLaw = yield* IrToLaw;
        const extractions = alignCandidates(OFFICE_ACTION_FIXTURE, candidates);

        // The distinction candidate is lower case vs the Title-Case source, so
        // alignment MUST take the case-insensitive `match_lesser` path (not a
        // trivial `match_exact`). This is what makes the re-slice below a real
        // grounding proof, and it rules out the fabricated span-undefined anchor
        // fallback in IrToLaw (which would yield `unaligned`/no span).
        const distinctionExtraction = extractions.find((e) => e.label === "distinction");
        expect(distinctionExtraction?.alignmentStatus).toBe("match_lesser");

        const law = yield* irToLaw.toLaw(extractions);

        // (a) exactly one Distinction, well-formed.
        expect(law.distinction).toBeInstanceOf(Distinction);
        expect(law.distinction.detail.kind).toBe("missing_limitation");

        // (b) the anchor re-slices the source to its own quote, and that quote is
        // the original-case substring recovered via the case-insensitive match.
        const { endChar, quote, startChar } = law.distinction.anchor;
        expect(OFFICE_ACTION_FIXTURE.slice(startChar, endChar)).toBe(quote);
        expect(quote).toBe(EXPECTED_DISTINCTION_QUOTE);

        // (d) the distinction's answer: missing limitation + recovered anchor quote.
        if (law.distinction.detail.kind === "missing_limitation") {
          expect(law.distinction.detail.limitation).toBe(EXPECTED_DISTINCTION_LIMITATION);
        }
      })
    );

    it.effect("review admits the claim, advancing it to shape_valid", () =>
      Effect.gen(function* () {
        const review = yield* OfficeActionReview;
        const input = yield* makeOfficeActionReviewInput();

        const view = yield* review.review(input);

        // (c) gate admits -> transition advances candidate -> shape_valid. The
        // claim ends at "shape_valid" (NOT lifecycle "admitted"), so admittedKeys
        // is empty — per SPEC "gate admits, lifecycle reaches shape_valid".
        expect(view.total).toBe(1);
        expect(view.counts.shape_valid).toBe(1);
        expect(view.counts.candidate).toBe(0);
        expect(view.counts.admitted).toBe(0);
        expect([...view.admittedKeys]).toEqual([]);
      })
    );
  });
});
